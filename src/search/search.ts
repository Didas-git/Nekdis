import { PrettyError } from "@infinite-fansub/logger";

import type { SearchOptions, SearchReply } from "redis";

import type { JSONDocument, HASHDocument } from "../document";

import {
    type SearchField,
    BooleanField,
    StringField,
    NumberField,
    BigIntField,
    VectorField,
    PointField,
    TextField,
    DateField
} from "./search-builders";

import type {
    SearchInformation,
    ParseSearchSchema,
    NodeRedisClient,
    FieldStringType,
    MapSearchField,
    ReturnDocument,
    ParseSchema,
    BaseField,
    ParsedMap
} from "../typings";

export type SearchReturn<T extends Search<ParseSchema<any>>> = Omit<T, "where" | "and" | "or" | "rawQuery" | `sort${string}` | `return${string}`>;
export type SearchSortReturn<T extends Search<ParseSchema<any>>> = Omit<T, `sort${string}`>;

export class Search<T extends ParseSchema<any>, P extends ParseSearchSchema<T["data"]> = ParseSearchSchema<T["data"]>> {
    readonly #client: NodeRedisClient;
    readonly #schema: T;
    readonly #parsedSchema: ParsedMap;
    readonly #information: SearchInformation;
    readonly #doc: typeof JSONDocument | typeof HASHDocument;

