import { JSONRepository, HASHRepository } from "./setup.mjs";

export async function benchJSONFetch(iter: number, amt: number) {
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await JSONRepository.fetch(j.toString());

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

    console.log(`JSON fetch\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchBatchJSONFetch(iter: number, amt: number): Promise<void> {
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(JSONRepository.fetch(j.toString()))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`JSON Batch fetch\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchHASHFetch(iter: number, amt: number) {
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await HASHRepository.fetch(j.toString());

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

    console.log(`HASH fetch\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchBatchHASHFetch(iter: number, amt: number): Promise<void> {
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(HASHRepository.fetch(j.toString()))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`HASH Batch fetch\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}