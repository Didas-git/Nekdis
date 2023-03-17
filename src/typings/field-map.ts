import { Point } from "./point";
import { SchemaDefinition } from "./schema-definition";

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
}