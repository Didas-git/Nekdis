import { Point } from "./point";
import { ArrayField, FieldTypes, ObjectField, SchemaDefinition, TupleField } from "./schema-definition";

export interface FieldMap<T = string> {
    string: string;
    number: number;
    boolean: boolean;
    text: string;
    date: Date;
    point: Point;
    array: Array<T>;
    tuple: { -readonly [K in keyof T]: T[K] }
    object: Record<string, SchemaDefinition>;
}


export type MapSchema<T extends SchemaDefinition> = {
    -readonly [K in keyof T]: T[K] extends ObjectField
    ? MapSchema<Exclude<T[K]["data"], undefined>>
    : T[K] extends ArrayField
    ? T[K]["elements"] extends SchemaDefinition
    ? FieldMap<MapSchema<T[K]["elements"]>>["array"]
    : FieldMap<FieldMap[Exclude<T[K]["elements"], undefined | SchemaDefinition>]>["array"]
    : T[K] extends TupleField
    ? FieldMap<DeconstructTuple<T[K]["elements"]>>["tuple"]
    : FieldMap[Exclude<T[K], FieldTypes>]
}

export type DeconstructTuple<T extends TupleField["elements"]> = {
    [K in keyof T]: T[K] extends SchemaDefinition
    ? MapSchema<T[K]>
    : FieldMap[Exclude<T[K], SchemaDefinition>]
}