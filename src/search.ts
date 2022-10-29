import { FieldTypes, Parsed, RedisClient, SchemaDefinition } from "./typings";
import { Document } from "./document";
import { StringField } from "./utils/search-builders/string";
import { SearchField } from "./utils/search-builders/base";
import { NumberField } from "./utils/search-builders/number";

export class Search<T extends SchemaDefinition> {
    readonly #client: RedisClient;
    readonly #schema: T;
    readonly #parsedSchema: Map<Parsed["pars"], Parsed>;
    readonly #index: string;
    #workingType: FieldTypes["type"] = "string";
    query: Array<SearchField<T>> = [];

    public constructor(client: RedisClient, schema: T, parsedSchema: Map<Parsed["pars"], Parsed>, searchIndex: string) {
        this.#client = client;
        this.#schema = schema;
        this.#parsedSchema = parsedSchema;
        this.#index = searchIndex;
    }

    public where(field: string) {
        return this.#createWhere(field);
    }

    or(value: unknown) {
        switch (this.#workingType) {
            case "string": {
                this.query.at(-1)?.or.push(value);
                break;
            }
            case "number": {
                this.query.at(-1)?.or.push([value, value])
                break;
            }
        }

        return this;
    }

    else(_value: unknown) { }

    // and() { }

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
        return this.query.map((q) => q.toString()).join(" ")
    }

    #createWhere(field: string) {

        if (!this.#parsedSchema.has(field)) throw new PrettyError(`'${field}' doesnt exist on the schema`)

        const parsedField = this.#parsedSchema.get(field)!;

        switch (parsedField.value.type) {
            case "string": {
                this.#workingType = "string";
                return new StringField<T>(this, field);
            }
            case "number": {
                this.#workingType = "number";
                return new NumberField<T>(this, field);
            }
        }

        throw new PrettyError("Some error occured creating the field");
    }
}