import { inspect } from "node:util";
import { Color } from "colours.js/dst";
import { SchemaDefinition, SchemaOptions, MethodsDefinition, TupleField, ParsedSchemaDefinition } from "./typings";
import { methods, schemaData } from "./utils/symbols";
import { ParsingError } from "./utils";

export class Schema<S extends SchemaDefinition, M extends MethodsDefinition> {

    [methods]: M;
    [schemaData]: ParsedSchemaDefinition;

    public constructor(public rawData: S, methodsData?: M, public readonly options: SchemaOptions = {}) {
        // R.I.P. Performance
        this[schemaData] = this.#parse(JSON.parse(JSON.stringify(rawData)));
        this[methods] = methodsData ?? <M>{};
        this.options.dataStructure = options.dataStructure ?? "JSON";

    }

    public add<SD extends SchemaDefinition>(data: SD): this {
        this[schemaData] = { ...this[schemaData], ...this.#parse(data) };
        return this;
    }

    public methods<MD extends MethodsDefinition>(data: MD): this {
        this[methods] = { ...this[methods], ...data };
        return this;
    }

    #parse<T extends SchemaDefinition>(schema: T): ParsedSchemaDefinition {
        Object.keys(schema).forEach((key) => {
            if (key.startsWith("$")) throw new PrettyError("Keys cannot start with '$'", {
                ref: "redis-om"
            });

            let value = schema[key];

            if (typeof value === "string") {
                //@ts-expect-error Anti-JS
                if (value === "object" || value === "tuple")
                    throw new PrettyError(`Type '${value}' needs to use its object definition`, {
                        ref: "redis-om",
                        lines: [
                            {
                                err: inspect({ [key]: schema[key] }, { colors: true }),
                                marker: { text: "Parsing:" }
                            },
                            {
                                err: value === "object" ? ParsingError.Object(key) : ParsingError.Tuple(key),
                                marker: { text: "Possible Fix:", color: Color.fromHex("#00FF00"), nl: true }
                            },
                            {
                                err: value === "object" ? ParsingError.Info.Object : ParsingError.Info.Tuple,
                                marker: { text: "Information:", color: Color.fromHex("#009dff"), spaced: true, nl: true }
                            }
                        ]
                    });

                if (value === "array")
                    value = { type: value, elements: "string", default: undefined, required: false };
                else
                    value = { type: value, default: undefined, required: false };
            } else {
                if (!value.type) throw new PrettyError("Type not defined");
                if (value.type !== "array" && value.type !== "object" && value.type !== "tuple" && value.type !== "date") {
                    if (typeof value.default === "undefined") value.default = undefined;
                    if (typeof value.required === "undefined") value.required = false;
                } else if (value.type === "array") {
                    if (typeof value.default === "undefined") value.default = undefined;
                    if (typeof value.required === "undefined") value.required = false;
                    if (!value.elements) value.elements = "string";
                    if (typeof value.elements === "object" && !Array.isArray(value.elements)) value.elements = this.#parse(value.elements);
                } else if (value.type === "tuple") {
                    if (typeof value.default === "undefined") value.default = undefined;
                    if (typeof value.required === "undefined") value.required = false;
                    if (typeof value.mutable === "undefined") value.mutable = false;
                    if (!value.elements || !Array.isArray(value.elements) || !value.elements.length) throw new PrettyError("A Tuple type needs to have its elements defined");
                    else value.elements = <TupleField["elements"]><unknown>this.#parse(<SchemaDefinition><unknown>value.elements);
                } else if (value.type === "date") {
                    if (value.default instanceof Date) value.default = value.default.getTime();
                    //@ts-expect-error using `new Date()` seems to return a string sometimes
                    if (typeof value.default === "string") value.default = new Date(value.default).getTime();
                    if (typeof value.default === "undefined") value.default = undefined;
                    if (typeof value.required === "undefined") value.required = false;
                } else {
                    if (typeof value.default === "undefined") value.default = undefined;
                    if (typeof value.required === "undefined") value.required = false;
                    if (!value.properties) value.properties = undefined;
                    else value.properties = this.#parse(value.properties);
                }
            }
            //@ts-expect-error More Shenanigans
            schema[key] = value;
        });
        return <ParsedSchemaDefinition>schema;
    }
}