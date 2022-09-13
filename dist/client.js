"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.Client = void 0;
const redis_1 = require("redis");
const model_1 = require("./model");
const schema_1 = require("./schema");
// Load in the lib
require("@infinite-fansub/logger");
class Client {
    #client;
    #raw;
    #models = new Map();
    isOpen = false;
    async connect(url = "redis://localhost:6379") {
        if (this.isOpen)
            return this;
        if (typeof url === "object") {
            const { username, password, entrypoint, port } = url;
            url = `${username}:${password}@${(/:\d$/).exec(entrypoint) ? entrypoint : `${entrypoint}:${port}`}`;
        }
        this.#client = (0, redis_1.createClient)({ url });
        this.#client.connect();
        this.#raw = this.#client;
        this.isOpen = true;
        return this;
    }
    async disconnect() {
        await this.#client.quit();
        this.isOpen = false;
        return this;
    }
    async forceDisconnect() {
        await this.#client.disconnect();
        this.isOpen = false;
        return this;
    }
    schema(schemaData, methods, options) {
        return new schema_1.Schema(schemaData, methods, options);
    }
    withModules(modules) {
        modules.forEach((module) => {
            //@ts-expect-error shenanigans
            this[module.name] = new module.ctor();
        });
        return this;
    }
    model(name, schema) {
        if (this.#models.has(name))
            return this.#models.get(name);
        if (!schema)
            throw new Error("You have to pass a schema if it doesnt exist");
        const model = new model_1.Model(this.#client, name, schema);
        this.#models.set(name, model);
        return model;
    }
    addModel(name, model, override = false) {
        if (this.#models.has(name) && !override)
            throw new Error("The model passed already exists, if you wish to override it pass in `true` as the third argument");
        if (!(model instanceof model_1.Model))
            throw new Error("The recieved model was of the wrong type");
        this.#models.set(name, model);
    }
    get raw() {
        return this.#raw;
    }
}
exports.Client = Client;
exports.client = new Client();
