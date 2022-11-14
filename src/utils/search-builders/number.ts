import { Search } from "../../search";
import { SchemaDefinition } from "../../typings";
import { SearchField } from "./base";

export class NumberField<T extends SchemaDefinition> extends SearchField<T> {

    declare protected value: [number, number];

    eq(value: number): Search<T> {
        this.value = [value, value];
        this.search.query.push(this)
        return this.search;
    }

    equals(value: number): Search<T> {
        return this.eq(value);
    }

    equalsTo(value: number): Search<T> {
        return this.eq(value);
    }

    protected construct(): string {
        return `[${this.value[0]} ${this.value[1]}]${this.or.length > 0 ? "" : ""}`
    }
}