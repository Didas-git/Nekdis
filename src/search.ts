import { Document } from "./document";
import { SearchField, StringField, NumberField, BooleanField } from "./utils/search-builders";
import type { FieldTypes, Parsed, RedisClient, SchemaDefinition, MapSearchField } from "./typings";

export class Search<T extends SchemaDefinition> {
    readonly #client: RedisClient;
    readonly #schema: T;
    readonly #parsedSchema: Map<Parsed["path"], Parsed>;
    readonly #index: string;
    #workingType!: FieldTypes["type"];
    /** @internal */
    _query: Array<SearchField<T>> = [];

    public constructor(client: RedisClient, schema: T, parsedSchema: Map<Parsed["path"], Parsed>, searchIndex: string) {
        this.#client = client;
        this.#schema = schema;
        this.#parsedSchema = parsedSchema;
        this.#index = searchIndex;
    }

    public where<S extends keyof T>(field: S) {
        return this.#createWhere(field);
    }

    public and<S extends keyof T>(field: S) {
        return this.#createWhere(field);
    }

    or(value: unknown) {
        switch (this.#workingType) {
            case "string": {
                this._query.at(-1)?.or.push(value);
                break;
            }
            case "number": {
                this._query.at(-1)?.or.push([value, value])
                break;
            }
            case "boolean": {
                this._query.at(-1)?.or.push(value);
                break;
            }
        }

        return this;
    }

    else(_value: unknown) {

    }

    async returnAll() {
        const docs: Array<Document<T>> = [];
        const { documents } = await this.#client.ft.search(this.#index, this.#buildQuery());

        documents.forEach((doc) => {
            docs.push(new Document(this.#schema, /:(.+)/.exec(doc.id)![1], doc.value));
        })

        return docs;
    }

    get rawQuery(): string {
        return this.#buildQuery();
    }

    #buildQuery(): string {
        return this._query.map((q) => q.toString()).join(" ")
    }

    #createWhere<S extends keyof T>(field: S): MapSearchField<S, T> {

        if (typeof field !== "string") throw new PrettyError();

        const parsedField = this.#parsedSchema.get(field);

        if (!parsedField) throw new PrettyError(`'${field}' doesn't exist on the schema`)

        switch (parsedField.value.type) {
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
        }

        throw new PrettyError("Some error occurred creating the field");
    }
}