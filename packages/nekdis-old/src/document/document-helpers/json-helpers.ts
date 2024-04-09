import { dateToNumber, numberToDate } from "./general-helpers.js";

import type { ParsedFieldType, ParsedSchemaDefinition, Point } from "../../typings/index.js";

export function documentFieldToJSONValue(field: ParsedFieldType | { type: ParsedFieldType["type"] }, value: any): unknown {
    if (field.type === "bigint") return (<bigint>value).toString();
    if (field.type === "date") return dateToNumber(<Date>value);
    if (field.type === "point") return `${(<Point>value).longitude},${(<Point>value).latitude}`;
    if (field.type === "vector") {
        if ((<Array<number>>value).length === 0) return undefined;
        return Array.from(<Array<number>>value);
    }

    if (field.type === "object") {
        if (!("properties" in field) || field.properties === null) return value;
        return transformParsedDefinition(field.properties, value, documentFieldToJSONValue);
    }

    if (field.type === "array") {
        if (!("elements" in field)) return value;
        if (!Array.isArray(value)) throw new Error("Expected Array got unknown");
        for (let i = 0, { length } = value; i < length; i++) {
            if (typeof field.elements === "object") {
                value[i] = transformParsedDefinition(field.elements, value[i], documentFieldToJSONValue);
                continue;
            }

            value[i] = documentFieldToJSONValue({ type: field.elements }, value[i]);
        }

        return value;
    }

    if (field.type === "tuple") {
        if (!("elements" in field)) return value;
        if (field.index) {
            const tempField: Record<number, ParsedFieldType> = { ...field.elements };
            const tempValue: Record<number, unknown> = <never>{ ...value };

            for (let i = 0, entries = Object.entries(tempField), { length } = entries; i < length; i++) {
                const [,val] = entries[i];

                tempValue[i] = documentFieldToJSONValue(val, tempValue[i]);
            }

            return tempValue;
        }

        for (let i = 0, { length } = field.elements; i < length; i++) (<Array<unknown>>value)[i] = documentFieldToJSONValue(field.elements[i], (<Array<unknown>>value)[i]);

        return value;
    }

    return value;
}

function transformParsedDefinition(
    field: ParsedSchemaDefinition["data"],
    value: any,
    transformer: typeof documentFieldToJSONValue | typeof JSONValueToDocumentField
): Record<string, unknown> {
    const temp: Record<string, unknown> = {};

    for (let i = 0, entries = Object.entries(field), { length } = entries; i < length; i++) {
        const [key, val] = entries[i];
        if (typeof (<Record<string, unknown>>value)[key] === "undefined") continue;

        temp[key] = transformer(val, (<Record<string, unknown>>value)[key]);
    }

    return temp;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function JSONValueToDocumentField(field: ParsedFieldType | { type: ParsedFieldType["type"] }, value: any): unknown {
    if (field.type === "bigint") return BigInt(<string>value);
    if (field.type === "date") return numberToDate(<number>value);
    if (field.type === "point") {
        const [longitude, latitude] = (<string>value).split(",");
        return { longitude: +longitude, latitude: +latitude };
    }

    if (field.type === "vector") {
        if (!("vecType" in field) || field.vecType === "FLOAT32") return new Float32Array(<Array<number>>value);
        return new Float64Array(<Array<number>>value);
    }

    if (field.type === "object") {
        if (!("properties" in field) || field.properties === null) return value;
        return transformParsedDefinition(field.properties, value, JSONValueToDocumentField);
    }

    if (field.type === "array") {
        if (!("elements" in field)) return value;
        if (!Array.isArray(value)) throw new Error("Expected Array got unknown");
        for (let i = 0, { length } = value; i < length; i++) {
            if (typeof field.elements === "object") {
                value[i] = transformParsedDefinition(field.elements, value[i], JSONValueToDocumentField);
                continue;
            }

            value[i] = JSONValueToDocumentField({ type: field.elements }, value[i]);
        }

        return value;
    }

    if (field.type === "tuple") {
        if (!("elements" in field)) return value;
        if (field.index) value = Object.values(<Record<string, unknown>>value);

        for (let i = 0, { length } = field.elements; i < length; i++) (<Array<unknown>>value)[i] = JSONValueToDocumentField(field.elements[i], (<Array<unknown>>value)[i]);

        return value;
    }

    return value;
}
