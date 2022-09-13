import { Model } from "./model";
import { Schema } from "./schema";
import { ExtractSchemaMethods, MethodsDefinition, SchemaDefinition, SchemaOptions, Module, WithModules, URLObject, RedisClient, ExctractName } from "./typings";
export declare class Client {
    #private;
    isOpen: boolean;
    connect(url?: string | URLObject): Promise<Client>;
    disconnect(): Promise<Client>;
    forceDisconnect(): Promise<Client>;
    schema<T extends SchemaDefinition, M extends MethodsDefinition>(schemaData: T, methods?: M, options?: SchemaOptions): Schema<T, M>;
    withModules<T extends Array<Module>>(modules: ExctractName<T>): this & WithModules<T>;
    model<T extends Schema<SchemaDefinition, MethodsDefinition>>(name: string, schema?: T): Model<T> & ExtractSchemaMethods<T>;
    addModel(name: string, model: Model<any>, override?: boolean): void;
    get raw(): RedisClient;
}
export declare const client: Client;
//# sourceMappingURL=client.d.ts.map