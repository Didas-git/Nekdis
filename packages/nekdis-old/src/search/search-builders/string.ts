import { SearchField } from "./base.js";

import type { ParseSchema } from "../../typings/index.js";
import type { Search } from "../search.js";

export class StringField<T extends ParseSchema<any>, L extends string> extends SearchField<T, L> {
    protected override value!: L;

    public eq(value: Array<L> | L): Search<T> {
        if (typeof value === "string")
            this.value = value;
        else {
            // eslint-disable-next-line @typescript-eslint/prefer-destructuring
            this.value = value[0];
            if (value.length > 1)
                for (let i = 1, { length } = value; i < length; i++) this.or.push(value[i]);
        }

        this.search._query.push(this);
        return this.search;
    }

    public equals(value: Array<L> | L): Search<T> {
        return this.eq(value);
    }

    public equalsTo(value: Array<L> | L): Search<T> {
        return this.eq(value);
    }

    public includes(value: Array<L> | L): Search<T> {
        return this.eq(value);
    }

    protected construct(): string {
        return `{${this.value}${this.or.length > 0 ? ` | ${this.or.join(" | ")}` : ""}}`;
    }
}
