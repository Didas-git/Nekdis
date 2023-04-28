import type { BooleanField, DateField, NumberField, PointField, StringField, TextField } from "../utils/search-builders";
import type { ParseSchema } from "./parse-schema";

export type MapSearchField<K extends keyof T, S extends ParseSchema<any>, T extends ParseSearchSchema<S>> = T[K] extends "string"
    ? StringField<S>
    : T[K] extends "number"
    ? NumberField<S>
    : T[K] extends "boolean"
    ? BooleanField<S>
    : T[K] extends "text"
    ? TextField<S>
    : T[K] extends "date"
    ? DateField<S>
    : T[K] extends "point"
    ? PointField<S>
    : never;

export type SchemaToStrings<T extends ParseSchema<any>, K extends keyof T = keyof T> = K extends string
    ? T[K] extends { schema: any }
    ? never
    : T[K] extends { index: false }
    ? never
    : T[K] extends { properties: any }
    ? `${K}.${SchemaToStrings<T[K]["properties"]>}`
    : K
    : never;

export type GetFinalProperty<T extends string, S extends ParseSchema<any>> = T extends `${infer Head}.${infer Tail}`
    ? S[Head] extends { properties: any }
    ? GetFinalProperty<Tail, S[Head]["properties"]>
    : never
    : S[T] extends { elements: any }
    ? S[T]["elements"] extends {}
    ? S[T]["elements"]
    : "string"
    : S[T]["type"];

export type ParseSearchSchema<T extends ParseSchema<any>> = {
    [K in SchemaToStrings<T>]: GetFinalProperty<K, T>
};