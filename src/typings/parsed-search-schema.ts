import type { FieldTypes } from "./schema-definition";

export interface Parsed {
    value: FieldTypes;
    path: string;
}

export type ParsedMap = Map<string, Parsed>;