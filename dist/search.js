"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = void 0;
const document_1 = require("./document");
const utils_1 = require("./utils");
class Search {
    #query = [];
    #client;
    #schema;
    #parsedSchema;
    #IDX;
    #currentField = {};
    constructor(client, schema, parsedSchema, idx) {
        this.#client = client;
        this.#schema = schema;
        this.#parsedSchema = parsedSchema;
        this.#IDX = idx;
    }
    async returnAll() {
        return await this.#search();
    }
    async returnFirst() {
        return (await this.#search())[0];
    }
    async #search() {
        const docs = [];
        const { documents } = await this.#client.ft.search(this.#IDX, this.#query.join(" "));
        documents.forEach((doc) => {
            docs.push(new Proxy(new document_1.Document(this.#schema, /:(.+)/.exec(doc.id)[1], doc.value), utils_1.proxyHandler));
        });
        return docs;
    }
    where(field) {
        this.#createWhere(field);
        return this;
    }
    equals(value) {
        this.#buildQuery(value);
        return this;
    }
    ;
    #createWhere(field) {
        if (!this.#parsedSchema.has(field))
            throw new Error(`'${field}' doesnt exist on the schema`);
        const { value } = this.#parsedSchema.get(field);
        if (value.type === "object")
            throw new Error("Searching entire objects is not supported yet");
        if (value.type === "point")
            throw new Error("Searching for points (GEO) is not supported yet");
        this.#currentField = { field, type: value.type };
    }
    #buildQuery(value) {
        this.#query.push(`(@${this.#currentField.field}:${this.#currentField.type === "number" ? `[${value} ${value}]` : `{${value}}`})`);
    }
    ;
}
exports.Search = Search;
