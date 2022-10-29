import { FieldMap } from "./field-map";
import { FieldTypes } from "./schema-definition";
export declare type ParseBasicFields<T extends Omit<FieldTypes, "ObjectField" | "ArrayField" | "TupleField">> = T["required"] extends true ? FieldMap[Exclude<T["type"], FieldTypes>] : T["default"] extends {} ? FieldMap[Exclude<T["type"], FieldTypes>] : FieldMap[Exclude<T["type"], FieldTypes>] | undefined;
//# sourceMappingURL=parse-basic-fields.d.ts.map