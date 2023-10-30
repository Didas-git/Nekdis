# Nekdis

Nekdis is a [Redis](https://redis.com/) ODM and mainly a proposal for [redis-om](https://github.com/redis/redis-om-node) that aims to improve the user experience and performance.

# Table of contents

- [Nekdis](#nekdis)
- [Table of contents](#table-of-contents)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Connecting to the database](#connecting-to-the-database)
  - [Creating a Schema](#creating-a-schema)
  - [Creating a Model](#creating-a-model)
  - [Creating a document/record](#creating-a-documentrecord)
- [Glossary](#glossary)
  - [RecordID](#recordid)
  - [Document](#document)
  - [Reference](#reference)
  - [Relation](#relation)
- [Advanced concepts](#advanced-concepts)
  - [Vector similarity search](#vector-similarity-search)
    - [Pure queries](#pure-queries)
    - [Hybrid queries](#hybrid-queries)
    - [Range queries](#range-queries)
  - [References VS Relations](#references-vs-relations)
    - [What is a Reference](#what-is-a-reference)
      - [The problem](#the-problem)
    - [What is a relation](#what-is-a-relation)
      - [The problem](#the-problem-1)
    - [Pros and Cons](#pros-and-cons)
    - [When to and not to use relations](#when-to-and-not-to-use-relations)
  - [Modularity with client modules](#modularity-with-client-modules)
  - [Modularity with base injections](#modularity-with-base-injections)
- [Nekdis VS Redis-OM](#nekdis-vs-redis-om)
  - [Client](#client)
  - [Schema](#schema)
  - [Model vs Repository](#model-vs-repository)
    - [Nekdis Document](#nekdis-document)
      - [Creating and saving](#creating-and-saving)
      - [Creating and mutating](#creating-and-mutating)
  - [Search](#search)
  - [Nested objects](#nested-objects)
  - [A Simple example](#a-simple-example)
  - [Benchmarks](#benchmarks)

# Installation

Nekdis is available on the npm registry and can be installed with your preferred package manager

```sh
pnpm i nekdis
```

# Getting Started

## Connecting to the database

Nekdis already exports a global client but you can also create your own instance with the `Client` class.

```ts
import { client } from "nekdis";

await client.connect().then(() => {
    console.log("Connected to redis");
});
```

## Creating a Schema

Schemas are what defines the shape of your data and can be created using the `schema` method of the client.

```ts
const catSchema = client.schema({
    name: { type: "string" }
});
```

## Creating a Model

Models are what you use to interact with the database and collections that have the shape of the schema you pass in. They can be crated using the `model` method of the client.

```ts
const catModel = client.model("Cat", catSchema);
```

## Creating a document/record

The model provides some methods to handle your documents but the simplest way to create one is to do as follows:

```ts
const aCat = catModel.createAndSave({
    name: "Nozomi"
});
```

# Glossary

Nekdis does naming a little different than redis does and here is a short explanation of some of them.

## RecordID

Nekdis introduces the concept of the `RecordID` which is as highly customizable id that is divided into pieces, in redis itself this is just the `key`. So when you see documentation talking about an `id` or you read the types and you see `id` remember that it is just a redis `key` and shorthand for a `RecordID` in Nekdis.

The structure of a `RecordID` is as follows:
![](./recordid.png)

## Document

A document in Nekdis is just the data within a key plus the id and its parts.
The id parts can be accessed with `$globalPrefix`, `$prefix`, `$modelName`, `$suffix`, `$id` and `$recordId` respectively.

## Reference

A `reference` in nekdis is nothing more nothing less than a foreign key, so when you defined a field in your schema as being a `reference` you are just saying that a field contains one or more keys.

## Relation

A `relation` is a bit more complex than a relation since it is "virtual" and not part of the document.
For more details you can check the [references versus relations](#references-vs-relations) section on the readme.

# Advanced concepts

Here im going to explain a bit more of the possibilities of Nekdis.

## Vector similarity search

Redis supports indexing vectors on the database for search, with this in mind we built a way to query them that resembles the point search using the same builder pattern.

There are plans to add more functionality to it in the future but for now using it is really simple.

### Pure queries

```ts
testModel.search().where("vec").eq((vector) => vector
    .knn()
    .from(new Float32Array([0.1, 0.1]))
    .return(8))
.returnAll();
// Generates the following query
// "*=>[KNN 8 @vec $BLOB]" "PARAMS" "2" "BLOB" "\xcd\xcc\xcc=\xcd\xcc\xcc=" "DIALECT" "2"
```

### Hybrid queries

```ts
testModel.search().where("age").between(18, 30)
    .and("vec").eq((vector) => vector
        .knn()
        .from(new Float32Array([0.1, 0.1]))
        .return(8))
    .returnAll();
// Generates the following query
// "((@age:[18 30])) =>[KNN 8 @vec $BLOB]" "PARAMS" "2" "BLOB" "\xcd\xcc\xcc=\xcd\xcc\xcc=" "DIALECT" "2"
```

### Range queries

```ts
testModel.search().where("vec").eq((vector) => vector
    .range(5)
    .from(new Float32Array([0.1, 0.1])))
.returnAll();
// Generates the following query
// "((@vec:[VECTOR_RANGE 5 $BLOB])) " "PARAMS" "2" "BLOB" "\xcd\xcc\xcc=\xcd\xcc\xcc=" "DIALECT" "2"
```

## References VS Relations

In this section i hope to explain a little bit more about the differences between this two methods of creation some sort of relationship between documents.

### What is a Reference

References are a pretty simple concept, they are pretty much an array of foreign keys, you can store keys in a field of a document as a form of saying "x keys is related in y form to this document".

#### The problem

While Nekdis provides a way to auto fetch this relations, meaning it will fetch the keys and append them to the field as an array, this **is not Atomic** which can lead to some problems.
While this could be made atomic it would be somewhat of a breaking that im not sure its worth to make specially because relations exist.

### What is a relation

A relation as the name implies is a way to relate documents to each other, they work somewhat like graph relations and were inspired by the way [SurrealDB](https://surrealdb.com/) does relations.

#### The problem

Relations are expensive to run given redis runs on memory, this is because a lot of work and what we call omitted documents have to be created on the background for everything to work.

### Pros and Cons

| Type      | Is Atomic | Requires Lua | Works in redis-cli | Heavy on memory | Searchable | Allows Metadata |
| --------- | :-------: | :----------: | :----------------: | :-------------: | :--------: | :-------------: |
| Reference |     ❌     |      ❌       |         ❌          |        ❌        |     ❌      |        ❌        |
| Relation  |     ✔️     |      ✔️       |         ✔️          |        ✔️        |     ✔️      |        ✔️        |

### When to and not to use relations

While relations provide an amazing api they are expensive on ram specially at scale, im not here to say "don't use it" but i do think you should only use them if you really need to do complex queries on your relations and/or apply constrains to them.

References are yes way more limiting than relations as of now but you can still map a lot of relationships with them if you use them properly.

## Modularity with client modules

Nekdis allows you to add your own modules to the client, this allows easier access to the raw node-redis client and a way to export all your higher functions in one go.

However there was a slight problem if you will regarding implementing this in a way that the types would still work, thats why instead of passing them to the constructor we provide a `withModules` method so even in javascript you can have intellisense on your modules.

```ts
// I have to think about something :c
```

## Modularity with base injections

Nekdis provides a way to set bases to your schemas, this means that you can have "global" definitions, methods and options that will be applied to every schema you create.

This is pretty useful specially when creating methods that you want to have across all your models.

A good example of this can be found <u>[here](./examples/table-module.ts)</u>.

# Nekdis VS Redis-OM

In this part of the document im going to cover how this proposal compares to the current redis-om (0.4.2) and the major differences.

## Client

In Nekdis the `Client` does not provide any methods to interact directly with the database and its pretty much only used to store your models and handle the connection, **however** you can access the `node-redis` client by accessing `client.raw`.

## Schema

The schema in Nekdis is just where you define the shape of your data while in redis-om it also takes care of creating indexes and some other internal bits.

With this comes the big question "Well, why not use just a plain object then", the simple answer to this question is ease of use but to explain it further, having the schema defined this way allows the library to internally check if there isn't anything missing and parse it so you are allowed to use the shorthand methods like `field: "string"`, this approach also allows for you to define methods an options that will be passed down to the model down the road and not to mention that this is one of the only ways to have references working properly without affecting performance.

## Model vs Repository

In redis-om you use a `repository` to interact with the db by using methods like `fetch`, `save` and `search`.

In Nekdis the `model` is not that different but it allows you to add more functionality to it (see: [Custom Methods](#custom-methods)) and overall gives more functionality out of the box.

### Nekdis Document

In Nekdis you have what are called documents, this is just an abstraction to the data to allow better interaction with references and faster parsing.

At first this might look daunting compared to redis-om that now uses plain objects but i can assure you that there isn't that much of a difference, and i will give some examples to demonstrate it.

#### Creating and saving

See, its just as easy

<table>
<tr>
<th>Nekdis</th>
<th>Redis-OM</th>
</tr>
<tr>
<td>

```ts
await model.createAndSave({
    name: "DidaS"
});
```

</td>
<td>

```ts
await repository.save({
    name: "DidaS"
});
```

</td>
</tr>
</table>

#### Creating and mutating

This is where things start to be a bit different, even tho you **can** use a plain object that isn't recommended since it would just use more memory.

<table>
<tr>
<th>Nekdis</th>
<th>Nekdis with plain object</th>
<th>Redis-OM</th>
</tr>
<tr>
<td>

```ts
// You can pass values directly to it
// just like in createAndSave
const data = model.create({
    name: "DidaS"
});

// mutate data
data.year = 2023;

await model.save(data);
```

</td>
<td>

```ts
// Doing it this way will use more memory
// and you wont have intellisense
const data = {
    name: "DidaS"
}

// mutate data
data.year = 2023;

await model.createAndSave(data);
```

</td>
<td>

```ts
const data = {
    name: "DidaS"
}

// mutate data
data.year = 2023;

await repository.save(data);
```

</td>
</tr>
</table>

## Search

Looking at search for the first time it is pretty much the same, the only difference is that `equals` operations exist in **every** data type so a lot of times changing the data type in the schema wont break the query **and** the best part is that `eq`, `equals` and other operators like them support arrays (so they pretty much work like an `in` operator).

## Nested objects

Currently in redis-om you need to define a path for each field to define your nested objects, meanwhile in Nekdis they just work like normal js objects!

There are several advantages to this, two of the main ones being, faster serialization/deserialization and simpler to use, here is an example comparing both

<table>
<tr>
<th>Nekdis</th>
<th>Redis-OM</th>
</tr>
<tr>
<td>

```ts
client.schema({
    field: {
        type: "object",
        properties: {
            aNumberInsideOfIt: "number",
            nesting: {
                type: "object",
                properties: {
                    doubleNested: "boolean"
                }
            }
        }
    }
})
```

</td>
<td>

```ts
Schema("OM", {
    aNumberInsideOfIt: {
        type: "number",
        path: "$.field.aNumberInsideOfIt"
    },
    doubleNested: {
        type: "boolean",
        path: "$.field.nesting.doubleNested"
    }
})
```

</td>
</tr>
</table>

## A Simple example

This is a simple program example that generates 30 random users with random ages and fetches the ones matching a certain age just to show the differences between the libraries

<table>
<tr>
<th>Nekdis</th>
<th>Redis-OM</th>
</tr>
<tr>
<td>

```ts
// Import the global client
import { client } from "nekdis";

// Connect to the db
await client.connect();

// Create the schema
const userSchema = client.schema({
    age: { type: "number", index: true }
}, {
    // Define function to help repetitive task
    findBetweenAge: async function (min: number, max: number) {
        return await this.search().where("age").between(min, max).returnAll();
    }
    // Add creation date to the key
}, { suffix: () => Date.now().toString() });

// Create the interface
const userModel = client.model("User", userSchema);

// Create the search index
await userModel.createIndex();

// Generate 30 users
for (let i = 0; i < 30; i++) {
    await userModel.createAndSave({
        age: between(18, 90)
    });
}

// Get the users that are between 30 and 50 years old
const users = await userModel.findBetweenAge(30, 50);

// Log the users
console.log(users)

// Close the connection
await client.disconnect();

// A helper function that generates a random number between min and max
function between(min: number, max: number) {
    return Math.round(Math.random() * (max - min + 1)) + min;
};
```

</td>
<td>

```ts
// Node stuff for the id
import { randomUUID } from "node:crypto";
// Import the redis client
import { createClient } from "redis";
// Import OM utilities
import { Schema, Repository, Entity, EntityId } from "redis-om";

// Create Client
const client = createClient()

// Connect to the db
await client.connect();

// Create the schema
const userSchema = new Schema("User", {
    age: { type: "number" }
});

// Create an interface to allow type safe manipulation
// However you will need to use it everywhere 
// If you are using js you would need to do it in jsdoc for it to work
interface UserEntity extends Entity {
    age: number
}

// Create the interface
const userRepository = new Repository(userSchema, client);

// Create the search index
await userRepository.createIndex();

// Generate 30 users
for (let i = 0; i < 30; i++) {
    await userRepository.save({
        // We set the "suffix" and random id to somewhat match Nekdis (still not 100% accurate you would need even more) 
        [EntityId]: `${Date.now()}:${randomUUID()}`,
        age: between(18, 90)
    });
}

// Get the users that are between 30 and 50 years old
const users = await findBetweenAge(userRepository, 30, 50);

// Log the users
console.log(users)

// Close the connection
await client.disconnect();

// Define function to help repetitive task
async function findBetweenAge(repository: Repository, min: number, max: number): Promise<Array<UserEntity>> {
    // Type assertion so ts does not complain
    return <Array<UserEntity>>await repository.search().where("age").between(min, max).returnAll();
}

// A helper function that generates a random number between min and max
function between(min: number, max: number) {
    return Math.round(Math.random() * (max - min + 1)) + min;
};
```

</td>
</tr>
</table>

## Benchmarks

There were a lot of benchmarks made and they can be found [here](./BENCHRESULTS.md)