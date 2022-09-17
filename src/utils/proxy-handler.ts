import { SchemaDefinition } from "../typings";
import { Document } from "../document";

export const proxyHandler: ProxyHandler<Document<SchemaDefinition>> = {
    set(target, key, value) {

        if (typeof key === "symbol") return false;

        if (value === null) {
            target[key].value = undefined;
            return true;
        };

        if (key === "_id") {
            if (typeof value === "number")
                target[key] = value.toString();
            else if (typeof value !== "string")
                throw new Error("Invalid `_id` type");
            else
                target[key] = value;
            return true;
        };

        const type = target[key].type;

        if (type === "tuple" || type === "array") {
            if (!Array.isArray(value))
                throw new Error(`${key} expects the value to be in an array format`);
            target[key].value = value;
        } else if (type === "object") {
            if (typeof value !== "object" || Array.isArray(value) || value === null)
                throw new Error(`${key} expects a plain object`);
            target[key].value = value;
        } else if (type === "date") {
            if (!(value instanceof Date))
                throw new Error(`${key} expects a Date object`);
            target[key].value = value.getTime();
        } else if (type === "point") {
            if (typeof value !== "object") throw new Error(`${key} expects a Point-like object`);
            if (!value.longitude || !value.latitude) throw new Error(`${key} doesnt not have a \`longitude\` and/or \`latitude\``);
            if (Object.keys(value).length > 2) throw new Error(`${key} has an invalid amount of keys`);
        } else if (type === "text") {
            if (typeof value !== "string")
                throw new Error(`${key} expects a string`)
            target[key].value = value;
        } else {
            if (typeof value !== type)
                throw new Error(`${key} recieved an invalid data type`)
            target[key].value = value;
        };
        return true;
    },

    get(target, key) {
        const val = target[key];
        if (val instanceof Function) {
            return function (...args: any) {
                return val.apply(target, args);
            }
        };
        if (key === "_id")
            return target[key];
        return val.value;
    },
}