import {
    IWindow,
    IBrowserClientOptions,
    UnregisteredLoop,
    OSCPort,
} from './typings';

import { Transport, TransportActions, TimingAction } from './Transport';
import { Loop } from './Loop';

// Load as JS string for inline worker fallback
import * as TimingWorker from '../../lib/timing.worker.js';

const DEFAULT_TIMING_WORKER_PATH = '/lib/timing.worker.js';
const EVENTS = Transport.EVENTS;

export class BrowserClient {
    public static Transport = Transport;
    public static EVENTS = EVENTS;
    public static OSC: any; // OSC.js library ref
    public static MIDI: any; // WebMidi library ref
    public static LOOKAHEAD = Transport.DEFAULT_LOOKAHEAD_MS;
    public static USE_SERVER_CLOCK: boolean = false;
    public static DEFAULT_BPM: number = Transport.DEFAULT_BPM;
    public static DEFAULT_LOOKAHEAD_MS = Transport.DEFAULT_LOOKAHEAD_MS;
    public static TIMING_WORKER_PATH: string = DEFAULT_TIMING_WORKER_PATH;
    public static DEFAULT_TICKS_TO_SCHEDULE: number = 100;
    public static currentBrowserBPM: number = Transport.DEFAULT_BPM;
    public static DEBUG: boolean = false;
    public lastTick: number = Date.now();
    public timerWorker: Worker = null;
    public clockHasStarted: boolean = false;

    private oscillator: OscillatorNode = null;
    private context: AudioContext;
    private autoplay: boolean;
    private lastScheduledTickTimestamp: number = Date.now();
    private hasStopped: boolean = true; // Initializes in a stopped state
    private transport: Transport;
    private bufferQueue: string[] = [];
    private newLoopsQueue: UnregisteredLoop[] = []; // TODO: remove any
    private bpm: number;
    private tick: number = 0;
    private beat: number = 0;
    private isFirstBeat: boolean = true;
    private loops: Record<string, Loop> = {};
    private useInlineWorker: boolean = false;
    private T: number = Transport.DEFAULT_TICK_RESOLUTION;
    private M: number = 4 * Transport.DEFAULT_TICK_RESOLUTION;

    constructor(options: IBrowserClientOptions = {}) {
        const { useInlineWorker, autoplay = true } = options;
        this.useInlineWorker = !!useInlineWorker;
        // TODO: perhaps don't init on constructor?
        this.autoplay = autoplay;
        this.init();
    }

    public init(): void {
        this.setTransport();
        this.setAudioContext();
        if (this.autoplay) this.startClock();
        this.setGlobals(<IWindow>window);
    }

    public tickToMS() {
        return this.transport.tickToMS();
    }

    public setTransport() {
        this.transport = new Transport({ bpm: Transport.DEFAULT_BPM });
        this.transport.events.on(EVENTS.TICK, this.onTick);
        // this.transport.events.on(EVENTS.BEAT, this.onBeat);
        this.bpm = this.transport.getBPM();
    }

    public setAudioContext(AC = AudioContext): void {
        // Dependency injectable for testing.
        this.context = new AC();
    }

    public sendToTransport(
        action: TransportActions | TimingAction,
        payload?: any,
    ) {
        // TODO: allow transport to observe messages from Client
        this.transport.onMessage(<any>{ data: { action, payload } });
    }

    public start(): void {
        if (!this.hasStopped) return; // already started, prevent double starts
        this.hasStopped = false;
        this.startTimerWorker();
        this.sendToTransport('start', { bpm: this.bpm });
    }

    public stop(): void {
        if (this.hasStopped) return; // already stopped, prevent double stops
        this.hasStopped = true;
        this.sendToTransport('stop');
        // this.timerWorker.postMessage({ action: 'stop' });
        // this.timerWorker.terminate();
    }

    // EVENT HANDLERS

    // aka handleTick
    public onTick = (ev: Event): void => {
        const t = this.transport.getTick();
        const since = Date.now() - this.lastTick;
        this.lastTick = Date.now();
        if (BrowserClient.DEBUG) {
            console.log('tick', t, since);
        }
        if (!t) {
            // TODO: handle undefined tick
            console.warn('skipped tick');
        } else {
            this.processLoops(t);
            if (t % Transport.DEFAULT_TICK_RESOLUTION === 0) {
                this.onBeat();
            }
        }
    };

    public onFirstBeat = (ev: Event): void => {
        // noop -- re-assignable
    };

