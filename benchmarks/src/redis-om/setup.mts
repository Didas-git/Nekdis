import { colorConsole, Color } from "colours.js/dst/index.js";
import { createClient } from "redis";
import { Schema, Repository } from "redis-om";

export const client = createClient();

await client.connect().then(() => console.log(colorConsole.uniform("Redis-OM Connected!", Color.fromHex("#FF0000"))));
await client.flushAll();

const JSONBenchSchema = new Schema("JSONBench", {
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

export const JSONRepository = new Repository(JSONBenchSchema, client);

const HASHBenchSchema = new Schema("HASHBench", {
    aString: { type: "string" },
    aNumber: { type: "number" },
    aBoolean: { type: "boolean" },
    someText: { type: "text" },
    aDate: { type: "date" },
    aPoint: { type: "point" },
    aStringArray: { type: "string[]" }
}, { dataStructure: "HASH" });

export const HASHRepository = new Repository(HASHBenchSchema, client);