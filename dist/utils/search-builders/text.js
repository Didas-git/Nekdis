"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextField = void 0;
const base_1 = require("./base");
class TextField extends base_1.SearchField {
    value = { val: "", exact: false };
    eq(value) {
        this.value.val = value;
        this.search.query.push(this);
        return this.search;
    }
    equalsTo(value) {
        return this.eq(value);
    }
    equals(value) {
        return this.eq(value);
    }
    get exactly() {
        this.value.exact = true;
        return this;
    }
    exact(value) {
        this.value = { val: value, exact: true };
        this.search.query.push(this);
        return this.search;
    }
    construct() {
        return `(${this.value.exact ? `"${this.value.val}"` : this.value.val}${this.or.length > 0 ? ` | ${this.value.exact ? this.or.map((v) => `"${v}"`).join(" | ") : this.or.join(" | ")}` : ""})`;
    }
}
exports.TextField = TextField;
