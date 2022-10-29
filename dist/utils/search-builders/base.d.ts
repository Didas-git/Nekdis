import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
export declare abstract class SearchField<T extends SchemaDefinition> {
    protected search: Search<T>;
    protected field: string;
    protected negated: boolean;
    protected value: unknown;
    protected or: unknown;
    protected and: unknown;
    constructor(search: Search<T>, field: string);
    /** Syntatic sugar, calls `eq` */
    abstract equalsTo(value: unknown): Search<T>;
    /** Syntatic sugar, calls `eq` */
    abstract equals(value: unknown): Search<T>;
    abstract eq(value: unknown): Search<T>;
    /** Syntatic sugar, return self */
    get does(): this;
    /** Syntatic sugar, return self */
    get is(): this;
    get not(): this;
    protected negate(): void;
    protected abstract construct(): string;
    toString(): string;
}
//# sourceMappingURL=base.d.ts.map