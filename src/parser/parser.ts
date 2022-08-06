//@ts-nocheck
/*
SchemaDefinition = Record<string, {type: string | number | boolean | text | date | point | array}>
*/

import { schemaData } from "src/privates/symbols";
import { Schema, FieldMap, SchemaDefinition } from "src/schema";
/*
schemaData: {
    name: {
        type: "object",
        default: "D",
        required: true,
        data: {
            ifk: {type: "string"}
        }
    },
    
    tongue: "string"

    age: {
        type: "array",
        elements: "string"
    }

    age2: {
        type: "tuple",
        elements: [{ type: "array", elements: "number" }, { ob: { type: "tuple", elements: [{ id: { type: "object", data: { t: "number" } } }] } }]
    }
}

type: {
    name: {
        ifk: "string"
    },
    age: [undefined, "string"]
    age2: ["array", {ob: "number"}]
}

default: {
    name: "D"
}

required: {}
*/

// export class Parser<T extends SchemaDefinition> {
//     private schemaData: SchemaDefinition;

//     public constructor(schema: T) {
//         this.schemaData = schema
//     }

//     public parseType<T extends SchemaDefinition>(s?: T) {
//         let result = <any>{};
//         const schema = s ?? this.schemaData;
//         Object.keys(schema).forEach((key, value) => {
//             if (typeof value === "object") {
//                 if (value.type === "object")
//                     result[key] = value.data === undefined ? "object" : this.parseType(value.data)
//                 else if (value.type === "array") {
//                     if (!value.elements) throw new Error("No elements defined")
//                     result[key] = [undefined, value.elements];
//                 }
//                 else if (value.type === "tuple") {
//                     result[key] = value.elements.map((el: keyof FieldMap | SchemaDefinition) => {
//                         if (typeof el === "string")
//                             return el;
//                         else
//                             return this.parseType(el);
//                     });
//                 } else result[key] = value.type;
//             } else {
//                 //@ts-expect-error Anti-JS
//                 if (value === "object" || value === "tuple")
//                     throw new Error("You fucking moron. Those types have unique properties which are entirely required. You imbecile. Unacceptable.");

//                 result[key] = value;
//             }
//         });
//         return result;
//     }
// }

// export function parseDefaultValues<T extends SchemaDefinition>(schema: T) {
//     let result = <any>{};
//     for (const key in schema) {
//         const value = schema[key];
//         let defaultValue: any;
//         if (typeof value === "object") {
//             defaultValue = value.default;
//             if ((value.type === "array" || value.type === "tuple" || value.type === "object") && defaultValue !== undefined)
//                 throw new Error("deez");
//             if (value.type === "object")
//                 defaultValue = parseDefaultValues(value.data);
//             if (defaultValue !== undefined)
//                 result[key] = defaultValue;
//         }
//     };
//     return result;
// }

// export function parseRequiredValues<T extends SchemaDefinition>(schema: T) {
//     let result = <any>{};
//     for (const key in schema) {
//         const value = schema[key];
//         let required: boolean;
//         if (typeof value === "object") {
//             if (value.type === "object")
//                 required = parseRequiredValues(value.data);
//             else
//                 required = value.required ?? false;
//             result[key] = required;
//         }
//     };
//     return result;
// }

const parser = new Parser({
    obj: {
        type: "object",
        data: {
            name: {
                type: "string",
                default: "DD"
            },
            age: {
                type: "number",
                required: true
            },
            email: {
                type: "string",
                default: "d@d.com"
            }
        }
    },
    arr: {
        type: "array",
        elements: "string"
    },
    t: { type: "string", default: undefined, required: false }
})

parser.parseType();
parseDefaultValues(parser.schemaData);
parseRequiredValues(parser.schemaData);
