import type { SchemaOptions } from "./schema-options";

export interface ModelOptions extends Pick<SchemaOptions, "skipDocumentValidation"> {
    injectScripts: boolean;
    globalPrefix: string;
    prefix: string;
}

export interface ModelInformation extends ModelOptions, Required<Pick<SchemaOptions, "suffix" | "dataStructure">> {
    modelName: string;
}

export interface SearchInformation extends ModelInformation {
    searchIndex: string;
}