# Nekdis

## What is it?

Nekdis is the temporary name for a proposal for [redis-om](https://github.com/redis/redis-om-node) that aims to improve the user experience and performance by providing an ODM-like naming scheme like the famous library [mongoose](https://mongoosejs.com/) for MongoDB

## Future Plans

Right now the proposal includes almost every feature that redis-om already has (See: [Missing Features](#missing-features) ) and introduces some like more like [References]().

The next steps for the proposal include:
- Adding [Vector Similarity Search](https://redis.io/docs/stack/search/reference/vectors/).
- Adding support for [Graph](https://redis.io/docs/stack/graph/) data types & relations.
- Improving auto fetch performance by including a lua script that will get injected as a redis function.
- Allow auto references to be updated.
- Improve reference checking
- Adding support for objects inside arrays.
- Make a proposal for [`node-redis`](https://github.com/redis/node-redis) to improve its performance.

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
- [Custom Methods](#custom-methods)
- [Schema Types](#schema-types)
- [Field Properties](#field-properties)
  - [Shared Properties](#shared-properties)
  - [Unique Properties](#unique-properties)
- [Missing features](#missing-features)

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
const aCat = catModel.createAndSave({
    name: "Nozomi"
});
```

# Custom Methods

In this proposal you can create your own custom methods that will be added to the `Model`, this methods are defined on the schema directly.

> **WARNING:** Anonymous functions cannot be used when defining custom methods/functions

```ts
const albumSchema = client.schema({
    artist: { type: "string", required: true },
    name: { type: "text", required: true },
    year: "number"
}, {
    searchByName: async function (name: string) {
        return await this.search().where("name").matches(name).returnAll();
    }
})

const albumModel = client.model("Album", albumSchema);

const results = await albumModel.searchByName("DROP");
```

# Schema Types

This proposal adds 3 new data types `array`, `object` & `reference` and removes the `string[]` type.

| Type        | Description                                                                                                                                                                                                                                                            |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `string`    | A standard string that will be treated as `TAG`                                                                                                                                                                                                                        |
| `number`    | A standard float64 number that will be treated as `NUMERIC`                                                                                                                                                                                                            |
| `boolean`   | A standard boolean that will be treated as `TAG`                                                                                                                                                                                                                       |
| `text`      | A standard string that will be treated as `TEXT` which allows for full text search                                                                                                                                                                                     |
| `date`      | This field will internally be treated as `NUMERIC`, it gets saved as a Unix Epoch but you will be able to interact with it normally as it will be a [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) when you access it |
| `point`     | This is an object containing a `latitude` and `longitude` and will be treated as `GEO`                                                                                                                                                                                 |
| `array`     | Internally it will be treated as the type given to the `elements` property which defaults to `string`                                                                                                                                                                  |
| `object`    | This type allows you to nest forever using the `properties` property in the schema and what gets indexed are its properties, if none are given it will not be indexed not checked                                                                                      |
| `reference` | When using this type you will be given a `ReferenceArray` which is a normal array with a `reference` method that you can pass in another document or a record id to it, references can be auto fetched but auto fetched references cannot be changed                   |

# Field Properties

This proposal includes the addition of 2 new shared properties and some unique ones

## Shared Properties

| Property   | Description                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `type`     | The type of the field                                                                                                    |
| `required` | Defines whether the field is required to exist or not (this doesn't work if validation is disabled)                      |
| `default`  | Chose a default value for the field making so that it will always exist even if it isn't required                        |
| `index`    | Defines whether the field should be indexed or not (defaults to `true`)                                                  |
| `sortable` | Defines whether the field is sortable or not (note that this doesn't exist nor work on object fields & reference fields) |

## Unique Properties

| Property     | Type        | Description                                                                                                                                                                  |
| ------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `elements`   | `array`     | Defines the type of the array                                                                                                                                                |
| `separator`  | `array`     | This defines the separator that will be used for arrays on hash fields                                                                                                       |
| `properties` | `object`    | The properties the object contains, if this isn't defined the object wont be type checked nor indexed                                                                        |
| `schema`     | `reference` | This is a required property when using references and it allows for intellisense to give the types on auto fetch and later on for certain type checking to also work as well |

# Missing features

- Case sensitive search fields.
- Word stemming.
- Field weight.
- Custom alias for a field.
- Phonetic matcher