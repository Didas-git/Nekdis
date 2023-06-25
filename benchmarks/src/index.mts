const ITER = parseInt(process.argv[2]) || 15;
const AMT = parseInt(process.argv[3]) || 1000

await (await import("./nekdis/index.mjs")).main(ITER, AMT);
await (await import("./redis-om/index.mjs")).main(ITER, AMT);