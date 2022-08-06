import { Schema } from "../../schema";

export type ExtractSchemaDefinition<T> = T extends Schema<infer S, any> ? S : never
export type ExtractSchemaMethods<T> = T extends Schema<any, infer M> ? M : never