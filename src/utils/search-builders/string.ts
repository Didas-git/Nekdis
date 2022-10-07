import { MapSchema, SchemaDefinition } from "../../typings";
import { SearchField } from "./base";

export class StringField<T extends SchemaDefinition> extends SearchField<T> {
}