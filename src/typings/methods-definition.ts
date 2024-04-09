import type { SchemaDefinition } from "./schema-and-fields-definition.js";
import type { Schema } from "../schema.js";
import type { Model } from "../model.js";

export type MethodsDefinition<T extends SchemaDefinition = SchemaDefinition> =
    Record<string, (this: Model<Schema<T>>, ...args: Array<any>) => unknown>;
