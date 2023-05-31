import type { ExtractParsedSchemaDefinition } from "./extract-generic";
import type {
    ArrayField,
    BaseField,
    ObjectField,
    ReferenceField,
    SchemaDefinition,
    TupleField
} from "./schema-definition";

export type ParseSchema<T extends SchemaDefinition> = {
    data: {
        [K in keyof T as T[K] extends ReferenceField ? never : K]: T[K] extends ObjectField
        ? {
            [P in keyof Required<ObjectField>]: P extends "properties"
            ? T[K][P] extends {} ? ParseSchema<T[K][P]>["data"] : undefined
            : T[K][P] extends {} ? T[K][P] : Fill<P>
        }
        : T[K] extends ArrayField
        ? {
            [P in keyof Required<ArrayField>]: P extends "elements"
            ? T[K][P] extends SchemaDefinition ? ParseSchema<T[K][P]>["data"]
            : T[K][P] extends {} ? T[K][P] : "string"
            : Fill<P>
        }
        : T[K] extends TupleField
        ? {
            [P in keyof Required<TupleField>]: P extends "elements"
            ? T extends Record<K, Record<P, infer V>>
            ? {
                [U in keyof V]: V[U] extends string
                ? CreateDefinitionFromString<V[U]>
                : V[U] extends SchemaDefinition
                ? ParseSchema<{ $: { type: "object", properties: V[U] } }>["data"]["$"]
                : never
            }
            : never
            : T[K][P] extends {} ? T[K][P] : Fill<P>
        }
        : T[K] extends BaseField
        ? {
            [P in keyof Required<BaseField>]: T[K][P] extends {} ? T[K][P] : Fill<P>
        }
        : CreateDefinitionFromString<T[K] & string>
    },
    references: {
        [K in keyof T as T[K] extends ReferenceField ? K : never]: T[K] extends ReferenceField
        ? {
            [P in keyof ReferenceField]: P extends "schema"
            ? ExtractParsedSchemaDefinition<T[K][P]>
            : T[K][P]
        }
        : never
    }
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