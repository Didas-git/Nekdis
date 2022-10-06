import { Schema } from "./schema";
import { Document } from "./document";
import { parse, proxyHandler, schemaData } from "./utils";
import { ExtractSchemaDefinition, SchemaDefinition, MapSchema, MethodsDefinition, ParsedSchemaDefinition, RedisClient, Parsed } from "./typings";
import { randomUUID } from "node:crypto";
import { Search } from "./search";

export class Model<S extends Schema<SchemaDefinition, MethodsDefinition>> {
    readonly #schema: S;
    readonly #client: RedisClient;
    readonly #searchIndexName: string;
    readonly #searchIndex: Array<string> = ["FT.CREATE"];
    readonly #parsedSchema = new Map<Parsed["pars"], Parsed>();

    public constructor(client: RedisClient, public readonly name: string, data: S) {
        this.#client = client;
        this.#schema = data;
        this.#searchIndexName = `${name}:index`;
        parse(<ParsedSchemaDefinition>this.#schema[schemaData]).forEach((parsedVal) => {
            this.#parsedSchema.set(parsedVal.pars, { value: parsedVal.value, pars: parsedVal.pars.replace(/[.]/g, "_") });
        });
    }

    // TODO: #defineMethods()

    public async get(id: string | number): Promise<Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>> | null> {
        if (!id) throw new Error();
        const data = await this.#client.json.get(`${this.name}:${id}`);

        if (!data) return null;

        return <any>new Proxy(new Document(this.#schema[schemaData], id.toString(), data), proxyHandler);
    }

    public create(id?: string | number): Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>> {
        // Using `any` because of the MapSchema type
        return <any>new Proxy(new Document(this.#schema[schemaData], id?.toString() ?? randomUUID()), proxyHandler);
    }

    public async save(doc: Document<SchemaDefinition>) {
        if (!doc) throw new Error();

        await this.#client.json.set(`${this.name}:${doc._id}`, "$", JSON.parse(doc.toString()));
    }

    public async delete(...docs: Array<string | number | Document<SchemaDefinition>>) {
        if (!docs) throw new Error();
        await this.#client.del(docs.map((el) => `${this.name}:${el instanceof Document ? el._id : el.toString()}`));
    };

    public async exists(...docs: Array<string | number | Document<SchemaDefinition>>) {
        if (!docs) throw new Error();
        return await this.#client.exists(docs.map((el) => `${this.name}:${el instanceof Document ? el._id : el.toString()}`));
    };

    public async expire(docs: Array<string | number | Document<SchemaDefinition>>, seconds: number, mode?: 'NX' | 'XX' | 'GT' | 'LT') {
        if (!docs) throw new Error();
        docs.map((el) => `${this.name}:${el instanceof Document ? el._id : el.toString()}`).forEach((doc) => {
            this.#client.expire(doc, seconds, mode);
        });
    }

    public async createAndSave(data: { _id?: string | number; } & MapSchema<ExtractSchemaDefinition<S>, true>) {
        const doc = new Proxy(new Document(this.#schema[schemaData], data._id?.toString() ?? randomUUID(), data), proxyHandler);
        await this.save(doc);
    }

    public search() {
        return new Search<ExtractSchemaDefinition<S>>(this.#client, <any>this.#schema[schemaData], this.#parsedSchema, this.#searchIndexName);
    }

    public async createIndex() {

        await this.deleteIndex();

        this.#searchIndex.push(this.#searchIndexName, "ON", "JSON", "PREFIX", "1", `${this.name}:`, "SCHEMA");
        this.#parsedSchema.forEach((val, key) => {
            this.#searchIndex.push(
                `$.${key}${val.value.type === "array" ? "[*]" : ""}`,
                "AS",
                val.pars,
                val.value.type === "text" ? "TEXT" : val.value.type === "number" ? "NUMERIC" : val.value.type === "point" ? "GEO" : "TAG"
            );
        });

        await this.#client.sendCommand(this.#searchIndex);
    }

    public async deleteIndex(DD: boolean = false) {
        await this.#client.sendCommand(["FT.DROPINDEX", this.#searchIndexName, DD ? "DD" : ""]).catch((e) => {
            if (e instanceof Error && e.message === "Unknown Index name") { }
            else throw e;
        });
    }

    public async rawSearch(...args: Array<string>) {
        return this.#client.ft.search(this.#searchIndexName, args.join(" "));
    }
}