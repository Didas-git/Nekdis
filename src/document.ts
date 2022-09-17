import { FieldTypes, ParsedSchemaDefinition, SchemaDefinition } from "./typings";

export class Document<S extends SchemaDefinition> {

    readonly #schema: S;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in th class
    */
    [key: string | symbol]: any;

    public constructor(schema: S, public _id: string | number, data?: {}) {

        this.#schema = schema

        if (data) {
            Object.keys(data).forEach((key) => {
                //@ts-expect-error
                this[key] = { value: data[key], type: schema[key].type };
            });
        }

        Object.keys(schema).forEach((key) => {
            if (this[key]) return;
            this[key] = { value: (<ParsedSchemaDefinition><unknown>schema[key]).default, type: (<ParsedSchemaDefinition><unknown>schema[key]).type };
        });
    }

    #validateData(dat?: Document<SchemaDefinition> | SchemaDefinition, schem?: ParsedSchemaDefinition, isField: boolean = false): void {
        const schema = schem ?? <ParsedSchemaDefinition>this.#schema
        const data = dat ?? this;
        Object.keys(schema).forEach((val) => {
            if (!isField && !new Set(Object.keys(data)).has(val)) throw new Error();

            const value = schema[val];
            const dataVal = data[val];

            if (dataVal === null) return;
            if (typeof dataVal === "undefined" && !value.required) return;
            if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined") throw new Error();

            if (value.type === "object") {
                if (!value.data) return;
                this.#validateData(dataVal, <ParsedSchemaDefinition>value.data, true);
            } else if (value.type === "array") {
                if (typeof value.elements === "object")
                    this.#validateData(dataVal, <ParsedSchemaDefinition>value.elements, true);
                else {
                    dataVal.every((vall: unknown) => {
                        if (typeof vall !== value.elements) throw new Error();
                    });
                }
            } else if (value.type === "tuple") {
                (<Array<FieldTypes>>value.elements).forEach((element, i) => {
                    this.#validateData(<SchemaDefinition><unknown>{ ...[dataVal[i]] }, <ParsedSchemaDefinition><unknown>{ ...[element] }, true);
                });
            };
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