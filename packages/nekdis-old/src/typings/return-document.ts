import type { HASHDocument, JSONDocument } from "../document/index.js";
import type { MapSchema } from "./map-schema-to-object.js";
import type { ParseSchema } from "./parse-schema.js";
import type { Schema } from "../schema.js";

export type Document = JSONDocument | HASHDocument;

export type ReturnDocument<
    T extends Schema<any, any> | ParseSchema<any>,
    FREF extends boolean = false,
    FREL extends boolean = false,
    MOR extends boolean = false,
    CAS extends boolean = false
> = T extends Schema<any, any, infer U>
    ? Document & MapSchema<U, FREF, FREL, MOR, CAS>
    : T extends ParseSchema<any> ? Document & MapSchema<T, FREF, FREL, MOR, CAS> : never;
