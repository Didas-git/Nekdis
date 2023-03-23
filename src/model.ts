import { Document } from "./document";
import { methods, parse, schemaData } from "./utils";
import { randomUUID } from "node:crypto";
import { Search } from "./search";
import type { Schema } from "./schema";
import type { ExtractSchemaDefinition, SchemaDefinition, MapSchema, MethodsDefinition, RedisClient, ParsedMap } from "./typings";

export class Model<S extends Schema<SchemaDefinition, MethodsDefinition>> {
    readonly #schema: S;
    readonly #client: RedisClient;
    readonly #searchIndexName: string;
    readonly #searchIndex: Array<string> = ["FT.CREATE"];
    readonly #parsedSchema: ParsedMap;

    public constructor(client: RedisClient, public readonly name: string, data: S) {
        this.#client = client;
        this.#schema = data;
        this.#searchIndexName = `${name}:index`;
        this.#parsedSchema = parse(this.#schema[schemaData]);
        this.#defineMethods();
    }

    public async get(id: string | number): Promise<Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>> | null> {
        if (typeof id === "undefined") throw new Error();
        const data = await this.#client.json.get(`${this.name}:${id}`);

        if (data === null) return null;

        return <never>new Document(this.#schema[schemaData], id.toString(), data);
    }

    public create(id?: string | number): Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>> {
        return <never>new Document(this.#schema[schemaData], id?.toString() ?? randomUUID());
    }

    public async save(doc: Document<SchemaDefinition>): Promise<void> {
        if (typeof doc === "undefined") throw new Error();

        await this.#client.json.set(`${this.name}:${doc.$id}`, "$", <never>JSON.parse(doc.toString()));
    }

    public async delete(...docs: Array<string | number | Document<SchemaDefinition>>): Promise<void> {
        if (!docs.length) throw new Error();
        await this.#client.del(docs.map((el) => `${this.name}:${el instanceof Document ? el.$id : el.toString()}`));
    }

    public async exists(...docs: Array<string | number | Document<SchemaDefinition>>): Promise<number> {
        if (!docs.length) throw new Error();
        return await this.#client.exists(docs.map((el) => `${this.name}:${el instanceof Document ? el.$id : el.toString()}`));
    }

    public expire(docs: Array<string | number | Document<SchemaDefinition>>, seconds: number, mode?: "NX" | "XX" | "GT" | "LT"): void {
        if (!docs.length) throw new Error();
        docs.map((el) => `${this.name}:${el instanceof Document ? el.$id : el.toString()}`).forEach((doc) => {
            this.#client.expire(doc, seconds, mode);
        });
    }

    public async createAndSave(data: { $id?: string | number } & MapSchema<ExtractSchemaDefinition<S>, true>): Promise<void> {
        const doc = new Document(this.#schema[schemaData], data.$id?.toString() ?? randomUUID(), data);
        await this.save(doc);
    }

    public search(): Search<ExtractSchemaDefinition<S>> {
        return new Search<ExtractSchemaDefinition<S>>(this.#client, <never>this.#schema[schemaData], this.#parsedSchema, this.#searchIndexName);
    }

    public async createIndex(): Promise<void> {

        await this.deleteIndex();

        this.#searchIndex.push(this.#searchIndexName, "ON", "JSON", "PREFIX", "1", `${this.name}:`, "SCHEMA");
        this.#parsedSchema.forEach((val, key) => {
            let arrayPath = "";

            if (val.value.type === "array") {
                if (typeof val.value.elements !== "string") {
                    throw new Error("Object definitions on `array` are not yet supported by the parser");
                }

                arrayPath = val.value.elements === "text" ? "[*]" : val.value.elements === "number" || val.value.elements === "date" || val.value.elements === "point" ? "" : "*";
            }

            this.#searchIndex.push(
                `$.${key}${arrayPath}`,
                "AS",
                val.path,
                val.value.type === "text" ? "TEXT" : val.value.type === "number" || val.value.type === "date" ? "NUMERIC" : val.value.type === "point" ? "GEO" : "TAG"
            );
        });

        await this.#client.sendCommand(this.#searchIndex);
    }

    public async deleteIndex(DD: boolean = false): Promise<void> {
        await this.#client.sendCommand(["FT.DROPINDEX", this.#searchIndexName, DD ? "DD" : ""]).catch((e) => {
            if (e instanceof Error && e.message === "Unknown Index name") {
                Promise.resolve();
            } else throw e;
        });
    }

    public async rawSearch(...args: Array<string>): Promise<ReturnType<RedisClient["ft"]["search"]>> {
        return await this.#client.ft.search(this.#searchIndexName, args.join(" "));
    }

    #defineMethods(): void {
        Object.entries(this.#schema[methods]).forEach(([key, value]) => {
            //@ts-expect-error Pending fix on type notations
            this[key] = value;
        });
    }
}