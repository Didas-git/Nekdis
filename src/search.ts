import { Parsed, RedisClient, SchemaDefinition } from "./typings";
import { Document } from "./document";
import { StringField } from "./utils/search-builders/string";

export class Search<T extends SchemaDefinition> {
    readonly #client: RedisClient;
    readonly #parsedSchema: Map<Parsed["pars"], Parsed>;

    public constructor(client: RedisClient, parsedSchema: Map<Parsed["pars"], Parsed>) {
        this.#client = client;
        this.#parsedSchema = parsedSchema;
    }

    public where(field: string) {
        return this.#createWhere(field);
    }

    or() { }
    and() { }
    get return() {
        return {
            all() {

            },
            first() {

            },
            last() {

            },
            page() {

            },
            count() {

            },
        }
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