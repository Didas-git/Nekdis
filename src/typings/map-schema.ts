import { FieldMap } from "./field-map";
import { ParseArrayField } from "./parse-array-field";
import { ParseBasicFields } from "./parse-basic-fields";
import { ParseObjectField } from "./parse-object-field";
import { ArrayField, FieldTypes, ObjectField, SchemaDefinition } from "./schema-definition";

export type MapSchema<T extends SchemaDefinition, CAS = false> = Pick<_MapSchema<T>, {
    [K in keyof T]: T[K] extends FieldTypes
    ? T[K]["required"] extends true
    ? K
    : T[K]["default"] extends {}
    ? CAS extends true
    ? never
    : K
    : never
    : never
}[keyof T]> & Partial<_MapSchema<T>>;

export type _MapSchema<T extends SchemaDefinition> = {
    -readonly [K in keyof T]: T[K] extends ObjectField
    ? ParseObjectField<T[K]>

    : T[K] extends ArrayField
    ? ParseArrayField<T[K]>

    : T[K] extends FieldTypes
    ? ParseBasicFields<T[K]>

    : FieldMap[Exclude<T[K], FieldTypes>] | undefined
};