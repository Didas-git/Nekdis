import { SchemaDefinition } from "./typings";
export declare class Document<S extends SchemaDefinition> {
    #private;
    _id: string | number;
    [key: string]: any;
    constructor(schema: S, _id: string | number, data?: {});
    toString(): string;
}
//# sourceMappingURL=document.d.ts.map