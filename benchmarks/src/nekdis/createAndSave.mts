import type { JSONBenchSchema, HASHBenchSchema } from "./setup.mjs";
import { client } from "../../../dist/index.js";

//#region Redis-OM Clone
export async function benchJSONCreateAndSave(amt: number): Promise<void> {
    const model = client.model<typeof JSONBenchSchema>("JSONBench");
    const temp = [];

    const loopStart = performance.now()
    for (let i = 0; i < amt; i++) {
        const start = performance.now();

        await model.createAndSave({
            aString: "ABC",
            aNumber: 3,
            aBoolean: true,
            someText: "Full Text",
            aDate: new Date(),
            aPoint: { longitude: 139.7745, latitude: 35.7023 },
            aStringArray: ["A", "B", "C"],
            anObject: {
                anotherBoolean: false,
                anotherObject: {
                    anotherText: "Lovely"
                }
            }
        })

        const end = performance.now();
        temp.push(end - start)
    }
    const loopEnd = performance.now();

    console.log(`Ran ${amt} createAndSave iterations on JSON in ${loopEnd - loopStart}ms, AVG: ${temp.reduce((prev, curr) => prev + curr, 0) / temp.length}ms`)
}

export async function benchBatchJSONCreateAndSave(amt: number): Promise<void> {
    const model = client.model<typeof JSONBenchSchema>("JSONBench");
    const temp = [];

    const loopStart = performance.now()
    for (let i = 0; i < amt; i++) {
        temp.push(model.createAndSave({
            aString: "ABC",
            aNumber: 3,
            aBoolean: true,
            someText: "Full Text",
            aDate: new Date(),
            aPoint: { longitude: 139.7745, latitude: 35.7023 },
            aStringArray: ["A", "B", "C"],
            anObject: {
                anotherBoolean: false,
                anotherObject: {
                    anotherText: "Lovely"
                }
            }
        }))
    }

    await Promise.all(temp);
    const loopEnd = performance.now();

    console.log(`Ran ${amt} createAndSave iterations in batch on JSON in ${loopEnd - loopStart}ms`)
}

export async function benchHASHCreateAndSave(amt: number): Promise<void> {
    const model = client.model<typeof HASHBenchSchema>("HASHBench");
    const temp = [];

    const loopStart = performance.now()
    for (let i = 0; i < amt; i++) {
        const start = performance.now();

        await model.createAndSave({
            aString: "ABC",
            aNumber: 3,
            aBoolean: true,
            someText: "Full Text",
            aDate: new Date(),
            aPoint: { longitude: 139.7745, latitude: 35.7023 },
            aStringArray: ["A", "B", "C"],
            anObject: {
                anotherBoolean: false,
                anotherObject: {
                    anotherText: "Lovely"
                }
            }
        })

        const end = performance.now();
        temp.push(end - start)
    }
    const loopEnd = performance.now();

    console.log(`Ran ${amt} createAndSave iterations on HASH in ${loopEnd - loopStart}ms, AVG: ${temp.reduce((prev, curr) => prev + curr, 0) / temp.length}ms`)
}

export async function benchBatchHASHCreateAndSave(amt: number): Promise<void> {
    const model = client.model<typeof JSONBenchSchema>("HASHBench");
    const temp = [];

    const loopStart = performance.now()
    for (let i = 0; i < amt; i++) {
        temp.push(model.createAndSave({
            aString: "ABC",
            aNumber: 3,
            aBoolean: true,
            someText: "Full Text",
            aDate: new Date(),
            aPoint: { longitude: 139.7745, latitude: 35.7023 },
            aStringArray: ["A", "B", "C"],
            anObject: {
                anotherBoolean: false,
                anotherObject: {
                    anotherText: "Lovely"
                }
            }
        }))
    }

    await Promise.all(temp);
    const loopEnd = performance.now();

    console.log(`Ran ${amt} createAndSave iterations in batch on HASH in ${loopEnd - loopStart}ms`)
}
//#endregion redis-OM Clone

//#region All Types

//#endregion All Types