import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";
export declare class StringField<T extends SchemaDefinition> extends SearchField<T> {
    eq(value: string): Search<T>;
    equals(value: string): Search<T>;
    equalsTo(value: string): Search<T>;
    protected construct(): string;
}
//# sourceMappingURL=string.d.ts.map