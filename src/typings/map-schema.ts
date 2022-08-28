import { FieldMap } from "./field-map";
import { ParseArrayField } from "./parse-array-field";
import { ParseBasicFields } from "./parse-basic-fields";
import { ParseObjectField } from "./parse-object-field";
import { ParseTupleField } from "./parse-tuple-field";
import { ArrayField, FieldTypes, ObjectField, SchemaDefinition, TupleField } from "./schema-definition";

export type MapSchema<T extends SchemaDefinition> = Pick<Map<T>, {
    [K in keyof T]: T[K] extends FieldTypes ? T[K]["required"] extends true ? K : never : never
}[keyof T]> & Partial<Map<T>>;

export type Map<T extends SchemaDefinition> = {
    -readonly [K in keyof T]: T[K] extends ObjectField
    ? ParseObjectField<T[K]>

    : T[K] extends ArrayField
    ? ParseArrayField<T[K]>

    : T[K] extends TupleField
    ? ParseTupleField<T[K]>

    : T[K] extends FieldTypes
    ? ParseBasicFields<T[K]>

    : FieldMap[Exclude<T[K], FieldTypes>] | undefined
};