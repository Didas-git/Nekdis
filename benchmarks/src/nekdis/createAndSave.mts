import { client } from "../../../dist/index.js";

import type {
    NoValidationFullJSONBenchSchema,
    NoValidationFullHASHBenchSchema,
    NoValidationJSONBenchSchema,
    NoValidationHASHBenchSchema,
    FullJSONBenchSchema,
    FullHASHBenchSchema,
    JSONBenchSchema,
    HASHBenchSchema,
} from "./setup.mjs";

//#region Redis-OM Clone
export async function benchJSONCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof JSONBenchSchema>("JSONBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
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
            temp[i].push(end - start);
        }
        const loopEnd = performance.now();

        temp[i] = temp[i].reduce((prev, curr) => prev + curr, 0) / temp[i].length;
        table[i] = { Takes: loopEnd - loopStart, PerCallRequestAverage: temp[i] }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length,
        PerCallRequestAverage: temp.reduce((prev, curr) => prev + curr, 0) / temp.length
    };

    console.log(`JSON createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchBatchJSONCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof JSONBenchSchema>("JSONBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.createAndSave({
                $id: j,
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

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`JSON Batch createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchHASHCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof HASHBenchSchema>("HASHBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.createAndSave({
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"]
            })

            const end = performance.now();
            temp[i].push(end - start);
        }
        const loopEnd = performance.now();

        temp[i] = temp[i].reduce((prev, curr) => prev + curr, 0) / temp[i].length;
        table[i] = { Takes: loopEnd - loopStart, PerCallRequestAverage: temp[i] }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length,
        PerCallRequestAverage: temp.reduce((prev, curr) => prev + curr, 0) / temp.length
    };

    console.log(`HASH createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchBatchHASHCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof HASHBenchSchema>("HASHBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"]
            }))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`HASH Batch createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchNoValJSONCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof NoValidationJSONBenchSchema>("NoValJSONBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
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
            temp[i].push(end - start);
        }
        const loopEnd = performance.now();

        temp[i] = temp[i].reduce((prev, curr) => prev + curr, 0) / temp[i].length;
        table[i] = { Takes: loopEnd - loopStart, PerCallRequestAverage: temp[i] }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length,
        PerCallRequestAverage: temp.reduce((prev, curr) => prev + curr, 0) / temp.length
    };

    console.log(`No Validation JSON createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchBatchNoValJSONCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof NoValidationJSONBenchSchema>("NoValJSONBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
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

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`No Validation JSON Batch createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchNoValHASHCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof NoValidationHASHBenchSchema>("NoValHASHBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.createAndSave({
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"]
            })

            const end = performance.now();
            temp[i].push(end - start);
        }
        const loopEnd = performance.now();

        temp[i] = temp[i].reduce((prev, curr) => prev + curr, 0) / temp[i].length;
        table[i] = { Takes: loopEnd - loopStart, PerCallRequestAverage: temp[i] }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length,
        PerCallRequestAverage: temp.reduce((prev, curr) => prev + curr, 0) / temp.length
    };

    console.log(`No Validation HASH createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchBatchNoValHASHCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof NoValidationHASHBenchSchema>("NoValHASHBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.createAndSave({
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"]
            }))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`No Validation HASH Batch createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}
//#endregion redis-OM Clone

