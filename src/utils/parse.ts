import type { ParsedMap, ParseSchema } from "../typings";

export function parse(schema: ParseSchema<any>, k?: string): ParsedMap {
    let objs: ParsedMap = new Map();

    Object.entries(schema).forEach(([key, value]) => {
        //@ts-expect-error Typescript is getting confused due to the union of array and object
        if (value.type === "object" && value.properties) {
            //@ts-expect-error Typescript is getting confused due to the union of array and object
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            const parsed = parse(value.properties, k ? `${k}.${key}` : key);
            objs = new Map([...objs, ...parsed]);
        }

        objs.set(k ? `${k}.${key}` : key, { value: value, path: k ? `${k}_${key}` : key });
    });

    return objs;
}