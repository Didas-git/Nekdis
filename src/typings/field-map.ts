import type { SchemaDefinition } from "./schema-definition";
import type { Point } from "./point";

/**
 * @typeParam T - The array and/or tuple type
 */
export interface FieldMap<T = string> {
    string: string;
    number: number;
    boolean: boolean;
    text: string;
    date: Date | number;
    point: Point;
    array: Array<T>;
    object: Record<string, SchemaDefinition>;
    reference: Array<Record<string, SchemaDefinition>>;
}