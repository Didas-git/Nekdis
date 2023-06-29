import { SearchField } from "./base";

import type { ParseSchema } from "../../typings";
import type { Search } from "../search";

export type VectorFunction = (vector: Vector) => Vector;

export class Vector {

    /** @internal */
    public _type!: "RANGE" | "KNN";

    /** @internal */
    public _buffer!: string;

    /** @internal */
    public _range?: number;

    /** @internal */
    public _return?: number;

    public knn(): Vector {
        this._type = "KNN";
        return this;
    }

    public range(range: number): Vector {
        this._type = "RANGE";
        this._range = range;
        return this;
    }

    public from(data: Array<number> | Float32Array | Float64Array): Vector {
        this._buffer = Buffer.from(<never>data).toString();
        return this;
    }

    public return(number: number): Vector {
        this._return = number;
        return this;
    }
}

export class VectorField<T extends ParseSchema<any>> extends SearchField<T> {
    #vector: Vector = new Vector();

    public override eq(fn: VectorFunction | Vector): Search<T> {
        this.#vector = typeof fn === "function" ? fn(this.#vector) : fn;
        if (this.#vector._type === "RANGE") this.search._query.push(this);
        else this.search._vector = this;
        return this.search;
    }

    public override equals(fn: VectorFunction | Vector): Search<T> {
        return this.eq(fn);
    }

    public override equalsTo(fn: VectorFunction | Vector): Search<T> {
        return this.eq(fn);
    }

    protected override construct(): string {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { _range, _buffer } = this.#vector;
        return `[VECTOR_RANGE ${_range} ${_buffer}]`;
    }

    public override toString(): string {
        if (this.#vector._type === "RANGE") {
            return `(${this.negated ? "-" : ""}(@${this.field}:${this.construct()}))`;
        } else {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { _type, _return, _buffer } = this.#vector;
            return `=>[${_type} ${_return} @${this.field} ${_buffer}]`;
        }
    }

}