import { createClient } from "redis";

import { Schema } from "./schema";
import { Model } from "./model";

import type {
    ExtractSchemaMethods,
    MethodsDefinition,
    SchemaDefinition,
    SchemaOptions,
    Module,
    WithModules,
    URLObject,
    RedisClient,
    ExtractName,
    ParseSchema
} from "./typings";

import "@infinite-fansub/logger";

export class Client {
    #client!: RedisClient;
    #models: Map<string, Model<any>> = new Map();
    #open: boolean = false;
    #prefix: string = "Nekdis";

    public async connect(url: string | URLObject = "redis://localhost:6379"): Promise<Client> {
        if (this.#open) return this;

        if (typeof url === "object") {

            const { username, password, entrypoint, port } = url;
            url = `${username}:${password}@${(/:\d$/).exec(entrypoint) ? entrypoint : `${entrypoint}:${port}`}`;
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

    public schema<T extends SchemaDefinition, M extends MethodsDefinition>(schemaData: T, methods?: M, options?: SchemaOptions): Schema<T, M> {
        return new Schema<T, M>(schemaData, methods, options);
    }

    public withModules<T extends Array<Module>>(modules: ExtractName<T>): this & WithModules<T> {
        for (let i = 0, len = modules.length; i < len; i++) {
            const module = modules[i];
            //@ts-expect-error shenanigans
            this[module.name] = new module.ctor();
        }

        return <never>this;
    }

    public model<T extends Schema<SchemaDefinition, MethodsDefinition, ParseSchema<any>>>(name: string, schema?: T): Model<T> & ExtractSchemaMethods<T> {
        let model = this.#models.get(name);
        if (model) return <never>model;

        if (!schema) throw new Error("You have to pass a schema if it doesn't exist");

        model = new Model(this.#client, this.#prefix, "V1", name, schema);
        this.#models.set(name, model);
        return <never>model;
    }

    public get raw(): RedisClient {
        return this.#client;
    }

    public get isOpen(): boolean {
        return this.#open;
    }

    public set redisClient(client: RedisClient) {
        if (!this.#open) {
            this.#client = client;
        }
    }

    public set globalPrefix(str: string) {
        this.#prefix = str;
    }
}

export const client = new Client();