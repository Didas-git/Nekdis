import { randomUUID } from "node:crypto";

import { ReferenceArray } from "../utils";
import {
    validateSchemaReferences,
    validateSchemaData,
    getLastKeyInSchema,
    hashFieldToString,
    stringToHashField,
    objectToString,
    stringToObject,
    deepMerge
} from "./document-helpers";

import type { DocumentShared, ObjectField, ParseSchema } from "../typings";

export class HASHDocument implements DocumentShared {

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
                    const arr = key.split(".");

                    if (arr.length > 1) /* This is an object */ {
                        this[arr[0]] = deepMerge(
                            this[arr[0]],
                            stringToObject(
                                arr,
                                stringToHashField(
                                    getLastKeyInSchema(<Required<ObjectField>>schema.data[arr[0]], <string>arr.at(-1)) ?? { type: "string" },
                                    <string>value
                                )
                            )[arr[0]]
                        );
                        continue;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (schema.references[key] === null && !this.#autoFetch) {
                        this[key] = new ReferenceArray(...<Array<string>>stringToHashField({ type: "array" }, <string>value));
                        continue;
                    }

                    this[key] = stringToHashField(<never>schema.data[key], <string>value);
                }
            } else {
                for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                    const [key, value] = entries[i];
                    this[key] = value;
                }
            }
        }
    }

    #populate(): void {
        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            this[key] = value.default ?? value.type === "object" ? {} : void 0;
        }

        for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
            const key = keys[i];
            this[key] = new ReferenceArray();
        }
    }

    public toString(): string {
        if (this.#validate) this.#validateSchemaData(this.#schema.data);

        const arr = [];

        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, val] = entries[i];

            if (val.type === "object") {
                //@ts-expect-error Typescript is getting confused due to the union of array and object
                arr.push(...objectToString(this[key], key, val.properties));
            } else {
                arr.push(key, hashFieldToString(<never>val, this[key]));
            }
        }

        if (!this.#autoFetch) {
            if (this.#validate) this.#validateSchemaReferences(this.#schema.references);
            for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
                const key = keys[i];

                arr.push(key, hashFieldToString({ type: "array" }, this[key]) ?? "");
            }
        }

        //@ts-expect-error pls dont question it
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return arr;
    }
}