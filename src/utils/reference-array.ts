import type { ParseSchema } from "../typings";
import { Document } from "../document";

export class ReferenceArray extends Array<string> {
    public reference(...recordOrDoc: Array<string | Document<ParseSchema<any>>>): this {
        for (let i = 0, len = recordOrDoc.length; i < len; i++) {
            const temp = recordOrDoc[i];
            this.push(temp instanceof Document ? temp.$record_id : temp);
        }
        return this;
    }
}