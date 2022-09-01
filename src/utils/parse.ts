import { ObjectField, Parsed, ParsedSchemaDefinition } from "../typings";

export function parse(schema: ParsedSchemaDefinition, k?: string) {
    const objs: Array<Parsed> = [];

    Object.keys(schema).forEach((key) => {
        if (schema[key].type === "object") {
            const parsed = parse((<ParsedSchemaDefinition>(<ObjectField>schema[key]).data!), k ? `${k}.${key}` : key);
            parsed.forEach((p) => objs.push(p));
        }

        objs.push({ value: schema[key], pars: k ? `${k}.${key}` : key });
    });

    return objs;
}