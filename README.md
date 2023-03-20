# Redis-OM Proposal: Simplify interface (v2)

This proposal aims to improve the developer experience while using redis-om for node.

## Motivation

During my experience with redis-om I experienced some interface problems where it would not throw errors when it should or even feel way to complex for what it aims to do.

## Proposal

The proposal aims to improve the developer experience by switching to a more simple interface inspired by [mongoose](https://mongoosejs.com/) by only providing 2 classes, 1 for defining the data structure and 1 for interacting with the database.

### Examples

**Disclaimer:** The `Model` is used just for the sake of the examples, I am aware that both users and redis-om devs would probably like to keep it as `Repository`.

#### Connecting to redis

```ts
import { client } from "redis-om";

// url is optional and it defaults to localhost
client.connect().then(() => {
    console.log("Connected to redis")
})
```

#### Creating a schema

All the current types apart from array on redis-om would not be changed but support for nested objects would be added. I still dont have a great idea on how to go about nested objects so whats is shown on the example is the current way I can think of doing it.

```ts
import { client } from "redis-om";

const memberSchema = client.schema({
    name: { type: "string", required: true },
    points: { type: "number", default: 0 },
    followingArtists: { type: "array", elements: {
        name: "string",
        points: "number"
    }},
    address: { type: "object", data: {
        city: "string",
        postalCode: "number" 
    }},
})
```

Or optionally you could also import the schema class itself.

```ts
import { Schema } from "redis-om";

const memberSchema = new Schema({
    name: { type: "string", required: true },
    points: { type: "number", default: 0 },
    followingArtists: { type: "array", elements: {
        name: "string",
        reference: "string"
    }},
    address: { type: "object", data: {
        city: "string",
        postalCode: "number" 
    }},
})
```

#### Creating a Model

```ts
import { client } from "redis-om";

client.model("Member", memberSchema);
```

Or optionally you can import the model class itself.<br/>
**WARNING:** the model function adds the model to a client map so it can be fetched from anywhere on your code if you have your client.

```ts
import { Model } from "redis-om";

const memberModel = new Model(client, "Member", memberSchema)
```

<details>
<summary>Adding the model to the client connection</summary>

This method is only in case you decided to create your own model instance, it works just like the normal model method but accepts a model instead of a schema

```ts
import { client } from "redis-om";

client.addModel("Member", memberModel)
```

</details>

#### Creating a key on the database

```ts
import { client } from "redis-om";

memberModel.createAndSave({
    name: "DidaS",
    followingArtists: [
        {
            name: "EGOIST",
            // null is saved to the database independent of the data type but undefined will throw an error
            reference: null
        },
        {
            name: "Minami",
            reference: null
        }
    ]
})
```

#### Creating methods

```ts
import { Model } from "redis-om";

const userSchema = client.schema({
    name: { type: "string", required: true },
    email: { type: "string", required: true },
    address: { type: "string" }
}, {
    searchByName: async function(name: string) {
        return await this.search().where("name").equals(name).returnAll();
    }
})

const userModel = client.model("User", userSchema);
const usersNamedDidaS = await userModel.searchByName("DidaS");
```

### Documentation

#### Client

| Syntax                           | Description                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| connect(url)                     | connects to the redis database                                                       |
| disconnect()                     | closes the current connection after finishing the ongoing transactions               |
| forceDisconnect()                | closes the current connection without finishing transactions.                        |
| schema(data, methods?, options?) | ALIAS TO `new Schema()` (creates a new schema)                                       |
| model(name, schema?)             | creates a new model and adds it to the client collection of models                   |
| addModel(name, model, override?) | takes in an instance of a model class and adds it to the client collection of models |
| isOpen                           | returns a boolean depending reflecting the state of the client                       |
| raw                              | Exposes the `node-redis` client                                                      |
| withModules(modules)             |                                                                                      |

#### Schema
| Syntax        | Description                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------- |
| add(data)     | adds data to the schema after it being created, this method is not recommend but its an option |
| methods(data) | adds methods to the schema after it being created, also not recommended                        |

#### Model
| Syntax                           | Description                                                                    |
| -------------------------------- | ------------------------------------------------------------------------------ |
| get(id)                          | get a specific document using the record id                                    |
| create(id?)                      | creates a new document.                                                        |
| save(document)                   | saves the given document to the database                                       |
| delete(documents)                | deletes the given documents or id(s) from the database                         |
| exists(documents)                | checks whether the document or id(s) already exists                            |
| expire(documents, seconds, mode) | calls the expire method on the documents with the given parameters             |
| createAndSave(data)              | ALIAS TO `const nModel = model.create(); model.save(nModel)`                   |
| search()                         | returns the search builder                                                     |
| createIndex()                    | creates the redis search index                                                 |
| deleteIndex()                    | deletes the redis search index                                                 |
| rawSearch(args)                  | raw redis search query                                                         |
| ~~update(id, data)~~             | updates the entry on the database                                              |
| ~~count()~~                      | returns the amount of existent entries corresponding to the model schema       |
| ~~watch()~~                      | creates an event emitter so you can listen to changes on data using that model |
| ~~aggregate()~~                  | retrieves the entry and aggregates data to it                                  |

#### Search
Refer to the current [redis-om](https://github.com/redis/redis-om-node#searching) version for now