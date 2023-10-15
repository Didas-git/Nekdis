import type { ExtractParsedSchemaDefinition } from "./extract-generic";
import type { Schema } from "../schema";

import type {
    TopLevelSchemaDefinition,
    ReferenceField,
    ObjectField,
    StringField,
    NumberField,
    VectorField,
    ArrayField,
    TupleField,
    FlatVector,
    HNSWVector,
    BaseField,
    FieldType,
    BigIntField,
    SchemaDefinition,
    RelationField
} from "./schema-definition";

export type ParseSchema<T extends TopLevelSchemaDefinition> = {
    data: ParseSchemaData<T>,
    references: {
        [K in keyof T as T[K] extends ReferenceField ? K : never]: T[K] extends ReferenceField
        ? {
            [P in keyof ReferenceField]: P extends "schema"
            ? T[K][P] extends "self"
            ? ParseSchemaData<T>
            : ExtractParsedSchemaDefinition<T[K][P]>["data"]
            : T[K][P]
        }
        : never
    },
    relations: {
        [K in keyof T as T[K] extends RelationField ? K : never]: T[K] extends RelationField
        ? {
            [P in keyof Required<RelationField>]: P extends "schema"
            ? T[K][P] extends "self"
            ? ParseSchemaData<T>
            : ExtractParsedSchemaDefinition<T[K][P]>["data"]
            : P extends "meta"
            ? T[K][P] extends {}
            ? T[K][P] extends Schema<any, any, infer U>
            ? U["data"]
            : T[K][P] extends SchemaDefinition
            ? ParseSchemaData<T>
            : never
            : undefined
            : T[K][P]
        }
        : never
    }
};

export type ParseSchemaData<T extends TopLevelSchemaDefinition> = {
    [K in keyof T as T[K] extends ReferenceField ? never : T[K] extends RelationField ? never : K]: T[K] extends ObjectField
    ? ParseObjectField<T[K]>
    : T[K] extends ArrayField
    ? ParseArrayField<T[K]>
    : T[K] extends TupleField
    ? ParseTupleField<T[K]>
    : T[K] extends VectorField
    ? T[K] extends FlatVector
    ? {
        [P in keyof Required<FlatVector>]: T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : T[K] extends HNSWVector
    ? {
        [P in keyof Required<HNSWVector>]: T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : never
    : T[K] extends StringField
    ? {
        [P in keyof Required<StringField>]: T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : T[K] extends NumberField
    ? {
        [P in keyof Required<NumberField>]: T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : T[K] extends BigIntField
    ? {
        [P in keyof Required<BigIntField>]: T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : T[K] extends BaseField
    ? {
        [P in keyof Required<BaseField>]: T[K][P] extends {} ? T[K][P] : Fill<P>
    }
    : CreateDefinitionFromString<T[K] & string>
};

type ParseObjectField<T extends ObjectField> = {
    [P in keyof Required<ObjectField>]: P extends "properties"
    ? T[P] extends {}
    ? T[P] extends Schema<any, any, infer U>
    ? U["data"]
    : T[P] extends SchemaDefinition
    ? ParseSchemaData<T[P]>
    : never
    : undefined
    : T[P] extends {} ? T[P] : Fill<P>
};

type ParseArrayField<T extends ArrayField> = {
    [P in keyof Required<ArrayField>]: P extends "elements"
    ? T[P] extends SchemaDefinition ? ParseSchemaData<T[P]>
    : T[P] extends {} ? T[P] : "string"
    : Fill<P>
};

type ParseTupleField<T extends TupleField> = {
    [P in keyof Required<TupleField>]: P extends "elements"
    ? T extends Record<P, infer V>
    ? {
        [U in keyof V]: V[U] extends string
        ? CreateDefinitionFromString<V[U]>
        : V[U] extends FieldType
        ? GetTupleObject<V[U]>
        : never
    }
    : never
    : T[P] extends {} ? T[P] : Fill<P>
};

type CreateDefinitionFromString<T extends string> = T extends "vector"
    ? {
        [K in keyof Required<FlatVector>]: K extends "type"
        ? T
        : K extends "algorithm"
        ? "FLAT"
        : K extends "vecType"
        ? "FLOAT32"
        : K extends "dim"
        ? 128
        : K extends "distance"
        ? "L2"
        : Fill<K>
    }
    : T extends "string"
    ? {
        [K in keyof Required<StringField>]: K extends "type"
        ? T
        : Fill<K>
    }
    : T extends "number"
    ? {
        [K in keyof Required<NumberField>]: K extends "type"
        ? T
        : Fill<K>
    }
    : T extends "bigint"
    ? {
        [K in keyof Required<BigIntField>]: K extends "type"
        ? T
        : Fill<K>
    }
    : {
        [K in keyof Required<BaseField>]: K extends "type"
        ? T
        : Fill<K>
    };

/**
 * `T` is the same as `keyof FieldTypes` but i can't use `extends` here
 */
type Fill<T> = T extends "optional"
    ? false
    : T extends "sortable"
    ? false
    : T extends "index"
    ? false
    : undefined;

type GetTupleObject<T extends FieldType, P = ParseSchema<{ $: T }>["data"]> = P extends { $: unknown } ? P["$"] : never;