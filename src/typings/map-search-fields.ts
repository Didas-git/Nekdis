import { StringField, NumberField, BooleanField, TextField } from "../utils/search-builders";
import { SchemaDefinition } from "./schema-definition";

export type MapSearchField<T extends keyof S, S extends SchemaDefinition> = S[T] extends Record<string, unknown> ? _MapSearchField<S[T]["type"], S> : _MapSearchField<S[T], S>

export type _MapSearchField<T extends unknown, S extends SchemaDefinition> = T extends "string"
    ? StringField<S>
    : T extends "number"
    ? NumberField<S>
    : T extends "boolean"
    ? BooleanField<S>
    : T extends "text"
    ? TextField<S>
    : never