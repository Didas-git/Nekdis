import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";
export declare class TextField<T extends SchemaDefinition> extends SearchField<T> {
    protected value: {
        val: string;
        exact: boolean;
    };
    eq(value: string): Search<T>;
    equalsTo(value: string): Search<T>;
    equals(value: string): Search<T>;
    get exactly(): Exclude<typeof this, "exact">;
    exact(value: string): Search<T>;
    protected construct(): string;
}
//# sourceMappingURL=text.d.ts.map