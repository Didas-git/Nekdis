import type { TopLevelSchemaDefinition } from "./schema-definition";
import type { Schema } from "../schema";
import type { Model } from "../model";

export type MethodsDefinition<T extends TopLevelSchemaDefinition = TopLevelSchemaDefinition> =
    Record<string, (this: Model<Schema<T>>, ...args: Array<any>) => unknown>;