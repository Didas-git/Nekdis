import { Document } from "./document";
import { methods, parse, schemaData } from "./utils";
import { randomUUID } from "node:crypto";
import { Search } from "./search";
import type { Schema } from "./schema";
import type { ExtractParsedSchemaDefinition, SchemaDefinition, MapSchema, MethodsDefinition, RedisClient, ParsedMap, ParseSchema } from "./typings";

export class Model<S extends Schema<SchemaDefinition, MethodsDefinition>> {
    readonly #schema: S;
    readonly #client: RedisClient;
    readonly #searchIndexName: string;
    readonly #searchIndex: Array<string> = ["FT.CREATE"];
    readonly #parsedSchema: ParsedMap;
    readonly #validate: boolean;

    public constructor(client: RedisClient, public readonly name: string, data: S) {
        this.#client = client;
        this.#schema = data;
        this.#searchIndexName = `${name}:index`;
        this.#parsedSchema = parse(this.#schema[schemaData]);
        this.#defineMethods();
        this.#validate = !this.#schema.options.skipDocumentValidation;
    }

    public async get(id: string | number): Promise<Document<ExtractParsedSchemaDefinition<S>> & MapSchema<ExtractParsedSchemaDefinition<S>> | null> {
        if (typeof id === "undefined") throw new Error();
        const data = await this.#client.json.get(`${this.name}:${id}`);

        if (data === null) return null;

        return <never>new Document(this.#schema[schemaData], id.toString(), data, this.#validate);
    }

    public create(id?: string | number): Document<ExtractParsedSchemaDefinition<S>> & MapSchema<ExtractParsedSchemaDefinition<S>> {
        return <never>new Document(this.#schema[schemaData], id?.toString() ?? randomUUID(), void 0, this.#validate);
    }

    public async save(doc: Document<ParseSchema<any>>): Promise<void> {
        if (typeof doc === "undefined") throw new Error();

        await this.#client.json.set(`${this.name}:${doc.$id}`, "$", <never>JSON.parse(doc.toString()));
    }

    public async delete(...docs: Array<string | number | Document<ParseSchema<any>>>): Promise<void> {
        if (!docs.length) throw new Error();
        await this.#client.del(docs.map((el) => `${this.name}:${el instanceof Document ? el.$id : el.toString()}`));
    }

    public async exists(...docs: Array<string | number | Document<ParseSchema<any>>>): Promise<number> {
        if (!docs.length) throw new Error();
        return await this.#client.exists(docs.map((el) => `${this.name}:${el instanceof Document ? el.$id : el.toString()}`));
    }

    public expire(docs: Array<string | number | Document<ParseSchema<any>>>, seconds: number, mode?: "NX" | "XX" | "GT" | "LT"): void {
        if (!docs.length) throw new Error();
        docs.map((el) => `${this.name}:${el instanceof Document ? el.$id : el.toString()}`);

        for (let i = 0, len = docs.length; i < len; i++) {
            const doc = docs[i];
            //@ts-expect-error TS is not catching the `.map` changes
            this.#client.expire(doc, seconds, mode);
        }
    }

    public async createAndSave(data: { $id?: string | number } & MapSchema<ExtractParsedSchemaDefinition<S>>): Promise<void> {
        const doc = new Document(this.#schema[schemaData], data.$id?.toString() ?? randomUUID(), data, this.#validate);
        await this.save(doc);
    }

    public search(): Search<ExtractParsedSchemaDefinition<S>> {
        return new Search<ExtractParsedSchemaDefinition<S>>(this.#client, <never>this.#schema[schemaData], this.#parsedSchema, this.#searchIndexName, this.#validate);
    }

    public async createIndex(): Promise<void> {

        await this.deleteIndex();

        this.#searchIndex.push(this.#searchIndexName, "ON", "JSON", "PREFIX", "1", `${this.name}:`, "SCHEMA");
        for (let i = 0, len = this.#parsedSchema.size, entries = [...this.#parsedSchema.entries()]; i < len; i++) {
            const [key, val] = entries[i];
            const { path, value } = val;
            let arrayPath = "";

            if (value.type === "array") {
                if (typeof value.elements !== "string") {
                    throw new Error("Object definitions on `array` are not yet supported by the parser");
                }

                arrayPath = value.elements === "text" ? "[*]" : value.elements === "number" || value.elements === "date" || value.elements === "point" ? "" : "*";
            }

            this.#searchIndex.push(
                `$.${key}${arrayPath}`,
                "AS",
                path,
                value.type === "text" ? "TEXT" : value.type === "number" || value.type === "date" ? "NUMERIC" : value.type === "point" ? "GEO" : "TAG"
            );

            if (value.sortable) this.#searchIndex.push("SORTABLE");
        }

        await this.#client.sendCommand(this.#searchIndex);
    }

    public async deleteIndex(): Promise<void> {
        await this.#client.sendCommand(["FT.DROPINDEX", this.#searchIndexName]).catch((e) => {
            if (e instanceof Error && e.message === "Unknown Index name") {
                Promise.resolve();
            } else throw e;
        });
    }

    public async rawSearch(...args: Array<string>): Promise<ReturnType<RedisClient["ft"]["search"]>> {
        return await this.#client.ft.search(this.#searchIndexName, args.join(" "));
    }

    #defineMethods(): void {
        for (let i = 0, entries = Object.entries(this.#schema[methods]), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            //@ts-expect-error Pending fix on type notations
            this[key] = value;
        }
    }
}