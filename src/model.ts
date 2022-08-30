import { Schema } from "./schema";
import { Document } from "./document";
import { schemaData } from "./utils/symbols";
import { ExtractSchemaDefinition, SchemaDefinition, MapSchema, MethodsDefinition, ParsedSchemaDefinition, RedisClient } from "./typings";
import { randomUUID } from "node:crypto";
import { validateData } from "./utils/validate-data";

export class Model<S extends Schema<SchemaDefinition, MethodsDefinition>> {
    readonly #schema: S;
    readonly #client: RedisClient;

    public constructor(client: RedisClient, public readonly name: string, data: S) {
        this.#client = client;
        this.#schema = data;
    }

    // TODO: #defineMethods()

    public async get(id: string | number) {
        const data = await this.#client.json.get(`${this.name}:${id}`);

        if (!data) return undefined;

        return new Document(this.#schema[schemaData], id.toString(), data)
    }

    public create(id?: string | number): Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>> {
        // Using `any` because of the MapSchema type
        return <any>new Document(this.#schema[schemaData], id?.toString() ?? randomUUID());
    }

    public async save(doc: Document<SchemaDefinition>) {
        validateData(doc, <ParsedSchemaDefinition>this.#schema[schemaData]);

        await this.#client.json.set(`${this.name}:${doc._id}`, "$", JSON.parse(doc.toString()));
    }

    public async createAndSave(data: { _id?: string | number } & MapSchema<ExtractSchemaDefinition<S>, true>) {
        const doc = new Document(this.#schema[schemaData], data._id?.toString() ?? randomUUID(), data);
        this.save(doc);
    }
}