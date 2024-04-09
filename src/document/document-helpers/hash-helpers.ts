import { dateToNumber, numberToDate } from "./general-helpers.js";

import type { FloatArray, ParsedFieldType, ParsedSchemaDefinition, Point } from "../../typings/index.js";

export function documentFieldToHASHValue(field: ParsedFieldType | { type: ParsedFieldType["type"] }, value: any, key?: string): Array<string | Buffer> {
    if (field.type === "boolean") return keyExists(booleanToString(<boolean>value), key);
    if (field.type === "date") return keyExists(dateToNumber(<Date>value).toString(), key);
    if (field.type === "point") return keyExists(`"${(<Point>value).longitude},${(<Point>value).latitude}"`, key);
    if (field.type === "vector") {
        if ((<Array<unknown>>value).length === 0) return [];
        return keyExists(Buffer.from(Array.isArray(value) ? new Float64Array(value).buffer : (<FloatArray>value).buffer), key);
    }

    if (field.type === "object") {
        if (!("properties" in field) || field.properties === null) return keyExists(JSON.stringify(value), key);
        if (!key) throw new Error("Something went terribly wrong");
        return flatten(field.properties, value, key);
    }

    if (field.type === "array") {
        if (!("elements" in field)) return keyExists((<string>value).toString(), key);
        if (!Array.isArray(value)) throw new Error("Expected Array got unknown");
        const temp: Array<string | Buffer> = [];

        if (typeof field.elements === "object") {
            for (let i = 0, { length } = value; i < length; i++) temp.push(...flatten(field.elements, value[i], `${key}.${i}`));

            return temp;
        }

        for (let i = 0, { length } = value; i < length; i++) {
            const parsed = documentFieldToHASHValue({ type: field.elements }, value[i], `${key}.${i}`);
            temp.push(parsed.length > 1 ? parsed[1] : parsed[0]);
        }

        return keyExists(temp.join(field.separator), key);
    }

    if (field.type === "tuple") {
        if (!("elements" in field)) return keyExists((<string>value).toString(), key);
        if (!Array.isArray(value)) throw new Error("Expected Array got unknown");

        const tempField: Record<`${number}`, ParsedFieldType> = { ...field.elements };
        const tempValue = { ...value };

        return flatten(tempField, tempValue, key);
    }

    return keyExists((<string>value).toString(), key);
}

function flatten(field: ParsedSchemaDefinition["data"], value: any, key?: string): Array<string | Buffer> {
    const temp: Array<string | Buffer> = [];

    for (let i = 0, entries = Object.entries(field), { length } = entries; i < length; i++) {
        const [k, val] = entries[i];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        temp.push(...documentFieldToHASHValue(val, value[k], key ? `${key}.${k}` : k));
    }

    return temp;
}

function keyExists(value: string | Buffer, key: string | undefined): Array<string | Buffer> {
    return key ? [key, value] : [value];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function HASHValueToDocumentField(
    field: ParsedFieldType | { type: ParsedFieldType["type"] },
    value: string,
    existingValue?: any,
    keysList?: Array<string>
): unknown {
    if (field.type === "number") return parseFloat(value);
    if (field.type === "bigint") return BigInt(value);
    if (field.type === "boolean") return stringToBoolean(value);
    if (field.type === "date") return numberToDate(parseFloat(value));
    if (field.type === "point") {
        const [longitude, latitude] = value.split(",");
        return { longitude: +longitude, latitude: +latitude };
    }

    if (field.type === "vector") {
        const buff = Buffer.from(value, "latin1");
        if (!("vecType" in field) || field.vecType === "FLOAT32") return new Float32Array(buff.buffer, buff.byteOffset, buff.byteLength / Float32Array.BYTES_PER_ELEMENT);
        return new Float64Array(buff.buffer, buff.byteOffset, buff.byteLength / Float64Array.BYTES_PER_ELEMENT);
    }

    if (field.type === "object") {
        if (!("properties" in field) || field.properties === null) return JSON.parse(value);
        if (!existingValue && !keysList) throw new Error("Something went terribly wrong");

        return deepMerge(<Record<string, unknown> | undefined>existingValue ?? {}, arrayOfKeysToObject(keysList, value));
    }

    if (field.type === "array") {
        if (!("elements" in field)) return value;
        if (typeof field.elements === "object") {
            const temp: Array<unknown> = [];
            if (!existingValue || !keysList) throw new Error("Something went terribly wrong");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const index = keysList.shift()!;

            for (let i = 0, { length } = temp; i < length; i++) temp[i] = HASHValueToDocumentField(field.elements[+index], value, existingValue, keysList);

            return temp;
        }
        const splitValue = value.split(field.separator);
        for (let i = 0, { length } = splitValue; i < length; i++) splitValue[i] = <never>HASHValueToDocumentField({ type: field.elements }, splitValue[i]);

        return splitValue;
    }

    if (field.type === "tuple") {
        if (!("elements" in field)) return value;
        if (!existingValue && !keysList) throw new Error("Something went terribly wrong");
        if (typeof existingValue === "undefined") existingValue = new Array(field.elements.length);

        let index = +(keysList?.shift() ?? 0);
        let currentField = field.elements[index];

        if (typeof currentField === "undefined") {
            index = +(keysList?.shift() ?? 0);
            currentField = field.elements[index];
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        existingValue[index] = HASHValueToDocumentField(currentField, value, existingValue, keysList);

        return existingValue;
    }

    return value;
}

// This needs to be optimized
function deepMerge(...objects: Array<Record<string, any>>): Record<string, any> {
    const newObject: Record<string, any> = {};

    for (let i = 0, len = objects.length; i < len; i++) {
        const obj = objects[i];

        if (typeof obj === "undefined") continue;

        for (let j = 0, entries = Object.entries(obj), le = entries.length; j < le; j++) {
            const [key, value]: [string, never] = <never>entries[j];
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (typeof value === "object" && value) {
                const derefObj: Record<string, unknown> = <never>{ ...<Record<string, unknown>>value };

                newObject[key] = newObject[key] ? deepMerge(<Record<string, unknown>>newObject[key], derefObj) : derefObj;
            } else newObject[key] = value;
        }
    }

    return newObject;
}

// This also needs to be optimized
export function arrayOfKeysToObject(arr: Array<string> | undefined, val: unknown): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    arr?.reduce((object, accessor, i) => {
        object[accessor] = {};

        if (arr.length - 1 === i)
            object[accessor] = val;

        return <Record<string, unknown>>object[accessor];
    }, obj);

    return obj;
}

function booleanToString(val: boolean): string {
    return (+val).toString();
}

function stringToBoolean(val: string): boolean {
    return !!+val;
}
