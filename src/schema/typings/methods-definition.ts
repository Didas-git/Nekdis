import { Model } from "../../model";
import { Schema } from "../schema";
import { SchemaDefinition } from "./schema-definition";

export type MethodsDefinition = Record<string, (this: Model<Schema<SchemaDefinition, MethodsDefinition>>, ...args: any[]) => any>