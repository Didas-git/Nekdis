import { randomUUID } from "node:crypto";

import { ReferenceArray } from "../utils";
import {
    validateSchemaReferences,
    validateSchemaData,
    jsonFieldToDoc,
    dateToNumber,
    tupleToObjStrings
} from "./document-helpers";

import type { DocumentShared, ParseSchema } from "../typings";

export class JSONDocument implements DocumentShared {

    readonly #schema: ParseSchema<any>;
    readonly #validate: boolean;
    readonly #autoFetch: boolean;
    #validateSchemaReferences = validateSchemaReferences;
    #validateSchemaData = validateSchemaData;

    /** @internal */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public readonly $id: string;

    /** @internal */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public readonly $record_id: string;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in the class
    */
    /** @internal */
    [key: string]: any;

    public constructor(
        schema: ParseSchema<any>,
        public $key_name: string,
        data?: Record<string, any>,
        id?: string,
        isFetchedData: boolean = false,
        validate: boolean = true,
        wasAutoFetched: boolean = false
    ) {
        this.$id = data?.$id ?? id ?? randomUUID();
        this.$record_id = `${$key_name}:${this.$id}`;
        this.#schema = schema;
        this.#validate = validate;
        this.#autoFetch = wasAutoFetched;

        this.#populate();

        if (data) {
            if (isFetchedData) {
                for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                    const [key, value] = entries[i];

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
            this[key] = value.default ?? (value.type === "object" ? {} : void 0);
        }

        for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
            const key = keys[i];
            this[key] = new ReferenceArray();
        }
    }

    public toString(): string {
        if (this.#validate) this.#validateSchemaData(this.#schema.data);

        const obj: Record<string, unknown> = {};

        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, val] = entries[i];

            if (val.type === "tuple") {
                const temp = tupleToObjStrings(<never>this[key], key);
                for (let j = 0, le = temp.length; j < le; j++) {
                    const [k, value] = Object.entries(temp[j])[0];
                    obj[k] = value;
                }
                continue;
            } else if (val.type === "date") {
                obj[key] = dateToNumber(this[key]);
                continue;
                //@ts-expect-error elements exists but again ts is confused
            } else if (val.type === "array" && val.elements === "date") {
                const temp = this[key];
                for (let j = 0, le = temp.length; j < le; j++) {
                    temp[j] = dateToNumber(temp[j]);
                }
                obj[key] = temp;
                continue;
            }

            obj[key] = this[key];
        }

        if (!this.#autoFetch) {
            if (this.#validate) this.#validateSchemaReferences(this.#schema.references);
            for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
                const key = keys[i];
                obj[key] = this[key];
            }
        }

        return JSON.stringify(obj, null);
    }
}