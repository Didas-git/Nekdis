import { Parsed, RedisClient, SchemaDefinition } from "./typings";
import { Document } from "./document";
import { StringField } from "./utils/search-builders/string";
import { SearchField } from "./utils/search-builders/base";

export class Search<T extends SchemaDefinition> {
    readonly #client: RedisClient;
    readonly #schema: T;
    readonly #parsedSchema: Map<Parsed["pars"], Parsed>;
    readonly #index: string;
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

    or(_value: unknown) {

    }

    and() { }
    async returnAll() {
        const docs: Array<Document<T>> = [];
        const { documents } = await this.#client.ft.search(this.#index, this.query.join(" "));

        documents.forEach((doc) => {
            docs.push(new Document(this.#schema, /:(.+)/.exec(doc.id)![1], doc.value));
        })

        return docs;
    }
    #createWhere(field: string) {

        if (!this.#parsedSchema.has(field)) throw new PrettyError(`'${field}' doesnt exist on the schema`)

        const parsedField = this.#parsedSchema.get(field)!;

        switch (parsedField.value.type) {
            case "string": {
                return new StringField<T>(this, field);
            }
        }

        throw new PrettyError("Some error occured creating the field");
    }
}