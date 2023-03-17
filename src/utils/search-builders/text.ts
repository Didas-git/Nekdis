import type { Search } from "../../search";
import type { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";

export class TextField<T extends SchemaDefinition> extends SearchField<T> {

    protected override value: {
        val: string,
        exact: boolean
    } = { val: "", exact: false };

    public eq(value: string): Search<T> {
        this.value.val = value;
        this.search._query.push(this);
        return this.search;
    }

    public equals(value: string): Search<T> {
        return this.eq(value);
    }

    public equalsTo(value: string): Search<T> {
        return this.eq(value);
    }

    public exact(value: string): Search<T> {
        this.value = { val: value, exact: true };
        this.search._query.push(this);
        return this.search;
    }

    public match(value: string): Search<T> {
        return this.eq(value);
    }

    public matchExact(value: string): Search<T> {
        return this.exact(value);
    }

    public matches(value: string): Search<T> {
        return this.eq(value);
    }

    public matchExactly(value: string): Search<T> {
        return this.exact(value);
    }

    public matchesExactly(value: string): Search<T> {
        return this.exact(value);
    }

    public get exactly(): Exclude<typeof this, "exact"> {
        this.value.exact = true;
        return <never>this;
    }

    protected construct(): string {
        return `(${this.value.exact ? `"${this.value.val}"` : this.value.val}${this.or.length > 0 ? ` | ${this.value.exact ? this.or.map((v) => `"${v}"`).join(" | ") : this.or.join(" | ")}` : ""})`;
    }
}