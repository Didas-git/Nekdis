import { Search } from "../../search";
import { SearchField } from "./base";
import type { SchemaDefinition } from "../../typings";

export class BooleanField<T extends SchemaDefinition> extends SearchField<T> {

    eq(value: boolean): Search<T> {
        this.value = value;
        this.search._query.push(this);
        return this.search;
    }

    equals(value: boolean): Search<T> {
        return this.eq(value);
    }

    equalsTo(value: boolean): Search<T> {
        return this.eq(value);
    }

    true(): Search<T> {
        return this.eq(true)
    }

    false(): Search<T> {
        return this.eq(false)
    }

    protected construct(): string {
        return `{${this.value}${this.or.length > 0 ? ` | ${this.or.join(" | ")}` : ""}}`
    }
}