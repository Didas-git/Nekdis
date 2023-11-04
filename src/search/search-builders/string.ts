import { SearchField } from "./base";

import type { ParseSchema } from "../../typings";
import type { Search } from "../search";

export class StringField<T extends ParseSchema<any>, L extends string> extends SearchField<T, L> {

    public eq(value: Array<L> | L): Search<T> {
        if (typeof value === "string") {
            this.value = value;
        } else {
            this.value = value[0];
            if (value.length > 1) {
                for (let i = 1, length = value.length; i < length; i++) {
                    this.or.push(value[i]);
                }
            }
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