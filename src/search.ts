import { Document } from "./document";
import { type SearchField, StringField, NumberField, BooleanField, TextField, DateField, PointField } from "./utils/search-builders";
import type { SearchOptions, SearchReply } from "redis";
import type { FieldTypes, RedisClient, MapSearchField, ParseSchema, ParseSearchSchema, BaseField, ParsedMap, MapSchema } from "./typings";
import { extractIdFromRecord } from "./utils/extract-id";

export type SearchReturn<T extends Search<ParseSchema<any>>> = Omit<T, "where" | "and" | "or" | "rawQuery" | `sort${string}` | `return${string}`>;
export type SearchSortReturn<T extends Search<ParseSchema<any>>> = Omit<T, `sort${string}`>;

export class Search<T extends ParseSchema<any>, P extends ParseSearchSchema<T> = ParseSearchSchema<T>> {
    readonly #client: RedisClient;
    readonly #schema: T;
    readonly #parsedSchema: ParsedMap;
    readonly #index: string;
    readonly #validate: boolean;
    #workingType!: FieldTypes["type"];

    /**
     * LIMIT defaults to 0 10
     * SORTBY DIRECTION defaults to ASC
    */
    #options: SearchOptions = {};

    /** @internal */
    public _query: Array<SearchField<T>> = [];

    public constructor(client: RedisClient, schema: T, parsedSchema: ParsedMap, searchIndex: string, validate: boolean = true) {
        this.#client = client;
        this.#schema = schema;
        this.#parsedSchema = parsedSchema;
        this.#index = searchIndex;
        this.#validate = validate;
    }

    public where<F extends keyof P>(field: F): MapSearchField<F, T, P> {
        return this.#createWhere(field);
    }

    public and<F extends keyof P>(field: F): MapSearchField<F, T, P> {
        return this.#createWhere(field);
    }

    public or(value: unknown): this {
        if (this.#workingType === "string" || this.#workingType === "boolean" || this.#workingType === "text") {
            this._query.at(-1)?.or.push(value);
        }

        return this;
    }

    // else(_value: unknown) {

    // }

    public sortBy<F extends keyof P>(field: F, order: "ASC" | "DESC" = "ASC"): SearchSortReturn<this> {
        this.#options.SORTBY = { BY: <string>field, DIRECTION: order };
        return <never>this;
    }

    public sortAsc<F extends keyof P>(field: F): SearchSortReturn<this> {
        return this.sortBy(field);
    }

    public sortAscending<F extends keyof P>(field: F): SearchSortReturn<this> {
        return this.sortBy(field);
    }

    public sortDesc<F extends keyof P>(field: F): SearchSortReturn<this> {
        return this.sortBy(field, "DESC");
    }

    public sortDescending<F extends keyof P>(field: F): SearchSortReturn<this> {
        return this.sortBy(field, "DESC");
    }

