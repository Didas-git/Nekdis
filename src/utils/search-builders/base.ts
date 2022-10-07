import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";

export abstract class SearchField<T extends SchemaDefinition> {

    protected negated: boolean = false;

    constructor(protected search: Search<T>) { }

    /** Syntatic sugar, calls `eq` */
    abstract equalsTo(): Search<T>;
    /** Syntatic sugar, calls `eq` */
    abstract equals(): Search<T>;
    abstract eq(): Search<T>;
    /** Syntatic sugar, return self */
    get does() {
        return this;
    }
    /** Syntatic sugar, return self */
    get is() {
        return this;
    }

    get not() {
        this.negate();
        return this;
    }

    protected negate(): void {
        this.negated = !this.negated
    }
}