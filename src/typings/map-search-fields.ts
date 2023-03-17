import { StringField, NumberField, BooleanField } from "../utils/search-builders";
import { MapSchema } from "./map-schema";
import { SchemaDefinition } from "./schema-definition";

export type MapSearchField<T extends keyof S, S extends SchemaDefinition, K extends MapSchema<S> = MapSchema<S>> = K[T] extends string | undefined
    ? StringField<S>
    : K[T] extends number | undefined
    ? NumberField<S>
    : K[T] extends boolean | undefined
    ? BooleanField<S>
    : never // under construction