import { SearchField } from "./base";

import type { ParseSchema } from "../../typings";
import type { Search } from "../search";

export class BigIntField<T extends ParseSchema<any>, L extends bigint> extends SearchField<T, L> {

    public eq(value: Array<L> | L): Search<T> {
        if (typeof value === "bigint") {
            this.value = value;
        } else {
            this.value = value[0];
            if (value.length > 1) {
                for (let i = 1, length = value.length; i < length; i++) {
                    this.or.push(value[i]);
                }
            }
        }
        return this.search;
    }

    public equals(value: Array<L> | L): Search<T> {
        return this.eq(value);
    }

    public equalsTo(value: Array<L> | L): Search<T> {
        return this.eq(value);
    }

    protected construct(): string {
        return `{${this.value}${this.or.length > 0 ? ` | ${this.or.join(" | ")}` : ""}}`;
    }
}