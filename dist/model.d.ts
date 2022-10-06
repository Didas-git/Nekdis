import { Schema } from "./schema";
import { Document } from "./document";
import { ExtractSchemaDefinition, SchemaDefinition, MapSchema, MethodsDefinition, RedisClient } from "./typings";
import { Search } from "./search";
export declare class Model<S extends Schema<SchemaDefinition, MethodsDefinition>> {
    #private;
    readonly name: string;
    constructor(client: RedisClient, name: string, data: S);
    get(id: string | number): Promise<Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>> | null>;
    create(id?: string | number): Document<ExtractSchemaDefinition<S>> & MapSchema<ExtractSchemaDefinition<S>>;
    save(doc: Document<SchemaDefinition>): Promise<void>;
    delete(...docs: Array<string | number | Document<SchemaDefinition>>): Promise<void>;
    exists(...docs: Array<string | number | Document<SchemaDefinition>>): Promise<number>;
    expire(docs: Array<string | number | Document<SchemaDefinition>>, seconds: number, mode?: 'NX' | 'XX' | 'GT' | 'LT'): Promise<void>;
    createAndSave(data: {
        _id?: string | number;
    } & MapSchema<ExtractSchemaDefinition<S>, true>): Promise<void>;
    search(): Search<ExtractSchemaDefinition<S>>;
    createIndex(): Promise<void>;
    deleteIndex(DD?: boolean): Promise<void>;
    rawSearch(...args: Array<string>): Promise<{
        total: number;
        documents: {
            id: string;
            value: {
                [x: string]: string | number | any | any[] | null;
            };
        }[];
    }>;
}
//# sourceMappingURL=model.d.ts.map