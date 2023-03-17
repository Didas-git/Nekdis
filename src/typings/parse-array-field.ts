import type { FieldMap } from "./field-map";
import type { MapSchema } from "./map-schema";
import type { ParseBasicFields } from "./parse-basic-fields";
import type { ParseObjectField } from "./parse-object-field";
import type { ArrayField, FieldTypes, ObjectField, SchemaDefinition } from "./schema-definition";

export type ParseArrayField<T extends ArrayField> = T["required"] extends true
    ? ParseArray<T>

    : T["default"] extends {}
    ? ParseArray<T>

    : ParseArray<T> | undefined;

export type ParseArray<T extends ArrayField> = T["elements"] extends ObjectField
    ? FieldMap<ParseObjectField<T["elements"]>>["array"]

    : T["elements"] extends ArrayField
    ? FieldMap<ParseArrayField<T["elements"]>>["array"]

    : T["elements"] extends FieldTypes
    ? FieldMap<ParseBasicFields<T["elements"]>>["array"]

    : T["elements"] extends SchemaDefinition
    ? FieldMap<MapSchema<T["elements"]>>["array"]

    : T["elements"] extends "object"
    ? Array<Record<string, any>>

    : T["elements"] extends keyof FieldMap
    ? FieldMap<FieldMap[Exclude<T["elements"], SchemaDefinition>]>["array"]

    : FieldMap["array"];