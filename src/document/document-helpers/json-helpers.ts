import { numberToDate } from "./general-helpers";

import type { ArrayField, BaseField, ObjectField } from "../../typings";

export function jsonFieldToDoc(schema: BaseField, val: any): any {
    if (schema.type === "date") {
        return numberToDate(val);
    } else if (schema.type === "object") {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        parseJsonObject(<never>schema, val);
    } else if (schema.type === "array") {
        for (let i = 0, le = val.length; i < le; i++) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            val[i] = jsonFieldToDoc({ type: <never>(<ArrayField>schema).elements ?? "string" }, val[i]);
        }
        return val;
    }

    return val;
}

export function parseJsonObject(schema: Required<ObjectField>, val: any): any {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (let i = 0, entries = Object.entries((<ObjectField>schema).properties!), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];

        //@ts-expect-error I dont have a proper type for this
        if (value.type === "object") {
            //@ts-expect-error I dont have a proper type for this
            val[key] = parseJsonObject(value, val[key]);
        }

        //@ts-expect-error I dont have a proper type for this
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
            const parsed = objectToString(<never>value, `${key}.${i}`);
            arr.push(...parsed);
            continue;
        }

        arr.push({ [`${key}.${i}`]: value });
    }

    return arr;
}