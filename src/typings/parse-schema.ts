import type { ArrayField, FieldTypes, ObjectField, SchemaDefinition } from "./schema-definition";

export type ParseSchema<T extends SchemaDefinition> = {
    [K in keyof T]: T[K] extends ObjectField
    ? {
        [P in keyof Required<ObjectField>]: P extends "properties"
        ? T[K][P] extends {} ? ParseSchema<T[K][P]> : undefined
        : T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : T[K] extends ArrayField
    ? {
        [P in keyof Required<ArrayField>]: T[K][P] extends {}
        ? T[K][P]
        : P extends "elements" ? "string" : Fill<P>
    }
    : T[K] extends FieldTypes
    ? {
        [P in keyof Required<FieldTypes>]: T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : CreateDefinitionFromString<T[K] & string>
};

export type CreateDefinitionFromString<T extends string> = {
    [K in keyof Required<FieldTypes> as T extends "array" ? K | "elements" : K]: K extends "type"
    ? T
    : K extends "elements"
    ? "string"
    : Fill<K>
};

/**
 * `T` is the same as `keyof FieldTypes` but i can't use `extends` here
 */
export type Fill<T> = T extends "default" ? undefined : false;