    /**
     * LIMIT defaults to 0 10
     * SORTBY DIRECTION defaults to ASC
    */
    #options: SearchOptions = {
        DIALECT: 2
    };

    #or: Array<Array<SearchField<T>>> = [];
    #blobCount: number = 0;
    #vectorQuery: string | undefined;

    /** @internal */
    public _query: Array<SearchField<T>> = [];

    public constructor(
        client: NodeRedisClient,
        schema: T,
        doc: typeof JSONDocument | typeof HASHDocument,
        parsedSchema: ParsedMap,
        information: SearchInformation
    ) {
        this.#client = client;
        this.#schema = schema;
        this.#doc = doc;
        this.#parsedSchema = parsedSchema;
        this.#information = information;
    }

    public where<F extends keyof P>(field: F): MapSearchField<F, T, P> {
        return this.#createWhere(field);
    }

    public and<F extends keyof P>(field: F): MapSearchField<F, T, P> {
        return this.#createWhere(field);
    }

    public or<F extends keyof P>(field: F): MapSearchField<F, T, P> {
        this.#or.push(this._query);
        this._query = [];

        return this.#createWhere(field);
    }

    public sortBy<F extends keyof P>(field: F, order: "ASC" | "DESC" = "ASC"): SearchSortReturn<Search<T>> {
        this.#options.SORTBY = { BY: <string>field, DIRECTION: order };
        return <never>this;
    }

    public sortAsc<F extends keyof P>(field: F): SearchSortReturn<Search<T>> {
        return this.sortBy(field);
    }

    public sortAscending<F extends keyof P>(field: F): SearchSortReturn<Search<T>> {
        return this.sortBy(field);
    }

    public sortDesc<F extends keyof P>(field: F): SearchSortReturn<Search<T>> {
        return this.sortBy(field, "DESC");
    }

    public sortDescending<F extends keyof P>(field: F): SearchSortReturn<Search<T>> {
        return this.sortBy(field, "DESC");
    }

    public async count(): Promise<number> {
        this.#options.LIMIT = { from: 0, size: 0 };
        return (await this.#search()).total;
    }

    public async page<F extends boolean = false>(offset: number, count: number, autoFetch?: F): Promise<Array<ReturnDocument<T, F>> | undefined> {
        const { total, documents } = await this.#search({ LIMIT: { from: offset, size: count } });
        if (total === 0) return undefined;

        const docs = [];

        for (let i = 0, len = documents.length; i < len; i++) {
            const doc = documents[i];
            if (autoFetch) {
                for (let j = 0, keys = Object.keys(this.#schema.references), le = keys.length; j < le; j++) {
                    const key = keys[j];
                    const val = <Array<string>><unknown>doc.value[key];
                    const temp = [];

                    for (let k = 0, l = val.length; k < l; k++) {
                        temp.push(this.#get(val[k]));
                    }

                    doc.value[key] = <never>await Promise.all(temp);
                }
            }

            docs.push(new this.#doc(<never>this.#schema, {
                globalPrefix: this.#information.globalPrefix,
                prefix: this.#information.prefix,
                name: this.#information.modelName,
                suffix: this.#information.suffix
            }, doc.value, true, this.#information.skipDocumentValidation, autoFetch));
        }

        return <never>docs;
    }

    public async pageOfIds(offset: number, count: number, idOnly: boolean = false): Promise<Array<string> | undefined> {
        const { total, documents } = await this.#search({ LIMIT: { from: offset, size: count } }, true);
        if (total === 0) return undefined;

        const docs: Array<string> = [];

        for (let j = 0, len = documents.length; j < len; j++) {
            const doc = documents[j];
            docs.push(idOnly ? doc.value.$id?.toString() ?? "UNKNOWN" : doc.id);
        }

        return docs;
    }

    public async first<F extends boolean = false>(autoFetch?: F): Promise<ReturnDocument<T, F> | undefined> {
        return (await this.page(0, 1, autoFetch))?.[0];
    }

    public async firstId(withKey: boolean = false): Promise<string | undefined> {
        return (await this.pageOfIds(0, 1, withKey))?.[0];
    }

    public async min<F extends keyof P, AF extends boolean = false>(field: F, autoFetch?: AF): Promise<ReturnDocument<T, AF> | undefined> {
        return await this.sortBy(field, "ASC").first(autoFetch);
    }

    public async minId<F extends keyof P>(field: F): Promise<string | undefined> {
        return await this.sortBy(field, "ASC").firstId();
    }

    public async max<F extends keyof P, AF extends boolean = false>(field: F, autoFetch?: AF): Promise<ReturnDocument<T, AF> | undefined> {
        return await this.sortBy(field, "DESC").first(autoFetch);
    }

    public async maxId<F extends keyof P>(field: F): Promise<string | undefined> {
        return await this.sortBy(field, "DESC").firstId();
    }

    public async all<F extends boolean = false>(autoFetch?: F): Promise<Array<ReturnDocument<T, F>> | undefined> {
        const { total } = await this.#search({ LIMIT: { from: 0, size: 0 } });
        if (total === 0) return undefined;

        const { documents } = await this.#search({ LIMIT: { from: 0, size: total } });
        const docs = [];

        for (let i = 0, len = documents.length; i < len; i++) {
            const doc = documents[i];

            if (autoFetch) {
                for (let j = 0, keys = Object.keys(this.#schema.references), le = keys.length; j < le; j++) {
                    const key = keys[j];
                    const val = <Array<string>><unknown>doc.value[key];
                    const temp = [];

                    for (let k = 0, l = val.length; k < l; k++) {
                        temp.push(this.#get(val[k]));
                    }

                    doc.value[key] = <never>await Promise.all(temp);
                }
            }
            docs.push(new this.#doc(<never>this.#schema, {
                globalPrefix: this.#information.globalPrefix,
                prefix: this.#information.prefix,
                name: this.#information.modelName,
                suffix: this.#information.suffix
            }, doc.value, true, this.#information.skipDocumentValidation, autoFetch));
        }

        return <never>docs;
    }

    public async allIds(idOnly: boolean = false): Promise<Array<string> | undefined> {
        const { total } = await this.#search({ LIMIT: { from: 0, size: 0 } });
        if (total === 0) return undefined;

        const { documents } = await this.#search({ LIMIT: { from: 0, size: total } });
        const docs: Array<string> = [];

        for (let i = 0, len = documents.length; i < len; i++) {
            const doc = documents[i];
            docs.push(idOnly ? doc.value.$id?.toString() ?? "UNKNOWN" : doc.id);
        }

        return docs;
    }

    public async returnCount(): Promise<number> {
        return this.count();
    }

    public async returnAll<F extends boolean = false>(autoFetch?: F): Promise<Array<ReturnDocument<T, F>> | undefined> {
        return await this.all(autoFetch);
    }

    public async returnAllIds(withKey: boolean = false): Promise<Array<string> | undefined> {
        return await this.allIds(withKey);
    }

    public async returnPage<F extends boolean = false>(offset: number, count: number, autoFetch?: F): Promise<Array<ReturnDocument<T, F>> | undefined> {
        return await this.page(offset, count, autoFetch);
    }

    public async returnPageOfIds(offset: number, count: number, withKey: boolean = false): Promise<Array<string> | undefined> {
        return await this.pageOfIds(offset, count, withKey);
    }

    public async returnFirst<F extends boolean = false>(autoFetch?: F): Promise<ReturnDocument<T, F> | undefined> {
        return await this.first(autoFetch);
    }

    public async returnFirstId(withKey: boolean = false): Promise<string | undefined> {
        return await this.firstId(withKey);
    }

    public async returnMin<F extends keyof P, AF extends boolean = false>(field: F, autoFetch?: AF): Promise<ReturnDocument<T, AF> | undefined> {
        return await this.min(field, autoFetch);
    }

    public async returnMinId<F extends keyof P>(field: F): Promise<string | undefined> {
        return await this.minId(field);
    }

    public async returnMax<F extends keyof P, AF extends boolean = false>(field: F, autoFetch?: AF): Promise<ReturnDocument<T, AF> | undefined> {
        return await this.max(field, autoFetch);
    }

    public async returnMaxId<F extends keyof P>(field: F): Promise<string | undefined> {
        return await this.maxId(field);
    }

    async #search(options?: SearchOptions, keysOnly: boolean = false): Promise<SearchReply> {
        const query = this.#buildQuery();
        options = { ...this.#options, ...options };
        if (keysOnly) options.RETURN = [];
        return await this.#client.ft.search(this.#information.searchIndex, query, options);
    }

    async #get(id: string): Promise<ReturnDocument<T> | null> {
        const data = this.#information.dataStructure === "JSON" ? await this.#client.json.get(id) : await this.#client.hGetAll(id);

        if (data === null || Object.keys(data).length === 0) return null;

        return <never>new this.#doc(<never>this.#schema, {
            globalPrefix: this.#information.globalPrefix,
            prefix: this.#information.prefix,
            name: this.#information.modelName,
            suffix: this.#information.suffix
        }, <never>data, true, this.#information.skipDocumentValidation, false);
    }

    #buildQuery(): string {
        const query: Array<string> = [];
        const length = this.#or.length;

        if (length === 0 && this._query.length === 0) return "*";
        else {
            if (length > 0) {
                query.push(this.#parseQuery(this.#or[0]));
                if (length > 1) {
                    for (let i = 1; i < length; i++) {
                        query.push(this.#parseQuery(this.#or[i]));
                    }
                }
            }

            query.push(this.#parseQuery(this._query));
        }

        let final = query.join(" | ");
        if (typeof this.#vectorQuery === "string") final += this.#vectorQuery;

        return final;
    }

    #parseQuery(query: Array<SearchField<T>>): string {
        const queryArr: Array<string> = ["("];

        for (let i = 0, len = query.length; i < len; i++) {
            const queryPart = query[i];

            if (queryPart instanceof VectorField) {
                if (queryPart._vector._type === "RANGE") {
                    queryArr.push(queryPart.toString(`BLOB${this.#blobCount}`));
                } else {
                    if (typeof this.#vectorQuery === "string") throw new PrettyError("Its not possible to `OR` multiple KNN queries together");
                    this.#vectorQuery = queryPart.toString(`BLOB${this.#blobCount}`);
                }

                if (typeof this.#options.PARAMS === "undefined") this.#options.PARAMS = {};
                this.#options.PARAMS[`BLOB${this.#blobCount}`] = queryPart._vector._buffer;
            } else {
                queryArr.push(queryPart.toString());
            }
        }

        queryArr.push(")");
        if (queryArr.length === 0) return "*";
        return queryArr.join(" ");
    }

    #createWhere<F extends keyof P>(field: F): MapSearchField<F, T, P> {
        if (typeof field !== "string") throw new PrettyError(`Expected a field name but instead got '${typeof field}'`);

        const parsedField = this.#parsedSchema.get(field);
        if (!parsedField) throw new PrettyError(`'${field}' doesn't exist on the schema`);

        const { type, searchPath } = parsedField;

        return <never>this.#defineReturn(searchPath, type);
    }

    #defineReturn(field: string, type: Exclude<FieldStringType, "array">): BaseField {
        switch (type) {
            case "string": {
                return <never>new StringField<T, string>(this, field);
            }
            case "number": {
                return <never>new NumberField<T, number>(this, field);
            }
            case "bigint": {
                return <never>new BigIntField<T, bigint>(this, field);
            }
            case "boolean": {
                return <never>new BooleanField<T>(this, field);
            }
            case "text": {
                return <never>new TextField<T>(this, field);
            }
            case "date": {
                return <never>new DateField<T>(this, field);
            }
            case "point": {
                return <never>new PointField<T>(this, field);
            }
            case "vector": {
                return <never>new VectorField<T>(this, field);
            }
        }
    }

    public get rawQuery(): string {
        return this.#buildQuery();
    }

    public get return(): SearchReturn<Search<T>> {
        return <never>this;
    }
}