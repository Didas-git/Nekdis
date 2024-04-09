import type { ParsedFieldType, ParsedSchemaDefinition, Point } from "../../typings/index.js";
import type { HASHDocument } from "../hash-document.js";
import type { JSONDocument } from "../json-document.js";

export function dateToNumber(val: Date | string | number): number {
    if (val instanceof Date) return val.getTime();
    if (typeof val === "string" || typeof val === "number") return new Date(val).getTime();
    throw new Error("An invalid value was given");
}

export function numberToDate(val: number): Date {
    return new Date(val);
}

export function validateSchemaReferences(
    schema: ParsedSchemaDefinition["references"],
    data: JSONDocument | HASHDocument
): void {
    for (let i = 0, keys = Object.keys(schema), len = keys.length; i < len; i++) {
        const key = keys[i];
        const dataVal = <Array<string>>data[key];

        if (typeof dataVal === "undefined") throw new Error(`Found a missing reference: '${key}'`);

        for (let j = 0, le = dataVal.length; j < le; j++) if (typeof dataVal[i] !== "string") throw new Error("Invalid id inside a reference");
    }
}

export function validateSchemaData(
    schema: ParsedSchemaDefinition["data"],
    data: JSONDocument | HASHDocument
): void {
    for (let i = 0, entries = Object.entries(schema), { length } = entries; i < length; i++) {
        const [key, field] = entries[i];

        validate(field, data[key], key);
    }
}

function validate(
    field: ParsedFieldType,
    value: any,
    workingKey: string
): void {
    if (value === null) throw new Error("Cannot save 'null' to the database");

    if (typeof value === "undefined"
        // eslint-disable-next-line @stylistic/no-mixed-operators
        || typeof value === "object" && !(value instanceof Date) && ((<Array<unknown>>value).length === 0 || Object.keys(<Record<string, unknown>>value).length === 0)
    ) {
        if (field.optional) return;
        if (typeof field.default === "undefined") throw new Error(`'${workingKey}' is required but was not given a value`);
    }

    if (field.type === "object") {
        if (field.properties === null) return;
        validateSchemaData(field.properties, <JSONDocument>value);
    } else if (field.type === "array") {
        for (let i = 0, len = (<Array<unknown>>value).length; i < len; i++) {
            const val = (<never>value)[i];

            if (typeof field.elements === "object")
                validateSchemaData(field.elements, val);
            else {
                // This should work without problems...
                validate(<never>{ type: field.elements }, val, `${workingKey}.${i}`);
            }
        }
    } else if (field.type === "tuple")
        for (let i = 0, { length } = field.elements; i < length; i++) validate(field.elements[i], (<never>value)[i], `${workingKey}.${i}`);
    else if (field.type === "date") {
        if (!(value instanceof Date) && typeof value !== "number") throw new Error(`Expected 'Date' or type 'number' but instead got ${typeof value}`);
    } else if (field.type === "point") {
        if (typeof value !== "object") throw new Error("Invalid 'point' format");
        if (!(<Point>value).longitude || !(<Point>value).latitude) throw new Error("'longitude' or 'latitude' where not defined");
        if (Object.keys(<Point>value).length > 2) throw new Error("Invalid 'point' format");
    } else if (field.type === "text") {
        if (typeof value !== "string") throw new Error("Text field has to be a string");
    } else if (field.type === "vector") {
        if (!(value instanceof Float32Array) && !(value instanceof Float64Array) && !Array.isArray(value)) throw new Error("Got wrong vector format");
    } else if (field.type === "string" || field.type === "number" || field.type === "bigint") {
        if (typeof field.literal !== "undefined") {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            if (!field.literal.includes(<never>value)) throw new Error(`Got wrong value. Expected one of: '${field.literal}' got '${value}'`);
        } else if (typeof value !== field.type) throw new Error(`Got wrong value type. Expected type: '${field.type}' got '${typeof value}'`);
    } else /* Handles `boolean` */
        if (typeof value !== field.type) throw new Error(`Got wrong value type. Expected type: '${field.type}' got '${typeof value}'`);
}
