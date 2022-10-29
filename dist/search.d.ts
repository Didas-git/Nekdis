import { Parsed, RedisClient, SchemaDefinition } from "./typings";
import { Document } from "./document";
import { StringField } from "./utils/search-builders/string";
import { SearchField } from "./utils/search-builders/base";
export declare class Search<T extends SchemaDefinition> {
    #private;
    query: Array<SearchField<T>>;
    constructor(client: RedisClient, schema: T, parsedSchema: Map<Parsed["pars"], Parsed>, searchIndex: string);
    where(field: string): StringField<T>;
    or(_value: unknown): void;
    and(): void;
    returnAll(): Promise<Document<T>[]>;
}
//# sourceMappingURL=search.d.ts.map