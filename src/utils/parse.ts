import type { ParsedMap, ParseSchema } from "../typings";

export function JSONParse(schema: ParseSchema<any>["data"], k?: string): ParsedMap {
    let objs: ParsedMap = new Map();

    for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];
        if (!value.index) continue;
        //@ts-expect-error Typescript is getting confused due to the union of array and object
        if (value.type === "object" && value.properties) {
            //@ts-expect-error Typescript is getting confused due to the union of array and object
            const parsed = JSONParse(value.properties, k ? `${k}.${key}` : key);
            objs = new Map([...objs, ...parsed]);
        }

        objs.set(k ? `${k}.${key}` : key, { value: value, path: k ? `${k}_${key}` : key });
    }

    return objs;
}

// export function HASHParse(schema: ParseSchema<any>["data"]): ParsedMap { }