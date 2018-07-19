import { EventEmitter } from './EventEmitter';

import { OSCEvent } from './typings';

const DEFAULT_TICK_RESOLUTION = 48;
const DEFAULT_TICKS_TO_SCHEDULE = 100;
const DEFAULT_BPM = 60;
const DEFAULT_LOOKAHEAD_MS = 1000;
const DEFAULT_TIMING_WORKER_PATH = '/lib/timing.worker.js';
const calcTickInterval = (bpm: number): number =>
    Math.round((60 * 1000) / bpm / DEFAULT_TICK_RESOLUTION);

const EVENTS = {
    TICK: 'TICK',
    BEAT: 'BEAT',
    BUFFER: 'BUFFER',
    PROCESS_LOOPS: 'PROCESS_LOOPS',
    STOP: 'STOP',
    START: 'START',
    UPDATE_BPM: 'UPDATE_BPM',
    OSC: 'OSC',
    MIDI: 'MIDI',
};

export interface IWorkerGlobalScope {
    onmessage: (e: any) => void;
    postMessage: (e: any) => void;
}

// TODO: split into worker and client events
type WorkerEventName =
    | 'midi'
    | 'tick'
    | 'buffer'
    | 'beat'
    | 'start'
    | 'stop'
    | 'processLoops'
    | 'osc'
    | 'updateBPM';

type WorkerEventParams =
    | 'interval'
    | 'scheduleLoop'
    | 'tickID'
    | 'tickInterval'
    | 'start'
    | 'stop'
    | 'queueRank';

export type TimingAction =
    | 'start'
    | 'stop'
    | 'updateInterval'
    | 'scheduleLoop'
    | 'error';

export type TransportActions =
    | 'processLoops'
    | 'tick'
    | 'start'
    | 'stop'
    | 'osc'
    | 'updateBPM';

export interface WorkerEvent {
    name?: WorkerEventName;
    address?: string; // TODO: depricate/normalize this for server events
    data: {
        action: TimingAction;
        payload: any;
    };
}

class TimingManager {
    public static DEFAULT_TICK_RESOLUTION = DEFAULT_TICK_RESOLUTION;
    public static DEFAULT_LOOKAHEAD_MS = DEFAULT_LOOKAHEAD_MS;
    public static DEFAULT_TICKS_TO_SCHEDULE = DEFAULT_TICKS_TO_SCHEDULE;
    public tick: number = 0;
    public lastTickSent: number = -1;
    public timerID: number;
    public interval: number = calcTickInterval(DEFAULT_BPM); // 60 BPM default
    public scheduledTicks: Set<number>;
    private bpm: number = DEFAULT_BPM; // 60 bpm default
    private ctx: IWorkerGlobalScope;

    constructor(ctx: IWorkerGlobalScope) {
        this.timerID = 0;
        this.scheduledTicks = new Set();
        this.ctx = ctx;
    }

    public onError(message: string) {
        this.ctx.postMessage({ event: 'error', message });
    }

    public onEvent(e: WorkerEvent) {
        const actionName: TimingAction = (e.data && e.data.action) || 'error';

        if (actionName === 'error') {
            this.onError(`Unsupport timing action ${actionName}`);
            return;
        }

        switch (actionName) {
            case 'start':
                this.start(e.data.payload);
                break;
            case 'updateInterval':
                this.updateInterval(e.data.payload);
                break;
            case 'stop':
                this.stop();
                break;
            default:
                console.warn('Worker received unhandled action: ' + actionName);
                break;
        }
    }

    public setBPM({ bpm }) {
        this.bpm = bpm;
        this.interval = calcTickInterval(bpm);
        // console.log('setBPM', this.bpm, 'interval', this.interval);
    }

    private updateInterval({ bpm }) {
        this.clearScheduledTicks();
        this.setBPM({ bpm });

        // Schedules ticks on each beat
        const schedulingFrequency =
            TimingManager.DEFAULT_TICK_RESOLUTION * this.interval;
        this.timerID = setInterval(() => {
            // Schedules all ticks for the next period
            this.scheduleTicks();
        }, schedulingFrequency);
    }

    private start({ bpm }) {
        // TODO: put this behind a debug flag
        // console.log('starting at BPM: ', bpm);
        this.updateInterval({ bpm });
    }

    private stop() {
        // console.log('stopping');
        this.clearScheduledTicks();
    }

    private clearScheduledTicks() {
        this.scheduledTicks.forEach(t => {
            clearTimeout(t);
            this.scheduledTicks.delete(t);
        });
        clearInterval(this.timerID);
        this.timerID = 0;
    }

    private incrementTick() {
        this.tick++;
    }

    private getTick() {
        return this.tick;
    }

