"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
function parse(schema, k) {
    const objs = [];
    Object.keys(schema).forEach((key) => {
        if (schema[key].type === "object" && schema[key].properties) {
            const parsed = parse(schema[key].properties, k ? `${k}.${key}` : key);
            parsed.forEach((p) => objs.push(p));
        }
        objs.push({ value: schema[key], pars: k ? `${k}.${key}` : key });
    });
    return objs;
}
exports.parse = parse;
