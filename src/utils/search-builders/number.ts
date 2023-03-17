import { Search } from "../../search";
import { SearchField } from "./base";
import type { SchemaDefinition } from "../../typings";

export class NumberField<T extends SchemaDefinition> extends SearchField<T> {

    declare protected value: [string, string];

    eq(value: number): Search<T> {
        this.value = [value.toString(), value.toString()];
        this.search._query.push(this)
        return this.search;
    }

    gt(value: number): Search<T> {
        this.value = [`(${value}`, "+inf"]
        return this.search
    }

    gte(value: number): Search<T> {
        this.value = [value.toString(), "+inf"]
        return this.search
    }

    lt(value: number): Search<T> {
        this.value = ["-inf", `(${value}`]
        return this.search
    }

    lte(value: number): Search<T> {
        this.value = ["-inf", value.toString()]
        return this.search
    }

    between(lower: number, upper: number): Search<T> {
        this.value = [lower.toString(), upper.toString()];
        return this.search
    }

    equals(value: number): Search<T> {
        return this.eq(value);
    }

    equalsTo(value: number): Search<T> {
        return this.eq(value);
    }

    greaterThan(value: number): Search<T> {
        return this.gt(value)
    }

    greaterThanOrEqualTo(value: number): Search<T> {
        return this.gte(value)
    }

    lessThan(value: number): Search<T> {
        return this.lt(value)
    }

    lessThanOrEqualTo(value: number): Search<T> {
        return this.lte(value)
    }

    protected construct(): string {
        return `[${this.value.join(" ")}]${this.or.length > 0 ? "" : ""}`
    }
}