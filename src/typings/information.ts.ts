import type { SchemaOptions } from "./schema-options";

export interface ModelOptions extends SchemaOptions {
    globalPrefix: string;
    prefix: string;
}

export interface ModelInformation extends ModelOptions {
    modelName: string;
}

export interface SearchInformation extends ModelInformation {
    searchIndex: string;
}