    private scheduleTicks = () => {
        let i = 1;
        let amountScheduled = 0;
        while (i < TimingManager.DEFAULT_TICKS_TO_SCHEDULE) {
            const timeUntilTick = i * this.interval;
            const tickToSchedule = this.getTick() + i;
            // Check if a timer has already been scheduled for this tick
            if (this.scheduledTicks.has(tickToSchedule)) {
                // do not reschedule
            } else {
                let timer = setTimeout(() => {
                    this.sendToTransport('tick');
                    this.incrementTick();
                    this.scheduledTicks.delete(tickToSchedule);
                }, timeUntilTick);
                this.scheduledTicks.add(tickToSchedule);
            }
            i++;
            amountScheduled += timeUntilTick;
        }
    };

    public sendToTransport(action: TransportActions, payload?: any) {
        this.ctx.postMessage({ action, payload });
    }
}

export const bindTimingWorkerOnMessageHandler = (
    self: IWorkerGlobalScope,
): ((e: WorkerEvent) => void) => {
    const timing = new TimingManager(self);
    return (e: WorkerEvent) => {
        try {
            timing.onEvent(e);
        } catch (e) {
            // Notify re: errors
            timing.onError(e.message);
        }
    };
};

interface ITransportOptions {
    bpm?: number;
}

interface IEvent {
    name: WorkerEventName;
    data: Record<string, any>;
}

export class Transport {
    public static EVENTS = EVENTS;
    public static DEFAULT_TICK_RESOLUTION = DEFAULT_TICK_RESOLUTION;
    public static DEFAULT_LOOKAHEAD_MS = DEFAULT_LOOKAHEAD_MS;
    public static DEFAULT_BPM = DEFAULT_BPM;
    // Utils
    public events: EventEmitter = null;
    private timerWorker: Worker;
    private beat: number = 0;
    private tick: number = 0;
    private bpm: number = DEFAULT_BPM;

    constructor(options: ITransportOptions = {}) {
        this.events = new EventEmitter();
        this.bpm = options.bpm;
    }

    // Useful for debugging
    public tickToMS() {
        return calcTickInterval(this.bpm);
    }

    public getTick(): number {
        return +this.tick;
    }

    public getBeat(): number {
        return +this.beat;
    }

    public getBPM(): number {
        return +this.bpm;
    }

    public incrementBeat(): void {
        this.beat++;
    }

    public incrementTick(): void {
        this.tick++;
    }

    public processLoops({ tick }): void {
        console.log('TODO: processLoops!');
    }

    public sendToWorker(evtName: TimingAction, payload: any) {
        this.timerWorker.postMessage({ action: evtName, payload });
    }

    public static toEvent(msg: WorkerEvent | OSCEvent): IEvent {
        // TODO: consolidate OSC format and workerevent format
        const address = msg.address || '';
        const msgParts: string[] = address.split('/');
        return {
            name: <WorkerEventName>msgParts[1], // TODO: remove need for casting
            data: msg,
        };
    }

    public onMessage = (evt: WorkerEvent): void => {
        const EVENTS = Transport.EVENTS;
        const evtName = evt.name || evt.data.action;
        switch (evtName) {
            case 'beat':
                this.incrementBeat();
                this.events.emit(EVENTS.BEAT, evt.data.payload);
                break;
            case 'tick':
                this.incrementTick();
                this.events.emit(EVENTS.TICK, evt.data.payload);
                break;
            case 'processLoops':
                this.events.emit(EVENTS.PROCESS_LOOPS, evt.data.payload);
                break;
            case 'updateBPM':
                this.updateBPM(evt.data.payload.bpm); // TODO: gracefully handle missing payload/bpm
                this.events.emit(EVENTS.UPDATE_BPM, evt.data.payload);
                break;
            case 'start':
                this.start(evt.data.payload);
                this.events.emit(EVENTS.START, evt.data.payload);
                break;
            case 'osc':
                this.receiveOSC(evt.data.payload);
            case 'stop':
                this.stop();
                this.events.emit(EVENTS.STOP, evt.data.payload);
                break;
            default:
                console.error('Unhandled transport event: ', evtName, evt);
                this.stop(); // TODO: stop halting
                break;
        }
    };

    // TODO:
    public bindTimerWorkerListeners(
        timerWorker: Worker,
        onError?: (e: ErrorEvent) => void,
    ): void {
        timerWorker.onmessage = (evt: WorkerEvent) => {
            this.onMessage(evt);
        };

        timerWorker.onerror = onError;
    }

    public startTimerWorker(worker): void {
        this.timerWorker = worker;

        // Bind worker listeners and fallback to inline
        this.bindTimerWorkerListeners(
            this.timerWorker,

            err => {
                console.error('Worker error: ', err.message);
            },
        );

        this.start({ bpm: this.bpm });
    }

    public start({ bpm }) {
        this.sendToWorker('start', { bpm });
    }

    public stop() {
        this.sendToWorker('stop', {});
    }

    public updateBPM(bpm) {
        this.sendToWorker('updateInterval', { bpm });
    }

    public receiveOSC({ message }) {
        // TODO: handle OSC here
        // console.log('OSC', Transport.toEvent(message), message);
    }
}

// Static utility class
export default Transport;
