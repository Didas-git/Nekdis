import type { FieldTypes, ObjectField, ReferenceField } from "./schema-definition";

export interface Parsed {
    value: Exclude<FieldTypes, ObjectField | ReferenceField>;
    path: string;
}

export type ParsedMap = Map<string, Parsed>;