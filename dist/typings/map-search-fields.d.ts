import { NumberField } from "../utils/search-builders/number";
import { StringField } from "../utils/search-builders/string";
import { MapSchema } from "./map-schema";
import { SchemaDefinition } from "./schema-definition";
export type MapSearchField<T extends keyof S, S extends SchemaDefinition, K extends MapSchema<S> = MapSchema<S>> = K[T] extends string | undefined ? StringField<S> : K[T] extends number | undefined ? NumberField<S> : never;
//# sourceMappingURL=map-search-fields.d.ts.map