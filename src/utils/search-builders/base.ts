import { Search } from "../../search";
import type { SchemaDefinition } from "../../typings";

export abstract class SearchField<T extends SchemaDefinition> {

    protected negated: boolean = false;
    protected value: unknown;
    or: Array<unknown> = [];

    constructor(protected search: Search<T>, protected field: string) { }

    /** Syntactic sugar, calls `eq` */
    abstract equalsTo(value: unknown): Search<T>;
    /** Syntactic sugar, calls `eq` */
    abstract equals(value: unknown): Search<T>;
    abstract eq(value: unknown): Search<T>;

    /** Syntactic sugar, return self */
    public get does() {
        return this;
    }
    /** Syntactic sugar, return self */
    public get is() {
        return this;
    }
    /** Negate query, return self */
    public get not() {
        this.negate();
        return this;
    }

    protected negate(): void {
        this.negated = !this.negated
    }

    protected abstract construct(): string;

    public toString() {
        return `(${this.negated ? "-" : ""}(@${this.field}:${this.construct()}))`
    }
}