import { Loop } from '../Loop';
import { BrowserClient } from '../Client';

declare module 'WorkerLoader.worker' {
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}

export interface IWindow extends Window {
    BrowserClient: any;
    sqcr: any;
    loop: (s: string, h: (c: Loop) => void) => void;
    setTempo: (b: number) => void;
    playNote: any;
    tickInterval: number;
    T: number;
    M: number;
    osc: any;
    WebMidi: any;
}

export interface IBaseEvent {
    address: string;
}

export interface OSCEvent extends IBaseEvent {}

export interface WorkerEvent extends IBaseEvent {}

export interface OSCPort {
    on: (s: string, cb: (ev: OSCEvent) => void) => void;
    open: (...args: any[]) => void;
}

export interface IMessage {
    event: string;
    data: Record<string, any>;
}

export interface IBrowserClientOptions {
    bpm?: number;
    useInlineWorker?: boolean;
    autoplay?: boolean;
}

export interface UnregisteredLoop {
    name: string;
    handler: (ctx: Loop) => void;
}
