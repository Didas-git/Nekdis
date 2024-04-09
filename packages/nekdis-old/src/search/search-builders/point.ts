import { SearchField } from "./base.js";

import type { ParseSchema, Point, Units } from "../../typings/index.js";
import type { Search } from "../search.js";

export type CircleFunction = (circle: Circle) => Circle;

export class Circle {
    /** @internal */
    public _longitude: number = 0;

    /** @internal */
    public _latitude: number = 0;

    /** @internal */
    public size: number = 1;

    /** @internal */
    public units: Units = "m";

    public longitude(value: number): this {
        this._longitude = value;
        return this;
    }

    public latitude(value: number): this {
        this._latitude = value;
        return this;
    }

    public origin(point: Point): Circle;
    public origin(longitude: number, latitude: number): Circle;
    public origin(pointOrLongitude: number | Point, latitude?: number): this {
        if (typeof pointOrLongitude === "object") {
            const { longitude, latitude: lat } = pointOrLongitude;
            this._longitude = longitude;
            this._latitude = lat;
            return this;
        }

        this._longitude = pointOrLongitude;
        latitude && (this._latitude = latitude);
        return this;
    }

    public radius(size: number): this {
        this.size = size;
        return this;
    }

    public get meters(): this {
        this.units = "m";
        return this;
    }

    public get meter(): this {
        return this.meters;
    }

    public get m(): this {
        return this.meters;
    }

    public get kilometers(): this {
        this.units = "km";
        return this;
    }

    public get kilometer(): this {
        return this.kilometers;
    }

    public get km(): this {
        return this.kilometers;
    }

    public get feet(): this {
        this.units = "ft";
        return this;
    }

    public get foot(): this {
        return this.feet;
    }

    public get ft(): this {
        return this.feet;
    }

    public get miles(): this {
        this.units = "mi";
        return this;
    }

    public get mile(): this {
        return this.miles;
    }

    public get mi(): this {
        return this.miles;
    }
}

export class PointField<T extends ParseSchema<any>> extends SearchField<T> {
    #circle: Circle = new Circle();

    public override eq(fn: CircleFunction | Circle): Search<T> {
        this.#circle = typeof fn === "function" ? fn(this.#circle) : fn;
        this.search._query.push(this);
        return this.search;
    }

    public override equals(fn: CircleFunction | Circle): Search<T> {
        return this.eq(fn);
    }

    public override equalsTo(fn: CircleFunction | Circle): Search<T> {
        return this.eq(fn);
    }

    public inRadius(fn: CircleFunction | Circle): Search<T> {
        return this.eq(fn);
    }

    public inCircle(fn: CircleFunction | Circle): Search<T> {
        return this.eq(fn);
    }

    protected construct(): string {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { _longitude, _latitude, size, units } = this.#circle;
        return `[${_longitude} ${_latitude} ${size} ${units}]`;
    }
}
