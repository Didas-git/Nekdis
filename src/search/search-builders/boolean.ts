import { SearchField } from "./base.js";

import type { ParseSchema } from "../../typings/index.js";
import type { Search } from "../search.js";

export class BooleanField<T extends ParseSchema<any>> extends SearchField<T> {
    protected override value!: boolean;

    public eq(value: boolean): Search<T> {
        this.value = value;
        this.search._query.push(this);
        return this.search;
    }

    public equals(value: boolean): Search<T> {
        return this.eq(value);
    }

    public equalsTo(value: boolean): Search<T> {
        return this.eq(value);
    }

    public true(): Search<T> {
        return this.eq(true);
    }

    public false(): Search<T> {
        return this.eq(false);
    }

    protected construct(): string {
        return `{${this.value}${this.or.length > 0 ? ` | ${this.or.join(" | ")}` : ""}}`;
    }
}
