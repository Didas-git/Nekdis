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
                this[key] = { value: data[key], type: schema[key].type };
            });
        }
        Object.keys(schema).forEach((key) => {
            if (this[key])
                return;
            this[key] = { value: schema[key].default, type: schema[key].type };
        });
    }
    #validateData(dat, schem, isField = false) {
        const schema = schem ?? this.#schema;
        const data = dat ?? this;
        Object.keys(schema).forEach((val) => {
            if (!isField && !data[val])
                throw new Error();
            const value = schema[val];
            const dataVal = data instanceof Document ? data[val].value : data[val];
            if (dataVal === null)
                throw new Error();
            if (typeof dataVal === "undefined" && !value.required)
                return;
            if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined")
                throw new Error();
            if (value.type === "object") {
                if (!value.data)
                    return;
                this.#validateData(dataVal, value.data, true);
            }
            else if (value.type === "array") {
                if (typeof value.elements === "object")
                    this.#validateData(dataVal, value.elements, true);
                else {
                    dataVal.every((vall) => {
                        if (typeof vall !== value.elements)
                            throw new Error();
                    });
                }
            }
            else if (value.type === "tuple") {
                value.elements.forEach((element, i) => {
                    this.#validateData({ ...[dataVal[i]] }, { ...[element] }, true);
                });
            }
            else if (value.type === "date") {
                if (!(dataVal instanceof Date))
                    throw new Error();
            }
            else if (value.type === "point") {
                if (typeof dataVal !== "object")
                    throw new Error();
                if (!dataVal.longitude || !dataVal.latitude)
                    throw new Error();
                if (Object.keys(dataVal).length > 2)
                    throw new Error();
            }
            else if (value.type === "text") {
                if (typeof dataVal !== "string")
                    throw new Error();
            }
            else {
                // This handles `number`, `boolean` and `string` types
                if (typeof dataVal !== value.type)
                    throw new Error();
            }
        });
    }
    toString() {
        this.#validateData();
        const obj = {};
        Object.keys(this.#schema).forEach((key) => {
            obj[key] = this[key].value;
        });
        return JSON.stringify(obj, null);
    }
}
exports.Document = Document;
