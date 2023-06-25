import "./setup.mjs";

import { client } from "../../../dist/index.js";
import { benchJSONCreateAndSave, benchBatchJSONCreateAndSave, benchHASHCreateAndSave, benchBatchHASHCreateAndSave } from "./createAndSave.mjs";

export async function main() {
    await benchJSONCreateAndSave(350000);
    await benchHASHCreateAndSave(350000);
    await client.raw.flushAll();
    await benchBatchJSONCreateAndSave(350000);
    await benchBatchHASHCreateAndSave(350000);
    await client.raw.flushAll();

    await client.disconnect();
}