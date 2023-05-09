import { ReferenceArray, dateToNumber, deepMerge, getLastKeyInSchema, hashFieldToString, objectToString, stringToHashField, stringToObject } from "./utils";

import type { ObjectField, ParseSchema } from "./typings";

export class Document<S extends ParseSchema<any>> {

    readonly #schema: S;
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

    public constructor(schema: S, public $key_name: string, public $id: string | number, data?: {}, validate: boolean = true, wasAutoFetched: boolean = false, structure: "JSON" | "HASH" = "JSON") {

        this.$record_id = `${$key_name}:${$id}`;
        this.#schema = schema;
        this.#validate = validate;
        this.#autoFetch = wasAutoFetched;

        this.#populate();

        if (data) {
            if (structure === "HASH") {
                for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                    const [key, value] = entries[i];
                    const arr = key.split(".");

                    if (arr.length > 1) /* This is an object */ {
                        this[arr[0]] = deepMerge(this[arr[0]], stringToObject(arr, stringToHashField(getLastKeyInSchema(<Required<ObjectField>>schema.data[arr[0]]), <string>value)));
                        continue;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (schema.references[key] === null && !this.#autoFetch) {
                        this[key] = new ReferenceArray(...<Array<string>>stringToHashField({ type: "array" }, <string>value));
                        continue;
                    }

                    this[key] = stringToHashField(schema.data[key], <string>value);

                }
            } else /* JSON */ {
                for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                    const [key, value] = entries[i];
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (schema.references[key] === null && !this.#autoFetch) {
                        this[key] = new ReferenceArray(...<Array<string>>value);
                        continue;
                    }

                    if (schema.data[key].type === "date") {
                        this[key] = new Date(<number>value);
                        continue;
                    }

                    //@ts-expect-error elements exists but again ts is confused
                    if (schema.data[key].type === "array" && schema.data[key].elements === "date") {
                        for (let j = 0, le = (<Array<number>>value).length; j < le; j++) {
                            //@ts-expect-error Im not going to fill this with castings
                            value[j] = new Date(value[j]);
                        }
                        this[key] = value;
                        continue;
                    }

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

    #validateSchemaReferences(data: Document<ParseSchema<any>> | ParseSchema<any>["references"] = this, schema: ParseSchema<any>["references"] = this.#schema.references, isField: boolean = false): void {
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

    #validateSchemaData(data: Document<ParseSchema<any>> | ParseSchema<any>["data"] = this, schema: ParseSchema<any>["data"] = this.#schema.data, isField: boolean = false): void {
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
                if (!(dataVal instanceof Date) || typeof dataVal !== "number") throw new Error();
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public toJSONString(): string {
        if (this.#validate) this.#validateSchemaData();

        const obj: Record<string, unknown> = {};

        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, val] = entries[i];

            if (val.type === "date") {
                obj[key] = dateToNumber(this[key]);
                continue;
            }

            //@ts-expect-error elements exists but again ts is confused
            if (val.type === "array" && val.elements === "date") {
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
            if (this.#validate) this.#validateSchemaReferences();
            for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
                const key = keys[i];
                obj[key] = this[key];
            }
        }

        return JSON.stringify(obj, null);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    public toHASHString(): string {
        if (this.#validate) this.#validateSchemaData();

        let str = "";

        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            let [key, val] = entries[i];

            if (val.type === "object") {
                //@ts-expect-error Typescript is getting confused due to the union of array and object
                str += ` ${objectToString(this[key], key, val.properties)}`;
            } else {
                str += ` "${key}" "${hashFieldToString(val, this[key])}"`;
            }
        }

        if (!this.#autoFetch) {
            if (this.#validate) this.#validateSchemaReferences();
            for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
                const key = keys[i];

                str += ` "${key}" "${hashFieldToString({ type: "array" }, this[key])}"`;
            }
        }

        return str;
    }
}