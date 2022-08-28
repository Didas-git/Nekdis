import { readdir, readFile } from "node:fs/promises";
import { Client } from "./client";
import { ParsedSchemaDefinition, SchemaDefinition } from "./typings";
import { Document } from "./document";

export class Search<S extends SchemaDefinition> {
    //@ts-expect-error To implement
    #query: Record<string, unknown> = {};
    #path: string;
    #schema: ParsedSchemaDefinition;
    //@ts-expect-error To use yet (maybe not on the json client)
    #client: Client;

    public constructor(path: string, schema: ParsedSchemaDefinition, client: Client) {
        this.#path = path;
        this.#schema = schema;
        this.#client = client;
    }

    public async returnAll(): Promise<Array<Document<S>>> {
        return await this.#search();
    }

    async #search(): Promise<Array<Document<S>>> {

        //! JSON version only
        const results: Array<Document<S>> = [];

        (await readdir(this.#path)).forEach(async (fileName) => {

            const file: Document<S> = JSON.parse((await readFile(`${this.#path}/${fileName}`)).toString());

            //@ts-expect-error On the making
            if (this.#match(file)) results.push(file);
        });

        return results;
    }

    //@ts-expect-error TODO
    #createWhere(field: string) {
        const value = this.#schema[field];

        if (!value) throw new Error();

        if (value.type === "object") return;
        if (value.type === "array") return;
        if (value.type === "tuple") return;
        if (value.type === "date") return;
        if (value.type === "point") return;
        if (value.type === "boolean") return;
        if (value.type === "number") return;
        if (value.type === "string") return;
        /* value.type === "text" */ return;
    }
}