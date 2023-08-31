import type { ParsedFieldType, ParsedMap, ParsedSchemaDefinition } from "../typings";

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

type TestMap = Map<string, {
    value: ParsedFieldType,
    finalPath: "[*]" | "*" | "",
    searchType: "TAG" | "NUMERIC" | "TEXT" | "GEO" | "VECTOR",
    path: string
}>;

/**
 * Key: `${string}.${string}`
 * Path: `${string}_${string}`
 */
export function parseSchemaToSearchIndex2(schema: ParsedSchemaDefinition["data"], previousKey?: string, previousPath?: string): {
    map: TestMap,
    index?: Array<string>
} {
    let objs: TestMap = new Map();
    let index: Array<string> = [];

    for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];

        if (value.type === "object") {
            if (value.properties === null) continue;
            const parsed = parseSchemaToSearchIndex2(
                value.properties,
                previousKey ? `${previousKey}.${key}` : key,
                previousPath ? `${previousPath}_${key}` : key
            );

            objs = new Map([...objs, ...parsed.map]);
            continue;
        }

        if (!value.index) continue;

        if (value.type === "array" && typeof value.elements === "object") continue;
        if (value.type === "tuple") {
            for (let j = 0, length = value.elements.length; j < length; j++) {
                const indexValue = value.elements[j];

                const parsed = parseSchemaToSearchIndex2(
                    { [j.toString()]: indexValue },
                    previousKey ? `${previousKey}.${key}` : key,
                    previousPath ? `${previousPath}_${key}` : key
                );

                objs = new Map([...objs, ...parsed.map]);

            }
            continue;
        }
        objs.set(
            previousKey ? `${previousKey}.${key}` : key,
            {
                value: value,
                finalPath: value.type === "array"
                    ? value.elements === "text"
                        ? "[*]"
                        : value.elements === "number" || value.elements === "date" || value.elements === "point"
                            ? ""
                            : "*"
                    : "",
                searchType: value.type === "text"
                    ? "TEXT"
                    : value.type === "number" || value.type === "date"
                        ? "NUMERIC"
                        : value.type === "point"
                            ? "GEO"
                            : value.type === "vector"
                                ? "VECTOR"
                                : "TAG",
                path: previousPath ? `${previousPath}_${key}` : key
            }
        );
    }

    return { map: objs, index };
}

