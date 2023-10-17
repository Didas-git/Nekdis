import type { SchemaOptions } from "./schema-options";

export interface ModelOptions extends Required<Pick<SchemaOptions, "skipDocumentValidation" | "suffix">> {
    injectScripts: boolean;
    globalPrefix: string;
    prefix: string;
}

export interface ModelInformation extends ModelOptions, Required<Pick<SchemaOptions, "dataStructure">> {
    modelName: string;
}

export interface SearchInformation extends ModelInformation {
    searchIndex: string;
}