import { createHash } from "node:crypto";

import type {
    ParsedRelationsToSearch,
    ParsedSchemaDefinition,
    ParsedSchemaToSearch,
    ParsedArrayField,
    ParsedFieldType,
    VectorField,
    ParsedMap
} from "../typings/index.js";

export function parseSchemaToSearchIndex(
    schema: ParsedSchemaDefinition["data"],
    structure: "JSON" | "HASH",
    { previousKey, previousPath, arrayKey }: { previousKey?: string, previousPath?: string, arrayKey?: string } = {}
): ParsedSchemaToSearch {
    const index: Array<string> = [];
    let objs: ParsedMap = new Map();

    for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];
        const withPreviousKey = previousKey ? `${previousKey}.${key}` : key;
        const withPreviousPath = previousPath ? `${previousPath}_${key}` : key;

        if (value.type === "object") {
            if (value.properties === null) continue;
            const parsed = parseSchemaToSearchIndex(
                value.properties,
                structure,
                {
                    previousKey: withPreviousKey,
                    previousPath: withPreviousPath
                }
            );

            objs = new Map([...objs, ...parsed.map]);
            index.push(...parsed.index);
            continue;
        }

        if (!value.index) continue;

        if (value.type === "array") {
            if (typeof value.elements === "object") {
                const parsed = parseSchemaToSearchIndex(
                    value.elements,
                    structure,
                    {
                        previousKey: withPreviousKey,
                        previousPath: withPreviousPath,
                        arrayKey: previousKey ? `${previousKey}.${key}${getArrayModifier(value.elements)}` : `${key}${getArrayModifier(value.elements)}`
                    }
                );
                objs = new Map([...objs, ...parsed.map]);
                index.push(...parsed.index);
                continue;
            }
        }

        if (value.type === "tuple") {
            for (let j = 0, { length } = value.elements; j < length; j++) {
                const indexValue = value.elements[j];

                const parsed = parseSchemaToSearchIndex(
                    { [j.toString()]: indexValue },
                    structure,
                    {
                        previousKey: withPreviousKey,
                        previousPath: withPreviousPath
                    }
                );

                objs = new Map([...objs, ...parsed.map]);
                index.push(...parsed.index);
            }
            continue;
        }

        const actualType = value.type === "array"
            // We are handling it already so we can cast
            ? <Exclude<ParsedArrayField["elements"], ParsedSchemaDefinition["data"]>>value.elements
            : value.type;

        objs.set(withPreviousKey, {
            type: actualType,
            searchPath: withPreviousPath
        });

        const prefix = structure === "JSON" ? "$." : "";

        index.push(
            `${prefix}${arrayKey ? `${arrayKey}.${key}` : withPreviousKey}`,
            "AS",
            withPreviousPath,
            getSearchType(actualType)
        );

        if (value.type === "vector") {
            index.push(
                value.algorithm,
                getCount(value),
                "TYPE",
                value.vecType,
                "DIM",
                value.dim.toString(),
                "DISTANCE_METRIC",
                value.distance
            );

            if (value.cap) index.push("INITIAL_CAP", value.cap.toString());

            if (value.algorithm === "FLAT") {
                if (value.size) index.push("BLOCK_SIZE", value.size.toString());
            } else {
                if (value.m) index.push("M", value.m.toString());
                if (value.construction) index.push("EF_CONSTRUCTION", value.construction.toString());
                if (value.runtime) index.push("EF_RUNTIME", value.runtime.toString());
                if (value.epsilon) index.push("EPSILON", value.epsilon.toString());
            }
        }

        if ("sortable" in value && value.sortable) index.push("SORTABLE");
        if (value.type === "string" && value.caseSensitive) index.push("CASESENSITIVE");
        if (value.type === "text") {
            if (typeof value.phonetic !== "undefined") index.push("PHONETIC", value.phonetic);
            if (typeof value.weight !== "undefined") index.push("WEIGHT", value.weight.toString());
        }
    }

    return { map: objs, index };
}

export function parseRelationsToSearchIndex(
    schema: ParsedSchemaDefinition["relations"],
    structure: "JSON" | "HASH",
    initialKey: string
): ParsedRelationsToSearch {
    const relations: ParsedRelationsToSearch = {};

    for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];

        relations[key] = {
            key: `${initialKey}-relation-${key}`,
            hash: createHash("sha1").update(JSON.stringify({
                structure: structure,
                definition: value.meta
            })).digest("base64"),
            data: parseSchemaToSearchIndex(value.meta, structure)
        };
    }

    return relations;
}

function getArrayModifier(elements: ParsedArrayField["elements"]): ".*" | ".[*]" | "" {
    if (typeof elements === "object" || elements === "vector") return ".[*]";
    if (elements === "string" || elements === "boolean") return ".*";
    return "";
}

function getSearchType(type: ParsedFieldType["type"]): "TAG" | "NUMERIC" | "TEXT" | "GEO" | "VECTOR" {
    if (type === "text") return "TEXT";
    if (type === "number" || type === "date") return "NUMERIC";
    if (type === "point") return "GEO";
    if (type === "vector") return "VECTOR";
    return "TAG";
}

function getCount(value: VectorField): string {
    let count = 6;

    if (value.cap) count += 2;
    if (value.algorithm === "FLAT") {
        if (value.size) count += 2;
    } else {
        if (value.m) count += 2;
        if (value.construction) count += 2;
        if (value.runtime) count += 2;
        if (value.epsilon) count += 2;
    }

    return count.toString();
}
