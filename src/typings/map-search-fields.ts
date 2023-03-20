import type { StringField, NumberField, BooleanField, TextField, DateField } from "../utils/search-builders";
import type { ArrayField, FieldTypes, ObjectField, SchemaDefinition } from "./schema-definition";

export type MapSearchField<K extends keyof T, S extends SchemaDefinition, T extends ParseSchema<S>> = T[K] extends "string"
    ? StringField<S>
    : T[K] extends "number"
    ? NumberField<S>
    : T[K] extends "boolean"
    ? BooleanField<S>
    : T[K] extends "text"
    ? TextField<S>
    : T[K] extends "date"
    ? DateField<S>
    : never;

export type SchemaToStrings<T extends SchemaDefinition, K extends keyof T = keyof T> = K extends string
    ? T[K] extends ObjectField
    ? `${K}.${SchemaToStrings<T[K]["properties"] & {}>}`
    : K
    : never;

export type GetFinalProperty<T extends string, S extends SchemaDefinition> = T extends `${infer Head}.${infer Tail}`
    ? S[Head] extends ObjectField
    ? GetFinalProperty<Tail, S[Head]["properties"] & {}>
    : never
    : S[T] extends ArrayField
    ? S[T]["elements"] extends {}
    ? S[T]["elements"]
    : "string"
    : S[T] extends FieldTypes
    ? S[T]["type"]
    : S[T];

export type ParseSchema<T extends SchemaDefinition> = {
    [K in SchemaToStrings<T>]: GetFinalProperty<K, T>
};