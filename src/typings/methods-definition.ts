import type { Model } from "../model";
import type { Schema } from "../schema";
import type { SchemaDefinition } from "./schema-definition";

export type MethodsDefinition = {
    [key: string]: (this: Model<Schema<SchemaDefinition, MethodsDefinition>>, ...args: Array<any>) => unknown
};