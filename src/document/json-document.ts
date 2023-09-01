/* eslint-disable @typescript-eslint/naming-convention */
import { randomUUID } from "node:crypto";

import { ReferenceArray } from "../utils";
import {
    validateSchemaReferences,
    validateSchemaData,
    tupleToObjStrings,
    jsonFieldToDoc,
    docToJson
} from "./document-helpers";

import type { DocumentShared, ParsedTupleField, ParsedObjectField, ParsedSchemaDefinition } from "../typings";

export class JSONDocument implements DocumentShared {

    readonly #schema: ParsedSchemaDefinition;
    readonly #validate: boolean;
    readonly #autoFetch: boolean;
    #validateSchemaReferences = validateSchemaReferences;
    #validateSchemaData = validateSchemaData;

    readonly #global_prefix: string;
    readonly #prefix: string;
    readonly #model_name: string;
    readonly #suffix: string | undefined;
    readonly #id: string;
    readonly #record_id: string;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in the class
    */
    /** @internal */
    [key: string]: any;

    public constructor(
        schema: ParsedSchemaDefinition,
        record: {
            globalPrefix: string,
            prefix: string,
            name: string,
            suffix?: string | (() => string) | undefined,
            id?: string | undefined
        },
        data?: Record<string, any>,
        isFetchedData: boolean = false,
        validate: boolean = true,
        wasAutoFetched: boolean = false
    ) {
        this.#global_prefix = record.globalPrefix;
        this.#prefix = record.prefix;
        this.#model_name = record.name;
        this.#suffix = data?.$suffix ?? (typeof record.suffix === "function" ? record.suffix() : record.suffix);
        this.#id = data?.$id?.toString() ?? record.id ?? randomUUID();
        this.#record_id = `${this.#global_prefix}:${this.#prefix}:${this.#model_name}:${this.#suffix ? `${this.#suffix}:` : ""}${this.#id}`;
        this.#schema = schema;
        this.#validate = validate;
        this.#autoFetch = wasAutoFetched;

        this.#populate();

        if (data) {
            if (isFetchedData) {
                for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                    const [key, value] = entries[i];
                    if (key.startsWith("$")) continue;
                    const arr = key.split(".");

                    if (arr.length > 1) /* This is a tuple */ {

                        // var name
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const temp = arr.shift()!;

                        if (arr.length === 1) {
                            this[temp].push(jsonFieldToDoc(<never>(<ParsedTupleField>schema.data[temp]).elements[<`${number}`>arr[0]], value));
                            continue;
                        }

                        this[temp].push({ [arr[1]]: jsonFieldToDoc(<never>(<ParsedObjectField>(<ParsedTupleField>schema.data[temp]).elements[<`${number}`>arr[0]]).properties?.[arr[1]], value) });
                        continue;
                    }

                    if (typeof schema.data[key] !== "undefined") {
                        this[key] = jsonFieldToDoc(<never>schema.data[key], value);
                        continue;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (schema.references[key] === null && !this.#autoFetch) {
                        this[key] = new ReferenceArray(...<Array<string>>value);
                        continue;
                    }

                    this[key] = value;
                }
            } else {
                for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                    const [key, value] = entries[i];
                    if (key.startsWith("$")) continue;
                    this[key] = value;
                }
            }
        }
    }

    #populate(): void {
        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            this[key] = value.default ?? (value.type === "object"
                ? {}
                : value.type === "tuple" || value.type === "array"
                    ? []
                    : value.type === "vector"
                        ? value.vecType === "FLOAT32"
                            ? new Float32Array()
                            : new Float64Array()
                        : void 0);
        }

        for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
            const key = keys[i];
            this[key] = new ReferenceArray();
        }
    }

    public toString(): string {
        if (this.#validate) this.#validateSchemaData(this.#schema.data, this);

        const obj: Record<string, unknown> = {
            $suffix: this.#suffix,
            $id: this.#id
        };

        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, val] = entries[i];
            if (typeof this[key] === "undefined") continue;

            if (val.index) {
                if (val.type === "tuple") {
                    const temp = tupleToObjStrings(<never>this[key], key);
                    for (let j = 0, le = temp.length; j < le; j++) {
                        const [k, value] = Object.entries(temp[j])[0];

                        if (val.elements[j].type === "object") {
                            if ((<ParsedObjectField>val.elements[j]).properties === null) continue;
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            for (let u = 0, en = Object.entries((<ParsedObjectField>val.elements[j]).properties!), l = en.length; u < l; u++) {
                                const objV = en[u][1];
                                obj[k] = docToJson(<any>objV, value);
                            }
                            continue;
                        }

                        obj[k] = value;
                    }
                    continue;
                }
            }

            obj[key] = docToJson(<never>val, this[key]);
        }

        if (!this.#autoFetch) {
            if (this.#validate) this.#validateSchemaReferences(this.#schema.references, this);
            for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
                const key = keys[i];
                obj[key] = this[key];
            }
        }
        return JSON.stringify(obj, null);
    }

    public get $globalPrefix(): string {
        return this.#global_prefix;
    }

    public get $prefix(): string {
        return this.#prefix;
    }

    public get $model_name(): string {
        return this.#model_name;
    }

    public get $suffix(): string | undefined {
        return this.#suffix;
    }

    public get $id(): string {
        return this.#id;
    }

    public get $record_id(): string {
        return this.#record_id;
    }
}