//#region All Types
export async function benchFullJSONCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof FullJSONBenchSchema>("FullJSONBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"],
                aNumberArray: [1, 2, 3, 4, 5],
                anObject: {
                    aBooleanArray: [false, true, false],
                    anotherObject: {
                        aTextArray: ["Lovely", "Full Text", "Search"]
                    }
                },
                aTuple: ["A", "B", 3],
                // In this test they will reference themselves just for my sake
                aReference: [`Nekdis:FullJSONBench:${j}`]
            })

            const end = performance.now();
            temp[i].push(end - start);
        }
        const loopEnd = performance.now();

        temp[i] = temp[i].reduce((prev, curr) => prev + curr, 0) / temp[i].length;
        table[i] = { Takes: loopEnd - loopStart, PerCallRequestAverage: temp[i] }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length,
        PerCallRequestAverage: temp.reduce((prev, curr) => prev + curr, 0) / temp.length
    };

    console.log(`FullJSON createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchBatchFullJSONCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof FullJSONBenchSchema>("FullJSONBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"],
                anObject: {
                    aBooleanArray: [false, true, false],
                    anotherObject: {
                        aTextArray: ["Lovely", "Full Text", "Search"]
                    }
                },
                aTuple: ["A", "B", 3],
                // In this test they will reference themselves just for my sake
                aReference: [`Nekdis:FullJSONBench:${j}`]
            }))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`FullJSON Batch createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchFullHASHCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof FullHASHBenchSchema>("FullHASHBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"],
                aNumberArray: [3, 3, 5],
                anObject: {
                    aBooleanArray: [false, true, false],
                    anotherObject: {
                        aTextArray: ["Lovely", "Full Text", "Search"]
                    }
                },
                aTuple: ["A", "B", 3],
                // In this test they will reference themselves just for my sake
                aReference: [`Nekdis:FullHASHBench:${j}`]
            })

            const end = performance.now();
            temp[i].push(end - start);
        }
        const loopEnd = performance.now();

        temp[i] = temp[i].reduce((prev, curr) => prev + curr, 0) / temp[i].length;
        table[i] = { Takes: loopEnd - loopStart, PerCallRequestAverage: temp[i] }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length,
        PerCallRequestAverage: temp.reduce((prev, curr) => prev + curr, 0) / temp.length
    };

    console.log(`FullHASH createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchBatchFullHASHCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof FullHASHBenchSchema>("FullHASHBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"],
                anObject: {
                    aBooleanArray: [false, true, false],
                    anotherObject: {
                        aTextArray: ["Lovely", "Full Text", "Search"]
                    }
                },
                aTuple: ["A", "B", 3],
                // In this test they will reference themselves just for my sake
                aReference: [`Nekdis:FullHASHBench:${j}`]
            }))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`FullHASH Batch createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}
export async function benchNoValFullJSONCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof NoValidationFullJSONBenchSchema>("NoValFullJSONBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"],
                aNumberArray: [1, 2, 3, 4, 5],
                anObject: {
                    aBooleanArray: [false, true, false],
                    anotherObject: {
                        aTextArray: ["Lovely", "Full Text", "Search"]
                    }
                },
                aTuple: ["A", "B", 3],
                // In this test they will reference themselves just for my sake
                aReference: [`Nekdis:FullJSONBench:${j}`]
            })

            const end = performance.now();
            temp[i].push(end - start);
        }
        const loopEnd = performance.now();

        temp[i] = temp[i].reduce((prev, curr) => prev + curr, 0) / temp[i].length;
        table[i] = { Takes: loopEnd - loopStart, PerCallRequestAverage: temp[i] }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length,
        PerCallRequestAverage: temp.reduce((prev, curr) => prev + curr, 0) / temp.length
    };

    console.log(`No Validation FullJSON createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchBatchNoValFullJSONCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof NoValidationFullJSONBenchSchema>("NoValFullJSONBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"],
                anObject: {
                    aBooleanArray: [false, true, false],
                    anotherObject: {
                        aTextArray: ["Lovely", "Full Text", "Search"]
                    }
                },
                aTuple: ["A", "B", 3],
                // In this test they will reference themselves just for my sake
                aReference: [`Nekdis:FullJSONBench:${j}`]
            }))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`No Validation FullJSON Batch createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchNoValFullHASHCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof NoValidationFullHASHBenchSchema>("NoValFullHASHBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"],
                anObject: {
                    aBooleanArray: [false, true, false],
                    anotherObject: {
                        aTextArray: ["Lovely", "Full Text", "Search"]
                    }
                },
                aTuple: ["A", "B", 3],
                // In this test they will reference themselves just for my sake
                aReference: [`Nekdis:FullHASHBench:${j}`]
            })

            const end = performance.now();
            temp[i].push(end - start);
        }
        const loopEnd = performance.now();

        temp[i] = temp[i].reduce((prev, curr) => prev + curr, 0) / temp[i].length;
        table[i] = { Takes: loopEnd - loopStart, PerCallRequestAverage: temp[i] }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length,
        PerCallRequestAverage: temp.reduce((prev, curr) => prev + curr, 0) / temp.length
    };

    console.log(`No Validation FullHASH createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}

export async function benchBatchNoValFullHASHCreateAndSave(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof NoValidationFullHASHBenchSchema>("NoValFullHASHBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.createAndSave({
                $id: j,
                aString: "ABC",
                aNumber: 3,
                aBoolean: true,
                someText: "Full Text",
                aDate: new Date(),
                aPoint: { longitude: 139.7745, latitude: 35.7023 },
                aStringArray: ["A", "B", "C"],
                anObject: {
                    aBooleanArray: [false, true, false],
                    anotherObject: {
                        aTextArray: ["Lovely", "Full Text", "Search"]
                    }
                },
                aTuple: ["A", "B", 3],
                // In this test they will reference themselves just for my sake
                aReference: [`Nekdis:FullHASHBench:${j}`]
            }))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`No Validation FullHASH Batch createAndSave\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.raw.flushAll();
}
//#endregion All Types