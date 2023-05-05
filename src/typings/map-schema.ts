import type { FieldMap } from "./field-map";
import type { ParseSchema } from "./parse-schema";

export type MapSchema<T extends ParseSchema<any>, AF extends boolean = false> = MapSchemaData<T["data"]> & MapSchemaReferences<T["references"], AF>;

type MapSchemaData<T extends ParseSchema<any>["data"]> = {
    [K in keyof T]: T[K] extends { properties: any }
    ? T[K]["properties"] extends ParseSchema<any> ? MapSchema<T[K]["properties"]> : unknown
    : T[K] extends { elements: any }
    ? FieldMap<FieldMap[T[K]["elements"]]>["array"]
    : FieldMap[T[K]["type"]]
};

type MapSchemaReferences<T extends ParseSchema<any>["references"], AF extends boolean> = {
    [K in keyof T]: AF extends true
    ? Array<MapSchema<T[K]["schema"]>>
    : Array<string>
};