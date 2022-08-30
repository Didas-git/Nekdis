import { createClient } from "redis";
import { Model } from "./model";
import { Schema } from "./schema";
import {
    ExtractSchemaMethods,
    MethodsDefinition,
    SchemaDefinition,
    SchemaOptions,
    Module,
    WithModules,
    URLObject,
    RedisClient,
    ExctractName
} from "./typings";

// Load in the lib
require("@infinite-fansub/logger");

export class Client {
    #client!: RedisClient;
    #models: Map<string, Model<any>> = new Map();
    public isOpen: boolean = false;

    public readonly raw: RedisClient = this.#client;

    public async connect(url: string | URLObject = "redis://localhost:6379"): Promise<Client> {
        if (this.isOpen) return this;

        if (typeof url === "object") {

            const { username, password, entrypoint, port } = url;
            url = `${username}:${password}@${(/:\d$/).exec(entrypoint) ? entrypoint : `${entrypoint}:${port}`}`;
        }

        this.#client = createClient({ url });
        this.#client.connect();
        this.isOpen = true;

        return this;
    }

    public async disconnect(): Promise<Client> {
        await this.#client?.quit();

        this.isOpen = false
        return this;
    }

    public async forceDisconnect(): Promise<Client> {
        await this.#client?.disconnect();

        this.isOpen = false
        return this;
    }

    public schema<T extends SchemaDefinition, M extends MethodsDefinition>(schemaData: T, methods?: M, options?: SchemaOptions): Schema<T, M> {
        return new Schema<T, M>(schemaData, methods, options);
    }

    public withModules<T extends Array<Module>>(modules: ExctractName<T>): this & WithModules<T> {
        modules.forEach((module) => {
            //@ts-expect-error shenanigans
            this[module.name] = new module.ctor();
        });

        return <any>this;
    }

    public model<T extends Schema<SchemaDefinition, MethodsDefinition>>(name: string, schema?: T): Model<T> & ExtractSchemaMethods<T> {
        if (this.#models.has(name)) return <any>this.#models.get(name)!;

        if (!schema) throw new Error("You have to pass a schema if it doesnt exist");

        const model = new Model(this.#client, name, schema);
        this.#models.set(name, model);
        return <any>model;
    }
}