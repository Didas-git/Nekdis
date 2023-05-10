import { JSONDocument, HASHDocument } from "../document";

import type { Doc } from "../typings";

export function stringOrDocToString(stringOrNumOrDoc: Array<string | number | Doc>, name: string): Array<string> {
    const temp = [];

    for (let i = 0, len = stringOrNumOrDoc.length; i < len; i++) {
        const el = stringOrNumOrDoc[i];
        temp.push(`${name}:${el instanceof JSONDocument || el instanceof HASHDocument ? el.$id : el.toString()}`);
    }

    return temp;
}