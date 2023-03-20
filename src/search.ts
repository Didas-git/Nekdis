import { Document } from "./document";
import { type SearchField, StringField, NumberField, BooleanField, TextField, DateField } from "./utils/search-builders";
import type { FieldTypes, Parsed, RedisClient, SchemaDefinition, MapSearchField, ParseSchema, MapSchema, BaseField } from "./typings";

export class Search<T extends SchemaDefinition, P extends ParseSchema<T> = ParseSchema<T>> {
    readonly #client: RedisClient;
    readonly #schema: T;
    readonly #parsedSchema: Map<Parsed["path"], Parsed>;
    readonly #index: string;
    #workingType!: FieldTypes["type"];

    /** @internal */
    public _query: Array<SearchField<T>> = [];

    public constructor(client: RedisClient, schema: T, parsedSchema: Map<Parsed["path"], Parsed>, searchIndex: string) {
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

    public async returnAll(): Promise<Array<Document<T> & MapSchema<T>>> {
        const docs: Array<never> = [];
        const { documents } = await this.#client.ft.search(this.#index, this.#buildQuery());

        documents.forEach((doc) => {
            docs.push(<never>new Document(this.#schema, (/:(.+)/).exec(doc.id)?.[1] ?? doc.id, doc.value));
        });

        return docs;
    }

    public get rawQuery(): string {
        return this.#buildQuery();
    }

    #buildQuery(): string {
        return this._query.map((q) => q.toString()).join(" ");
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
            case "point": { throw new Error('Not implemented yet: "point" case'); }
            case "object": { throw new Error('Not implemented yet: "object" case'); }
        }
    }
}