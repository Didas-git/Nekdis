// import { schemaData } from "../../src/utils";
// import { complexTupleSchema, simpleTupleSchema } from "../constants";

// describe("simple tuple fields", () => {
//     test("raw data", () => {
//         expect(simpleTupleSchema.rawData).toStrictEqual({
//             tupleField1: { type: "tuple", elements: ["string", "number"] },
//             tupleField2: { type: "tuple", elements: ["string", "number"], default: ["S", 2] },
//             tupleField3: { type: "tuple", elements: ["string", "number"], mutable: true },
//             tupleField4: { type: "tuple", elements: ["string", "number"], default: ["SS", 4], mutable: true },
//             tupleField5: { type: "tuple", elements: ["string", "number"], required: true },
//             tupleField6: { type: "tuple", elements: ["string", "number"], default: ["SSS", 6], required: true },
//             tupleField7: { type: "tuple", elements: ["string", "number"], mutable: true, required: true }
//         });
//     });

//     test("formatted data", () => {
//         expect(simpleTupleSchema[schemaData]).toStrictEqual({
//             tupleField1: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type:
//                             "string",
//                         default: undefined,
//                         required: false
//                     }, {
//                         type: "number",
//                         default: undefined,
//                         required: false
//                     }
//                 ],
//                 default: undefined,
//                 mutable: false,
//                 required: false
//             },
//             tupleField2: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type: "string",
//                         default: undefined,
//                         required: false
//                     }, {
//                         type: "number",
//                         default: undefined,
//                         required: false
//                     }
//                 ],
//                 default: ["S", 2],
//                 mutable: false,
//                 required: false
//             },
//             tupleField3: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type: "string",
//                         default: undefined,
//                         required: false
//                     }, {
//                         type: "number",
//                         default: undefined,
//                         required: false
//                     }
//                 ],
//                 default: undefined,
//                 mutable: true,
//                 required: false
//             },
//             tupleField4: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type: "string",
//                         default: undefined,
//                         required: false
//                     }, {
//                         type: "number",
//                         default: undefined,
//                         required: false
//                     }
//                 ],
//                 default: ["SS", 4],
//                 mutable: true,
//                 required: false
//             },
//             tupleField5: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type: "string",
//                         default: undefined,
//                         required: false
//                     }, {
//                         type: "number", default:
//                             undefined,
//                         required: false
//                     }
//                 ],
//                 default: undefined,
//                 mutable: false,
//                 required: true
//             },
//             tupleField6: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type: "string",
//                         default: undefined,
//                         required: false
//                     }, {
//                         type: "number",
//                         default: undefined,
//                         required: false
//                     }
//                 ],
//                 default: ["SSS", 6],
//                 mutable: false,
//                 required: true
//             },
//             tupleField7: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type: "string",
//                         default: undefined,
//                         required: false
//                     }, {
//                         type: "number",
//                         default: undefined,
//                         required: false
//                     }
//                 ],
//                 default: undefined,
//                 mutable: true,
//                 required: true
//             }
//         });
//     });
// });

// describe("complex tuple fields", () => {
//     test("raw data", () => {
//         expect(complexTupleSchema.rawData).toStrictEqual({
//             tupleField1: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type: "object",
//                         properties: {
//                             propertie1: "string",
//                             propertie2: {
//                                 type: "object",
//                                 properties: {
//                                     nestedPropertie1: {
//                                         type: "tuple",
//                                         elements: ["boolean", { type: "tuple", elements: ["date"] }],
//                                         default: [true]
//                                     }
//                                 }
//                             }
//                         }
//                     },
//                     "number",
//                     { type: "array" }
//                 ],
//                 required: true,
//                 mutable: true
//             }
//         });
//     });

//     test("formatted data", () => {
//         expect(complexTupleSchema[schemaData]).toStrictEqual({
//             tupleField1: {
//                 type: "tuple",
//                 elements: [
//                     {
//                         type: "object",
//                         properties: {
//                             propertie1: { type: "string", default: undefined, required: false },
//                             propertie2: {
//                                 type: "object",
//                                 properties: {
//                                     nestedPropertie1: {
//                                         type: "tuple",
//                                         elements: [
//                                             {
//                                                 type: "boolean",
//                                                 default: undefined,
//                                                 required: false
//                                             }, {
//                                                 type: "tuple",
//                                                 elements: [
//                                                     {
//                                                         type: "date",
//                                                         default: undefined,
//                                                         required: false
//                                                     }
//                                                 ],
//                                                 default: undefined,
//                                                 mutable: false,
//                                                 required: false
//                                             }

//                                         ],
//                                         default: [true],
//                                         mutable: false,
//                                         required: false
//                                     }
//                                 },
//                                 default: undefined,
//                                 required: false
//                             }
//                         },
//                         default: undefined,
//                         required: false
//                     },
//                     { type: "number", default: undefined, required: false },
//                     { type: "array", elements: "string", default: undefined, required: false }
//                 ],
//                 default: undefined,
//                 mutable: true,
//                 required: true
//             }
//         });
//     });
// })