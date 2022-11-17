"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NumberField = void 0;
const base_1 = require("./base");
class NumberField extends base_1.SearchField {
    eq(value) {
        this.value = [value, value];
        this.search.query.push(this);
        return this.search;
    }
    equals(value) {
        return this.eq(value);
    }
    equalsTo(value) {
        return this.eq(value);
    }
    construct() {
        return `[${this.value[0]} ${this.value[1]}]${this.or.length > 0 ? "" : ""}`;
    }
}
exports.NumberField = NumberField;
