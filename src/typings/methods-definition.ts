import { Model } from "../model";
import { Schema } from "../schema";
import { SchemaDefinition } from "./schema-definition";

export type MethodsDefinition = {
    [key: string]: (this: Model<Schema<SchemaDefinition, MethodsDefinition>>, ...args: Array<any>) => unknown
};