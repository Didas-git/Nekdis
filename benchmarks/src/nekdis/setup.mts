import { colorConsole, Color } from "colours.js/dst/index.js";
import { client } from "../../../dist/index.js";

await client.connect().then(() => console.log(colorConsole.uniform("Nekdis Connected!", Color.fromHex("#0000FF"))));
await client.raw.flushAll();

export const FullJSONBenchSchema = client.schema({
    string: { type: "string", index: true },
    number: "number",
    boolean: "boolean",
    date: "date",
    point: "point",
    bigint: "bigint",
    text: "text",
    vector: "vector",
    stringArray: { type: "array", elements: "string" },
    numberArray: { type: "array", elements: "number" },
    booleanArray: { type: "array", elements: "boolean" },
    dateArray: { type: "array", elements: "date" },
    pointArray: { type: "array", elements: "point" },
    bigintArray: { type: "array", elements: "bigint" },
    textArray: { type: "array", elements: "text" },
    vectorArray: { type: "array", elements: "vector" },
    objectArray: { type: "array", elements: { a: "number" } },
    object: {
        type: "object",
        properties: {
            string: "string",
            number: "number",
            boolean: "boolean",
            date: "date",
            point: "point",
            bigint: "bigint",
            text: "text",
            vector: "vector",
            stringArray: { type: "array", elements: "string" },
            numberArray: { type: "array", elements: "number" },
            booleanArray: { type: "array", elements: "boolean" },
            dateArray: { type: "array", elements: "date" },
            pointArray: { type: "array", elements: "point" },
            bigintArray: { type: "array", elements: "bigint" },
            textArray: { type: "array", elements: "text" },
            vectorArray: { type: "array", elements: "vector" },
            nestedObject: {
                type: "object", properties: {
                    nestedTuple: { type: "tuple", elements: ["boolean"] }
                }
            }
        }
    },
    tuple: {
        type: "tuple",
        elements: [
            "string",
            "number",
            "boolean",
            "date",
            "point",
            "bigint",
            "text",
            "vector",
            { type: "array", elements: "string" },
            { type: "array", elements: "number" },
            { type: "array", elements: "boolean" },
            { type: "array", elements: "date" },
            { type: "array", elements: "point" },
            { type: "array", elements: "bigint" },
            { type: "array", elements: "text" },
            { type: "array", elements: "vector" },
            { type: "tuple", elements: ["string", "number"] },
            { type: "object", properties: { a: "boolean" } }
        ]
    },
    reference: { type: "reference", schema: "self" },
});

client.model("FullJSONBench", FullJSONBenchSchema);

export const FullHASHBenchSchema = client.schema({
    string: { type: "string", index: true },
    number: "number",
    boolean: "boolean",
    date: "date",
    point: "point",
    bigint: "bigint",
    text: "text",
    // vector: "vector",
    stringArray: { type: "array", elements: "string" },
    numberArray: { type: "array", elements: "number" },
    booleanArray: { type: "array", elements: "boolean" },
    dateArray: { type: "array", elements: "date" },
    pointArray: { type: "array", elements: "point" },
    bigintArray: { type: "array", elements: "bigint" },
    textArray: { type: "array", elements: "text" },
    // vectorArray: { type: "array", elements: "vector" },
    objectArray: { type: "array", elements: { a: "number" } },
    object: {
        type: "object",
        properties: {
            string: "string",
            number: "number",
            boolean: "boolean",
            date: "date",
            point: "point",
            bigint: "bigint",
            text: "text",
            // vector: "vector",
            stringArray: { type: "array", elements: "string" },
            numberArray: { type: "array", elements: "number" },
            booleanArray: { type: "array", elements: "boolean" },
            dateArray: { type: "array", elements: "date" },
            pointArray: { type: "array", elements: "point" },
            bigintArray: { type: "array", elements: "bigint" },
            textArray: { type: "array", elements: "text" },
            // vectorArray: { type: "array", elements: "vector" },
            nestedObject: {
                type: "object", properties: {
                    nestedTuple: { type: "tuple", elements: ["boolean"] }
                }
            }
        }
    },
    tuple: {
        type: "tuple",
        elements: [
            "string",
            "number",
            "boolean",
            "date",
            "point",
            "bigint",
            "text",
            // "vector",
            { type: "array", elements: "string" },
            { type: "array", elements: "number" },
            { type: "array", elements: "boolean" },
            { type: "array", elements: "date" },
            { type: "array", elements: "point" },
            { type: "array", elements: "bigint" },
            { type: "array", elements: "text" },
            // { type: "array", elements: "vector" },
            { type: "tuple", elements: ["string", "number"] },
            { type: "object", properties: { a: "boolean" } }
        ]
    },
    reference: { type: "reference", schema: "self" },
}, {}, { dataStructure: "HASH" });

client.model("FullHASHBench", FullHASHBenchSchema);

export const JSONBenchSchema = client.schema({
    aString: { type: "string", index: true },
    aNumber: "number",
    aBoolean: "boolean",
    someText: "text",
    aDate: "date",
    aPoint: "point",
    aStringArray: "array",
    aNumberArray: { type: "array", elements: "number" },
    anObject: {
        type: "object",
        properties: {
            anotherBoolean: "boolean",
            anotherObject: {
                type: "object",
                properties: {
                    anotherText: "text"
                }
            }
        }
    }
});

client.model("JSONBench", JSONBenchSchema);

export const HASHBenchSchema = client.schema({
    aString: { type: "string", index: true },
    aNumber: "number",
    aBoolean: "boolean",
    someText: "text",
    aDate: "date",
    aPoint: "point",
    aStringArray: "array"
}, {}, { dataStructure: "HASH" });

