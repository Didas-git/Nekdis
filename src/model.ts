import { createHash } from "node:crypto";

import { JSONDocument, HASHDocument } from "./document";
import { methods, schemaData } from "./utils/symbols";
import { parseSchemaToSearchIndex } from "./utils";
import { Search } from "./search";

import type { Schema } from "./schema";
import type {
    ExtractParsedSchemaDefinition,
    SchemaDefinition,
    MapSchema,
    MethodsDefinition,
    RedisClient,
    ParsedMap,
    ReturnDocument,
    Doc
} from "./typings";
import { stringToHashField } from "./document/document-helpers";

export class Model<S extends Schema<SchemaDefinition, MethodsDefinition>> {
    readonly #schema: S;
    readonly #client: RedisClient;
    readonly #globalPrefix: string;
    readonly #prefix: string;
    readonly #searchIndexName: string;
    readonly #searchIndexHashName: string;
    readonly #searchIndex: Array<string>;
    readonly #searchIndexHash: string;
    readonly #parsedSchema: ParsedMap;
    readonly #validate: boolean;
    readonly #ver: string;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    readonly #docType: typeof JSONDocument | typeof HASHDocument;

    public constructor(client: RedisClient, globalPrefix: string, ver: string, private readonly name: string, data: S) {
        this.#client = client;
        this.#schema = data;
        this.#ver = ver;
        this.#globalPrefix = globalPrefix;
        this.#prefix = this.#schema.options.prefix ?? this.#ver;
        this.#validate = !this.#schema.options.skipDocumentValidation;
        this.#parsedSchema = parseSchemaToSearchIndex(this.#schema[schemaData].data);
        this.#searchIndexName = `${globalPrefix}:${this.#prefix}:${this.name}:index`;
        this.#searchIndexHashName = `${globalPrefix}:${this.#prefix}:${this.name}:index:hash`;
        this.#searchIndex = [
            "FT.CREATE",
            this.#searchIndexName,
            "ON",
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            data.options.dataStructure!,
            "PREFIX",
            "1",
            `${globalPrefix}:${this.#prefix}:${this.name}:`,
            "SCHEMA"
        ];
        this.#searchIndexHash = createHash("sha1").update(JSON.stringify({
            name,
            structure: this.#schema.options.dataStructure,
            definition: this.#schema[schemaData].data
        })).digest("base64");

        this.#defineMethods();

        if (data.options.dataStructure === "HASH") this.#docType = HASHDocument;
        else this.#docType = JSONDocument;
    }

    public async get<F extends boolean = false>(id: string | number, autoFetch?: F): Promise<ReturnDocument<S, F> | null> {
        if (typeof id === "undefined") throw new Error();
        if (id.toString().split(":").length === 1) {
            const suffix = this.#schema.options.suffix;

            if (typeof suffix === "function") {
                throw new PrettyError("Due to the use of dynamic suffixes you gave to pass in a full id");
            }
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            id = `${this.#globalPrefix}:${this.#prefix}:${this.name}:${suffix ? `${suffix}:` : ""}${id}`;
        }

        const data = this.#schema.options.dataStructure === "JSON" ? await this.#client.json.get(id.toString()) : await this.#client.hGetAll(id.toString());

        if (data === null) return null;
        if (autoFetch) {
            for (let i = 0, keys = Object.keys(this.#schema[schemaData].references), len = keys.length; i < len; i++) {
                const key = keys[i];
                //@ts-expect-error node-redis types decided to die
                const val = this.#schema.options.dataStructure === "JSON" ? data[key] : stringToHashField({ type: "array" }, <string>data[key]);
                const temp = [];

                for (let j = 0, le = val.length; j < le; j++) {
                    temp.push(this.get(<string>val[j]));
                }

                //@ts-expect-error node-redis types decided to die
                data[key] = await Promise.all(temp);
            }
        }

        return <never>new this.#docType(this.#schema[schemaData], void 0, <never>data, true, this.#validate, autoFetch);
    }

    public create(id?: string | number): ReturnDocument<S>;
    public create(data?: { $id?: string | number } & MapSchema<ExtractParsedSchemaDefinition<S>, true, true>): ReturnDocument<S>;
    public create(idOrData?: string | number | { $id?: string | number } & MapSchema<ExtractParsedSchemaDefinition<S>, true, true>): ReturnDocument<S> {
        if (typeof idOrData === "object") {
            return <never>new this.#docType(this.#schema[schemaData], {
                globalPrefix: this.#globalPrefix,
                prefix: this.#prefix,
                name: this.name,
                suffix: this.#schema.options.suffix
            }, idOrData, false, this.#validate, false);
        }

        return <never>new this.#docType(this.#schema[schemaData], {
            globalPrefix: this.#globalPrefix,
            prefix: this.#prefix,
            name: this.name,
            suffix: this.#schema.options.suffix,
            id: idOrData?.toString()
        }, void 0, false, this.#validate, false);
    }

    public async save(doc: Doc): Promise<void> {
        if (typeof doc === "undefined") throw new Error();

        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        if (this.#schema.options.dataStructure === "HASH") await this.#client.sendCommand(["HSET", doc.$record_id, ...doc.toString()]);
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        else await this.#client.sendCommand(["JSON.SET", doc.$record_id, "$", doc.toString()]);
    }

    public async delete(...docs: Array<string | number | Doc>): Promise<void> {
        if (!docs.length) throw new Error();
        await this.#client.del(this.#stringOrDocToString(docs));
    }

    public async exists(...docs: Array<string | number | Doc>): Promise<number> {
        if (!docs.length) throw new Error();
        return await this.#client.exists(this.#stringOrDocToString(docs));
    }

    public async expire(docs: Array<string | number | Doc>, seconds: number | Date, mode?: "NX" | "XX" | "GT" | "LT"): Promise<void> {
        if (!docs.length) throw new Error();
        docs = this.#stringOrDocToString(docs);

        if (seconds instanceof Date) seconds = seconds.getTime() / 1000;

        const temp = [];

        for (let i = 0, len = docs.length; i < len; i++) {
            const doc = <string>docs[i];
            temp.push(this.#client.expire(doc, seconds, mode));
        }

        await Promise.all(temp);
    }

    public async createAndSave(data: { $id?: string | number } & MapSchema<ExtractParsedSchemaDefinition<S>, true, true>): Promise<void> {
        const doc = new this.#docType(this.#schema[schemaData], {
            globalPrefix: this.#globalPrefix,
            prefix: this.#prefix,
            name: this.name,
            suffix: this.#schema.options.suffix
        }, data, false, this.#validate, false);
        await this.save(doc);
    }

    public search(): Search<ExtractParsedSchemaDefinition<S>> {
        // eslint-disable-next-line max-len
        return new Search<ExtractParsedSchemaDefinition<S>>(this.#client, <never>this.#schema[schemaData], this.#parsedSchema, this.#searchIndexName, this.#validate, this.#schema.options.dataStructure);
    }

    public async createIndex(): Promise<void> {
        const currentIndexHash = await this.#client.get(this.#searchIndexHashName);
        if (currentIndexHash === this.#searchIndexHash) return;

        await this.deleteIndex();

        const prefix = this.#schema.options.dataStructure === "JSON" ? "$." : "";

        for (let i = 0, len = this.#parsedSchema.size, entries = [...this.#parsedSchema.entries()]; i < len; i++) {
            const [key, val] = entries[i];
            const { path, value } = val;
            let arrayPath = "";

            if (this.#schema.options.dataStructure === "JSON") {
                if (value.type === "array") {
                    if (typeof value.elements !== "string") {
                        throw new Error("Object definitions on `array` are not yet supported by the parser");
                    }

                    arrayPath = value.elements === "text" ? "[*]" : value.elements === "number" || value.elements === "date" || value.elements === "point" ? "" : "*";
                }
            }

            this.#searchIndex.push(
                `${prefix}${key}${arrayPath}`,
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

    #stringOrDocToString(stringOrNumOrDoc: Array<string | number | Doc>): Array<string> {
        const temp = [];

        for (let i = 0, len = stringOrNumOrDoc.length; i < len; i++) {
            const el = stringOrNumOrDoc[i];
            let id = "";

            if (el instanceof JSONDocument || el instanceof HASHDocument) {
                id = el.$record_id;
            } else if (el.toString().split(":").length === 1) {
                const suffix = this.#schema.options.suffix;

                if (typeof suffix === "function") {
                    throw new PrettyError("Due to the use of dynamic suffixes you gave to pass in a full id");
                }
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                id = `${this.#globalPrefix}:${this.#prefix}:${this.name}:${suffix ? `${suffix}:` : ""}${el.toString()}`;
            }

            temp.push(id);
        }

        return temp;
    }

    #defineMethods(): void {
        for (let i = 0, entries = Object.entries(this.#schema[methods]), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            //@ts-expect-error Pending fix on type notations
            this[key] = value;
        }
    }
}