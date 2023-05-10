import { ReferenceArray, deepMerge, getLastKeyInSchema, hashFieldToString, objectToString, stringToHashField, stringToObject } from "../utils";

import type { DocumentShared, ObjectField, ParseSchema } from "../typings";

export class HASHDocument implements DocumentShared {

    readonly #schema: ParseSchema<any>;
    readonly #validate: boolean;
    readonly #autoFetch: boolean;

    /** @internal */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public readonly $record_id: string;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in the class
    */
    [key: string]: any;

    public constructor(schema: ParseSchema<any>, public $key_name: string, public $id: string | number, data?: {}, isFetchedData: boolean = false, validate: boolean = true, wasAutoFetched: boolean = false) {

        this.$record_id = `${$key_name}:${$id}`;
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

                    this[key] = stringToHashField(schema.data[key], <string>value);
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

    #validateSchemaReferences(data: HASHDocument | ParseSchema<any>["references"] = this, schema: ParseSchema<any>["references"] = this.#schema.references, isField: boolean = false): void {
        for (let i = 0, keys = Object.keys(schema), len = keys.length; i < len; i++) {
            const key = keys[i];
            if (isField && !data[key]) throw new Error();

            const dataVal = data[key];

            if (typeof dataVal === "undefined") throw new Error();

            for (let j = 0, le = dataVal.length; j < le; j++) {
                const val = dataVal[i];
                if (typeof val !== "string") throw new Error();
            }
        }

    }

    #validateSchemaData(data: HASHDocument | ParseSchema<any>["data"] = this, schema: ParseSchema<any>["data"] = this.#schema.data, isField: boolean = false): void {
        for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];

            if (isField && !data[key]) throw new Error();

            const dataVal = data[key];

            if (dataVal === null) throw new Error();

            if (typeof dataVal === "undefined" && !value.required) continue;
            if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined") throw new Error();

            if (value.type === "object") {
                if (!(<ObjectField>value).properties) continue;
                //@ts-expect-error Typescript is getting confused due to the union of array and object
                this.#validateSchemaData(dataVal, value.properties, true);
            } else if (value.type === "array") {
                dataVal.every((val: unknown) => {
                    //@ts-expect-error Typescript is getting confused due to the union of array and object
                    if (typeof val !== value.elements) throw new Error();
                });

            } else if (value.type === "date") {
                if (!(dataVal instanceof Date) && typeof dataVal !== "number") throw new Error();
            } else if (value.type === "point") {
                if (typeof dataVal !== "object") throw new Error();
                if (!dataVal.longitude || !dataVal.latitude) throw new Error();
                if (Object.keys(dataVal).length > 2) throw new Error();
            } else if (value.type === "text") {
                if (typeof dataVal !== "string") throw new Error();
            } else {
                // This handles `number`, `boolean` and `string` types
                if (typeof dataVal !== value.type) throw new Error();
            }
        }
    }

    public toString(): string {
        if (this.#validate) this.#validateSchemaData();

        const arr = [];

        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, val] = entries[i];

            if (val.type === "object") {
                //@ts-expect-error Typescript is getting confused due to the union of array and object
                arr.push(...objectToString(this[key], key, val.properties));
            } else {
                arr.push(key, hashFieldToString(val, this[key]));
            }
        }

        if (!this.#autoFetch) {
            if (this.#validate) this.#validateSchemaReferences();
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