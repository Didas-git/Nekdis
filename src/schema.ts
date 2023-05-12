import { inspect } from "node:util";

import { Color } from "colours.js/dst";

import { ParsingErrors } from "./utils";
import { methods, schemaData } from "./utils/symbols";

import type {
    MethodsDefinition,
    SchemaDefinition,
    SchemaOptions,
    ParseSchema,
    BaseField
} from "./typings";

export class Schema<S extends SchemaDefinition, M extends MethodsDefinition, P extends ParseSchema<S> = ParseSchema<S>> {

    /** @internal */
    public [methods]: M;

    /** @internal */
    public [schemaData]: P;

    public constructor(rawData: S, methodsData?: M, public readonly options: SchemaOptions = {}) {
        // R.I.P. Performance
        this[schemaData] = this.#parse(rawData);
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

    #parse<T extends SchemaDefinition>(schema: T): P {
        const data: Record<string, unknown> = {};
        const references: Record<string, unknown> = {};

        for (let i = 0, entries = Object.entries(schema), len = entries.length; i < len; i++) {
            let [key, value] = entries[i];
            if (key.startsWith("$")) throw new PrettyError("Keys cannot start with '$'", {
                ref: "nekdis"
            });

            if (typeof value === "string") {
                //@ts-expect-error Some people do not read docs
                if (value === "object") {
                    throw new PrettyError("Type 'object' needs to use its object definition", {
                        ref: "nekdis",
                        lines: [
                            {
                                err: inspect({ [key]: value }, { colors: true }),
                                marker: { text: "Parsing:" }
                            },
                            {
                                err: ParsingErrors.Fix.Object(key),
                                marker: { text: "Fix:", color: Color.fromHex("#00FF00"), nl: true }
                            },
                            {
                                err: ParsingErrors.Info.Object,
                                marker: { text: "Information:", color: Color.fromHex("#009dff"), spaced: true, nl: true }
                            }
                        ]
                    });
                    //@ts-expect-error Some people do not read docs
                } if (value === "reference") {
                    throw new PrettyError("Type 'reference' needs to use its object definition", {
                        ref: "nekdis",
                        lines: [
                            {
                                err: inspect({ [key]: value }, { colors: true }),
                                marker: { text: "Parsing:" }
                            },
                            {
                                err: ParsingErrors.Fix.Reference(key),
                                marker: { text: "Fix:", color: Color.fromHex("#00FF00"), nl: true }
                            }
                        ]
                    });
                } if (value === "array") {
                    value = { type: value, elements: "string", default: undefined, required: false, sortable: false, index: true };
                } else {
                    value = { type: value, default: undefined, required: false, sortable: false, index: true };
                }
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (!value.type) throw new PrettyError("Type not defined", {
                    ref: "nekdis",
                    lines: [
                        {
                            err: inspect({ [key]: value }, { colors: true }),
                            marker: { text: "Parsing:" }
                        }
                    ]
                });
                if (value.type === "array") {
                    if (typeof value.elements === "undefined") value.elements = "string";
                    if (typeof value.separator === "undefined") value.separator = ",";
                    if (typeof value.elements === "object" && !Array.isArray(value.elements)) throw new PrettyError("Objects inside arrays are not yet supported", {
                        ref: "nekdis",
                        lines: [
                            {
                                err: inspect({ [key]: value }, { colors: true }),
                                marker: { text: "Parsing:" }
                            }
                        ]
                    });
                    value = this.#fill(value);
                } else if (value.type === "date") {
                    if (value.default instanceof Date) value.default = value.default.getTime();
                    if (typeof value.default === "string" || typeof value.default === "number") value.default = new Date(value.default).getTime();
                    value = this.#fill(value);
                } else if (value.type === "object") {
                    if (typeof value.default === "undefined") value.default = undefined;
                    if (typeof value.required === "undefined") value.required = false;
                    if (!value.properties) value.properties = undefined;
                    else value.properties = <never>this.#parse(value.properties).data;
                } else if (value.type === "reference") {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
                    if (!value.schema) throw new PrettyError("Type 'reference' lacks a schema", {
                        ref: "nekdis",
                        lines: [
                            {
                                err: inspect({ [key]: value }, { colors: true }),
                                marker: { text: "Parsing:" }
                            },
                            {
                                err: ParsingErrors.Fix.Reference(key),
                                marker: { text: "Fix:", color: Color.fromHex("#00FF00"), nl: true }
                            }
                        ]
                    });
                    references[key] = null;
                    continue;
                } else {
                    value = this.#fill(value);
                }
            }
            data[key] = value;
        }
        return <never>{ data, references };
    }

    #fill(value: BaseField): any {
        if (typeof value.default === "undefined") value.default = undefined;
        if (typeof value.required === "undefined") value.required = false;
        if (typeof value.sortable === "undefined") value.sortable = false;
        if (typeof value.index === "undefined") value.index = true;
        return value;
    }
}