import { SchemaDefinition, SchemaOptions, MethodsDefinition, ParsedSchemaDefinition } from "./typings";
import { methods, schemaData } from "./utils/symbols";
export declare class Schema<S extends SchemaDefinition, M extends MethodsDefinition> {
    #private;
    data: S;
    readonly options: SchemaOptions;
    [methods]: M;
    [schemaData]: ParsedSchemaDefinition;
    constructor(data: S, methodsData?: M, options?: SchemaOptions);
    add<SD extends SchemaDefinition>(data: SD): this;
    methods<MD extends MethodsDefinition>(data: MD): this;
}
//# sourceMappingURL=schema.d.ts.map