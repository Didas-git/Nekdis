import { FieldTypes, ParsedSchemaDefinition, SchemaDefinition } from "../typings";
import { Document } from "../document";

export function validateData(data: Document<SchemaDefinition> | SchemaDefinition, schema: ParsedSchemaDefinition, isField: boolean = false): void {
    const schemaKeySet = new Set(Object.keys(schema));
    const dataKeySet = new Set(Object.keys(data ?? {}));

    schemaKeySet.forEach((val) => {
        if (!isField && !dataKeySet.has(val)) throw new Error();

        const value = schema[val];
        const dataVal = data[val];

        if (dataVal === null) return;
        if (typeof dataVal === "undefined" && !value.required) return;
        if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined") throw new Error();

        if (value.type === "object") {
            if (!value.data) return;
            validateData(dataVal, <ParsedSchemaDefinition>value.data, true);
        } else if (value.type === "array") {
            if (typeof value.elements === "object")
                validateData(dataVal, <ParsedSchemaDefinition>value.elements, true);
            else {
                dataVal.every((vall: unknown) => {
                    if (typeof vall !== value.elements) throw new Error();
                });
            }
        } else if (value.type === "tuple") {
            (<Array<FieldTypes>>value.elements).forEach((element, i) => {
                validateData(<SchemaDefinition><unknown>{ ...[dataVal[i]] }, <ParsedSchemaDefinition><unknown>{ ...[element] }, true);
            });
        } else if (value.type === "date") {
            if (!(dataVal instanceof Date)) throw new Error();
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
    });
}