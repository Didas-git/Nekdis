import type { FieldTypes, ParsedSchemaDefinition, SchemaDefinition } from "./typings";

export class Document<S extends SchemaDefinition> {

    readonly #schema: S;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in th class
    */
    [key: string]: any;

    public constructor(schema: S, public $id: string | number, data?: {}) {

        this.#schema = schema

        if (data) {
            Object.keys(data).forEach((key) => {
                //@ts-expect-error
                this[key] = data[key];
            });
        }

        Object.keys(schema).forEach((key) => {
            if (typeof this[key] !== "undefined") return;
            this[key] = (<ParsedSchemaDefinition><unknown>schema[key]).default;
        });
    }

    #validateData(dat?: Document<SchemaDefinition> | SchemaDefinition, schem?: ParsedSchemaDefinition, isField: boolean = false): void {
        const schema = schem ?? <ParsedSchemaDefinition>this.#schema
        const data = dat ?? this;
        Object.keys(schema).forEach((val) => {
            if (isField && !data[val]) throw new Error();

            const value = schema[val];
            const dataVal = data[val];

            if (dataVal === null) throw new Error();
            if (typeof dataVal === "undefined" && !value.required) return;
            if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined") throw new Error();

            if (value.type === "object") {
                if (!value.properties) return;
                this.#validateData(dataVal, <ParsedSchemaDefinition>value.properties, true);
            } else if (value.type === "array") {
                if (typeof value.elements === "object")
                    this.#validateData(dataVal, <ParsedSchemaDefinition>value.elements, true);
                else {
                    dataVal.every((vall: unknown) => {
                        if (typeof vall !== value.elements) throw new Error();
                    });
                }
                // } else if (value.type === "tuple") {
                //     (<Array<FieldTypes>>value.elements).forEach((element, i) => {
                //         this.#validateData(<SchemaDefinition><unknown>{ ...[dataVal[i]] }, <ParsedSchemaDefinition><unknown>{ ...[element] }, true);
                //     });
            } else if (value.type === "date") {
                if (!(dataVal instanceof Date)) throw new Error();
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