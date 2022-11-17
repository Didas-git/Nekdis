import { MapSchema } from "./map-schema";
import { ObjectField, SchemaDefinition } from "./schema-definition";

export type ParseObjectField<T extends ObjectField> = T["required"] extends true
    ? ParseObject<T>

    : T["default"] extends {}
    ? ParseObject<T>

    : ParseObject<T> | undefined;

export type ParseObject<T extends ObjectField> = T["properties"] extends SchemaDefinition
    ? MapSchema<Exclude<T["properties"], undefined>>
    : Record<string, any>;