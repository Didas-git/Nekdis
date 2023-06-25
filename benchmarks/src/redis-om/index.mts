import { client } from "./setup.mjs";
import {
    benchBatchJSONSave,
    benchBatchHASHSave,
    benchJSONSave,
    benchHASHSave
} from "./save.mjs";
import {
    benchBatchJSONFetch,
    benchBatchHASHFetch,
    benchJSONFetch,
    benchHASHFetch
} from "./fetch.mjs";

export async function main(iter: number, amt: number) {
    //#region save
    await benchJSONSave(iter, amt);
    await benchHASHSave(iter, amt);

    await benchBatchJSONSave(iter, amt);
    await benchBatchHASHSave(iter, amt);

    //#endregion save
    //#region fetch
    await benchJSONFetch(iter, amt);
    await benchHASHFetch(iter, amt);

    await benchBatchJSONFetch(iter, amt);
    await benchBatchHASHFetch(iter, amt);
    //#endregion fetch

    await client.flushAll();

    await client.disconnect();
}