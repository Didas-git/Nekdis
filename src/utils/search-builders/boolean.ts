import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";

export class BooleanField<T extends SchemaDefinition> extends SearchField<T> {

    eq(value: boolean): Search<T> {
        this.value = value;
        this.search.query.push(this);
        return this.search;
    }

    equalsTo(value: boolean): Search<T> {
        return this.eq(value);
    }

    equals(value: boolean): Search<T> {
        return this.eq(value);
    }

    protected construct(): string {
        return `{${this.value}${this.or.length > 0 ? ` | ${this.or.join(" | ")}` : ""}}`
    }
}