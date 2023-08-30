import type { HASHDocument, JSONDocument } from "../document";
import type { ParseSchema } from "./parse-schema";
import type { MapSchema } from "./map-schema";
import type { Schema } from "../schema";

export type Document = JSONDocument | HASHDocument;

export type ReturnDocument<T extends Schema<any, any> | ParseSchema<any>, AF extends boolean = false> = T extends Schema<any, any, infer U>
    ? Document & MapSchema<U, AF>
    : Document & MapSchema<T & ParseSchema<any>, AF>;