    public async count(): Promise<number> {
        this.#options.LIMIT = { from: 0, size: 0 };
        return (await this.#search()).total;
    }

    public async page(offset: number, count: number): Promise<Array<Document<T> & MapSchema<T>>> {
        const docs = [];
        const { documents } = await this.#search({ LIMIT: { from: offset, size: count } });

        for (let j = 0, len = documents.length; j < len; j++) {
            const doc = documents[j];
            docs.push(new Document(this.#schema, extractIdFromRecord(doc.id), doc.value, this.#validate));
        }

        return <never>docs;
    }

    public async pageOfIds(offset: number, count: number, withRecord: boolean = false): Promise<Array<string>> {
        const docs: Array<string> = [];
        const { documents } = await this.#search({ LIMIT: { from: offset, size: count } }, true);

        for (let j = 0, len = documents.length; j < len; j++) {
            const doc = documents[j];
            docs.push(withRecord ? doc.id : extractIdFromRecord(doc.id));
        }

        return docs;
    }

    public async first(): Promise<Document<T> & MapSchema<T>> {
        return (await this.page(0, 1))[0];
    }

    public async firstId(withRecord: boolean = false): Promise<string> {
        return (await this.pageOfIds(0, 1, withRecord))[0];
    }

    public async min<F extends keyof P>(field: F): Promise<Document<T> & MapSchema<T>> {
        return await this.sortBy(field, "ASC").first();
    }

    public async minId<F extends keyof P>(field: F): Promise<string> {
        return await this.sortBy(field, "ASC").firstId();
    }

    public async max<F extends keyof P>(field: F): Promise<Document<T> & MapSchema<T>> {
        return await this.sortBy(field, "DESC").first();
    }

    public async maxId<F extends keyof P>(field: F): Promise<string> {
        return await this.sortBy(field, "DESC").firstId();
    }

    public async all(): Promise<Array<Document<T> & MapSchema<T>>> {
        const docs = [];
        const { size, idx } = this.#parseNum((await this.#search({ LIMIT: { from: 0, size: 0 } })).total);

        for (let i = 0, from = 0; i < idx; i++) {
            const { documents } = await this.#search({ LIMIT: { from, size } });

            for (let j = 0, len = documents.length; j < len; j++) {
                const doc = documents[j];
                docs.push(new Document(this.#schema, extractIdFromRecord(doc.id), doc.value, this.#validate));
            }

            from += size;
        }

        return <never>docs;
    }

    public async allIds(withRecord: boolean = false): Promise<Array<string>> {
        const docs: Array<string> = [];
        const { size, idx } = this.#parseNum((await this.#search({ LIMIT: { from: 0, size: 0 } })).total);

        for (let i = 0, from = 0; i < idx; i++) {
            const { documents } = await this.#search({ LIMIT: { from, size } }, true);

            for (let j = 0, len = documents.length; j < len; j++) {
                const doc = documents[j];
                docs.push(withRecord ? doc.id : extractIdFromRecord(doc.id));
            }

            from += size;
        }

        return docs;
    }

    public async returnCount(): Promise<number> {
        return this.count();
    }

    public async returnAll(): Promise<Array<Document<T> & MapSchema<T>>> {
        return await this.all();
    }

    public async returnAllIds(withRecord: boolean = false): Promise<Array<string>> {
        return await this.allIds(withRecord);
    }

    public async returnPage(offset: number, count: number): Promise<Array<Document<T> & MapSchema<T>>> {
        return <never>await this.page(offset, count);
    }

    public async returnPageOfIds(offset: number, count: number, withRecord: boolean = false): Promise<Array<string>> {
        return await this.pageOfIds(offset, count, withRecord);
    }

    public async returnFirst(): Promise<Document<T> & MapSchema<T>> {
        return await this.first();
    }

    public async returnFirstId(withRecord: boolean = false): Promise<string> {
        return await this.firstId(withRecord);
    }

    public async returnMin<F extends keyof P>(field: F): Promise<Document<T> & MapSchema<T>> {
        return await this.min(field);
    }

    public async returnMinId<F extends keyof P>(field: F): Promise<string> {
        return await this.minId(field);
    }

    public async returnMax<F extends keyof P>(field: F): Promise<Document<T> & MapSchema<T>> {
        return await this.max(field);
    }

    public async returnMaxId<F extends keyof P>(field: F): Promise<string> {
        return await this.maxId(field);
    }

    async #search(options?: SearchOptions, keysOnly: boolean = false): Promise<SearchReply> {
        options = { ...this.#options, ...options };
        if (keysOnly) options.RETURN = [];
        return await this.#client.ft.search(this.#index, this.#buildQuery(), options);
    }

    #buildQuery(): string {
        let query = "";
        for (let i = 0, len = this._query.length; i < len; i++) {
            const queryPart = this._query[i];
            query += `${queryPart} `;
        }
        return query;
    }

    #createWhere<F extends keyof P>(field: F): MapSearchField<F, T, P> {
        if (typeof field !== "string") throw new PrettyError();

        const parsedField = this.#parsedSchema.get(field);
        if (!parsedField) throw new PrettyError(`'${field}' doesn't exist on the schema`);

        const { path, value } = parsedField;

        return <never>this.#defineReturn(path, value.type === "array" ? value.elements ?? "string" : value.type);
    }

    #defineReturn(field: string, type: Exclude<FieldTypes["type"], "array" | "reference">): BaseField {
        switch (type) {
            case "string": {
                this.#workingType = "string";
                return <never>new StringField<T>(this, field);
            }
            case "number": {
                this.#workingType = "number";
                return <never>new NumberField<T>(this, field);
            }
            case "boolean": {
                this.#workingType = "boolean";
                return <never>new BooleanField<T>(this, field);
            }
            case "text": {
                this.#workingType = "text";
                return <never>new TextField<T>(this, field);
            }
            case "date": {
                this.#workingType = "date";
                return <never>new DateField<T>(this, field);
            }
            case "point": {
                this.#workingType = "point";
                return <never>new PointField<T>(this, field);
            }
            case "object": { throw new Error('Not implemented yet: "object" case'); }
        }
    }

    #parseNum(num: number): {
        size: number,
        idx: number
    } {
        let size = 100;
        if (num < 100) return { size, idx: 1 };
        if (num > 1000) size = 300;
        return {
            size,
            idx: Math.ceil(num / size)
        };
    }

    public get rawQuery(): string {
        return this.#buildQuery();
    }

    public get return(): SearchReturn<this> {
        return <never>this;
    }
}