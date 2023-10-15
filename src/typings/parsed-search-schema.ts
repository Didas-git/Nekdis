import type { FieldStringType } from "./schema-definition";

export interface ParsedSchemaToSearch {
    map: ParsedMap;
    index: Array<string>;
}

export type ParsedMap = Map<string, {
    type: Exclude<FieldStringType, "array">,
    searchPath: string
}>;