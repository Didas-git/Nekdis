import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";
export declare class NumberField<T extends SchemaDefinition> extends SearchField<T> {
    protected value: [number, number];
    eq(value: number): Search<T>;
    equals(value: number): Search<T>;
    equalsTo(value: number): Search<T>;
    protected construct(): string;
}
//# sourceMappingURL=number.d.ts.map