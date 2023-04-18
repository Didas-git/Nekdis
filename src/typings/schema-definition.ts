import type { FieldMap } from "./field-map";
import type { Point } from "./point";

export type SchemaDefinition = Record<string, keyof Omit<FieldMap, "object"> | FieldTypes>;

export type FieldTypes = StringField | NumberField | BooleanField | TextField | DateField | PointField | ArrayField | ObjectField;

export interface BaseField {
    type: keyof FieldMap;
    required?: boolean | undefined;
    default?: FieldMap<unknown>[keyof FieldMap] | undefined;
    sortable?: boolean;
}

// TAG
export interface StringField extends BaseField {
    type: "string";
    default?: string | undefined;
}

// NUMERIC
export interface NumberField extends BaseField {
    type: "number";
    default?: number | undefined;
}

// TAG
export interface BooleanField extends BaseField {
    type: "boolean";
    default?: boolean | undefined;
}

// TEXT
export interface TextField extends BaseField {
    type: "text";
    default?: string | undefined;
}

// NUMERIC
export interface DateField extends BaseField {
    type: "date";
    default?: Date | number | string | undefined;
}

// GEO
export interface PointField extends BaseField {
    type: "point";
    default?: Point | undefined;
}

// FALLBACK
export interface ArrayField extends BaseField {
    type: "array";
    elements?: Exclude<keyof FieldMap, "array"> | undefined /*SchemaDefinition*/;
    default?: Array<unknown> | undefined;
}

// FALLBACK
export interface ObjectField extends Omit<BaseField, "sortable"> {
    type: "object";
    properties?: SchemaDefinition | undefined;
    default?: Record<string, any> | undefined;
}