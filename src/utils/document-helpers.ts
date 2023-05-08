import type { ArrayField, BaseField, ParseSchema, Point } from "../typings";

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
    } else if (schema.type === "object") {
        return void 0; //!!
    } else {
        return <string>val.toString();
    }
}

export function objectToString(schema: ParseSchema<any>["data"], k: string): { key: string, value: string } | string {
    for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
        const [key, val] = entries[i];

        if (val.type !== "object") {
            return { key: "", value: "" };
        }
    }

    return "";
}