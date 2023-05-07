import type { ReferenceArray } from "../utils";
import type { FieldMap } from "./field-map";
import type { ParseSchema } from "./parse-schema";

export type MapSchema<
    T extends ParseSchema<any>,
    AF extends boolean = false,
    CAS extends boolean = false
> = MapSchemaData<T["data"], CAS> & (CAS extends true ? Partial<MapSchemaReferences<T["references"], AF, CAS>> : MapSchemaReferences<T["references"], AF, CAS>);

type MapSchemaData<T extends ParseSchema<any>["data"], CAS extends boolean = false> = {
    [K in keyof T as T[K]["required"] extends true ? K : T[K]["default"] extends {} ? CAS extends true ? never : K : never]: _MapSchemaData<T[K]>
} & {
        [K in keyof T as T[K]["required"] extends true ? never : T[K]["default"] extends {} ? CAS extends true ? K : never : K]?: _MapSchemaData<T[K]>
    };

// eslint-disable-next-line @typescript-eslint/naming-convention
type _MapSchemaData<T extends ParseSchema<any>["data"][number]> = T extends { properties: unknown }
    ? T["properties"] extends ParseSchema<any> ? MapSchema<T["properties"]> : unknown
    : T extends { elements: any }
    ? FieldMap<FieldMap[T["elements"]]>["array"]
    : FieldMap[T["type"]]
    ;

type MapSchemaReferences<T extends ParseSchema<any>["references"], AF extends boolean = false, CAS extends boolean = false> = CAS extends true ? {
    [K in keyof T]?: Array<string>
} : {
        [K in keyof T]: _MapSchemaReferences<T[K], AF>
    };

// eslint-disable-next-line @typescript-eslint/naming-convention
type _MapSchemaReferences<T extends ParseSchema<any>["references"][number], AF extends boolean = false> = AF extends true
    ? Array<MapSchema<T["schema"]>>
    : ReferenceArray;