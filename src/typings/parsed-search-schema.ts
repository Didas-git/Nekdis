import type { FieldTypes, ObjectField } from "./schema-definition";

export interface Parsed {
    value: Exclude<FieldTypes, ObjectField>;
    path: string;
}

export type ParsedMap = Map<string, Parsed>;