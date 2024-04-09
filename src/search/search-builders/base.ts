import type { ParseSchema } from "../../typings/index.js";
import type { Search } from "../search.js";

export abstract class SearchField<T extends ParseSchema<any>, L = unknown> {
    protected negated: boolean = false;
    protected search: Search<T>;
    protected field: string;
    public or: Array<L> = [];

    protected abstract value: unknown;

    public constructor(search: Search<T>, field: string) {
        this.search = search;
        this.field = field;
    }

    public abstract eq(value: Array<L> | L): Search<T>;

    /** Syntactic sugar, calls `eq` */
    public abstract equals(value: L): Search<T>;

    /** Syntactic sugar, calls `eq` */
    public abstract equalsTo(value: L): Search<T>;

    /** Syntactic sugar, return self */
    public get does(): this {
        return this;
    }

    /** Syntactic sugar, return self */
    public get is(): this {
        return this;
    }

    /** Negate query, return self */
    public get not(): this {
        this.negate();
        return this;
    }

    protected negate(): void {
        this.negated = !this.negated;
    }

    protected abstract construct(): string;

    public toString(): string {
        return `(${this.negated ? "-" : ""}(@${this.field}:${this.construct()}))`;
    }
}
