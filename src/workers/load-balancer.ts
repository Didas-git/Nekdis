import { Worker } from "node:worker_threads";
import { join } from "node:path";

import { HASHDocument, JSONDocument } from "../document";

import type { ParseSchema } from "../typings";

export type WorkerResponse = WorkerResultResponse | WorkerIdleResponse;

export interface WorkerResultResponse {
    eventType: "result";
    id: string;
    type: "JSON" | "HASH";
    schema: ParseSchema<any>;
    data: object;
    validate: boolean;
    wasAutoFetched: boolean;
}

export interface WorkerIdleResponse {
    eventType: "idle";
    id?: undefined;
    type?: undefined;
    schema?: undefined;
    data?: undefined;
    validate?: undefined;
    wasAutoFetched?: undefined;

}

export class LoadBalancer {
    readonly #queue: Array<object> = [];
    readonly #resolvers = new Map<string, ((result: any) => void)>();
    // boolean = is free
    readonly #workers = new Map<Worker, boolean>();
    readonly #docType = { JSON: JSONDocument, HASH: HASHDocument };

    public constructor(threads: number = 3) {
        for (let i = 0; i < threads; i++) {
            const worker = new Worker(join(__dirname, "./worker.js"));
            this.#workers.set(worker, true);

            worker.on("message", ({
                eventType,
                id,
                type,
                schema,
                data,
                validate
            }: WorkerResponse) => {
                switch (eventType) {
                    case "idle":
                        this.#workers.set(worker, true);
                        this.onIdle();
                        break;
                    case "result":
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.#resolvers.get(id)!(new this.#docType[type](schema, void 0, data, validate));
                        this.#resolvers.delete(id);
                        break;
                }
            });
        }
    }

    public async handle(id: string, data: Record<string, unknown>): Promise<any> {
        return new Promise((resolve) => {
            this.#resolvers.set(id, resolve);

            this.onIdle(data);
        });
    }

    public onIdle(data?: any): void {
        if (!data && this.#queue.length < 1) return;
        for (let i = 0, entries = [...this.#workers.entries()], len = this.#workers.size; i <= len; i++) {
            if (i === len) {
                this.#queue.push(data);
                return;
            }

            const [worker, val] = entries[i];

            if (!val) {
                continue;
            }

            data ??= this.#queue.shift();
            worker.postMessage(data);
            this.#workers.set(worker, false);
            return;

        }
    }

    public async destroy(): Promise<void> {
        for (let i = 0, keys = [...this.#workers.keys()], len = this.#workers.size; i < len; i++) {
            const key = keys[i];
            await key.terminate();
        }
    }
}