import { DeconstructTuple } from "./deconstruct-tuple";
import { FieldMap } from "./field-map";
import { TupleField } from "./schema-definition";

export type ParseTupleField<T extends TupleField> = T["required"] extends true
    ? ParseTuple<T>
    : ParseTuple<T> | undefined;

export type ParseTuple<T extends TupleField> = T["mutable"] extends true
    ? FieldMap<DeconstructTuple<T["elements"]>, true>["tuple"]
    : FieldMap<DeconstructTuple<T["elements"]>>["tuple"];