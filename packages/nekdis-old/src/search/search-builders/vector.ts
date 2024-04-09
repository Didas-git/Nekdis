import { SearchField } from "./base.js";

import type { ParseSchema, FloatArray } from "../../typings/index.js";
import type { Search } from "../search.js";

export type VectorFunction = (vector: Vector) => Vector;

export class Vector {
    /** @internal */
    public _type!: "RANGE" | "KNN";

    /** @internal */
    public _buffer!: Buffer;

    /** @internal */
    public _range?: number;

    /** @internal */
    public _return?: number;

    public knn(): this {
        this._type = "KNN";
        return this;
    }

    public range(range: number): this {
        this._type = "RANGE";
        this._range = range;
        return this;
    }

    public from(data: Array<number> | FloatArray): this {
        this._buffer = Buffer.from(Array.isArray(data) ? new Float32Array(data).buffer : data.buffer);
        return this;
    }

    public return(number: number): this {
        this._return = number;
        return this;
    }
}

export class VectorField<T extends ParseSchema<any>> extends SearchField<T> {
    /** @internal */
    public override value: Vector = new Vector();

    public override eq(fn: VectorFunction | Vector): Search<T> {
        this.value = typeof fn === "function" ? fn(this.value) : fn;
        this.search._query.push(this);
        return this.search;
    }

    public override equals(fn: VectorFunction | Vector): Search<T> {
        return this.eq(fn);
    }

    public override equalsTo(fn: VectorFunction | Vector): Search<T> {
        return this.eq(fn);
    }

    protected override construct(paramName: string = "BLOB"): string {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { _range } = this.value;
        return `[VECTOR_RANGE ${_range} $${paramName}]`;
    }

    public override toString(paramName: string = "BLOB"): string {
        if (this.value._type === "RANGE")
            return `(${this.negated ? "-" : ""}(@${this.field}:${this.construct(paramName)}))`;

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { _type, _return } = this.value;
        return `=>[${_type} ${_return} @${this.field} $${paramName}]`;
    }
}
