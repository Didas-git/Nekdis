import { client } from "../../../dist/index.js";
import { promisify } from "node:util";


import type {
    FullJSONBenchSchema,
    FullHASHBenchSchema,
    JSONBenchSchema,
    HASHBenchSchema,
} from "./setup.mjs";

const sleep = promisify(setTimeout);

export async function benchJSONPage(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof JSONBenchSchema>("JSONBench");
    await model.createIndex();
    // Let redisearch do its thing
    await sleep(20000);
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const loopStart = performance.now()

        await model.search().returnPage(0, amt)

        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`JSON page\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchHASHPage(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof HASHBenchSchema>("HASHBench");
    await model.createIndex();
    // Let redisearch do its thing
    await sleep(20000);
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const loopStart = performance.now()

        await model.search().returnPage(0, amt)

        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`HASH page\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchFullJSONPage(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof FullJSONBenchSchema>("FullJSONBench");
    await model.createIndex();
    // Let redisearch do its thing
    await sleep(20000);
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const loopStart = performance.now()

        await model.search().returnPage(0, amt)

        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`FullJSON page\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchFullHASHPage(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof FullHASHBenchSchema>("FullHASHBench");
    await model.createIndex();
    // Let redisearch do its thing
    await sleep(20000);
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const loopStart = performance.now()

        await model.search().returnPage(0, amt)

        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`FullHASH page\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}