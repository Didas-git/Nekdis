import { Document } from "./document";
import { type SearchField, StringField, NumberField, BooleanField, TextField, DateField, PointField } from "./utils/search-builders";
import type { SearchOptions, SearchReply } from "redis";
import type { FieldTypes, RedisClient, MapSearchField, ParseSchema, ParseSearchSchema, BaseField, ParsedMap, MapSchema } from "./typings";

export type SearchReturn = Omit<Search<ParseSchema<any>>, "where" | "and" | "or" | "rawQuery" | `sort${string}` | `return${string}`>;
export type SearchSortReturn = Omit<Search<ParseSchema<any>>, `sort${string}`>;

export class Search<T extends ParseSchema<any>, P extends ParseSearchSchema<T> = ParseSearchSchema<T>> {
    readonly #client: RedisClient;
    readonly #schema: T;
    readonly #parsedSchema: ParsedMap;
    readonly #index: string;
    #workingType!: FieldTypes["type"];

    /**
     * LIMIT defaults to 0 10
     * SORTBY DIRECTION defaults to ASC
    */
    #options: SearchOptions = {};

    /** @internal */
    public _query: Array<SearchField<T>> = [];

    public constructor(client: RedisClient, schema: T, parsedSchema: ParsedMap, searchIndex: string) {
        this.#client = client;
        this.#schema = schema;
        this.#parsedSchema = parsedSchema;
        this.#index = searchIndex;
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

    public sortBy(field: string, order: "ASC" | "DESC" = "ASC"): SearchSortReturn {
        this.#options.SORTBY = { BY: field, DIRECTION: order };
        return <never>this;
    }

    public sortAsc(field: string): SearchSortReturn {
        return this.sortBy(field);
    }

    public sortAscending(field: string): SearchSortReturn {
        return this.sortBy(field);
    }

    public sortDesc(field: string): SearchSortReturn {
        return this.sortBy(field, "DESC");
    }

    public sortDescending(field: string): SearchSortReturn {
        return this.sortBy(field, "DESC");
    }

    public async count(): Promise<number> {
        this.#options.LIMIT = { from: 0, size: 0 };
        return (await this.#search()).total;
    }

    public async returnCount(): Promise<number> {
        return this.count();
    }

    public async page(offset: number, count: number): Promise<Array<Document<T> & MapSchema<T>>> {
        return <never>await this.#search({ LIMIT: { from: offset, size: count } });
    }

    public async returnPage(offset: number, count: number): Promise<Array<Document<T> & MapSchema<T>>> {
        return <never>await this.page(offset, count);
    }

    public async all(): Promise<Array<Document<T> & MapSchema<T>>> {
        const things = [];
        const { size, idx } = this.#parseNum((await this.#search({ LIMIT: { from: 0, size: 0 } })).total);

        for (let i = 0, from = 0; i < idx; i++) {
            const { documents } = await this.#search({ LIMIT: { from, size } });

            for (let j = 0, len = documents.length; j < len; j++) {
                const doc = documents[j];
                things.push(new Document(this.#schema, (/:(.+)/).exec(doc.id)?.[1] ?? doc.id, doc.value));
            }

            from += size;
        }

        return <never>things;
    }

    public async returnAll(): Promise<Array<Document<T> & MapSchema<T>>> {
        return this.all();
    }

    async #search(options?: SearchOptions, keysOnly = true): Promise<SearchReply> {
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

        return <never>this.#defineReturn(field, parsedField.value.type === "array" ? parsedField.value.elements ?? "string" : parsedField.value.type);
    }

    #defineReturn(field: string, type: Exclude<FieldTypes["type"], "array">): BaseField {
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

    public get return(): SearchReturn {
        return <never>this;
    }
}