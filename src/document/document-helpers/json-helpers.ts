import { numberToDate, stringsToObject } from "./general-helpers";

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

export function stringToArray(arr: Array<string>, schema: any, val: string): Record<string, any> {
    let temp: any = [];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const idx = arr.shift()!;
    let props = schema[idx].properties;

    if (arr.length === 1) {
        return { [arr[0]]: val };
    }

    for (let i = 0, len = arr.length; i < len; i++) {
        const value = arr[i];

        if (props[value].type === "object") {
            temp.push(value);
            const x = i + 1;
            props = { [arr[x]]: props[value].properties[arr[x]] };
            continue;
        }

        temp.push(value, val);
    }

    const trueVal = temp.pop();
    return stringsToObject(temp, trueVal);
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