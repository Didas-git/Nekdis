import { SearchField } from "./base";

import type { ParseSchema } from "../../typings";
import type { Search } from "../search";

export class DateField<T extends ParseSchema<any>, L extends Date | number | string> extends SearchField<T, L> {

    declare protected value: [string, string];

    public eq(value: L): Search<T> {
        const time = this.#getTime(value);
        this.value = [time, time];
        this.search._query.push(this);
        return this.search;
    }

    public gt(value: L): Search<T> {
        this.value = [`(${this.#getTime(value)}`, "+inf"];
        this.search._query.push(this);
        return this.search;
    }

    public gte(value: L): Search<T> {
        this.value = [this.#getTime(value), "+inf"];
        this.search._query.push(this);
        return this.search;
    }

    public lt(value: L): Search<T> {
        this.value = ["-inf", `(${this.#getTime(value)}`];
        this.search._query.push(this);
        return this.search;
    }

    public lte(value: L): Search<T> {
        this.value = ["-inf", this.#getTime(value)];
        this.search._query.push(this);
        return this.search;
    }

    public between(lower: L, upper: L): Search<T> {
        this.value = [this.#getTime(lower), this.#getTime(upper)];
        this.search._query.push(this);
        return this.search;
    }

    public equals(value: L): Search<T> {
        return this.eq(value);
    }

    public equalsTo(value: L): Search<T> {
        return this.eq(value);
    }

    public greaterThan(value: L): Search<T> {
        return this.gt(value);
    }

    public greaterThanOrEqualTo(value: L): Search<T> {
        return this.gte(value);
    }

    public lessThan(value: L): Search<T> {
        return this.lt(value);
    }

    public lessThanOrEqualTo(value: L): Search<T> {
        return this.lte(value);
    }

    public on(value: L): Search<T> {
        return this.eq(value);
    }

    public after(value: L): Search<T> {
        return this.gt(value);
    }

    public before(value: L): Search<T> {
        return this.lt(value);
    }

    public onOrAfter(value: L): Search<T> {
        return this.gte(value);
    }

    public onOrBefore(value: L): Search<T> {
        return this.lte(value);
    }

    protected construct(): string {
        return `[${this.value.join(" ")}]`;
    }

    #getTime(value: L): string {
        if (value instanceof Date) return value.getTime().toString();
        if (typeof value === "string") return new Date(value).getTime().toString();
        return value.toString();
    }
}