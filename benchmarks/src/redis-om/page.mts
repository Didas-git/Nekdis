import { JSONRepository, HASHRepository } from "./setup.mjs";
import { promisify } from "node:util";

const sleep = promisify(setTimeout);

export async function benchJSONPage(iter: number, amt: number): Promise<void> {
    await JSONRepository.createIndex();
    // Let redisearch do its thing
    await sleep(20000);
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const loopStart = performance.now()

        await JSONRepository.search().returnPage(0, amt)

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
    await HASHRepository.createIndex();
    // Let redisearch do its thing
    await sleep(20000);
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const loopStart = performance.now()

        await HASHRepository.search().returnPage(0, amt)

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