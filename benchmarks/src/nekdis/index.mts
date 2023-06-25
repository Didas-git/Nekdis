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
    benchHASHCreateAndSave,
} from "./createAndSave.mjs";

export async function main(iter: number, amt: number) {
    // With Validation
    await benchJSONCreateAndSave(iter, amt);
    await benchHASHCreateAndSave(iter, amt);

    await benchBatchJSONCreateAndSave(iter, amt);
    await benchBatchHASHCreateAndSave(iter, amt);

    await benchFullJSONCreateAndSave(iter, amt);
    await benchFullHASHCreateAndSave(iter, amt);

    await benchBatchFullJSONCreateAndSave(iter, amt);
    await benchBatchFullHASHCreateAndSave(iter, amt);

    // Without Validation
    await benchNoValJSONCreateAndSave(iter, amt);
    await benchNoValHASHCreateAndSave(iter, amt);

    await benchBatchNoValJSONCreateAndSave(iter, amt);
    await benchBatchNoValHASHCreateAndSave(iter, amt);

    await benchNoValFullJSONCreateAndSave(iter, amt)
    await benchNoValFullHASHCreateAndSave(iter, amt)

    await benchBatchNoValFullJSONCreateAndSave(iter, amt);
    await benchBatchNoValFullHASHCreateAndSave(iter, amt);

    await client.disconnect();
}