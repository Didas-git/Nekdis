import { inspect } from "node:util";
import { Color } from "colours.js/dst";
import { ErrorLogger } from "@infinite-fansub/logger/dist";
import { SchemaDefinition, SchemaOptions, MethodsDefinition } from "./typings";
import { methods, schemaData } from "../privates/symbols";
import { ParsingError } from "../errors";

export class Schema<S extends SchemaDefinition, M extends MethodsDefinition> {

    [methods]: M;
    [schemaData]: S;

    public constructor(data: S, methodsData?: M, public readonly options: SchemaOptions = {}) {
        this[schemaData] = this.parse(data);
        this[methods] = methodsData ?? <M>{};
        if (!options?.dataStructure) this.options.dataStructure = "JSON"

    }

    /**
     * 
     * @param data 
     * @returns The instance of the class, the types shown are just for the sake of adding types
     */
    public add<S extends SchemaDefinition>(data: S) {
        this[schemaData] = { ...this[schemaData], ...data };
        return this
    }

    public methods<M extends MethodsDefinition>(data: M) {
        this[methods] = { ...this[methods], ...data };
        return this
    }

    private parse<T extends SchemaDefinition>(schema: T): T {
        Object.keys(schema).forEach((key) => {
            let value = schema[key];
            if (typeof value === "string") {
                //@ts-expect-error Anti-JS
                if (value === "object" || value === "tuple")
                    throw new ErrorLogger(`Type '${value}' needs to use its object definition`, {
                        errCode: "R403",
                        ref: true,
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
                    })

                if (value === "array")
                    value = { type: value, required: false, elements: undefined }
                else
                    //@ts-expect-error TS can't figure this out
                    value = { type: value, required: false, default: undefined }
            } else {
                if (!value.type) throw new Error("Type not defined");
                if (value.type !== "array" && value.type !== "object" && value.type !== "tuple") {
                    if (!value.required) value.required = false;
                    if (!value.default) value.default = undefined;
                }
                if (value.type === "array")
                    if (!value.elements) (value).elements = undefined;
                if (value.type === "tuple")
                    if (!value.elements) throw new Error("A Tuple type needs to have its elements defined");
                if (value.type === "object")
                    if (!value.data) (value).data = undefined
                    else (value).data = this.parse((value).data);
            }
            //@ts-expect-error More Shenanigans
            schema[key] = value
        })
        return schema;
    }
}