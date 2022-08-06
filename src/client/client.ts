import { createClient } from "redis";
import { ExtractSchemaMethods, Model } from "../model";
import { MethodsDefinition, Schema, SchemaDefinition, SchemaOptions } from "../schema";
import { URLObject, RedisClient } from "./typings";

export class Client {
    #client?: RedisClient;
    #models: Map<string, Model<any>> = new Map();
    public isOpen: boolean = false;

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

    public model<T extends Schema<SchemaDefinition, MethodsDefinition>>(name: string, schema?: T): Model<T> & ExtractSchemaMethods<T> {
        if (this.#models.has(name)) return <any>this.#models.get(name)!;

        if (!schema) throw new Error("You have to pass a schema if it doesnt exist");

        const model = new Model(schema, this.#client!);
        this.#models.set(name, model);
        return <any>model;
    }
}