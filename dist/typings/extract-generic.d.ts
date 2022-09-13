import { Schema } from "../schema";
export declare type ExtractSchemaDefinition<T> = T extends Schema<infer S, any> ? S : never;
export declare type ExtractSchemaMethods<T> = T extends Schema<any, infer M> ? M : never;
//# sourceMappingURL=extract-generic.d.ts.map