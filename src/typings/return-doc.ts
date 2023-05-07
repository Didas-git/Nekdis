import type { ParseSchema } from "./parse-schema";
import type { MapSchema } from "./map-schema";
import type { Document } from "../document";
import type { Schema } from "../schema";

export type ReturnDocument<T extends Schema<any, any> | ParseSchema<any>, AF extends boolean = false> = T extends Schema<any, any, infer U>
    ? Document<U> & MapSchema<U, AF>
    : Document<T & ParseSchema<any>> & MapSchema<T & ParseSchema<any>, AF>;