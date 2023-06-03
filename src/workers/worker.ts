import { parentPort } from "node:worker_threads";

import { JSONDocument, HASHDocument } from "../document";

parentPort?.on("message", ({
    type,
    schema,
    data,
    isFetchedData,
    validate,
    wasAutoFetched
}) => {
    if (type === "HASH") {
        const HashData = new HASHDocument(schema, void 0, data, isFetchedData, validate, wasAutoFetched);
        parentPort?.postMessage({ eventType: "result", id: HashData.$record_id, data: HashData });
        parentPort?.postMessage({ eventType: "idle" });
    } else {
        const JsonData = new JSONDocument(schema, void 0, data, isFetchedData, validate, wasAutoFetched);
        parentPort?.postMessage({ eventType: "result", id: JsonData.$record_id, data: JsonData });
        parentPort?.postMessage({ eventType: "idle" });
    }
});