import { colorConsole, Color } from "colours.js/dst/index.js";
import { client } from "../../../dist/index.js";

await client.connect().then(() => console.log(colorConsole.uniform("Nekdis Connected!", Color.fromHex("#0000FF"))));
await client.raw.flushAll();

export const FullJSONBenchSchema = client.schema({
    aString: "string",
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
            aBooleanArray: { type: "array", elements: "boolean" },
            anotherObject: {
                type: "object",
                properties: {
                    aTextArray: { type: "array", elements: 'text' }
                }
            }
        }
    },
    aTuple: { type: "tuple", elements: ["string", "string", "number"] },
    aReference: { type: "reference", schema: "self" }
});

client.model("FullJSONBench", FullJSONBenchSchema);

export const FullHASHBenchSchema = client.schema({
    aString: "string",
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
            aBooleanArray: { type: "array", elements: "boolean" },
            anotherObject: {
                type: "object",
                properties: {
                    aTextArray: { type: "array", elements: 'text' }
                }
            }
        }
    },
    aTuple: { type: "tuple", elements: ["string", "string", "number"] },
    aReference: { type: "reference", schema: "self" }
}, {}, { dataStructure: "HASH" });

client.model("FullHASHBench", FullHASHBenchSchema);

export const JSONBenchSchema = client.schema({
    aString: "string",
    aNumber: "number",
    aBoolean: "boolean",
    someText: "text",
    aDate: "date",
    aPoint: "point",
    aStringArray: "array",
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
    aString: "string",
    aNumber: "number",
    aBoolean: "boolean",
    someText: "text",
    aDate: "date",
    aPoint: "point",
    aStringArray: "array"
}, {}, { dataStructure: "HASH" });

client.model("HASHBench", HASHBenchSchema);

export const NoValidationFullJSONBenchSchema = client.schema({
    aString: "string",
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
            aBooleanArray: { type: "array", elements: "boolean" },
            anotherObject: {
                type: "object",
                properties: {
                    aTextArray: { type: "array", elements: 'text' }
                }
            }
        }
    },
    aTuple: { type: "tuple", elements: ["string", "string", "number"] },
    aReference: { type: "reference", schema: "self" }
}, {}, { skipDocumentValidation: true });

client.model("NoValFullJSONBench", NoValidationFullJSONBenchSchema);

export const NoValidationFullHASHBenchSchema = client.schema({
    aString: "string",
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
            aBooleanArray: { type: "array", elements: "boolean" },
            anotherObject: {
                type: "object",
                properties: {
                    aTextArray: { type: "array", elements: 'text' }
                }
            }
        }
    },
    aTuple: { type: "tuple", elements: ["string", "string", "number"] },
    aReference: { type: "reference", schema: "self" }
}, {}, { dataStructure: "HASH", skipDocumentValidation: true });

client.model("NoValFullHASHBench", NoValidationFullHASHBenchSchema);

export const NoValidationJSONBenchSchema = client.schema({
    aString: "string",
    aNumber: "number",
    aBoolean: "boolean",
    someText: "text",
    aDate: "date",
    aPoint: "point",
    aStringArray: "array",
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
    aString: "string",
    aNumber: "number",
    aBoolean: "boolean",
    someText: "text",
    aDate: "date",
    aPoint: "point",
    aStringArray: "array"
}, {}, { dataStructure: "HASH", skipDocumentValidation: true });

client.model("NoValHASHBench", NoValidationHASHBenchSchema);