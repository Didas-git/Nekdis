import { dateToNumber, numberToDate, stringsToObject } from "./general-helpers";

import type { FieldType, ParsedFieldType, ParsedObjectField, ParsedSchemaDefinition, Point } from "../../typings";
import { PrettyError } from "@infinite-fansub/logger";

export function booleanToString(val: boolean): string {
    return (+val).toString();
}

export function stringToBoolean(val: string): boolean {
    return !!+val;
}

export function stringToPoint(val: string): Point {
    const [longitude, latitude] = val.split(",");
    return { longitude: parseFloat(longitude), latitude: parseFloat(latitude) };
}

export function stringToNumber(val: string): number {
    return parseFloat(val);
}

export function stringToHashField(schema: FieldType, val: string): any {
    if (schema.type === "number") {
        return stringToNumber(val);
    } if (schema.type === "boolean") {
        return stringToBoolean(val);
    } else if (schema.type === "date") {
        return numberToDate(stringToNumber(val));
    } else if (schema.type === "point") {
        return stringToPoint(val);
    } else if (schema.type === "array") {
        const temp = val.split(schema.separator ?? ",");
        for (let i = 0, len = temp.length; i < len; i++) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            temp[i] = stringToHashField({ type: <never>schema.elements ?? "string" }, temp[i]);
        }
        return temp;
    } else if (schema.type === "vector") {
        if (schema.vecType === "FLOAT32") return new Float32Array(Buffer.from(val));
        return new Float64Array(Buffer.from(val));
    }
    return val;
}

export function stringToHashArray(arr: Array<string>, schema: any, val: string): Record<string, any> {
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

        temp.push(value, stringToHashField(props[value], val));
    }

    const trueVal = temp.pop();
    return stringsToObject(temp, trueVal);
}

export function deepMerge(...objects: Array<Record<string, any>>): Record<string, any> {
    let newObject: Record<string, any> = {};

    for (let i = 0, len = objects.length; i < len; i++) {
        const obj = objects[i];

        if (typeof obj === "undefined") continue;

        for (let j = 0, entries = Object.entries(obj), le = entries.length; j < le; j++) {
            const [key, value] = entries[j];
            if (typeof value === "object" && value) {
                const derefObj = { ...value };

                newObject[key] = newObject[key] ? deepMerge(newObject[key], derefObj) : derefObj;
            } else {
                newObject[key] = value;
            }
        }
    }

    return newObject;
}

export function getLastKeyInSchema(data: ParsedObjectField, key: string): FieldType | undefined {
    if (typeof data.properties === "undefined" || data.properties === null) return { type: "string" };

    for (let i = 0, entries = Object.entries(data.properties), len = entries.length; i < len; i++) {
        const [k, value] = entries[i];

        if (key === k) {
            return <never>value;
        }

        if (typeof value === "undefined") continue;

        if (value.type === "object") {
            return getLastKeyInSchema(value, key);
        }

        continue;
    }

    return void 0;
}

export function documentFieldToHASHValue(field: ParsedFieldType | { type: ParsedFieldType["type"] }, value: any, key?: string): Array<string> {
    if (field.type === "boolean") return keyExists(booleanToString(value), key);
    if (field.type === "date") return keyExists(dateToNumber(value).toString(), key);
    if (field.type === "point") return keyExists(`${value.longitude},${value.latitude}`, key);
    if (field.type === "vector") return keyExists(Buffer.from(value).toString(), key);
    if (field.type === "object") {
        if (!("properties" in field) || field.properties === null) return keyExists(JSON.stringify(value), key);
        if (!key) throw new PrettyError("Something went terribly wrong");
        return flatten(field.properties, value, key);
    }

    if (field.type === "array") {
        if (!("elements" in field)) return keyExists(value.toString(), key);
        for (let i = 0, length = value.length; i < length; i++) {
            if (typeof field.elements === "object") {
                value[i] = flatten(field.elements, value[i]);
                continue;
            }

            value[i] = documentFieldToHASHValue({ type: field.elements }, value[i]);
        }

        return keyExists(value.join(field.separator), key);
    }

    if (field.type === "tuple") {
        if (!("elements" in field)) return keyExists(value.toString(), key);

        const tempField: Record<`${number}`, ParsedFieldType> = { ...field.elements };
        const tempValue = { ...value };

        for (let i = 0, entries = Object.entries(tempField), length = entries.length; i < length; i++) {
            const val = entries[i][1];

            tempValue[i] = documentFieldToHASHValue(val, tempValue[i]);
        }

        return flatten(tempField, tempValue, key);
    }

    return keyExists(value.toString(), key);

}

function flatten(field: ParsedSchemaDefinition["data"], value: any, key?: string): Array<string> {
    const temp: Array<string> = [];

    for (let i = 0, entries = Object.entries(field), length = entries.length; i < length; i++) {
        const [k, val] = entries[i];

        temp.push(...documentFieldToHASHValue(val, value[k], key ? `${key}.${k}` : k));
    }

    return temp;
}

function keyExists(value: string, key: string | undefined): Array<string> {
    return key ? [key, value] : [value];
}

export function HASHValueToDocumentField(field: ParsedFieldType | { type: ParsedFieldType["type"] }, value: any, existingValue?: unknown): unknown {
    if (field.type === "number") return parseFloat(value);
    if (field.type === "boolean") return stringToBoolean(value);
    if (field.type === "date") return numberToDate(parseFloat(value));
    if (field.type === "point") {
        const [longitude, latitude] = value.split(",");
        return { longitude: +longitude, latitude: +latitude };
    }

    if (field.type === "vector") {
        if (!("vecType" in field)) throw new PrettyError("Something went terribly wrong");
        if (field.vecType === "FLOAT32") return new Float32Array(Buffer.from(value));
        return new Float64Array(Buffer.from(value));
    }

    if (field.type === "object") {
        // How to un-flatten??
    }

    if (field.type === "array") {
        if (!("elements" in field)) return value;
        const temp = value.split(field.separator);

        for (let i = 0, length = temp.length; i < length; i++) {
            if (typeof field.elements === "object") {
                // How to un-flatten??
                continue;
            }
            temp[i] = HASHValueToDocumentField({ type: field.elements }, temp[i]);
        }
        return temp;
    }

    if (field.type === "tuple") {
        if (!("elements" in field)) return value;
        // How to un-flatten??
    }

    return value;

}