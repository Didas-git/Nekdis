import { Document } from "./document";
import { SearchField, StringField, NumberField, BooleanField, TextField, DateField } from "./utils/search-builders";
import type { FieldTypes, Parsed, RedisClient, SchemaDefinition, MapSearchField, ParseSchema, MapSchema } from "./typings";

export class Search<T extends SchemaDefinition, P extends ParseSchema<T> = ParseSchema<T>> {
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

    public where<F extends keyof P>(field: F) {
        return this.#createWhere(field);
    }

    public and<F extends keyof P>(field: F) {
        return this.#createWhere(field);
    }

    or(value: unknown) {
        if (this.#workingType === "string" || this.#workingType === "boolean" || this.#workingType === "text") {
            this._query.at(-1)?.or.push(value);
        }

        return this;
    }

    else(_value: unknown) {

    }

    async returnAll(): Promise<Array<Document<T> & MapSchema<T>>> {
        const docs: Array<never> = [];
        const { documents } = await this.#client.ft.search(this.#index, this.#buildQuery());

        documents.forEach((doc) => {
            docs.push(<never>new Document(this.#schema, /:(.+)/.exec(doc.id)![1], doc.value));
        })

        return docs;
    }

    get rawQuery(): string {
        return this.#buildQuery();
    }

    #buildQuery(): string {
        return this._query.map((q) => q.toString()).join(" ")
    }

    #createWhere<F extends keyof P>(field: F): MapSearchField<F, T, P> {

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
            case "text": {
                this.#workingType = "text";
                return <never>new TextField<T>(this, field);
            }
            case "date": {
                this.#workingType = "date";
                return <never>new DateField<T>(this, field);
            }
        }

        throw new PrettyError("Some error occurred creating the field");
    }
}