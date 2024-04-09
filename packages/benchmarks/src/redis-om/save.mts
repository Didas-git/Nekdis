import { EntityId } from "redis-om";
import { client, JSONRepository, HASHRepository } from "./setup.mjs";

export async function benchJSONSave(iter: number, amt: number): Promise<void> {
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await JSONRepository.save({
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

    console.log(`JSON save\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.flushAll();
}

export async function benchBatchJSONSave(iter: number, amt: number): Promise<void> {
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(JSONRepository.save({
                [EntityId]: j.toString(),
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

    console.log(`JSON Batch save\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchHASHSave(iter: number, amt: number): Promise<void> {
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await HASHRepository.save({
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

    console.log(`HASH save\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);

    await client.flushAll();
}

export async function benchBatchHASHSave(iter: number, amt: number): Promise<void> {
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(HASHRepository.save({
                [EntityId]: j.toString(),
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

    console.log(`HASH Batch save\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}