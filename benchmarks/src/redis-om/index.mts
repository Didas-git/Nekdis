import { client } from "./setup.mjs";
import {
    benchBatchJSONSave,
    benchBatchHASHSave,
    benchJSONSave,
    benchHASHSave,
} from "./save.mjs";

export async function main(iter: number, amt: number) {
    await benchJSONSave(iter, amt);
    await benchHASHSave(iter, amt);

    await benchBatchJSONSave(iter, amt);
    await benchBatchHASHSave(iter, amt);

    await client.disconnect();
}