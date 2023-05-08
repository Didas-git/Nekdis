import { randomUUID, createHash } from "node:crypto";

import { stringOrDocToString } from "./utils/string-or-document-to-string";
import { RecordRegex, extractIdFromRecord } from "./utils/extract-id";
import { methods, parse, schemaData } from "./utils";
import { Document } from "./document";
import { Search } from "./search";

import type { Schema } from "./schema";
import type {
    ExtractParsedSchemaDefinition,
    SchemaDefinition,
    MapSchema,
    MethodsDefinition,
    RedisClient,
    ParsedMap,
    ParseSchema,
    ReturnDocument
} from "./typings";

export class Model<S extends Schema<SchemaDefinition, MethodsDefinition>> {
    readonly #schema: S;
    readonly #client: RedisClient;
    readonly #searchIndexName: string;
    readonly #searchIndexHashName: string;
    readonly #searchIndex: Array<string>;
    readonly #searchIndexHash: string;
    readonly #parsedSchema: ParsedMap;
    readonly #validate: boolean;

    public constructor(client: RedisClient, public readonly name: string, data: S) {
        this.#client = client;
        this.#schema = data;
        this.#validate = !this.#schema.options.skipDocumentValidation;
        this.#parsedSchema = parse(this.#schema[schemaData].data);
        this.#searchIndexName = `${name}:nekdis:index`;
        this.#searchIndexHashName = `${name}:nekdis:index:hash`;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#searchIndex = ["FT.CREATE", this.#searchIndexName, "ON", data.options.dataStructure!, "PREFIX", "1", `${this.name}:`, "SCHEMA"];
        this.#searchIndexHash = createHash("sha1").update(JSON.stringify({
            name,
            structure: this.#schema.options.dataStructure,
            definition: this.#schema[schemaData].data
        })).digest("base64");

        this.#defineMethods();
    }

    public async get<F extends boolean = false>(id: string | number, autoFetch?: F): Promise<ReturnDocument<S, F> | null> {
        if (typeof id === "undefined") throw new Error();
        if (RecordRegex.exec(id.toString()) === null) {
            console.log(id);
            id = `${this.name}:${id}`;
        }
        const data = await this.#client.json.get(id.toString());

        if (data === null) return null;
        if (autoFetch) {
            for (let i = 0, keys = Object.keys(this.#schema[schemaData].references), len = keys.length; i < len; i++) {
                const key = keys[i];
                //@ts-expect-error node-redis types decided to die
                const val = data[key];
                const temp = [];

                for (let j = 0, le = val.length; j < le; j++) {
                    temp.push(this.get(<string>val[j]));
                }

                //@ts-expect-error node-redis types decided to die
                data[key] = await Promise.all(temp);
            }
        }

        return <never>new Document(this.#schema[schemaData], this.name, extractIdFromRecord(id.toString()), data, this.#validate, autoFetch);
    }

    public create(id?: string | number): ReturnDocument<S> {
        return <never>new Document(this.#schema[schemaData], this.name, id?.toString() ?? randomUUID(), void 0, this.#validate);
    }

    public async save(doc: Document<ParseSchema<any>>): Promise<void> {
        if (typeof doc === "undefined") throw new Error();

        await this.#client.sendCommand(["JSON.SET", `${this.name}:${doc.$id}`, "$", doc.toString()]);
    }

    public async delete(...docs: Array<string | number | Document<ParseSchema<any>>>): Promise<void> {
        if (!docs.length) throw new Error();
        await this.#client.del(stringOrDocToString(docs, this.name));
    }

    public async exists(...docs: Array<string | number | Document<ParseSchema<any>>>): Promise<number> {
        if (!docs.length) throw new Error();
        return await this.#client.exists(stringOrDocToString(docs, this.name));
    }

    public async expire(docs: Array<string | number | Document<ParseSchema<any>>>, seconds: number, mode?: "NX" | "XX" | "GT" | "LT"): Promise<void> {
        if (!docs.length) throw new Error();
        docs = stringOrDocToString(docs, this.name);
        const temp = [];

        for (let i = 0, len = docs.length; i < len; i++) {
            const doc = <string>docs[i];
            temp.push(this.#client.expire(doc, seconds, mode));
        }

        await Promise.all(temp);
    }

    public async createAndSave(data: { $id?: string | number } & MapSchema<ExtractParsedSchemaDefinition<S>, true, true>): Promise<void> {
        const doc = new Document(this.#schema[schemaData], this.name, data.$id?.toString() ?? randomUUID(), data, this.#validate, true);
        await this.save(doc);
    }

    public search(): Search<ExtractParsedSchemaDefinition<S>> {
        return new Search<ExtractParsedSchemaDefinition<S>>(this.#client, <never>this.#schema[schemaData], this.#parsedSchema, this.name, this.#searchIndexName, this.#validate);
    }

    public async createIndex(): Promise<void> {
        const currentIndexHash = await this.#client.get(this.#searchIndexHashName);
        if (currentIndexHash === this.#searchIndexHash) return;

        await this.deleteIndex();

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

        await Promise.all([
            this.#client.set(this.#searchIndexHashName, this.#searchIndexHash),
            this.#client.sendCommand(this.#searchIndex)
        ]);
    }

    public async deleteIndex(): Promise<void> {
        try {
            await Promise.all([
                this.#client.unlink(this.#searchIndexHashName),
                this.#client.ft.dropIndex(this.#searchIndexName)
            ]);
        } catch (e) {
            if (e instanceof Error && e.message === "Unknown Index name") {
                Promise.resolve();
            } else throw e;
        }
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