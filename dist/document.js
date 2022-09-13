"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
class Document {
    _id;
    #schema;
    constructor(schema, _id, data) {
        this._id = _id;
        this.#schema = schema;
        if (data) {
            Object.keys(data).forEach((key) => {
                //@ts-expect-error
                this[key] = data[key];
            });
        }
        Object.keys(schema).forEach((key) => {
            if (this[key])
                return;
            this[key] = schema[key].default;
        });
    }
    toString() {
        const obj = {};
        Object.keys(this.#schema).forEach((key) => {
            obj[key] = this[key];
        });
        return JSON.stringify(obj, null);
    }
}
exports.Document = Document;
