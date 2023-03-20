import type { Parsed, ParsedSchemaDefinition } from "../typings";

export function parse(schema: ParsedSchemaDefinition, k?: string): Array<Parsed> {
    const objs: Array<Parsed> = [];

    Object.entries(schema).forEach(([key, value]) => {
        if (value.type === "object" && value.properties) {
            const parsed = parse(<ParsedSchemaDefinition>value.properties, k ? `${k}.${key}` : key);
            parsed.forEach((p) => objs.push(p));
        }

        objs.push({ value: value, path: k ? `${k}.${key}` : key });
    });

    return objs;
}