    // aka handleBeat
    public onBeat = (ev?: Event): void => {
        // Init callback
        if (this.isFirstBeat) {
            this.onFirstBeat(ev);
            this.isFirstBeat = false;
        }

        this.processBuffers();
        this.drainRegisterLoopQueue();
    };

    public drainRegisterLoopQueue(): void {
        while (this.newLoopsQueue.length > 0) {
            const loops = this.loops;
            const { name, handler } = this.newLoopsQueue.pop();
            // Cleanup if exists
            if (loops[name]) {
                const oldLoop = loops[name];
                oldLoop.destroy();
                delete loops[name];
            }
            loops[name] = new Loop({ name, handler });
        }
    }

    public registerLoop = (
        name: string,
        handler: (ctx: Loop) => void,
    ): void => {
        this.newLoopsQueue.push({ name, handler });
    };

    public setTempo = bpm => {
        if (!BrowserClient.USE_SERVER_CLOCK) {
            this.sendToTransport('updateBPM', { bpm });
            return;
        }

        // If no worker is being used...
        fetch(`http://${window.location.host}/updateBpm`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ bpm }),
        }).then(res => {
            console.log('BPM updated', res.json());
        });
    };

    public playNote = n => {
        const context = this.context;
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = n;
        oscillator.connect(context.destination);
        oscillator.start(0);

        this.oscillator = oscillator;
        setTimeout(() => {
            this.oscillator.stop(0);
        }, 100);
    };

    public loadBuffer(b: string) {
        const $buffers = document.querySelectorAll('.buffer-script');
        Array.from($buffers).forEach(b => b.remove());
        const $buffer = document.createElement('script');
        const ts = Date.now();
        $buffer.src = `${b}?${ts}`;
        $buffer.className = 'buffer-script';
        document.body.appendChild($buffer);
        // Cancel any pending loop invokations
    }

    public processLoops(t: number) {
        // Limit duration of this invokation with timeout to preserve time
        Object.keys(this.loops).forEach(loopName => {
            if (BrowserClient.DEBUG) {
                console.log('processing loop', loopName, t);
            }
            this.loops[loopName].run(t);
        });
    }

    public processBuffers() {
        while (this.bufferQueue.length) {
            this.loadBuffer(this.bufferQueue.shift());
        }
    }

    // TODO: move this to the transport layer
    public startOSCListen(): void {
        if (!BrowserClient.OSC) {
            console.warn(
                'OSC Browser client not found!  Will not observe file changes.',
            );
            return;
        }

        // Use OSC layer to observe file changes

        // Init container
        let oscPort: OSCPort = new BrowserClient.OSC.WebSocketPort({
            url: `ws://${window.location.host}`,
        });
        // listen
        oscPort.on('message', msg => {
            const evt = Transport.toEvent(msg);
            const address = evt.data.address;
            const bufferSrc = address
                .split('/')
                .slice(2)
                .join('/');
            this.bufferQueue.push(bufferSrc);
        });
        // open port
        oscPort.open();
    }

    public startTimerWorker(): void {
        if (this.useInlineWorker) {
            this.transport.startTimerWorker(this.makeBlobWorker());
        } else {
            this.transport.startTimerWorker(
                new Worker(BrowserClient.TIMING_WORKER_PATH),
            );
        }
        this.clockHasStarted = true;
    }

    public makeBlobWorker() {
        if (typeof Blob === 'undefined') {
            console.warn('Unable to load fallback worker.');
            return;
        }
        var blob = new Blob([TimingWorker], { type: 'text/javascript' });

        return new Worker(window.URL.createObjectURL(blob));
    }

    public getOutputs = (): any => {
        if (!BrowserClient.MIDI) {
            return [];
        }
        // MIDI Testing
        BrowserClient.MIDI.enable(function(err) {
            if (err) {
                console.log('WebMidi could not be enabled.', err);
            } else {
                console.log('WebMidi enabled!');
            }
        });
    };

    public startClock(): void {
        // Use web-worker for client-beat instead of backend worker
        if (!BrowserClient.USE_SERVER_CLOCK) {
            this.start();
            // this.startTimerWorker();
        }

        this.startOSCListen();
    }

    // Sets window-level globals -- UH OH
    public setGlobals(WINDOW: IWindow): void {
        // TODO: add proper type annotations for Window globals
        WINDOW.loop = this.registerLoop;
        WINDOW.setTempo = this.setTempo;
        WINDOW.playNote = this.playNote;
        // WINDOW.tickInterval = this.tickInterval;
        WINDOW.T = this.T;
        WINDOW.M = this.M;
        WINDOW.sqcr = this; // exposes API as global
        WINDOW.BrowserClient = BrowserClient;
    }
}

export default BrowserClient;
