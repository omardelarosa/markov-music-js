import { Dispatcher } from './Dispatcher';

type EventCallback = (...args: any[]) => void;
type EventName = string; // NOTE: no symbol support yet

/**
 *
 * This class is designed to have a similar interface to
 * the node EventEmitter / events module.  However, it
 * works only in the browser and is designed to avoid
 * bundling EventEmitter with the library.
 *
 * Until more feature of EE are required, this limited
 * version is fine.
 *
 */

export class EventEmitter {
    private dispatcher: Dispatcher;

    constructor(d?: Dispatcher) {
        this.dispatcher = d || new Dispatcher();
    }

    public on(evtName: EventName, cb: EventCallback): void {
        this.dispatcher.addEventListener(evtName, cb);
    }

    public emit(evtName: EventName, data?: any): void {
        const evt = new CustomEvent(evtName, data);
        this.dispatcher.dispatchEvent(evt);
    }

    public off(evtName: EventName, cb: EventCallback): void {
        this.dispatcher.removeEventListener(evtName, cb);
    }
}
