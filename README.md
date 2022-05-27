# Redis-OM Proposal: Simplify interface (v2)

This proposal aims to improve the developer experience while using redis-om for node.

## Motivation

During my experience with redis-om I experienced some interface problems where it would not throw errors when it should or even feel way to complex for what it aims to do.

## Proposal

The proposal aims to improve the developer experience by switching to a more simple interface inspired by [mongoose](https://mongoosejs.com/) by only providing 2 classes, 1 for defining the data structure and 1 for interacting with the database.

### Examples

**Disclaimer:** The `Model` is used just for the sake of the examples, I am aware that both users and redis-om devs would probably like to keep it as `Repository`.
<br/>

#### Connecting to redis

```ts
import { client } from "redis-om";

// url is optional and it defaults to localhost
client.connect().then(() => {
    console.log("Connected to redis")
})
```
<br/>

#### Creating a schema

All the current types apart from array on redis-om would not be changed but support for nested objects and tuples would be added. I still dont have a great idea on how to go about nested objects so whats is shown on the example is the current way I can think of doing it.

```ts
import { client } from "redis-om";

const memberSchema = client.schema({
    name: { type: "string", required: true },
    points: { type: "number", default: 0 },
    // The array type if passed a data property will be a tuple (and it supports objects)
    followingArtists: { type: "array", data: [{
        name: "string",
        points: "number"
    }]},
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
    followingArtists: { type: "array", data: [{
        name: "string",
        reference: "string"
    }]},
    address: { type: "object", data: {
        city: "string",
        postalCode: "number" 
    }},
})
```
<br/>

#### Creating a Model

```ts
import { client } from "redis-om";

client.model("Member", memberSchema);
```

Or optionally you can import the model class itself.<br/>
**WARNING:** the model function adds the model to a client map so it can be fetched from anywhere on your code if you have your client.

```ts
import { Model } from "redis-om";

const memberModel = new Model(memberSchema, client)
```

<details>
<summary>Adding the model to the client connection</summary>

This method is only in case you decided to create your own model instance, it works just like the normal model method but accepts a model instead of a schema

```ts
import { client } from "redis-om";

client.addModel("Member", memberModel)
```

</details><br/>

#### Creating a key on the database

```ts
import { client } from "redis-om";

//Fetching an already existent model from the client collection
const memberModel = client.model("Member");

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
<br/>

#### Creating methods

Example writen in typescript

```ts
import { Model } from "redis-om";

const userSchema = client.schema({
    name: { type: "string", required: true },
    email: { type: "string", required: true },
    address: { type: "string" }
})

interface UserFunctions {
    searchByName: (this: Model<T>, name: string) => Promise<string | Array<string>>
}

// This is a function just because of typescript runtime types
const userMethods = userSchema.methods<UserFunctions>();

// This can't be an arrow function because of how `this` works
userMethods.searchByName = async function(name: string) {
    return await this.query().where("name").equals(name);
}

const userModel = client.model("User", userSchema);
const usersNamedDidaS = await userModel.searchByName("DidaS");
```


### Structure

![structure](/img/oop-structure.png)

### Documentation
<br/>

#### Client

| Syntax                                 | Description                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| connect(uri: string \| URL)            | connects to the redis database                                                          |
| close()                                | closes the current connection with the redis database                                   |
| isOpen()                               | checks if the connection is still active or not                                         |
| schema(data: Record<string, any>)      | ALIAS TO `new Schema()` (creates a new schema)                                          |
| model(name: string, data: Schema<T>)   | creates a new model and adds it to the client collection of models                      |
| addModel(name: string, data: Model<T>) | takes in an instance of a model class and adds it to the client collection of models    |
| search()                               | a global query that you can search anything on your database without being model locked |
<br/>

#### Schema
| Syntax                              | Description                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| add(data: Record<string, { type }>) | adds data to the schema after it being created, this method is not recommend but its an option |
<br/>

#### Model
| Syntax                                                                            | Description                                                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| create(data: any)                                                                 | creates a new entry on the database.                                                                                      |
| save()                                                                            | saves the current data to its corresponding entry on the the database if changes were made                                |
| delete(model?: T)                                                                 | deletes the corresponding entry on the database                                                                           |
| update(data: any, model?: T)                                                      | updates the entry on the database, ALIAS TO `modelproperty = value; modelsave()`                                          |
| exists(index?: string)                                                            | checks whether the current model has an entry or if the index passed already exists                                       |
| count()                                                                           | returns the amount of existent entries corresponding to the model schema                                                  |
| search(data: Record<PropertyKey, any>)                                            | search for a specific entry                                                                                               |
| searchOne(data: Record<PropertyKey, any>)                                         | just like `search` but only returns the first entry                                                                       |
| searchAndUpdate(data: Record<PropertyKey, any>, new: Record<PropertyKey, any>)    | search for a specific entry(ies) and update its content, ALIAS TO `modelsearch()property = value; modelsearch()save()`    |
| searchAndDelete(data:Record<PropertyKey, any>)                                    | search for a specific entry(ies) and delete it, ALIAS TO `modelsearch()forEach(delete)`                                   |
| searchOneAndUpdate(data: Record<PropertyKey, any>, new: Record<PropertyKey, any>) | just like `searchAndUpdate` but only updates the first entry                                                              |
| searchOneAndDelete(data: Record<PropertyKey, any>)                                | just like `searchAndDelete` but only deletes the first entry                                                              |
| searchByIndex(index?: string)                                                     | search for the the model id or a specific one                                                                             |
| searchByIndexAndUpdate(data: Record<PropertyKey, any>, index?: string)            | search for a specific index and update its content, ALIAS TO `modelsearchById()property = value; modelsearchById()save()` |
| searchByIndexAndDelete(index?: string)                                            | search for a specific index and delete it, ALIAS TO `modelsearchByIndex()delete()`                                        |
| updateOne(data: Record<PropertyKey, any>, new: Record<PropertyKey, any>)          | a more limited version of  `searchOneAndUpdate`                                                                           |
| deleteOne(data: Record<PropertyKey, any>)                                         | a more limited version of `searchOneAndDelete`                                                                            |
| watch()                                                                           | creates an event emiter so you can listen to changes on data using that model                                             |
| aggregate()                                                                       | retrieves the entry and aggregates data to it (a more verbose update, and idk if i want to keep it)                       |
| rawSearch(data: Array<any>)                                                       | raw redis search query                                                                                                    |
| query()                                                                           | creates a search query                                                                                                    |
| createAndSave(data: any)                                                          | ALIAS TO `const nModel = model.create({}); nModel.save()`                                                                 |
<br/>

#### Query
Refer to the current redis-om version for now
<br/>

#### Missing description for client commands
The commands on the client class not listed above are all official redis commands and you should read their documentation or go look at node-redis
<br/>

**DISCLAIMER:** `any` and PropertyKey are used in some type notations just for the sake of this proposal and T is refering to the Model return type, so if a Model represents a Guild T is Guild.