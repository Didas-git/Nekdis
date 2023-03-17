import type { createClient } from "redis";

export type RedisClient = ReturnType<typeof createClient>;