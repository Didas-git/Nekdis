import { FieldTypes, Parsed, RedisClient, SchemaDefinition } from "./typings";
import { Document } from "./document";

export class Search<S extends SchemaDefinition> {
    protected query: Array<string> = [];
    readonly #client: RedisClient;
    readonly #schema: S;
    readonly #parsedSchema: Map<Parsed["pars"], Parsed>;
    readonly #IDX: string;
    #negated: boolean = false;
    #currentField: { field: string, type: FieldTypes["type"]; } = <any>{};

    public constructor(client: RedisClient, schema: S, parsedSchema: Map<Parsed["pars"], Parsed>, idx: string) {
        this.#client = client;
        this.#schema = schema;
        this.#parsedSchema = parsedSchema;
        this.#IDX = idx;
    }

    public async returnAll() {
        return await this.#search();
    }

    public async returnFirst() {
        return (await this.#search())[0];
    }

    async #search() {
        const docs: Array<Document<S>> = [];

        const { documents } = await this.#client.ft.search(this.#IDX, this.query.join(" "));
        documents.forEach((doc) => {
            docs.push(new Document(this.#schema, /:(.+)/.exec(doc.id)![1], doc.value));
        });

        return docs;
    }

    public where(field: string) {
        this.#createWhere(field);
        return this;
    }

    public equals(value: string | number) {
        this.#buildQuery(value);
        return this;
    };

    public negate() {
        this.#negated = !this.#negated;
    }

    #createWhere(field: string) {
        if (!this.#parsedSchema.has(field)) throw new Error(`'${field}' doesnt exist on the schema`);

        const { value } = this.#parsedSchema.get(field)!;

        if (value.type === "object") throw new Error("Searching entire objects is not supported yet");

        this.#currentField = { field, type: value.type };
    }

    #buildQuery(value: unknown) {
        const isNegated = this.#negated ? "-" : "";
        this.query.push(`(${isNegated}@${this.#currentField.field}:${this.#currentField.type === "number" ? `[${value} ${value}]` : `{${value}}`})`);
    };
}