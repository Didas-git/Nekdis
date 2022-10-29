"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchField = void 0;
class SearchField {
    search;
    field;
    negated = false;
    value;
    or;
    and;
    constructor(search, field) {
        this.search = search;
        this.field = field;
    }
    /** Syntatic sugar, return self */
    get does() {
        return this;
    }
    /** Syntatic sugar, return self */
    get is() {
        return this;
    }
    get not() {
        this.negate();
        return this;
    }
    negate() {
        this.negated = !this.negated;
    }
    toString() {
        return `${this.negated ? "-" : ""}(@${this.field}:)`;
    }
}
exports.SearchField = SearchField;
