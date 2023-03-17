import { Search } from "../../search";
import { SearchField } from "./base";
import type { SchemaDefinition } from "../../typings";

export class DateField<T extends SchemaDefinition> extends SearchField<T> {

    declare protected value: [string, string];

    eq(value: Date | number | string): Search<T> {
        const time = this.#getTime(value);
        this.value = [time, time];
        this.search._query.push(this)
        return this.search;
    }

    gt(value: Date | number | string): Search<T> {
        this.value = [`(${this.#getTime(value)}`, "+inf"]
        return this.search
    }

    gte(value: Date | number | string): Search<T> {
        this.value = [this.#getTime(value), "+inf"]
        return this.search
    }

    lt(value: Date | number | string): Search<T> {
        this.value = ["-inf", `(${this.#getTime(value)}`]
        return this.search
    }

    lte(value: Date | number | string): Search<T> {
        this.value = ["-inf", this.#getTime(value)]
        return this.search
    }

    between(lower: Date | number | string, upper: Date | number | string): Search<T> {
        this.value = [this.#getTime(lower), this.#getTime(upper)];
        return this.search
    }

    equals(value: Date | number | string): Search<T> {
        return this.eq(value);
    }

    equalsTo(value: Date | number | string): Search<T> {
        return this.eq(value);
    }

    greaterThan(value: Date | number | string): Search<T> {
        return this.gt(value)
    }

    greaterThanOrEqualTo(value: Date | number | string): Search<T> {
        return this.gte(value)
    }

    lessThan(value: Date | number | string): Search<T> {
        return this.lt(value)
    }

    lessThanOrEqualTo(value: Date | number | string): Search<T> {
        return this.lte(value)
    }

    on(value: Date | number | string): Search<T> {
        return this.eq(value)
    }

    after(value: Date | number | string): Search<T> {
        return this.gt(value)
    }

    before(value: Date | number | string): Search<T> {
        return this.lt(value)
    }

    onOrAfter(value: Date | number | string): Search<T> {
        return this.gte(value)
    }

    onOrBefore(value: Date | number | string): Search<T> {
        return this.lte(value)
    }

    protected construct(): string {
        return `[${this.value.join(" ")}]${this.or.length > 0 ? "" : ""}`
    }

    #getTime(value: Date | number | string) {
        if (value instanceof Date) return value.getTime().toString();
        if (typeof value === 'string') return new Date(value).getTime().toString();
        return value.toString();
    }
}