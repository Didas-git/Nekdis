import type { FieldMap } from "./field-map";
import type { ParseSchema } from "./parse-schema";

export type MapSchema<T extends ParseSchema<any>> = {
    [K in keyof T]: T[K] extends { schema: any }
    ? Array<MapSchema<T[K]["schema"]>>
    : T[K] extends { properties: any }
    ? T[K]["properties"] extends ParseSchema<any> ? MapSchema<T[K]["properties"]> : unknown
    : T[K] extends { elements: any }
    ? FieldMap<FieldMap[T[K]["elements"]]>["array"]
    : FieldMap[T[K]["type"]]
};