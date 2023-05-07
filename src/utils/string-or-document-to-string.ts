import type { ParseSchema } from "../typings";
import { Document } from "../document";

export function stringOrDocToString(stringOrNumOrDoc: Array<string | number | Document<ParseSchema<any>>>, name: string): Array<string> {
    const temp = [];

    for (let i = 0, len = stringOrNumOrDoc.length; i < len; i++) {
        const el = stringOrNumOrDoc[i];
        temp.push(`${name}:${el instanceof Document ? el.$id : el.toString()}`);
    }

    return temp;
}