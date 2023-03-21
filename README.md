# Nekdis

## What is it?

Nekdis is an orm for redis built on top of the node-redis with the goal to provide a user friendly interface to build your data structure and interact with it.

## Future Plans

I want to implement my own RESP3 parser and redis client to further improve performance and reduce the amount of dependencies.

# Table of contents

- [Nekdis](#nekdis)
  - [What is it?](#what-is-it)
  - [Future Plans](#future-plans)
- [Table of contents](#table-of-contents)
- [Installation](#installation)
- [Getting Started](#getting-started)
  - [Connecting to the database](#connecting-to-the-database)
  - [Creating a Schema](#creating-a-schema)
  - [Creating a Model](#creating-a-model)
  - [Creating and Saving data](#creating-and-saving-data)
- [The Schema class](#the-schema-class)
  - [Schema Definition](#schema-definition)
    - [Basics](#basics)
    - [Arrays](#arrays)
    - [Nested Objects](#nested-objects)
    - [Parameters](#parameters)

# Installation

Nekdis is available on npm via the command

```sh
npm i nekdis
```

# Getting Started

## Connecting to the database

Nekdis already exports a global client but you can also create your own instance with the `Client` class.

```ts
import { client } from "nekdis";

client.connect().then(() => {
    console.log("Connected to redis");
});
```

<details>
<summary>Creating an instance</summary>

```ts
import { Client } from "nekdis";

const client = new Client();

client.connect().then(() => {
    console.log("Connected to redis");
});
```

</details>

## Creating a Schema

The client provides a helper to build a schema without any extra steps.

```ts
import { client } from "nekdis";

const catSchema = client.schema({
    name: { type: "string" }
});
```

## Creating a Model

The client also provides a helper to create a model.

```ts
import { client } from "nekdis";

const catModel = client.model("Cat", catSchema);
```

## Creating and Saving data

The model is what provides all the functions to manage your data on the database.

```ts
const aCat = catModel.create();

aCat.name = "Nozomi";

await catModel.save(aCat);
```

# The Schema class

The schema class allows you to define your data structure and custom functions that will be implemented in the model.

```ts
new Schema(data, methods, options);
```

| Name      | Type                                     | Description |
| --------- | ---------------------------------------- | ----------- |
| `data`    | [`SchemaDefinition`](#schema-definition) |             |
| `methods` | `MethodsDefinition`                      |             |
| `options` | `SchemaOptions`                          |             |

## Schema Definition

### Basics

```ts
new Schema({
    name: { type: "string", required: true },
    xp: {type: "number", default: 0},
    nickName: "string"

})
```

### Arrays

```ts
new Schema({
    friends: "array",
    recordedScores: { type: "array", elements: "number" }
})
```

### Nested Objects

### Parameters