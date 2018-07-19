export class Loop {
    public handler: (ctx: Loop) => void;
    public name: string;

    private isSleeping: boolean = false;
    private tick: number;
    private isDead: boolean;
    private tickToAwake: number;

    constructor({ handler, name }) {
        this.handler = handler.bind(this);
        this.name = name;
        this.isDead = false;
    }

    public sleep(amount): Promise<any> {
        this.isSleeping = true;
        this.tickToAwake = this.tick + amount;
        return new Promise((resolve, reject) => {});
    }

    destroy() {
        this.isDead = true;
        this.handler = null;
    }

    run(t: number): void {
        this.tick = t;

        if (this.isSleeping && this.tick === this.tickToAwake) {
            this.isSleeping = false;
            this.tickToAwake = null;
        }

        if (!this.isSleeping && !this.isDead) {
            this.handler(this);
        }
    }
}
