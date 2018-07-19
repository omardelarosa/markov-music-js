import { BrowserClient } from './Client';

(<any>window).SQCR = BrowserClient;
(<any>window).sqcr = new BrowserClient({
    useInlineWorker: true, // Allows for this to be a drop-in JS lib
});
