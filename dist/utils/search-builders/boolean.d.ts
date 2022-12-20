import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";
export declare class BooleanField<T extends SchemaDefinition> extends SearchField<T> {
    eq(value: boolean): Search<T>;
    equalsTo(value: boolean): Search<T>;
    equals(value: boolean): Search<T>;
    protected construct(): string;
}
//# sourceMappingURL=boolean.d.ts.map