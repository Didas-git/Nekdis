"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const node_util_1 = require("node:util");
const dst_1 = require("colours.js/dst");
const symbols_1 = require("./utils/symbols");
const utils_1 = require("./utils");
class Schema {
    rawData;
    options;
    [symbols_1.methods];
    [symbols_1.schemaData];
    constructor(rawData, methodsData, options = {}) {
        this.rawData = rawData;
        this.options = options;
        // R.I.P. Performance
        this[symbols_1.schemaData] = this.#parse(JSON.parse(JSON.stringify(rawData)));
        this[symbols_1.methods] = methodsData ?? {};
        this.options.dataStructure = options.dataStructure ?? "JSON";
    }
    add(data) {
        this[symbols_1.schemaData] = { ...this[symbols_1.schemaData], ...this.#parse(data) };
        return this;
    }
    methods(data) {
        this[symbols_1.methods] = { ...this[symbols_1.methods], ...data };
        return this;
    }
    #parse(schema) {
        Object.keys(schema).forEach((key) => {
            if (key.startsWith("$"))
                throw new PrettyError("Keys cannot start with '$'", {
                    ref: "redis-om"
                });
            let value = schema[key];
            if (typeof value === "string") {
                //@ts-expect-error Anti-JS
                if (value === "object" || value === "tuple")
                    throw new PrettyError(`Type '${value}' needs to use its object definition`, {
                        ref: "redis-om",
                        lines: [
                            {
                                err: (0, node_util_1.inspect)({ [key]: schema[key] }, { colors: true }),
                                marker: { text: "Parsing:" }
                            },
                            {
                                err: value === "object" ? utils_1.ParsingError.Object(key) : utils_1.ParsingError.Tuple(key),
                                marker: { text: "Possible Fix:", color: dst_1.Color.fromHex("#00FF00"), nl: true }
                            },
                            {
                                err: value === "object" ? utils_1.ParsingError.Info.Object : utils_1.ParsingError.Info.Tuple,
                                marker: { text: "Information:", color: dst_1.Color.fromHex("#009dff"), spaced: true, nl: true }
                            }
                        ]
                    });
                if (value === "array")
                    value = { type: value, elements: "string", default: undefined, required: false };
                else
                    value = { type: value, default: undefined, required: false };
            }
            else {
                if (!value.type)
                    throw new PrettyError("Type not defined");
                if (value.type !== "array" && value.type !== "object" && value.type !== "tuple" && value.type !== "date") {
                    if (typeof value.default === "undefined")
                        value.default = undefined;
                    if (typeof value.required === "undefined")
                        value.required = false;
                }
                else if (value.type === "array") {
                    if (typeof value.default === "undefined")
                        value.default = undefined;
                    if (typeof value.required === "undefined")
                        value.required = false;
                    if (!value.elements)
                        value.elements = "string";
                    if (typeof value.elements === "object" && !Array.isArray(value.elements))
                        value.elements = this.#parse(value.elements);
                }
                else if (value.type === "tuple") {
                    if (typeof value.default === "undefined")
                        value.default = undefined;
                    if (typeof value.required === "undefined")
                        value.required = false;
                    if (typeof value.mutable === "undefined")
                        value.mutable = false;
                    if (!value.elements || !Array.isArray(value.elements) || !value.elements.length)
                        throw new PrettyError("A Tuple type needs to have its elements defined");
                    else
                        value.elements = this.#parse(value.elements);
                }
                else if (value.type === "date") {
                    if (value.default instanceof Date)
                        value.default = value.default.getTime();
                    //@ts-expect-error using `new Date()` seems to return a string sometimes
                    if (typeof value.default === "string")
                        value.default = new Date(value.default).getTime();
                    if (typeof value.default === "undefined")
                        value.default = undefined;
                    if (typeof value.required === "undefined")
                        value.required = false;
                }
                else {
                    if (typeof value.default === "undefined")
                        value.default = undefined;
                    if (typeof value.required === "undefined")
                        value.required = false;
                    if (!value.properties)
                        value.properties = undefined;
                    else
                        value.properties = this.#parse(value.properties);
                }
            }
            //@ts-expect-error More Shenanigans
            schema[key] = value;
        });
        return schema;
    }
}
exports.Schema = Schema;
