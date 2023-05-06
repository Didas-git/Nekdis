import type { ReferenceArray } from "../utils";
import type { FieldMap } from "./field-map";
import type { ParseSchema } from "./parse-schema";

export type MapSchema<T extends ParseSchema<any>, AF extends boolean = false, CAS extends boolean = false> = _MapSchema<T, AF, CAS>;

// eslint-disable-next-line @typescript-eslint/naming-convention
type _MapSchema<
    T extends ParseSchema<any>,
    AF extends boolean = false,
    CAS extends boolean = false
> = MapSchemaData<T["data"], CAS> & (CAS extends true ? Partial<MapSchemaReferences<T["references"], AF, CAS>> : MapSchemaReferences<T["references"], AF, CAS>);

type MapSchemaData<T extends ParseSchema<any>["data"], CAS extends boolean = false, SD = _MapSchemaData<T>> = (Pick<SD, ({
    [K in keyof T]: T[K]["required"] extends true
    ? K
    : T[K]["default"] extends {}
    ? CAS extends true
    ? never
    : K
    : never
}[keyof T]) & keyof SD> & Partial<SD>);

// eslint-disable-next-line @typescript-eslint/naming-convention
type _MapSchemaData<T extends ParseSchema<any>["data"]> = {
    [K in keyof T]: T[K] extends { properties: any }
    ? T[K]["properties"] extends ParseSchema<any> ? MapSchema<T[K]["properties"]> : unknown
    : T[K] extends { elements: any }
    ? FieldMap<FieldMap[T[K]["elements"]]>["array"]
    : FieldMap[T[K]["type"]]
};

type MapSchemaReferences<T extends ParseSchema<any>["references"], AF extends boolean = false, CAS extends boolean = false> = {
    [K in keyof T]: CAS extends true
    ? Array<string>
    : AF extends true
    ? Array<MapSchema<T[K]["schema"]>>
    : ReferenceArray
};