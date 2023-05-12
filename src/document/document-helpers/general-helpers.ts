import type { ObjectField, ParseSchema } from "../../typings";
import type { HASHDocument } from "../hash-document";
import type { JSONDocument } from "../json-document";

export function dateToNumber(val: Date | string | number): number {
    if (val instanceof Date) return val.getTime();
    if (typeof val === "string" || typeof val === "number") return new Date(val).getTime();
    throw new Error();
}

export function numberToDate(val: number): Date {
    return new Date(val);
}

export function validateSchemaReferences(
    this: HASHDocument | JSONDocument,
    schema: ParseSchema<any>["references"],
    data: JSONDocument | ParseSchema<any>["references"] = this,
    isField: boolean = false
): void {
    for (let i = 0, keys = Object.keys(schema), len = keys.length; i < len; i++) {
        const key = keys[i];
        if (isField && !data[key]) throw new Error();

        const dataVal = data[key];

        if (typeof dataVal === "undefined") throw new Error();

        for (let j = 0, le = dataVal.length; j < le; j++) {
            const val = dataVal[i];
            if (typeof val !== "string") throw new Error();
        }
    }

}

export function validateSchemaData(
    this: HASHDocument | JSONDocument,
    schema: ParseSchema<any>["data"],
    data: HASHDocument | ParseSchema<any>["data"] = this,
    isField: boolean = false
): void {
    for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];

        if (isField && !data[key]) throw new Error();

        const dataVal = data[key];

        if (dataVal === null) throw new Error();

        if (typeof dataVal === "undefined" && !value.required) continue;
        if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined") throw new Error();

        if (value.type === "object") {
            if (!(<ObjectField>value).properties) continue;
            //@ts-expect-error Typescript is getting confused due to the union of array and object
            validateSchemaData(value.properties, dataVal, true);
        } else if (value.type === "array") {
            dataVal.every((val: unknown) => {
                //@ts-expect-error Typescript is getting confused due to the union of array and object
                if (typeof val !== value.elements) throw new Error();
            });

        } else if (value.type === "date") {
            if (!(dataVal instanceof Date) && typeof dataVal !== "number") throw new Error();
        } else if (value.type === "point") {
            if (typeof dataVal !== "object") throw new Error();
            if (!dataVal.longitude || !dataVal.latitude) throw new Error();
            if (Object.keys(dataVal).length > 2) throw new Error();
        } else if (value.type === "text") {
            if (typeof dataVal !== "string") throw new Error();
        } else {
            // This handles `number`, `boolean` and `string` types
            if (typeof dataVal !== value.type) throw new Error();
        }
    }
}