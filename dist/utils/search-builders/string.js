"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringField = void 0;
const base_1 = require("./base");
class StringField extends base_1.SearchField {
    eq(value) {
        this.value = value;
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
        return `{${this.value}}`;
    }
}
exports.StringField = StringField;
