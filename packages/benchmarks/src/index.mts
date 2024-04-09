const ITER = parseInt(process.argv[2]) || 15;
const AMT = parseInt(process.argv[3]) || 1000;
const SPV = typeof process.argv[4] === "boolean" ? process.argv[4] : false;

await (await import("./nekdis/index.mjs")).main(ITER, AMT, SPV);
await (await import("./redis-om/index.mjs")).main(ITER, AMT, SPV);