import { Point } from "./point";
import { SchemaDefinition } from "./schema-definition";

/**
 * @typeParam T - The array and/or tuple type
 * @typeParam M - Is the tuple mutable
 */
export interface FieldMap<T = string, M = false> {
    string: string;
    number: number;
    boolean: boolean;
    text: string;
    date: Date;
    point: Point;
    array: Array<T>;
    tuple: M extends true ? T : { readonly [K in keyof T]: T[K] };
    object: Record<string, SchemaDefinition>;
}