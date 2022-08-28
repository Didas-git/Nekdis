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

    public create(id?: string): Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>> {
        // Using `any` because of the MapSchema type
        return <any>new Document(this.#schema[schemaData], id ?? randomUUID());
    }

    public save(doc: Document<SchemaDefinition>) {
        validateData(doc, <ParsedSchemaDefinition>this.#schema[schemaData]);
        if (!this.#schema.options.dataStructure || this.#schema.options.dataStructure === "JSON")
            //@ts-ignore JS Shenanigans
            this.client.json.set(this.name, "$", JSON.parse(doc.toString()))
        else if (this.#schema.options.dataStructure === "HASH")
            this.#client.hSet(this.#schema.constructor.name, "$", doc.toString());
    }

}