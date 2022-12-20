"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooleanField = void 0;
const base_1 = require("./base");
class BooleanField extends base_1.SearchField {
    eq(value) {
        this.value = value;
        this.search.query.push(this);
        return this.search;
    }
    equalsTo(value) {
        return this.eq(value);
    }
    equals(value) {
        return this.eq(value);
    }
    construct() {
        return `{${this.value}${this.or.length > 0 ? ` | ${this.or.join(" | ")}` : ""}}`;
    }
}
exports.BooleanField = BooleanField;
