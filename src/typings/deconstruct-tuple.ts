import { FieldMap } from "./field-map";
import { MapSchema } from "./map-schema";
import { ParseArray } from "./parse-array-field";
import { ParseObject } from "./parse-object-field";
import { ParseTuple } from "./parse-tuple-field";
import { ArrayField, FieldTypes, ObjectField, SchemaDefinition, TupleField } from "./schema-definition";

/**
 * @typeParam T - The tuple elements
 */
export type DeconstructTuple<T extends TupleField["elements"]> = {
    [K in keyof T]: T[K] extends ObjectField
    ? ParseObject<T[K]>

    : T[K] extends ArrayField
    ? ParseArray<T[K]>

    : T[K] extends TupleField
    ? ParseTuple<T[K]>

    : T[K] extends FieldTypes
    ? FieldMap[Exclude<T[K]["type"], FieldTypes>]

    : T[K] extends SchemaDefinition
    ? MapSchema<T[K]>

    : FieldMap[Exclude<T[K], SchemaDefinition | FieldTypes>]
};