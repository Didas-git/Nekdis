"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const document_1 = require("./document");
const utils_1 = require("./utils");
const node_crypto_1 = require("node:crypto");
const search_1 = require("./search");
class Model {
    name;
    #schema;
    #client;
    #searchIndexName;
    #searchIndex = ["FT.CREATE"];
    #parsedSchema = new Map();
    constructor(client, name, data) {
        this.name = name;
        this.#client = client;
        this.#schema = data;
        this.#searchIndexName = `${name}:index`;
        (0, utils_1.parse)(this.#schema[utils_1.schemaData]).forEach((parsedVal) => {
            this.#parsedSchema.set(parsedVal.pars, { value: parsedVal.value, pars: parsedVal.pars.replace(/[.]/g, "_") });
        });
        this.#defineMethods();
    }
    async get(id) {
        if (!id)
            throw new Error();
        const data = await this.#client.json.get(`${this.name}:${id}`);
        if (!data)
            return null;
        return new document_1.Document(this.#schema[utils_1.schemaData], id.toString(), data);
    }
    create(id) {
        return new document_1.Document(this.#schema[utils_1.schemaData], id?.toString() ?? (0, node_crypto_1.randomUUID)());
    }
    async save(doc) {
        if (!doc)
            throw new Error();
        await this.#client.json.set(`${this.name}:${doc.$id}`, "$", JSON.parse(doc.toString()));
    }
    async delete(...docs) {
        if (!docs)
            throw new Error();
        await this.#client.del(docs.map((el) => `${this.name}:${el instanceof document_1.Document ? el.$id : el.toString()}`));
    }
    ;
    async exists(...docs) {
        if (!docs)
            throw new Error();
        return await this.#client.exists(docs.map((el) => `${this.name}:${el instanceof document_1.Document ? el.$id : el.toString()}`));
    }
    ;
    async expire(docs, seconds, mode) {
        if (!docs)
            throw new Error();
        docs.map((el) => `${this.name}:${el instanceof document_1.Document ? el.$id : el.toString()}`).forEach((doc) => {
            this.#client.expire(doc, seconds, mode);
        });
    }
    async createAndSave(data) {
        const doc = new document_1.Document(this.#schema[utils_1.schemaData], data.$id?.toString() ?? (0, node_crypto_1.randomUUID)(), data);
        await this.save(doc);
    }
    search() {
        return new search_1.Search(this.#client, this.#schema[utils_1.schemaData], this.#parsedSchema, this.#searchIndexName);
    }
    async createIndex() {
        await this.deleteIndex();
        this.#searchIndex.push(this.#searchIndexName, "ON", "JSON", "PREFIX", "1", `${this.name}:`, "SCHEMA");
        this.#parsedSchema.forEach((val, key) => {
            this.#searchIndex.push(`$.${key}${val.value.type === "array" ? "[*]" : ""}`, "AS", val.pars, val.value.type === "text" ? "TEXT" : val.value.type === "number" ? "NUMERIC" : val.value.type === "point" ? "GEO" : "TAG");
        });
        await this.#client.sendCommand(this.#searchIndex);
    }
    async deleteIndex(DD = false) {
        await this.#client.sendCommand(["FT.DROPINDEX", this.#searchIndexName, DD ? "DD" : ""]).catch((e) => {
            if (e instanceof Error && e.message === "Unknown Index name") { }
            else
                throw e;
        });
    }
    async rawSearch(...args) {
        return this.#client.ft.search(this.#searchIndexName, args.join(" "));
    }
    #defineMethods() {
        Object.keys(this.#schema[utils_1.methods]).forEach((key) => {
            //@ts-expect-error
            this[key] = this.#schema[utils_1.methods][key];
        });
    }
}
exports.Model = Model;
