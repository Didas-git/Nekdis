import type { ParsedMap, ParsedSchemaDefinition } from "../typings";

export function parse(schema: ParsedSchemaDefinition, k?: string): ParsedMap {
    let objs: ParsedMap = new Map();

    Object.entries(schema).forEach(([key, value]) => {
        if (value.type === "object" && value.properties) {
            const parsed = parse(<ParsedSchemaDefinition>value.properties, k ? `${k}.${key}` : key);
            objs = new Map([...objs, ...parsed]);
        }

        objs.set(k ? `${k}.${key}` : key, { value: value, path: k ? `${k}_${key}` : key });
    });

    return objs;
}