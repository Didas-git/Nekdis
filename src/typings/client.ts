import type { createClient } from "redis";

import type { MethodsDefinition } from "./methods-definition";
import type { TopLevelSchemaDefinition } from "./schema-definition";
import type { SchemaOptions } from "./schema-options";
import type { URLObject } from "./url-object";

export type NodeRedisClient = ReturnType<typeof createClient>;

export interface ClientOptions<T extends TopLevelSchemaDefinition, M extends MethodsDefinition<T>> {
    url?: string | URLObject;
    globalPrefix?: string;
    enableInjections?: boolean;
    base?: {
        schema?: {
            definition?: T,
            methods?: M,
            options?: SchemaOptions
        }
    };
}