client.model("HASHBench", HASHBenchSchema);

export const NoValidationFullJSONBenchSchema = client.schema({
    string: { type: "string", index: true },
    number: "number",
    boolean: "boolean",
    date: "date",
    point: "point",
    bigint: "bigint",
    text: "text",
    vector: "vector",
    stringArray: { type: "array", elements: "string" },
    numberArray: { type: "array", elements: "number" },
    booleanArray: { type: "array", elements: "boolean" },
    dateArray: { type: "array", elements: "date" },
    pointArray: { type: "array", elements: "point" },
    bigintArray: { type: "array", elements: "bigint" },
    textArray: { type: "array", elements: "text" },
    vectorArray: { type: "array", elements: "vector" },
    objectArray: { type: "array", elements: { a: "number" } },
    object: {
        type: "object",
        properties: {
            string: "string",
            number: "number",
            boolean: "boolean",
            date: "date",
            point: "point",
            bigint: "bigint",
            text: "text",
            vector: "vector",
            stringArray: { type: "array", elements: "string" },
            numberArray: { type: "array", elements: "number" },
            booleanArray: { type: "array", elements: "boolean" },
            dateArray: { type: "array", elements: "date" },
            pointArray: { type: "array", elements: "point" },
            bigintArray: { type: "array", elements: "bigint" },
            textArray: { type: "array", elements: "text" },
            vectorArray: { type: "array", elements: "vector" },
            nestedObject: {
                type: "object", properties: {
                    nestedTuple: { type: "tuple", elements: ["boolean"] }
                }
            }
        }
    },
    tuple: {
        type: "tuple",
        elements: [
            "string",
            "number",
            "boolean",
            "date",
            "point",
            "bigint",
            "text",
            "vector",
            { type: "array", elements: "string" },
            { type: "array", elements: "number" },
            { type: "array", elements: "boolean" },
            { type: "array", elements: "date" },
            { type: "array", elements: "point" },
            { type: "array", elements: "bigint" },
            { type: "array", elements: "text" },
            { type: "array", elements: "vector" },
            { type: "tuple", elements: ["string", "number"] },
            { type: "object", properties: { a: "boolean" } }
        ]
    },
    reference: { type: "reference", schema: "self" },
}, {}, { skipDocumentValidation: true });

client.model("NoValFullJSONBench", NoValidationFullJSONBenchSchema);

export const NoValidationFullHASHBenchSchema = client.schema({
    string: { type: "string", index: true },
    number: "number",
    boolean: "boolean",
    date: "date",
    point: "point",
    bigint: "bigint",
    text: "text",
    // vector: "vector",
    stringArray: { type: "array", elements: "string" },
    numberArray: { type: "array", elements: "number" },
    booleanArray: { type: "array", elements: "boolean" },
    dateArray: { type: "array", elements: "date" },
    pointArray: { type: "array", elements: "point" },
    bigintArray: { type: "array", elements: "bigint" },
    textArray: { type: "array", elements: "text" },
    // vectorArray: { type: "array", elements: "vector" },
    objectArray: { type: "array", elements: { a: "number" } },
    object: {
        type: "object",
        properties: {
            string: "string",
            number: "number",
            boolean: "boolean",
            date: "date",
            point: "point",
            bigint: "bigint",
            text: "text",
            // vector: "vector",
            stringArray: { type: "array", elements: "string" },
            numberArray: { type: "array", elements: "number" },
            booleanArray: { type: "array", elements: "boolean" },
            dateArray: { type: "array", elements: "date" },
            pointArray: { type: "array", elements: "point" },
            bigintArray: { type: "array", elements: "bigint" },
            textArray: { type: "array", elements: "text" },
            // vectorArray: { type: "array", elements: "vector" },
            nestedObject: {
                type: "object", properties: {
                    nestedTuple: { type: "tuple", elements: ["boolean"] }
                }
            }
        }
    },
    tuple: {
        type: "tuple",
        elements: [
            "string",
            "number",
            "boolean",
            "date",
            "point",
            "bigint",
            "text",
            // "vector",
            { type: "array", elements: "string" },
            { type: "array", elements: "number" },
            { type: "array", elements: "boolean" },
            { type: "array", elements: "date" },
            { type: "array", elements: "point" },
            { type: "array", elements: "bigint" },
            { type: "array", elements: "text" },
            // { type: "array", elements: "vector" },
            { type: "tuple", elements: ["string", "number"] },
            { type: "object", properties: { a: "boolean" } }
        ]
    },
    reference: { type: "reference", schema: "self" },
}, {}, { dataStructure: "HASH", skipDocumentValidation: true });

client.model("NoValFullHASHBench", NoValidationFullHASHBenchSchema);

export const NoValidationJSONBenchSchema = client.schema({
    aString: { type: "string", index: true },
    aNumber: "number",
    aBoolean: "boolean",
    someText: "text",
    aDate: "date",
    aPoint: "point",
    aStringArray: "array",
    aNumberArray: { type: "array", elements: "number" },
    anObject: {
        type: "object",
        properties: {
            anotherBoolean: "boolean",
            anotherObject: {
                type: "object",
                properties: {
                    anotherText: "text"
                }
            }
        }
    }
}, {}, { skipDocumentValidation: true });

client.model("NoValJSONBench", NoValidationJSONBenchSchema);

export const NoValidationHASHBenchSchema = client.schema({
    aString: { type: "string", index: true },
    aNumber: "number",
    aBoolean: "boolean",
    someText: "text",
    aDate: "date",
    aPoint: "point",
    aStringArray: "array"
}, {}, { dataStructure: "HASH", skipDocumentValidation: true });

client.model("NoValHASHBench", NoValidationHASHBenchSchema);