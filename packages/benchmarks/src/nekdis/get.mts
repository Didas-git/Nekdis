import { client } from "../../../dist/index.js";

import type {
    FullJSONBenchSchema,
    FullHASHBenchSchema,
    JSONBenchSchema,
    HASHBenchSchema,
} from "./setup.mjs";

export async function benchJSONGet(iter: number, amt: number) {
    const model = client.model<typeof JSONBenchSchema>("JSONBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.get(j);

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

    console.log(`JSON get\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchBatchJSONGet(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof JSONBenchSchema>("JSONBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.get(j))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`JSON Batch get\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchHASHGet(iter: number, amt: number) {
    const model = client.model<typeof HASHBenchSchema>("HASHBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.get(j);

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

    console.log(`HASH get\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchBatchHASHGet(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof HASHBenchSchema>("HASHBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.get(j))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`HASH Batch get\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchFullJSONGet(iter: number, amt: number) {
    const model = client.model<typeof FullJSONBenchSchema>("FullJSONBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.get(j);

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

    console.log(`FullJSON get\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchBatchFullJSONGet(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof FullJSONBenchSchema>("FullJSONBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.get(j))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`FullJSON Batch get\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchFullHASHGet(iter: number, amt: number) {
    const model = client.model<typeof FullHASHBenchSchema>("FullHASHBench");
    const table: Record<"AVG" | number, { Takes: number, PerCallRequestAverage: number }> = {} as never;

    const all = [];
    const temp = [];
    for (let i = 1; i <= iter; i++) {
        temp[i] = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            const start = performance.now();

            await model.get(j);

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

    console.log(`FullHASH get\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}

export async function benchBatchFullHASHGet(iter: number, amt: number): Promise<void> {
    const model = client.model<typeof FullHASHBenchSchema>("FullHASHBench");
    const table: Record<"AVG" | number, { Takes: number }> = {} as never;

    const all = [];
    for (let i = 1; i <= iter; i++) {
        const temp = [];
        const loopStart = performance.now()
        for (let j = 0; j < amt; j++) {
            temp.push(model.get(j))
        }
        await Promise.all(temp);
        const loopEnd = performance.now();

        table[i] = { Takes: loopEnd - loopStart }
        all.push(loopEnd - loopStart);
    }

    table.AVG = {
        Takes: all.reduce((prev, curr) => prev + curr, 0) / all.length
    };

    console.log(`FullHASH Batch get\nIterations: ${iter}\nDocuments: ${amt}`)
    console.table(table);
}