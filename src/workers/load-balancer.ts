import { Worker } from "node:worker_threads";
import { join } from "node:path";

export class LoadBalancer {
    #last: number = 0;
    readonly #queue: any = [];
    readonly #resolvers = new Map<string, ((result: any) => void)>();
    // boolean = is free
    readonly #workers = new Map<Worker, boolean>();
    readonly #threadAmt: number;

    public constructor(threads: number = 3) {
        this.#threadAmt = threads;
        for (let i = 0; i < threads; i++) {
            const worker = new Worker(join(__dirname, "./worker.js"));
            this.#workers.set(worker, true);

            worker.on("message", ({ type, id, data }) => {
                switch (type) {
                    case "idle":
                        this.#workers.set(worker, true);
                        this.onIdle();
                        break;
                    case "result":
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.#resolvers.get(id)!(data);
                        this.#resolvers.delete(id);
                        break;
                }
            });
        }
    }

    public async handle(id: string, data: any): Promise<any> {
        return new Promise((resolve) => {
            this.#resolvers.set(id, resolve);

            this.onIdle(data);
        });
    }

    public onIdle(data?: any): any {
        if (!data && this.#queue.length < 1) return;
        for (let i = 0, entries = [...this.#workers.entries()], len = this.#workers.size; i < len; i++) {
            const [worker, val] = entries[i];

            this.#last = this.#last === this.#threadAmt ? 1 : this.#last;

            if (worker.threadId === this.#last) {
                continue;
            }

            if (val) {
                this.#last = worker.threadId;
                this.#workers.set(worker, false);
                worker.postMessage(data ?? this.#queue.shift());
                return;
            } else {
                if (!data) return;
                this.#queue.push(data);
            }
        }
    }

    public async destroy(): Promise<void> {
        for (let i = 0, keys = [...this.#workers.keys()], len = this.#workers.size; i < len; i++) {
            const key = keys[i];
            await key.terminate();
        }
    }

}