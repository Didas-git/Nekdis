import type { FieldTypes, ObjectField, ParseSchema } from "./typings";

export class Document<S extends ParseSchema<any>> {

    readonly #schema: S;
    readonly #validate: boolean;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in th class
    */
    [key: string]: any;

    public constructor(schema: S, public $id: string | number, data?: {}, validate: boolean = true) {

        this.#schema = schema;
        this.#validate = validate;

        for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            if (value.type === "reference") {
                this[key] = [];
                continue;
            }
            //@ts-expect-error Due to the complexity of the types ts is not catching the if check above
            this[key] = value.default;
        }

        if (data) {
            for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                const [key, value] = entries[i];
                this[key] = value;
            }
        }
    }

    #validateData(data: Document<ParseSchema<any>> | ParseSchema<any> = this, schema: ParseSchema<any> = this.#schema, isField: boolean = false): void {
        for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            if (isField && !data[key]) throw new Error();

            const dataVal = data[key];

            if (dataVal === null) throw new Error();

            if (value.type === "reference") {
                if (typeof dataVal === "undefined") throw new Error();
                dataVal.every((val: unknown) => {
                    if (typeof val !== "string") throw new Error();
                });
                continue;
            }

            //@ts-expect-error Due to the complexity of the types ts is not catching the if check on references
            if (typeof dataVal === "undefined" && !value.required) continue;
            //@ts-expect-error Due to the complexity of the types ts is not catching the if check on references
            if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined") throw new Error();

            if (value.type === "object") {
                if (!(<ObjectField>value).properties) continue;
                //@ts-expect-error Typescript is getting confused due to the union of array and object
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                this.#validateData(dataVal, value.properties, true);
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
        this.#validate && this.#validateData();
        const obj: Record<string, FieldTypes> = {};

        for (let i = 0, keys = Object.keys(this.#schema), len = keys.length; i < len; i++) {
            const key = keys[i];
            obj[key] = this[key];
        }

        return JSON.stringify(obj, null);
    }
}