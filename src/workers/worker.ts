import { parentPort } from "node:worker_threads";

import { deepMerge, getLastKeyInSchema, jsonFieldToDoc, stringToArray, stringToHashArray, stringToHashField, stringsToObject } from "../document/document-helpers";
import { ReferenceArray } from "../utils";

import type { WorkerIdleResponse, WorkerResultResponse } from "./load-balancer";
import type { ObjectField, ParseSchema } from "../typings";

function populate(schema: ParseSchema<any>): Record<string, any> {
    const obj: Record<string, any> = {};
    for (let i = 0, entries = Object.entries(schema.data), len = entries.length; i < len; i++) {
        const [key, value] = entries[i];
        obj[key] = value.default ?? (value.type === "object" ? {} : value.type === "tuple" ? [] : void 0);
    }

    for (let i = 0, keys = Object.keys(schema.references), len = keys.length; i < len; i++) {
        const key = keys[i];
        obj[key] = new ReferenceArray();
    }

    return obj;
}

parentPort?.on("message", ({
    type,
    schema,
    data,
    validate,
    wasAutoFetched
}) => {
    const obj = populate(schema);

    if (type === "HASH") {
        for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            const arr = key.split(".");

            if (arr.length > 1) /* This is an object or tuple */ {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (schema.data[arr[0]]?.type === "tuple") {
                    // var name
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const temp = arr.shift()!;

                    if (arr.length === 1) {
                        obj[temp].push(stringToHashField(
                            schema.data[temp].elements[arr[0]],
                            <string>value
                        ));

                        continue;
                    }

                    obj[temp].push(stringToHashArray(arr, schema.data[temp].elements, <string>value));
                } else /*we assume its an object*/ {
                    obj[arr[0]] = deepMerge(
                        obj[arr[0]],
                        stringsToObject(
                            arr,
                            stringToHashField(
                                getLastKeyInSchema(<Required<ObjectField>>schema.data[arr[0]], <string>arr.at(-1)) ?? { type: "string" },
                                <string>value
                            )
                        )[arr[0]]
                    );
                }
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (schema.references[key] === null && !wasAutoFetched) {
                obj[key] = new ReferenceArray(...<Array<string>>stringToHashField({ type: "array" }, <string>value));
                continue;
            }

            obj[key] = stringToHashField(<never>schema.data[key], <string>value);
        }

        parentPort?.postMessage({
            eventType: "result",
            id: `${obj.$global_prefix}:${obj.$prefix}:${obj.$model_name}:${obj.$suffix ? `${obj.$suffix}:` : ""}${obj.$id}`,
            type,
            schema,
            data: obj,
            validate,
            wasAutoFetched
        } satisfies WorkerResultResponse);
        parentPort?.postMessage({ eventType: "idle" } satisfies WorkerIdleResponse);
    } else {
        for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
            const [key, value] = entries[i];
            const arr = key.split(".");

            if (arr.length > 1) /* This is a tuple */ {

                // var name
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const temp = arr.shift()!;

                if (arr.length === 1) {
                    obj[temp].push(value);
                    continue;
                }

                obj[temp].push(stringToArray(arr, schema.data[temp].elements, <string>value));
                continue;
            }

            if (typeof schema.data[key] !== "undefined") {
                obj[key] = jsonFieldToDoc(<never>schema.data[key], value);
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (schema.references[key] === null && !wasAutoFetched) {
                obj[key] = new ReferenceArray(...<Array<string>>value);
                continue;
            }

            obj[key] = value;
        }

        parentPort?.postMessage({
            eventType: "result",
            id: `${obj.$global_prefix}:${obj.$prefix}:${obj.$model_name}:${obj.$suffix ? `${obj.$suffix}:` : ""}${obj.$id}`,
            type,
            schema,
            data: obj,
            validate,
            wasAutoFetched
        } satisfies WorkerResultResponse);
        parentPort?.postMessage({ eventType: "idle" } satisfies WorkerIdleResponse);
    }
});