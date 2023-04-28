import type { ExtractParsedSchemaDefinition } from "./extract-generic";
import type { ArrayField, BaseField, ObjectField, ReferenceField, SchemaDefinition } from "./schema-definition";

export type ParseSchema<T extends SchemaDefinition> = {
    [K in keyof T]: T[K] extends ReferenceField
    ? {
        [P in keyof ReferenceField]: P extends "schema"
        ? ExtractParsedSchemaDefinition<T[K][P]>
        : T[K][P]
    }
    : T[K] extends ObjectField
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
    : T[K] extends BaseField
    ? {
        [P in keyof Required<BaseField>]: T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : CreateDefinitionFromString<T[K] & string>
};

export type CreateDefinitionFromString<T extends string> = {
    [K in keyof Required<BaseField>]: K extends "type"
    ? T
    : Fill<K>
};

/**
 * `T` is the same as `keyof FieldTypes` but i can't use `extends` here
 */
export type Fill<T> = T extends "default" ? undefined : T extends "index" ? true : false;