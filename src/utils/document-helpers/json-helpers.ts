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
            val[i] = jsonFieldToDoc({ type: (<ArrayField>schema).elements ?? "string" }, val[i]);
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