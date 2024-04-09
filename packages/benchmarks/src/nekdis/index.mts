import "./setup.mjs";

import { client } from "../../../dist/index.js";
import {
    benchBatchNoValFullJSONCreateAndSave,
    benchBatchNoValFullHASHCreateAndSave,
    benchBatchNoValJSONCreateAndSave,
    benchBatchNoValHASHCreateAndSave,
    benchBatchFullJSONCreateAndSave,
    benchBatchFullHASHCreateAndSave,
    benchNoValFullJSONCreateAndSave,
    benchNoValFullHASHCreateAndSave,
    benchBatchJSONCreateAndSave,
    benchBatchHASHCreateAndSave,
    benchNoValJSONCreateAndSave,
    benchNoValHASHCreateAndSave,
    benchFullJSONCreateAndSave,
    benchFullHASHCreateAndSave,
    benchJSONCreateAndSave,
    benchHASHCreateAndSave
} from "./createAndSave.mjs";
import {
    benchBatchFullJSONGet,
    benchBatchFullHASHGet,
    benchBatchJSONGet,
    benchBatchHASHGet,
    benchFullJSONGet,
    benchFullHASHGet,
    benchJSONGet,
    benchHASHGet
} from "./get.mjs";
import {
    benchFullJSONPage,
    benchFullHASHPage,
    benchJSONPage,
    benchHASHPage
} from "./page.mjs";

export async function main(iter: number, amt: number, spv: boolean) {
    //#region createAndSave
    // With Validation
    await benchJSONCreateAndSave(iter, amt);
    await benchHASHCreateAndSave(iter, amt);

    await benchBatchJSONCreateAndSave(iter, amt);
    await benchBatchHASHCreateAndSave(iter, amt);

    // Reasons...
    await client.raw.flushAll();

    await benchFullJSONCreateAndSave(iter, amt);
    await benchFullHASHCreateAndSave(iter, amt);

    await benchBatchFullJSONCreateAndSave(iter, amt);
    await benchBatchFullHASHCreateAndSave(iter, amt);

    // Reasons...
    await client.raw.flushAll();

    // Without Validation
    await benchNoValJSONCreateAndSave(iter, amt);
    await benchNoValHASHCreateAndSave(iter, amt);

    await benchBatchNoValJSONCreateAndSave(iter, amt);
    await benchBatchNoValHASHCreateAndSave(iter, amt);

    await benchNoValFullJSONCreateAndSave(iter, amt)
    await benchNoValFullHASHCreateAndSave(iter, amt)

    await benchBatchNoValFullJSONCreateAndSave(iter, amt);
    await benchBatchNoValFullHASHCreateAndSave(iter, amt);
    //#endregion createAndSave

    // We need data for the next tests
    await benchBatchJSONCreateAndSave(1, amt);
    await benchBatchHASHCreateAndSave(1, amt);
    await benchBatchFullJSONCreateAndSave(1, amt);
    await benchBatchFullHASHCreateAndSave(1, amt);

    //#region get
    await benchJSONGet(iter, amt);
    await benchHASHGet(iter, amt);

    await benchBatchJSONGet(iter, amt);
    await benchBatchHASHGet(iter, amt);

    await benchFullJSONGet(iter, amt);
    await benchFullHASHGet(iter, amt);

    await benchBatchFullJSONGet(iter, amt);
    await benchBatchFullHASHGet(iter, amt);
    //#endregion get
    //#region page
    await benchJSONPage(iter, spv ? amt : amt > 10000 ? 10000 : amt);
    await benchHASHPage(iter, spv ? amt : amt > 10000 ? 10000 : amt);

    await benchFullJSONPage(iter, spv ? amt : amt > 10000 ? 10000 : amt);
    await benchFullHASHPage(iter, spv ? amt : amt > 10000 ? 10000 : amt);
    //#endregion page
    await client.raw.flushAll();

    await client.disconnect();
}