import type { ArrayField, BaseField, ObjectField, ParseSchema, Point } from "../typings";

export function dateToNumber(val: Date | string | number): number {
    if (val instanceof Date) return val.getTime();
    if (typeof val === "string" || typeof val === "number") return new Date(val).getTime();
    throw new Error();
}

export function booleanToString(val: boolean): string | undefined {
    if (typeof val !== "undefined") return (+val).toString();
    return void 0;
}

export function pointToString(val: Point): string {
    const { longitude, latitude } = val;
    return `${longitude},${latitude}`;
}

export function stringToBoolean(val: string): boolean {
    return !!+val;
}

export function stringToPoint(val: string): Point {
    const [longitude, latitude] = val.split(",");
    return { longitude: parseFloat(longitude), latitude: parseFloat(latitude) };
}

export function hashFieldToString(schema: BaseField, val: any, separator?: string): string | undefined {
    if (schema.type === "boolean") {
        return booleanToString(val);
    } else if (schema.type === "date") {
        return dateToNumber(val).toString();
    } else if (schema.type === "point") {
        return pointToString(val);
    } else if (schema.type === "array") {
        const temp = [];
        for (let i = 0, len = (<Array<unknown>>val).length; i < len; i++) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            temp.push(hashFieldToString({ type: (<ArrayField>schema).elements! }, val[i]));
        }
        return temp.join(separator);
    } else {
        return <string>val.toString();
    }
}

export function stringToHashField(schema: BaseField, val: string): unknown {

}

export function objectToString(data: Record<string, any>, k: string, schema?: Record<string, any>): string {
    let init = "";
    for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
        const [key, val] = entries[i];

        if (typeof val === "object" && !Array.isArray(val)) {
            if (typeof schema?.[key]?.properties !== "undefined") {
                init += objectToString(val, key, schema[key].properties);
                continue;
            }
            init += objectToString(val, key);
            continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        init += ` "${`${k}.${key}`}" "${hashFieldToString(<BaseField>schema?.[key] ?? convertUnknownToSchema(val), val)}"`;

    }

    return init;
}

export function stringToObject(arr: Array<string>, val: unknown): Record<string, any> {
    let obj: any = {};
    arr.reduce((object, accessor, i) => {
        object[accessor] = {};

        if (arr.length - 1 === i) {
            object[accessor] = val;
        }

        return <Record<string, unknown>>object[accessor];
    }, obj);

    return <Record<string, any>>obj;
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

export function convertUnknownToSchema(val: any): BaseField {
    if (Array.isArray(val)) return { type: "array" };
    if (val instanceof Date) return { type: "date" };
    if (typeof val === "object" && "latitude" in val && "longitude" in val) return { type: "point" };
    return { type: <"string" | "number" | "boolean" | "object">typeof val };
}

export function getLastKeyInSchema(data: Required<ObjectField>): BaseField {

}