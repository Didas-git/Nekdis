import { Parsed, RedisClient, SchemaDefinition } from "./typings";
import { Document } from "./document";
import { SearchField } from "./utils/search-builders/base";
import { MapSearchField } from "./typings/map-search-fields";
export declare class Search<T extends SchemaDefinition> {
    #private;
    query: Array<SearchField<T>>;
    constructor(client: RedisClient, schema: T, parsedSchema: Map<Parsed["pars"], Parsed>, searchIndex: string);
    where<S extends keyof T>(field: S): MapSearchField<S, T, import("./typings").MapSchema<T, false>>;
    and<S extends keyof T>(field: S): MapSearchField<S, T, import("./typings").MapSchema<T, false>>;
    or(value: unknown): this;
    else(_value: unknown): void;
    returnAll(): Promise<Document<T>[]>;
    get rawQuery(): string;
}
//# sourceMappingURL=search.d.ts.map