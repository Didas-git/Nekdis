import type { FieldTypes, ObjectField, ParseSchema } from "./typings";

export class Document<S extends ParseSchema<any>> {

    readonly #schema: S;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in th class
    */
    [key: string]: any;

    public constructor(schema: S, public $id: string | number, data?: {}) {

        this.#schema = schema;

        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                this[key] = value;
            });
        }

        Object.entries(schema).forEach(([key, value]) => {
            if (typeof this[key] !== "undefined") return;
            this[key] = value.default;
        });
    }

    #validateData(data: Document<ParseSchema<any>> | ParseSchema<any> = this, schema: ParseSchema<any> = <ParseSchema<any>>this.#schema, isField: boolean = false): void {
        Object.entries(schema).forEach(([key, value]) => {
            if (isField && !data[key]) throw new Error();

            const dataVal = data[key];

            if (dataVal === null) throw new Error();
            if (typeof dataVal === "undefined" && !value.required) return;
            if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined") throw new Error();

            if (value.type === "object") {
                if (!(<ObjectField>value).properties) return;
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
        });
    }

    public toString(): string {
        this.#validateData();
        const obj: Record<string, FieldTypes> = {};

        Object.keys(this.#schema).forEach((key) => {
            obj[key] = this[key];
        });

        return JSON.stringify(obj, null);
    }
}