import { colorConsole, Color } from "colours.js/dst/index.js";
import { createClient } from "redis";
import { Schema } from "redis-om";

export const client = createClient();

await client.connect().then(() => console.log(colorConsole.uniform("Nekdis Connected!", Color.fromHex("#0000FF"))));
await client.flushAll();

export const JSONBenchSchema = new Schema("JSONBench", {
    aString: { type: "string" },
    aNumber: { type: "number" },
    aBoolean: { type: "boolean" },
    someText: { type: "text" },
    aDate: { type: "date" },
    aPoint: { type: "point" },
    aStringArray: { type: "string[]" },
    anotherBoolean: { type: "boolean", path: "$.anObject.anotherBoolean" },
    anotherText: { type: "text", path: "$.anObject.anotherObject.anotherText" }
});

export const HASHBenchSchema = new Schema("HASHBench", {
    aString: { type: "string" },
    aNumber: { type: "number" },
    aBoolean: { type: "boolean" },
    someText: { type: "text" },
    aDate: { type: "date" },
    aPoint: { type: "point" },
    aStringArray: { type: "string[]" }
}, { dataStructure: "HASH" });