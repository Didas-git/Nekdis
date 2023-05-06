import type { FieldTypes, ObjectField, ParseSchema } from "./typings";
import { ReferenceArray } from "./utils";

export class Document<S extends ParseSchema<any>> {

    readonly #schema: S;
    readonly #validate: boolean;
    readonly #autoFetch: boolean;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    public readonly $record_id: string;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in th class
    */
    [key: string]: any;

    public constructor(schema: S, public $key_name: string, public $id: string | number, data?: {}, validate: boolean = true, wasAutoFetched: boolean = false) {

        this.$record_id = `${$key_name}:${$id}`;
        this.#schema = schema;
        this.#validate = validate;
        this.#autoFetch = wasAutoFetched;

        this.#populate();

        if (data) {
            for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                const [key, value] = entries[i];
                if (typeof schema.references[key] !== "undefined" && !this.#autoFetch) {
                    this[key] = new ReferenceArray(...<Array<string>>value);
                    continue;
                }
                this[key] = value;
            }
        }
    }

    #populate(): void {
        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            this[key] = value.default;
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
        if (this.#validate) {
            this.#validateSchemaData();
        }

        const obj: Record<string, FieldTypes> = {};

        for (let i = 0, keys = Object.keys(this.#schema.data), len = keys.length; i < len; i++) {
            const key = keys[i];
            obj[key] = this[key];
        }

        if (!this.#autoFetch) {
            this.#validateSchemaReferences();
            for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
                const key = keys[i];
                obj[key] = this[key];
            }
        }

        return JSON.stringify(obj, null);
    }
}