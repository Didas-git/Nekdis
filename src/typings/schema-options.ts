export interface SchemaOptions {
    dataStructure?: "HASH" | "JSON";
    skipDocumentValidation?: boolean;
    noLogs?: boolean;
    prefix?: string;
    suffix?: string | (() => string);
}