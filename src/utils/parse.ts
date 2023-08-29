import type { ParsedMap, ParsedSchemaDefinition } from "../typings";

export function parseSchemaToSearchIndex(schema: ParsedSchemaDefinition, k?: string, p?: string): ParsedMap {
    let objs: ParsedMap = new Map();

    for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];

        if (value.type === "object") {
            if (typeof value.properties === "undefined") continue;
            const parsed = parseSchemaToSearchIndex(value.properties, k ? `${k}.${key}` : key, p ? `${k}_${key}` : key);
            objs = new Map([...objs, ...parsed]);
            continue;
        }

        if (!value.index) continue;

        if (value.type === "array" && typeof value.elements === "object") continue;
        if (value.type === "tuple") {
            for (let j = 0, le = value.elements.length; j < le; j++) {
                const temp = value.elements[j];

                const parsed = parseSchemaToSearchIndex(<never>{ [j]: temp }, k ? `${k}.${key}` : key, p ? `${k}_${key}` : key);
                objs = new Map([...objs, ...parsed]);

            }
            continue;
        }
        objs.set(k ? `${k}.${key}` : key, { value: value, path: p ? `${p}_${key}` : key });
    }

    return objs;
}