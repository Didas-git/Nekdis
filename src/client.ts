import { PrettyError } from "@infinite-fansub/logger";
import { createClient } from "redis";

import { Schema } from "./schema";
import { Model } from "./model";

import type {
    ExtractSchemaMethods,
    MethodsDefinition,
    TopLevelSchemaDefinition,
    NodeRedisClient,
    SchemaOptions,
    ClientOptions,
    ExtractName,
    WithModules,
    URLObject,
    Narrow,
    Module
} from "./typings";

export class Client<SD extends TopLevelSchemaDefinition = {}, MD extends MethodsDefinition<SD> = {}> {
    #client!: NodeRedisClient;
    #models: Map<string, Model<any>> = new Map();
    #open: boolean = false;
    #options: ClientOptions<SD, MD>;

    public constructor(options?: ClientOptions<SD, MD>) {
        this.#options = options ?? <ClientOptions<SD, MD>>{};
    }

    public async connect(url: string | URLObject = this.#options.url ?? "redis://localhost:6379"): Promise<Client> {
        if (this.#open) return this;

        if (typeof url === "object") {
            const { username, password, entrypoint, port } = url;
            url = `redis://${username}:${password}@${(/:\d$/).exec(entrypoint) ? entrypoint : `${entrypoint}:${port}`}`;
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.#client ??= createClient({ url });
        try {
            await this.#client.connect();
            this.#open = true;
        } catch (e) {
            Promise.reject(e);
        }

        return this;
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

    public schema<T extends Narrow<TopLevelSchemaDefinition>, M extends MethodsDefinition<(T & SD)>>(definition: T, methods?: M, options?: SchemaOptions): Schema<
        { [K in keyof (T & SD)]: (T & SD)[K] },
        { [K in keyof (M & MD)]: (M & MD)[K] }
    > {
        return <never>new Schema({
            ...this.#options.inject?.schema?.definition,
            ...definition
        }, <never>{
            ...this.#options.inject?.schema?.methods,
            ...methods
        }, {
            ...this.#options.inject?.schema?.options,
            ...options
        });
    }

    public model<T extends Schema<any>>(name: string, schema?: T): Model<T> & ExtractSchemaMethods<T> {
        let model = this.#models.get(name);
        if (model) return <never>model;

        if (!schema) throw new PrettyError("You have to pass a schema if it doesn't exist", {
            reference: "nekdis"
        });

        model = new Model(this.#client, this.#options.globalPrefix ?? "Nekdis", "V1", name, schema);
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
    }

    public set redisClient(client: NodeRedisClient) {
        if (!this.#open) {
            this.#client = client;
        }
    }

    public set globalPrefix(str: string) {
        this.#options.globalPrefix = str;
    }
}

export const client = new Client();