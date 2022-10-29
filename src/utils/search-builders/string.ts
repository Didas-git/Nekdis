import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";

export class StringField<T extends SchemaDefinition> extends SearchField<T> {

    declare protected value: string;

    eq(value: string): Search<T> {
        this.value = value;
        this.search.query.push(this)
        return this.search;
    }

    equals(value: string): Search<T> {
        return this.eq(value);
    }

    equalsTo(value: string): Search<T> {
        return this.eq(value);
    }

    protected construct(): string {
        return `{${this.value}${this.or.length > 0 ? ` | ${this.or.join(" | ")}` : ""}}`
    }
}