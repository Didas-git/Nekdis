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
                aNumberArray: [1, 2, 3],
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
                aNumberArray: [1, 2, 3],
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
                aNumberArray: [1, 2, 3],
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
                aNumberArray: [1, 2, 3],
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
                string: "s",
                number: 3,
                boolean: true,
                date: Date.now(),
                point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                bigint: 1n,
                text: "some text",
                vector: [3, 2, 4],
                stringArray: ["a", "b", "c"],
                numberArray: [1, 2, 3],
                booleanArray: [true, false, true],
                dateArray: [Date.now(), Date.now(), Date.now()],
                objectArray: [{ a: 2 }],
                pointArray: [
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                ],
                bigintArray: [1n, 2n, 3n],
                textArray: ["this is a", "this is b", "this is c"],
                vectorArray: [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                object: {
                    string: "s",
                    number: 3,
                    boolean: true,
                    date: Date.now(),
                    point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    bigint: 1n,
                    text: "some text",
                    vector: [3, 2, 4],
                    stringArray: ["a", "b", "c"],
                    numberArray: [1, 2, 3],
                    booleanArray: [true, false, true],
                    dateArray: [Date.now(), Date.now(), Date.now()],
                    pointArray: [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    bigintArray: [1n, 2n, 3n],
                    textArray: ["this is a", "this is b", "this is c"],
                    vectorArray: [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                    nestedObject: {
                        nestedTuple: [true]
                    }
                },
                tuple: [
                    "s",
                    3,
                    true,
                    Date.now(),
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    1n,
                    "some text",
                    [3, 2, 4],
                    ["a", "b", "c"],
                    [1, 2, 3],
                    [true, false, true],
                    [Date.now(), Date.now(), Date.now()],
                    [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    [1n, 2n, 3n],
                    ["this is a", "this is b", "this is c"],
                    [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                    ["a", 1],
                    { a: true }
                ],
                reference: [`Nekdis:FullJSONBench:${j}`]
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
                string: "s",
                number: 3,
                boolean: true,
                date: Date.now(),
                point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                bigint: 1n,
                text: "some text",
                vector: [3, 2, 4],
                stringArray: ["a", "b", "c"],
                numberArray: [1, 2, 3],
                booleanArray: [true, false, true],
                dateArray: [Date.now(), Date.now(), Date.now()],
                objectArray: [{ a: 2 }],
                pointArray: [
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                ],
                bigintArray: [1n, 2n, 3n],
                textArray: ["this is a", "this is b", "this is c"],
                vectorArray: [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                object: {
                    string: "s",
                    number: 3,
                    boolean: true,
                    date: Date.now(),
                    point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    bigint: 1n,
                    text: "some text",
                    vector: [3, 2, 4],
                    stringArray: ["a", "b", "c"],
                    numberArray: [1, 2, 3],
                    booleanArray: [true, false, true],
                    dateArray: [Date.now(), Date.now(), Date.now()],
                    pointArray: [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    bigintArray: [1n, 2n, 3n],
                    textArray: ["this is a", "this is b", "this is c"],
                    vectorArray: [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                    nestedObject: {
                        nestedTuple: [true]
                    }
                },
                tuple: [
                    "s",
                    3,
                    true,
                    Date.now(),
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    1n,
                    "some text",
                    [3, 2, 4],
                    ["a", "b", "c"],
                    [1, 2, 3],
                    [true, false, true],
                    [Date.now(), Date.now(), Date.now()],
                    [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    [1n, 2n, 3n],
                    ["this is a", "this is b", "this is c"],
                    [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                    ["a", 1],
                    { a: true }
                ],
                reference: [`Nekdis:FullJSONBench:${j}`]
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
                string: "s",
                number: 3,
                boolean: true,
                date: Date.now(),
                point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                bigint: 1n,
                text: "some text",
                stringArray: ["a", "b", "c"],
                numberArray: [1, 2, 3],
                booleanArray: [true, false, true],
                dateArray: [Date.now(), Date.now(), Date.now()],
                objectArray: [{ a: 2 }],
                pointArray: [
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                ],
                bigintArray: [1n, 2n, 3n],
                textArray: ["this is a", "this is b", "this is c"],
                object: {
                    string: "s",
                    number: 3,
                    boolean: true,
                    date: Date.now(),
                    point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    bigint: 1n,
                    text: "some text",
                    stringArray: ["a", "b", "c"],
                    numberArray: [1, 2, 3],
                    booleanArray: [true, false, true],
                    dateArray: [Date.now(), Date.now(), Date.now()],
                    pointArray: [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    bigintArray: [1n, 2n, 3n],
                    textArray: ["this is a", "this is b", "this is c"],
                    nestedObject: {
                        nestedTuple: [true]
                    }
                },
                tuple: [
                    "s",
                    3,
                    true,
                    Date.now(),
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    1n,
                    "some text",
                    ["a", "b", "c"],
                    [1, 2, 3],
                    [true, false, true],
                    [Date.now(), Date.now(), Date.now()],
                    [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    [1n, 2n, 3n],
                    ["this is a", "this is b", "this is c"],
                    ["a", 1],
                    { a: true }
                ],
                reference: [`Nekdis:FullJSONBench:${j}`]
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
                string: "s",
                number: 3,
                boolean: true,
                date: Date.now(),
                point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                bigint: 1n,
                text: "some text",
                stringArray: ["a", "b", "c"],
                numberArray: [1, 2, 3],
                booleanArray: [true, false, true],
                dateArray: [Date.now(), Date.now(), Date.now()],
                objectArray: [{ a: 2 }],
                pointArray: [
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                ],
                bigintArray: [1n, 2n, 3n],
                textArray: ["this is a", "this is b", "this is c"],
                object: {
                    string: "s",
                    number: 3,
                    boolean: true,
                    date: Date.now(),
                    point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    bigint: 1n,
                    text: "some text",
                    stringArray: ["a", "b", "c"],
                    numberArray: [1, 2, 3],
                    booleanArray: [true, false, true],
                    dateArray: [Date.now(), Date.now(), Date.now()],
                    pointArray: [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    bigintArray: [1n, 2n, 3n],
                    textArray: ["this is a", "this is b", "this is c"],
                    nestedObject: {
                        nestedTuple: [true]
                    }
                },
                tuple: [
                    "s",
                    3,
                    true,
                    Date.now(),
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    1n,
                    "some text",
                    ["a", "b", "c"],
                    [1, 2, 3],
                    [true, false, true],
                    [Date.now(), Date.now(), Date.now()],
                    [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    [1n, 2n, 3n],
                    ["this is a", "this is b", "this is c"],
                    ["a", 1],
                    { a: true }
                ],
                reference: [`Nekdis:FullJSONBench:${j}`]
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
                string: "s",
                number: 3,
                boolean: true,
                date: Date.now(),
                point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                bigint: 1n,
                text: "some text",
                vector: [3, 2, 4],
                stringArray: ["a", "b", "c"],
                numberArray: [1, 2, 3],
                booleanArray: [true, false, true],
                dateArray: [Date.now(), Date.now(), Date.now()],
                objectArray: [{ a: 2 }],
                pointArray: [
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                ],
                bigintArray: [1n, 2n, 3n],
                textArray: ["this is a", "this is b", "this is c"],
                vectorArray: [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                object: {
                    string: "s",
                    number: 3,
                    boolean: true,
                    date: Date.now(),
                    point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    bigint: 1n,
                    text: "some text",
                    vector: [3, 2, 4],
                    stringArray: ["a", "b", "c"],
                    numberArray: [1, 2, 3],
                    booleanArray: [true, false, true],
                    dateArray: [Date.now(), Date.now(), Date.now()],
                    pointArray: [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    bigintArray: [1n, 2n, 3n],
                    textArray: ["this is a", "this is b", "this is c"],
                    vectorArray: [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                    nestedObject: {
                        nestedTuple: [true]
                    }
                },
                tuple: [
                    "s",
                    3,
                    true,
                    Date.now(),
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    1n,
                    "some text",
                    [3, 2, 4],
                    ["a", "b", "c"],
                    [1, 2, 3],
                    [true, false, true],
                    [Date.now(), Date.now(), Date.now()],
                    [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    [1n, 2n, 3n],
                    ["this is a", "this is b", "this is c"],
                    [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                    ["a", 1],
                    { a: true }
                ],
                reference: [`Nekdis:FullJSONBench:${j}`]
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
                string: "s",
                number: 3,
                boolean: true,
                date: Date.now(),
                point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                bigint: 1n,
                text: "some text",
                vector: [3, 2, 4],
                stringArray: ["a", "b", "c"],
                numberArray: [1, 2, 3],
                booleanArray: [true, false, true],
                dateArray: [Date.now(), Date.now(), Date.now()],
                objectArray: [{ a: 2 }],
                pointArray: [
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                ],
                bigintArray: [1n, 2n, 3n],
                textArray: ["this is a", "this is b", "this is c"],
                vectorArray: [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                object: {
                    string: "s",
                    number: 3,
                    boolean: true,
                    date: Date.now(),
                    point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    bigint: 1n,
                    text: "some text",
                    vector: [3, 2, 4],
                    stringArray: ["a", "b", "c"],
                    numberArray: [1, 2, 3],
                    booleanArray: [true, false, true],
                    dateArray: [Date.now(), Date.now(), Date.now()],
                    pointArray: [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    bigintArray: [1n, 2n, 3n],
                    textArray: ["this is a", "this is b", "this is c"],
                    vectorArray: [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                    nestedObject: {
                        nestedTuple: [true]
                    }
                },
                tuple: [
                    "s",
                    3,
                    true,
                    Date.now(),
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    1n,
                    "some text",
                    [3, 2, 4],
                    ["a", "b", "c"],
                    [1, 2, 3],
                    [true, false, true],
                    [Date.now(), Date.now(), Date.now()],
                    [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    [1n, 2n, 3n],
                    ["this is a", "this is b", "this is c"],
                    [[3, 2, 4], [3, 2, 4], [3, 2, 4]],
                    ["a", 1],
                    { a: true }
                ],
                reference: [`Nekdis:FullJSONBench:${j}`]
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
                string: "s",
                number: 3,
                boolean: true,
                date: Date.now(),
                point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                bigint: 1n,
                text: "some text",
                stringArray: ["a", "b", "c"],
                numberArray: [1, 2, 3],
                booleanArray: [true, false, true],
                dateArray: [Date.now(), Date.now(), Date.now()],
                objectArray: [{ a: 2 }],
                pointArray: [
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                ],
                bigintArray: [1n, 2n, 3n],
                textArray: ["this is a", "this is b", "this is c"],
                object: {
                    string: "s",
                    number: 3,
                    boolean: true,
                    date: Date.now(),
                    point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    bigint: 1n,
                    text: "some text",
                    stringArray: ["a", "b", "c"],
                    numberArray: [1, 2, 3],
                    booleanArray: [true, false, true],
                    dateArray: [Date.now(), Date.now(), Date.now()],
                    pointArray: [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    bigintArray: [1n, 2n, 3n],
                    textArray: ["this is a", "this is b", "this is c"],
                    nestedObject: {
                        nestedTuple: [true]
                    }
                },
                tuple: [
                    "s",
                    3,
                    true,
                    Date.now(),
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    1n,
                    "some text",
                    ["a", "b", "c"],
                    [1, 2, 3],
                    [true, false, true],
                    [Date.now(), Date.now(), Date.now()],
                    [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    [1n, 2n, 3n],
                    ["this is a", "this is b", "this is c"],
                    ["a", 1],
                    { a: true }
                ],
                reference: [`Nekdis:FullJSONBench:${j}`]
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
                string: "s",
                number: 3,
                boolean: true,
                date: Date.now(),
                point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                bigint: 1n,
                text: "some text",
                stringArray: ["a", "b", "c"],
                numberArray: [1, 2, 3],
                booleanArray: [true, false, true],
                dateArray: [Date.now(), Date.now(), Date.now()],
                objectArray: [{ a: 2 }],
                pointArray: [
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                ],
                bigintArray: [1n, 2n, 3n],
                textArray: ["this is a", "this is b", "this is c"],
                object: {
                    string: "s",
                    number: 3,
                    boolean: true,
                    date: Date.now(),
                    point: { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    bigint: 1n,
                    text: "some text",
                    stringArray: ["a", "b", "c"],
                    numberArray: [1, 2, 3],
                    booleanArray: [true, false, true],
                    dateArray: [Date.now(), Date.now(), Date.now()],
                    pointArray: [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    bigintArray: [1n, 2n, 3n],
                    textArray: ["this is a", "this is b", "this is c"],
                    nestedObject: {
                        nestedTuple: [true]
                    }
                },
                tuple: [
                    "s",
                    3,
                    true,
                    Date.now(),
                    { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                    1n,
                    "some text",
                    ["a", "b", "c"],
                    [1, 2, 3],
                    [true, false, true],
                    [Date.now(), Date.now(), Date.now()],
                    [
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 },
                        { latitude: 35.69959561887533, longitude: 139.77083086508688 }
                    ],
                    [1n, 2n, 3n],
                    ["this is a", "this is b", "this is c"],
                    ["a", 1],
                    { a: true }
                ],
                reference: [`Nekdis:FullJSONBench:${j}`]
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