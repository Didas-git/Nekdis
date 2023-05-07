import { Document } from "../document";

import type { ParseSchema } from "../typings";

export class ReferenceArray extends Array<string> {
    public reference(...recordOrDoc: Array<string | Document<ParseSchema<any>>>): this {
        for (let i = 0, len = recordOrDoc.length; i < len; i++) {
            const tempVal = recordOrDoc[i];
            const tempId = tempVal instanceof Document ? tempVal.$record_id : tempVal;
            if (this.includes(tempId)) continue;
            this.push(tempId);
        }
        return this;
    }
}