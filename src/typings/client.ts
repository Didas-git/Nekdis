import type { createClient } from "redis";

import type { MethodsDefinition } from "./methods-definition";
import type { SchemaDefinition } from "./schema-definition";
import type { SchemaOptions } from "./schema-options";
import type { URLObject } from "./url-object";

export type NodeRedisClient = ReturnType<typeof createClient>;

export interface ClientOptions<T extends SchemaDefinition, M extends MethodsDefinition<T>> {
    url?: string | URLObject;
    inject?: {
        schema?: {
            definition?: T,
            methods?: M,
            options?: SchemaOptions
        }
    };
}