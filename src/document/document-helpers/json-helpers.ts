import { dateToNumber, numberToDate } from "./general-helpers";

import type { ArrayField, BaseField, FieldType, ParsedFieldType, ParsedObjectField, ParsedSchemaDefinition } from "../../typings";

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
            val[key] = parseDoc(value, val[key]);
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
            val[key] = parseJsonObject(value, val[key]);
        }

        val[key] = jsonFieldToDoc(<never>value, val[key]);
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

export function tupleToObjStrings(value: Array<unknown>, key: string): Array<Record<string, unknown>> {
    const arr: Array<Record<string, unknown>> = [];

    for (let i = 0, length = value.length; i < length; i++) {
        const val = value[i];

        if (typeof val === "object") {
            for (let j = 0, entries = Object.entries(<never>val), len = entries.length; j < len; j++) {
                const [k, v] = entries[j];
                arr.push({ [`${key}.${i}.${k}`]: v });
            }
            continue;
        }

        arr.push({ [`${key}.${i}`]: value });
    }

    return arr;
}

export function documentFieldToJSONValue(field: ParsedFieldType | { type: ParsedFieldType["type"] }, value: any): unknown {
    if (field.type === "date") return dateToNumber(value);
    if (field.type === "point") return `${value.longitude},${value.latitude}`;
    if (field.type === "vector") return Array.from(value);
    if (field.type === "object") {
        if (!("properties" in field) || field.properties === null) return value;
        return objectFieldToJSONValue(field.properties, value);
    }

    if (field.type === "array") {
        if (!("elements" in field)) return value;
        for (let i = 0, le = value.length; i < le; i++) {
            if (typeof field.elements === "object") {
                value[i] = objectFieldToJSONValue(field.elements, value[i]);
                continue;
            }

            value[i] = documentFieldToJSONValue({ type: field.elements }, value[i]);
        }

        return value;
    }

    if (field.type === "tuple") {
        if (!("elements" in field)) return value;
        for (let i = 0, le = value.length; i < le; i++) {
            value[i] = documentFieldToJSONValue(field.elements[i], value[i]);
        }
    }

    return value;
}

function objectFieldToJSONValue(field: ParsedSchemaDefinition["data"], value: any): Record<string, unknown> {
    const temp: Record<string, unknown> = {};

    for (let i = 0, entries = Object.entries(field), length = entries.length; i < length; i++) {
        const [key, val] = entries[i];
        if (typeof value[key] === "undefined") continue;

        temp[key] = documentFieldToJSONValue(field[key], val);
    }

    return temp;
}

/**
 * Convert tuple to key-value pairs
 * `${tupleName}.${index<number>}?.${key}`
*/
// export function expandTuple(field: ParsedTupleField, value: any): Record<string, unknown> {
//     const temp: Record<string, unknown> = {};

//     // for (let i = 0, length = value.length; i < length; i++) {
//     //     const val = value[i];

//     //     if (typeof val === "object") {
//     //         for (let j = 0, entries = Object.entries(<never>val), len = entries.length; j < len; j++) {
//     //             const [k, v] = entries[j];
//     //             arr.push({ [`${key}.${i}.${k}`]: v });
//     //         }
//     //         continue;
//     //     }

//     //     arr.push({ [`${key}.${i}`]: value });
//     // }

//     for (let i = 0, length = field.elements.length; i < length; i++) {
//         const elField = field.elements[i];

//         elField

//         temp[key] = 
//     }

//     return temp;
// }