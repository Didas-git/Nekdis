import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";

export class TextField<T extends SchemaDefinition> extends SearchField<T> {

    protected override value: {
        val: string,
        exact: boolean
    } = { val: "", exact: false };

    eq(value: string): Search<T> {
        this.value.val = value
        this.search._query.push(this);
        return this.search;
    }

    equals(value: string): Search<T> {
        return this.eq(value)
    }

    equalsTo(value: string): Search<T> {
        return this.eq(value);
    }

    exact(value: string): Search<T> {
        this.value = { val: value, exact: true };
        this.search._query.push(this);
        return this.search;
    }

    match(value: string): Search<T> {
        return this.eq(value);
    }

    matchExact(value: string): Search<T> {
        return this.exact(value);
    }

    matches(value: string): Search<T> {
        return this.eq(value)
    }

    matchExactly(value: string): Search<T> {
        return this.exact(value)
    }

    matchesExactly(value: string): Search<T> {
        return this.exact(value)
    }

    get exactly(): Exclude<typeof this, "exact"> {
        this.value.exact = true;
        return <never>this;
    }

    protected construct(): string {
        return `(${this.value.exact ? `"${this.value.val}"` : this.value.val}${this.or.length > 0 ? ` | ${this.value.exact ? this.or.map((v) => `"${v}"`).join(" | ") : this.or.join(" | ")}` : ""})`
    }
}