import type { Search } from "../../search";
import type { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";

export class StringField<T extends SchemaDefinition> extends SearchField<T> {

    public eq(value: string): Search<T> {
        this.value = value;
        this.search._query.push(this);
        return this.search;
    }

    public equals(value: string): Search<T> {
        return this.eq(value);
    }

    public equalsTo(value: string): Search<T> {
        return this.eq(value);
    }

    protected construct(): string {
        return `{${this.value}${this.or.length > 0 ? ` | ${this.or.join(" | ")}` : ""}}`;
    }
}