import { HASHDocument, JSONDocument } from "../document";

import type { Document } from "../typings";

export class ReferenceArray extends Array<string> {
    public reference(...recordOrDoc: Array<string | Document>): this {
        for (let i = 0, len = recordOrDoc.length; i < len; i++) {
            const tempVal = recordOrDoc[i];
            const tempId = tempVal instanceof JSONDocument || tempVal instanceof HASHDocument ? tempVal.$recordId : tempVal;
            if (this.includes(tempId)) continue;
            this.push(tempId);
        }
        return this;
    }
}