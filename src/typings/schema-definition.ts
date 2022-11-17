import { FieldMap } from "./field-map";
import { Point } from "./point";

export type ParsedSchemaDefinition = SchemaDefinition extends Record<string, infer T> ? Record<string, Exclude<T, keyof FieldMap>> : never;
export type SchemaDefinition = Record<string, keyof Omit<FieldMap, "object" | "tuple"> | FieldTypes>;
export type TupleDefinition = keyof Omit<FieldMap, "object" | "tuple" | "array"> | FieldTypes | SchemaDefinition;

export type FieldTypes = StringField | NumberField | BooleanField | TextField | DateField | PointField | ArrayField | TupleField | ObjectField;

export interface BaseField {
    type: keyof FieldMap;
    required?: boolean | undefined;
    default?: FieldMap<unknown>[keyof FieldMap] | undefined;
}

export interface StringField extends BaseField {
    type: "string";
    default?: string | undefined;
}

export interface NumberField extends BaseField {
    type: "number";
    default?: number | undefined;
}

export interface BooleanField extends BaseField {
    type: "boolean";
    default?: boolean | undefined;
}

export interface TextField extends BaseField {
    type: "text";
    default?: string | undefined;
}

export interface DateField extends BaseField {
    type: "date";
    default?: Date | number | undefined;
}

export interface PointField extends BaseField {
    type: "point";
    default?: Point | undefined;
}

export interface ArrayField extends BaseField {
    type: "array";
    elements?: keyof FieldMap | SchemaDefinition | undefined;
    default?: Array<unknown> | undefined;
}

export interface TupleField extends BaseField {
    type: "tuple";
    elements: [TupleDefinition, ...Array<TupleDefinition>];
    mutable?: boolean | undefined;
    default?: [unknown, ...Array<unknown>] | undefined;
}

export interface ObjectField extends BaseField {
    type: "object";
    properties?: SchemaDefinition | undefined;
    default?: Record<string, unknown> | undefined;
}