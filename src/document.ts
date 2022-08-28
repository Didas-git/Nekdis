import { ParsedSchemaDefinition, SchemaDefinition } from "./typings";

export class Document<S extends SchemaDefinition> {
    readonly #schema: S;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in th class
    */
    [key: string]: any;

    public constructor(schema: S, public _id: string, data?: string) {

        this.#schema = schema;

        if (data) {
            // TODO
        }

        Object.keys(schema).forEach((key) => {
            if (this[key]) return;
            this[key] = (<ParsedSchemaDefinition><unknown>schema[key]).default;
        });
    }
}