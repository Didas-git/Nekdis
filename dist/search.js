"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Search = void 0;
const document_1 = require("./document");
const string_1 = require("./utils/search-builders/string");
class Search {
    #client;
    #schema;
    #parsedSchema;
    #index;
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
    or(_value) {
    }
    and() { }
    async returnAll() {
        const docs = [];
        const { documents } = await this.#client.ft.search(this.#index, this.query.join(" "));
        documents.forEach((doc) => {
            docs.push(new document_1.Document(this.#schema, /:(.+)/.exec(doc.id)[1], doc.value));
        });
        return docs;
    }
    #createWhere(field) {
        if (!this.#parsedSchema.has(field))
            throw new PrettyError(`'${field}' doesnt exist on the schema`);
        const parsedField = this.#parsedSchema.get(field);
        switch (parsedField.value.type) {
            case "string": {
                return new string_1.StringField(this, field);
            }
        }
        throw new PrettyError("Some error occured creating the field");
    }
}
exports.Search = Search;
