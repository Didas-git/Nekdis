"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateData = void 0;
function validateData(data, schema, isField = false) {
    const schemaKeySet = new Set(Object.keys(schema));
    const dataKeySet = new Set(Object.keys(data ?? {}));
    schemaKeySet.forEach((val) => {
        if (!isField && !dataKeySet.has(val))
            throw new Error();
        const value = schema[val];
        const dataVal = data[val];
        if (dataVal === null)
            return;
        if (typeof dataVal === "undefined" && !value.required)
            return;
        if (typeof dataVal === "undefined" && value.required && typeof value.default === "undefined")
            throw new Error();
        if (value.type === "object") {
            if (!value.data)
                return;
            validateData(dataVal, value.data, true);
        }
        else if (value.type === "array") {
            if (typeof value.elements === "object")
                validateData(dataVal, value.elements, true);
            else {
                dataVal.every((vall) => {
                    if (typeof vall !== value.elements)
                        throw new Error();
                });
            }
        }
        else if (value.type === "tuple") {
            value.elements.forEach((element, i) => {
                validateData({ ...[dataVal[i]] }, { ...[element] }, true);
            });
        }
        else if (value.type === "date") {
            if (!(dataVal instanceof Date))
                throw new Error();
        }
        else if (value.type === "point") {
            if (typeof dataVal !== "object")
                throw new Error();
            if (!dataVal.longitude || !dataVal.latitude)
                throw new Error();
            if (Object.keys(dataVal).length > 2)
                throw new Error();
        }
        else if (value.type === "text") {
            if (typeof dataVal !== "string")
                throw new Error();
        }
        else {
            // This handles `number`, `boolean` and `string` types
            if (typeof dataVal !== value.type)
                throw new Error();
        }
    });
}
exports.validateData = validateData;
