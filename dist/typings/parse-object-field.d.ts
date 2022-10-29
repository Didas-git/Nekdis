import { MapSchema } from "./map-schema";
import { ObjectField, SchemaDefinition } from "./schema-definition";
export declare type ParseObjectField<T extends ObjectField> = T["required"] extends true ? ParseObject<T> : T["default"] extends {} ? ParseObject<T> : ParseObject<T> | undefined;
export declare type ParseObject<T extends ObjectField> = T["data"] extends SchemaDefinition ? MapSchema<Exclude<T["data"], undefined>> : Record<string, any>;
//# sourceMappingURL=parse-object-field.d.ts.map