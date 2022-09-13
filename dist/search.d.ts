import { Parsed, RedisClient, SchemaDefinition } from "./typings";
import { Document } from "./document";
export declare class Search<S extends SchemaDefinition> {
    #private;
    constructor(client: RedisClient, schema: S, parsedSchema: Map<Parsed["pars"], Parsed>, idx: string);
    returnAll(): Promise<Document<S>[]>;
    returnFirst(): Promise<Document<S>>;
    where(field: string): this;
    equals(value: string | number): this;
}
//# sourceMappingURL=search.d.ts.map