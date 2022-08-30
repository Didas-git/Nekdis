import { FieldTypes, ParsedSchemaDefinition, SchemaDefinition } from "./typings";

export class Document<S extends SchemaDefinition> {

    readonly #schema: S;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in th class
    */
    [key: string]: any;

    public constructor(schema: S, public _id: string, data?: {}) {

        this.#schema = schema

        if (data) {
            Object.keys(data).forEach((key) => {
                //@ts-expect-error
                this[key] = data[key];
            });
        }

        Object.keys(schema).forEach((key) => {
            if (this[key]) return;
            this[key] = (<ParsedSchemaDefinition><unknown>schema[key]).default;
        });
    }

    public toString(): string {
        const obj: Record<string, FieldTypes> = {};

        Object.keys(this.#schema).forEach((key) => {
            obj[key] = this[key];
        });

        return JSON.stringify(obj, null);
    }
}