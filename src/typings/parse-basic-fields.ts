import type { FieldMap } from "./field-map";
import type { FieldTypes } from "./schema-definition";

export type ParseBasicFields<T extends Omit<FieldTypes, "ObjectField" | "ArrayField" | "TupleField">> = T["required"] extends true
    ? FieldMap[Exclude<T["type"], FieldTypes>]

    : T["default"] extends {}
    ? FieldMap[Exclude<T["type"], FieldTypes>]

    : FieldMap[Exclude<T["type"], FieldTypes>] | undefined;