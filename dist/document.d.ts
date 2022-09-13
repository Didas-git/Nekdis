import { SchemaDefinition } from "./typings";
export declare class Document<S extends SchemaDefinition> {
    #private;
    _id: string;
    [key: string]: any;
    constructor(schema: S, _id: string, data?: {});
    toString(): string;
}
//# sourceMappingURL=document.d.ts.map