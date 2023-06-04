/* eslint-disable @typescript-eslint/naming-convention */
import { randomUUID } from "node:crypto";

import {
    validateSchemaReferences,
    validateSchemaData,
    tupleToObjStrings,
    dateToNumber
} from "./document-helpers";

import type { DocumentShared, ParseSchema } from "../typings";

export class JSONDocument implements DocumentShared {

    readonly #schema: ParseSchema<any>;
    readonly #validate: boolean;
    readonly #autoFetch: boolean;
    #validateSchemaReferences = validateSchemaReferences;
    #validateSchemaData = validateSchemaData;

    public readonly $global_prefix: string;
    public readonly $prefix: string;
    public readonly $model_name: string;
    public readonly $suffix: string | undefined;
    public readonly $id: string;
    public readonly $record_id: string;

    /*
    * Using any so everything works as intended
    * I couldn't find any other way to do this or implement the MapSchema type directly in the class
    */
    /** @internal */
    [key: string]: any;

    public constructor(
        schema: ParseSchema<any>,
        record?: {
            globalPrefix: string,
            prefix: string,
            name: string,
            suffix?: string | (() => string) | undefined,
            id?: string | undefined
        },
        data?: Record<string, any>,
        validate: boolean = true,
        wasAutoFetched: boolean = false
    ) {
        this.$global_prefix = data?.$global_prefix ?? record?.globalPrefix;
        this.$prefix = data?.$prefix ?? record?.prefix;
        this.$model_name = data?.$model_name ?? record?.name;
        this.$suffix = data?.$suffix ?? (typeof record?.suffix === "function" ? record.suffix() : record?.suffix);
        this.$id = data?.$id ?? record?.id ?? randomUUID();
        this.$record_id = `${this.$global_prefix}:${this.$prefix}:${this.$model_name}:${this.$suffix ? `${this.$suffix}:` : ""}${this.$id}`;
        this.#schema = schema;
        this.#validate = validate;
        this.#autoFetch = wasAutoFetched;

        if (data) {
            for (let i = 0, entries = Object.entries(data), len = entries.length; i < len; i++) {
                const [key, value] = entries[i];
                if (key.startsWith("$")) continue;
                this[key] = value;
            }
        }
    }

    public toString(): string {
        if (this.#validate) this.#validateSchemaData(this.#schema.data);

        const obj: Record<string, unknown> = {
            $global_prefix: this.$global_prefix,
            $prefix: this.$prefix,
            $model_name: this.$model_name,
            $suffix: this.$suffix,
            $id: this.$id
        };

        for (let i = 0, entries = Object.entries(this.#schema.data), len = entries.length; i < len; i++) {
            const [key, val] = entries[i];

            if (val.type === "tuple") {
                const temp = tupleToObjStrings(<never>this[key], key);
                for (let j = 0, le = temp.length; j < le; j++) {
                    const [k, value] = Object.entries(temp[j])[0];
                    obj[k] = value;
                }
                continue;
            } else if (val.type === "date") {
                obj[key] = dateToNumber(this[key]);
                continue;
                //@ts-expect-error elements exists but again ts is confused
            } else if (val.type === "array" && val.elements === "date") {
                const temp = this[key];
                for (let j = 0, le = temp.length; j < le; j++) {
                    temp[j] = dateToNumber(temp[j]);
                }
                obj[key] = temp;
                continue;
            }

            obj[key] = this[key];
        }

        if (!this.#autoFetch) {
            if (this.#validate) this.#validateSchemaReferences(this.#schema.references);
            for (let i = 0, keys = Object.keys(this.#schema.references), len = keys.length; i < len; i++) {
                const key = keys[i];
                obj[key] = this[key];
            }
        }

        return JSON.stringify(obj, null);
    }
}