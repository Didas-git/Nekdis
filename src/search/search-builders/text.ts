import { SearchField } from "./base";

import type { ParseSchema } from "../../typings";
import type { Search } from "../search";

export class TextField<T extends ParseSchema<any>> extends SearchField<T> {

    protected override value: {
        val: string,
        exact: boolean
    } = { val: "", exact: false };

    public eq(value: Array<string> | string): Search<T> {
        return this.#handleMultipleFields(value);
    }

    public equals(value: Array<string> | string): Search<T> {
        return this.eq(value);
    }

    public equalsTo(value: Array<string> | string): Search<T> {
        return this.eq(value);
    }

    public exact(value: Array<string> | string): Search<T> {
        return this.#handleMultipleFields(value, true);
    }

    public match(value: Array<string> | string): Search<T> {
        return this.eq(value);
    }

    public matches(value: Array<string> | string): Search<T> {
        return this.eq(value);
    }

    public matchExact(value: Array<string> | string): Search<T> {
        return this.exact(value);
    }

    public matchExactly(value: Array<string> | string): Search<T> {
        return this.exact(value);
    }

    public matchesExactly(value: Array<string> | string): Search<T> {
        return this.exact(value);
    }

    public get exactly(): Exclude<typeof this, "exact" | "matchExact" | "matchExactly" | "matchesExactly"> {
        this.value.exact = true;
        return <never>this;
    }

    protected construct(): string {
        return `(${this.value.exact ? `"${this.value.val}"` : this.value.val}${this.or.length > 0 ? ` | ${this.value.exact ? this.or.map((v) => `"${v}"`).join(" | ") : this.or.join(" | ")}` : ""})`;
    }

    /** @internal */
    #handleMultipleFields(value: Array<string> | string, exact: boolean = false): Search<T> {
        if (typeof value === "string") {
            this.value = { val: value, exact };
        } else {
            this.value = { val: value[0], exact };
            if (value.length > 1) {
                for (let i = 1, length = value.length; i < length; i++) {
                    this.or.push(value[i]);
                }
            }
        }

        return this.search;
    }
}