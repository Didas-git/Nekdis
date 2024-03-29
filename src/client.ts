import { PrettyError } from "@infinite-fansub/logger";
import { readFile } from "node:fs/promises";
import { createClient } from "redis";
import { join } from "node:path";

import { Schema } from "./schema";
import { Model } from "./model";

import type {
    ExtractSchemaMethods,
    MethodsDefinition,
    SchemaDefinition,
    NodeRedisClient,
    SchemaOptions,
    ClientOptions,
    ExtractName,
    WithModules,
    URLObject,
    Narrow,
    Module
} from "./typings";

export class Client<SD extends SchemaDefinition = {}, MD extends MethodsDefinition<SD> = {}> {
    #client!: NodeRedisClient;
    #models: Map<string, Model<any>> = new Map();
    #open: boolean = false;
    #options: ClientOptions<SD, MD>;

    public constructor(options?: ClientOptions<SD, MD>, client?: NodeRedisClient) {
        this.#options = options ?? <ClientOptions<SD, MD>>{};
        this.#client = <never>client;
        this.#appendToModelProto();
    }

    public async connect(url: string | URLObject = this.#options.url ?? "redis://localhost:6379"): Promise<Client> {
        return new Promise((resolve, reject) => {
            if (this.#open) resolve(this);

            if (typeof url === "object") {
                const { username, password, entrypoint, port } = url;
                url = `redis://${username}:${password}@${(/:\d$/).exec(entrypoint) ? entrypoint : `${entrypoint}:${port}`}`;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            this.#client ??= createClient({ url });

            this.#client.connect().then(async () => {
                this.#open = true;
                if (this.#options.enableInjections) {
                    await this.#client.functionLoad((
                        await readFile(join(__dirname, "scripts/create-relation.lua"))
                    ).toString("utf8"), { REPLACE: true });
                }

                resolve(this);
            }).catch((e) => reject(e));
        });
    }

    public async disconnect(): Promise<Client> {
        await this.#client.quit();

        this.#open = false;
        return this;
    }

    public async forceDisconnect(): Promise<Client> {
        await this.#client.disconnect();

        this.#open = false;
        return this;
    }

    public schema<T extends Narrow<SchemaDefinition>, M extends MethodsDefinition<(T & SD)> = {}>(definition: T, methods?: M, options?: SchemaOptions): Schema<
        { [K in keyof (T & SD)]: (T & SD)[K] },
        { [K in keyof (M & MD)]: (M & MD)[K] }
    > {
        return <never>new Schema(
            {
                ...this.#options.base?.schema?.definition,
                ...definition
            },
            <never>methods,
            {
                ...this.#options.base?.schema?.options,
                ...options
            }
        );
    }

    public model<T extends Schema<any>>(name: string, schema?: T): Model<T> & ExtractSchemaMethods<T> {
        let model = this.#models.get(name);
        if (model) return <never>model;

        if (!schema) throw new PrettyError("You have to pass a schema if it doesn't exist", {
            reference: "nekdis"
        });

        model = new Model(this.#client, this.#options.globalPrefix ?? "Nekdis", "V1", name, this.#options.enableInjections ?? false, schema);
        this.#models.set(name, model);
        return <never>model;
    }

    public withModules<T extends Array<Module>>(...modules: ExtractName<T>): this & WithModules<T> {
        for (let i = 0, len = modules.length; i < len; i++) {
            const module = modules[i];
            //@ts-expect-error shenanigans
            this[module.name] = new module.ctor(this);
        }

        return <never>this;
    }

    public get raw(): NodeRedisClient {
        return this.#client;
    }

    public get isOpen(): boolean {
        return this.#open;
    }

    public get options(): ClientOptions<SD, MD> {
        return this.#options;
    }

    public set options(options: ClientOptions<SD, MD>) {
        if (this.#open) {
            throw new PrettyError("Client options cannot be modified when the client is connected", {
                reference: "nekdis"
            });
        }

        this.#options = { ...this.#options, ...options };
        this.#appendToModelProto();
    }

    public set redisClient(client: NodeRedisClient) {
        if (!this.#open) {
            this.#client = client;
        }
    }

    #appendToModelProto(): void {
        if (typeof this.#options.base?.schema?.methods === "undefined") return;

        Object.assign(Model.prototype, this.#options.base.schema.methods);
    }
}

export const client = new Client();