import {
    bindTimingWorkerOnMessageHandler,
    IWorkerGlobalScope,
} from '../browser/Transport';

const ctx: any = <any>self;

ctx.onmessage = bindTimingWorkerOnMessageHandler(ctx);
