"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParsingError = void 0;
const node_util_1 = require("node:util");
exports.ParsingError = {
    Object: (key) => {
        return (0, node_util_1.inspect)({
            [key]: {
                type: "object"
            }
        }, { colors: true, compact: false });
    },
    Tuple: (key) => {
        return (0, node_util_1.inspect)({
            [key]: {
                type: "tuple",
                elements: ["string"]
            }
        }, { colors: true, compact: false });
    },
    Info: {
        Object: (0, node_util_1.inspect)({
            artist: {
                type: "object",
                data: {
                    name: "string",
                    age: "number",
                    hobbies: "array"
                }
            }
        }, { colors: true }),
        Tuple: (0, node_util_1.inspect)({
            information: {
                type: "tuple",
                elements: ["string", "number", { createdAt: "date", joinedAt: "date" }, "array"]
            }
        }, { colors: true, depth: null })
    }
};
