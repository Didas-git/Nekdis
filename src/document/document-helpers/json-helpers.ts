import { dateToNumber, numberToDate } from "./general-helpers";

import type { ArrayField, BaseField, FieldType, ParsedObjectField } from "../../typings";

export function jsonFieldToDoc(schema: FieldType | undefined, val: any): any {
    if (typeof schema === "undefined") return val;

    if (schema.type === "date") {
        return numberToDate(val);
    } else if (schema.type === "point") {
        const [longitude, latitude] = val.split(",");
        return { longitude: +longitude, latitude: +latitude };
    } else if (schema.type === "object") {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parseJsonObject(<never>schema, val);
    } else if (schema.type === "array") {
        for (let i = 0, le = val.length; i < le; i++) {
            val[i] = jsonFieldToDoc({ type: <never>schema.elements }, val[i]);
        }
        return val;
    } else if (schema.type === "vector") {
        if (schema.vecType === "FLOAT32") return new Float32Array(val);
        return new Float64Array(val);
    }

    return val;
}

export function docToJson(schema: BaseField, val: any): any {
    if (schema.type === "date") {
        return dateToNumber(val);
    } else if (schema.type === "point") {
        return `${val.longitude},${val.latitude}`;
    } else if (schema.type === "object") {
        parseDoc(<never>schema, val);
    } else if (schema.type === "array") {
        for (let i = 0, le = val.length; i < le; i++) {
            val[i] = docToJson({ type: <never>(<ArrayField>schema).elements }, val[i]);
        }
        return val;
    } else if (schema.type === "vector") {
        return Array.from(val);
    }

    return val;

}

export function parseDoc(schema: ParsedObjectField, val: any): any {
    if (schema.properties === null) return val;
    for (let i = 0, entries = Object.entries(schema.properties), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];

        if (value.type === "object") {
            val[key] = parseDoc(<ParsedObjectField>value, val[key]);
        }
        val[key] = docToJson(value, val[key]);
    }

    return val;
}

export function parseJsonObject(schema: ParsedObjectField, val: any): any {
    if (schema.properties === null) return val;
    for (let i = 0, entries = Object.entries(schema.properties), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];

        if (value.type === "object") {
            val[key] = parseJsonObject(<ParsedObjectField>value, val[key]);
        }

        val[key] = jsonFieldToDoc(value, val[key]);
    }

    return val;
}

export function objectToString(val: Record<string, unknown>, k: string): Array<Record<string, unknown>> {
    const arr: Array<Record<string, unknown>> = [];

    for (let i = 0, entries = Object.entries(val), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];

        if (typeof value === "object") {
            const temp = objectToString(<never>value, `${k}.${key}`);
            arr.push(...temp);
            continue;
        }

        arr.push({ [`${k}.${key}`]: value });
    }

    return arr;
}

export function tupleToObjStrings(val: Array<unknown>, key: string): Array<Record<string, unknown>> {
    const arr: Array<Record<string, unknown>> = [];

    for (let i = 0, len = val.length; i < len; i++) {
        const value = val[i];

        if (typeof value === "object") {
            for (let j = 0, entries = Object.entries(<never>value), le = entries.length; j < le; j++) {
                const [k, v] = entries[j];

                arr.push({ [`${key}.${i}.${k}`]: v });
            }
            continue;
        }

        arr.push({ [`${key}.${i}`]: value });
    }

    return arr;
}