import { inspect } from "node:util";
import { Color } from "colours.js/dst";
import { methods, schemaData } from "./utils/symbols";
import { ParsingError } from "./utils";
import type { SchemaDefinition, SchemaOptions, MethodsDefinition, ParsedSchemaDefinition } from "./typings";

export class Schema<S extends SchemaDefinition, M extends MethodsDefinition> {

    /** @internal */
    public [methods]: M;

    /** @internal */
    public [schemaData]: ParsedSchemaDefinition;

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
        Object.entries(schema).forEach(([key, value]) => {
            if (key.startsWith("$")) throw new PrettyError("Keys cannot start with '$'", {
                ref: "redis-om"
            });

            if (typeof value === "string") {
                //@ts-expect-error Anti-JS
                if (value === "object")
                    throw new PrettyError(`Type '${value}' needs to use its object definition`, {
                        ref: "nekdis",
                        lines: [
                            {
                                err: inspect({ [key]: value }, { colors: true }),
                                marker: { text: "Parsing:" }
                            },
                            {
                                err: ParsingError.Object(key),
                                marker: { text: "Possible Fix:", color: Color.fromHex("#00FF00"), nl: true }
                            },
                            {
                                err: ParsingError.Info.Object,
                                marker: { text: "Information:", color: Color.fromHex("#009dff"), spaced: true, nl: true }
                            }
                        ]
                    });

                if (value === "array")
                    value = { type: value, elements: "string", default: undefined, required: false };
                else
                    value = { type: value, default: undefined, required: false };
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!value.type) throw new PrettyError("Type not defined");
                if (value.type !== "array" && value.type !== "object" && value.type !== "date") {
                    if (typeof value.default === "undefined") value.default = undefined;
                    if (typeof value.required === "undefined") value.required = false;
                } else if (value.type === "array") {
                    if (typeof value.default === "undefined") value.default = undefined;
                    if (typeof value.required === "undefined") value.required = false;
                    if (typeof value.elements === "undefined") value.elements = "string";
                    if (typeof value.elements === "object" && !Array.isArray(value.elements)) throw new Error();/* value.elements = this.#parse(value.elements); */
                } else if (value.type === "date") {
                    if (value.default instanceof Date) value.default = value.default.getTime();

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
        });
        return <ParsedSchemaDefinition>schema;
    }
}