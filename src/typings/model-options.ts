import type { SchemaOptions } from "./schema-options";

export interface ModelOptions extends SchemaOptions {
    globalPrefix: string;

    /** Default prefix */
    version: string;
}