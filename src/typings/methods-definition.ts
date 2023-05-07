import type { SchemaDefinition } from "./schema-definition";
import type { Schema } from "../schema";
import type { Model } from "../model";

export type MethodsDefinition = {
    [key: string]: (this: Model<Schema<SchemaDefinition, MethodsDefinition>>, ...args: Array<any>) => unknown
};