"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = void 0;
const document_1 = require("./document");
const string_1 = require("./utils/search-builders/string");
const number_1 = require("./utils/search-builders/number");
class Search {
    #client;
    #schema;
    #parsedSchema;
    #index;
    #workingType = "string";
    query = [];
    constructor(client, schema, parsedSchema, searchIndex) {
        this.#client = client;
        this.#schema = schema;
        this.#parsedSchema = parsedSchema;
        this.#index = searchIndex;
    }
    where(field) {
        return this.#createWhere(field);
    }
    and(field) {
        return this.#createWhere(field);
    }
    or(value) {
        switch (this.#workingType) {
            case "string": {
                this.query.at(-1)?.or.push(value);
                break;
            }
            case "number": {
                this.query.at(-1)?.or.push([value, value]);
                break;
            }
        }
        return this;
    }
    else(_value) {
    }
    async returnAll() {
        const docs = [];
        const { documents } = await this.#client.ft.search(this.#index, this.#buildQuery());
        documents.forEach((doc) => {
            docs.push(new document_1.Document(this.#schema, /:(.+)/.exec(doc.id)[1], doc.value));
        });
        return docs;
    }
    get rawQuery() {
        return this.#buildQuery();
    }
    #buildQuery() {
        return this.query.map((q) => q.toString()).join(" ");
    }
    #createWhere(field) {
        if (typeof field !== "string")
            throw new PrettyError();
        if (!this.#parsedSchema.has(field))
            throw new PrettyError(`'${field}' doesnt exist on the schema`);
        const parsedField = this.#parsedSchema.get(field);
        switch (parsedField.value.type) {
            case "string": {
                this.#workingType = "string";
                return new string_1.StringField(this, field);
            }
            case "number": {
                this.#workingType = "number";
                return new number_1.NumberField(this, field);
            }
        }
        throw new PrettyError("Some error occured creating the field");
    }
}
exports.Search = Search;
