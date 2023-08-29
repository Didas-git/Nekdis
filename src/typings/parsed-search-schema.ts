import type { FieldType, ObjectField, ReferenceField, TupleField } from "./schema-definition";

export interface Parsed {
    value: Exclude<FieldType, TupleField | ObjectField | ReferenceField>;
    path: string;
}

export type ParsedMap = Map<string, Parsed>;