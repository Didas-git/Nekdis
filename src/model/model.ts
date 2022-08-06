import { MapSchema, MethodsDefinition, Schema, SchemaDefinition } from "../schema";
import { Document } from "../document";
import { RedisClient } from "../client";
import { schemaData } from "../privates/symbols";
import { ExtractSchemaDefinition } from "./typings";

export class Model<S extends Schema<SchemaDefinition, MethodsDefinition>> {
    private readonly schema: S;
    public constructor(data: S, private readonly client: RedisClient) {
        this.schema = data;
    }

    // #defineMethods() {

    // }

    public create(): Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>> {
        const doc = new Document();
        Object.keys(this.schema[schemaData]).forEach((key) => {
            Object.defineProperty(doc, key, {
                configurable: true,
                get: function (): unknown {
                    return this[key]
                },

                set: function (value: unknown) {
                    this[key] = value
                }
            })
        })

        // Using `any` because of the MapSchema type
        return <any>doc
    }

    public save(doc: Document<SchemaDefinition>) {
        if (!this.schema.options || this.schema.options === "JSON")
            //@ts-ignore JS Shenanigans
            this.client.json.set(this.schema.costructor.name, "$", JSON.parse(doc.toString()))
        else if (this.schema.options === "HASH")
            this.client.hSet(this.schema.constructor.name, "$", doc.toString());
    }

    public createAndSave() {

    }
}