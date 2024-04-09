import { benchHASHPage, benchJSONPage } from "./page.mjs";
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

export async function main(iter: number, amt: number, spv: boolean) {
    //#region save
    await benchJSONSave(iter, amt);
    await benchHASHSave(iter, amt);

    await benchBatchJSONSave(iter, amt);
    await benchBatchHASHSave(iter, amt);

    //Reasons...
    await client.flushAll()

    //#endregion save

    // We need data for the next tests
    await benchBatchJSONSave(1, amt);
    await benchBatchHASHSave(1, amt);

    //#region fetch
    await benchJSONFetch(iter, amt);
    await benchHASHFetch(iter, amt);

    await benchBatchJSONFetch(iter, amt);
    await benchBatchHASHFetch(iter, amt);
    //#endregion fetch
    //#region page
    await benchJSONPage(iter, spv ? amt : amt > 10000 ? 10000 : amt);
    await benchHASHPage(iter, spv ? amt : amt > 10000 ? 10000 : amt);
    //#endregion page

    await client.flushAll();

    await client.disconnect();
}