# This Document

The purpose of this document is to document the inner workings of Nekdis, if you are not interested in collaborating to the project or do not care about the internals at all you can skip this file.

This is to follow the policy of "no hidden behavior" i want to implement.

# Table of Contents

- [This Document](#this-document)
- [Table of Contents](#table-of-contents)
- [The Schema](#the-schema)
  - [Parsing](#parsing)
    - [Input](#input)
    - [Output](#output)
  - [Extending](#extending)
  - [Future Plans](#future-plans)
- [Model](#model)
  - [Constructing](#constructing)
  - [Parsing the Schema](#parsing-the-schema)
    - [Structure](#structure)
    - [Internals](#internals)
      - [`ObjectField`](#objectfield)
      - [`ReferenceField`](#referencefield)
      - [`TupleField`](#tuplefield)
  - [The search hash](#the-search-hash)
- [Documents](#documents)
  - [Setup](#setup)
  - [Populating](#populating)
  - [Saving process](#saving-process)
    - [Validation](#validation)
    - [JSON](#json)
    - [HASH](#hash)
  - [Parsing fetched data](#parsing-fetched-data)
    - [JSON](#json-1)
    - [HASH](#hash-1)
- [The types](#the-types)
  - [Parsing the Schema (`ParseSchema`)](#parsing-the-schema-parseschema)
  - [Mapping the Schema (`ReturnDocument`)](#mapping-the-schema-returndocument)
  - [Mapping the Search fields (`ParseSearchSchema`)](#mapping-the-search-fields-parsesearchschema)

# The Schema

The purpose of the schema class is to simply parse the `schemaData` passed to it so you can use "shortcuts" and properly define your schema

## Parsing

### Input

The parser will always receive the data the user gave as input which is in the following format:

```ts
Record<
    string,
    keyof (Omit<
        FieldMap, "tuple" | "object" | "reference"
    > | FieldTypes)
>
```

The `Omit` here is important because those fields cannot have a shortcut method because they required explicit extra fields.

The definition of shortcut here is that you can do `field: typeString` instead of `field: { type: typeString }`.

You can check the full [Schema Definition](./src/typings/schema-definition.ts) for more details (comments will be added in a later date to the entire code base).

### Output

The parser should always output the following format:

```ts
{
    data: Record<string, FieldType>,
    references: Record<string, null>
}
```

The `references` object exists for 2 reasons:

1. Being able to properly type them out for the user
2. Being able to distinguish which fields should be parsed as references for auto fetch

This however could be changed in the future but right now i don't know how i could make it better.

The type-level transformation can be found on [here](./src/typings/parse-schema.ts) and the runtime parsing can be found on the [Schema](./src/schema.ts) under the `#parse` function.

## Extending

Currently the `extends` feature is rly limited and doesn't support methods nor selective extends.

## Future Plans

I plan on adding a new union on the `properties` of the ObjectField so you can have a shared schema for multiple objects.

It would work something like this:

```ts
const shared = client.schema({
    multiplier: "number",
    value: "number"
})

const mainSchema = client.schema({
    atk: {
        type: "object",
        properties: shared
    },
    hp: {
        type: "object",
        properties: shared
    }
})
```

# Model

The model is what will do a lot of the heavy lifting for you and requires a more in-depth explanation, so here we go.

## Constructing

When a model gets constructed it goes through 4 steps:

1. [Parsing the Schema](#parsing-the-schema)
2. Initial setup off the search index
3. [Creating the search hash](#the-search-hash)
4. Adding the methods from `Schema.methods` into itself

## Parsing the Schema

This will change soon due to some findings i did, but, for now lets document whats written.

The type-level transformations can be found [here](./src/typings/map-search-fields.ts) (tho keep in mind they are only used on the [Search](#search) and not on the model) and the runtime parsing can be found [here](./src/utils/parse.ts) 

### Structure

The `parseSchemaToSearchIndex` is responsible for generating the following structure:

```ts
Map<string, {
    // with some exclusions that i will explain in a moment
    value: FieldType,
    path: string
}>
```

Due to the limitations of RediSearch its not possible to created an alias with dots (`.`) so the following is invalid:

```txt
$.object.property AS object.property
```

To circumvent this and still give the user a good experience the created Map looks like this:

```ts
{
    "object.property" => {
        value: ..., // Field
        path: "object_property"
    }
}
```

and later on gets defined as:

```txt
$.object.property AS object_property
```

### Internals

Before i mentioned that some fields are excluded from the map type, this is because they are converted to other field types internally.

This is the list of currently ignored fields:

#### `ObjectField`

The object fields go into recursion until they are narrowed down to a more "primitive" value.

So the input:

```ts
object: {
    type: "object",
    properties: {
        property: "string"
    }
}
```

Converts to:

```ts
{
    "object.property" => {
        value: {
            type: "string",
            ...
        }, // StringField
        path: "object_property"
    }
}
```

#### `ReferenceField`

Reference fields get skipped entirely and are not even passed to the function at the moment.

#### `TupleField`

Due to the nature of tuples they are not saved as arrays internally and are instead saved as a key-value pair.

> **Note:**
> This behaviour will change and tuples will only be converted to key-value pairs if they are indexed or if you are using hashes

So the following tuple:

```ts
tuple: {
    type: "tuple",
    elements: ["number"]
}
```

Gets converted to:

```ts
{
    "t.0" => {
        value: {
            type: "number",
            ...
        }, // NumberField
        path: "t_0"
    }
}
```

## The search hash

Currently the hash is pretty primitive, it gathers the model name, data structure and schema definition and makes a `sha1` hash digested into `base64`.

However **this will change**, when progress on [#10](https://github.com/Didas-git/Nekdis/issues/10) is made there will be a new way to create the hashes since it only needs to be changed if a indexable field gets added or removed.

# Documents

Documents are the abstractions behind the data you see, they are responsible for transforming the js data into its corresponding format (JSON or HASH) and do all the extra steps needed.

## Setup

There are 2 essential steps when creating the document:

1. Define document-exclusives (fields prefixed with `$`)
2. [Populate](#populating)

## Populating

Populating the document has 2 steps:

- Populating with defaults
  - This adds all the default values to the document
- Populating with data (if available)

If the document has data to populate it will do a simple check:

> "Was the data fetched from database or given by the user"

If the data was passed by the user it will just append the data to the document so later on it can be validated and/or saved

If the data was fetched from the database it will go through some steps depending on the data structure, lets break them down following the exact steps of the current version (0.10.3) of the "parsers" so i can explain as you go along (open the code on the side for better clarification if you need)..

## Saving process

> **Note:**
> `$id` and `$suffix` are saved to the database due to some limitations.

### Validation

I wont go to much in depth on the validation process because in my opinion it is rly straight forward, just check if the given value is according to the schema.

### JSON

The only "hard" step we have to do is parse tuples to key-value pairs.
However this implementation is really bad and needs to be reworked from the ground up, currently it will only go 1 level deep into an object, so if you have objects with lots of nested fields it will save them but the search functionality wont work.
This is really bad because i haven't added any warning for it which i wont at this stage because i will reword the entire method anyways but for now its written here.

If we are not dealing with tuples the conversions are really simple:

```txt
date -> number (in ms)
point -> "longitude,latitude"
array -> recursive (just in case its an array of dates or points or objects)
object -> recursive
vector -> normal array
```

`JSON.stringify` will do the rest for us

### HASH

Hashes are a little bit more tricky than JSON because they can only be key-value pairs.
So here is how we handle the different types:

**Objects:**

Just like we need before for the search index but a little bit more complex because we also need to parse the value.

This is the value parsing list for hashes:

```txt
boolean -> string (0 or 1)
date -> string (number in ms)
point -> "longitude,latitude"
array -> recursive (same reason as JSON)
vector -> buffer -> string
```

**Tuple:**

This works just like the JSON method did **but** without the issue mentioned, the hashes one will go as deep as you want (because otherwise it would fail rly...)

The parsing list was given above.

## Parsing fetched data

### JSON

We attempt to split the keys to check if we are currently interacting with a tuple or not, this is due to how the data is saved on the db currently. See: [Saving Process](#saving-process)

*IF* it is a tuple we shift it so we remove the key/field name of the array.
*IF* the length its 1 that means that it is a primitive value we are dealing with (not an object) so we can just tell it to parse the data with the element on that position
*ELSE* we know we are dealing with an object inside a tuple so we have to get the position on the array that has the object information and parse it just like a normal object.

However there is a problem with this approach that i already talked about in the saving part (its the same problem).

The last 2 steps are fairly simple but need some rework, lets talk about why.

Right now the library allows you to save data that you haven't defined on the schema, this is something that i dealt with in a really poor way on the saving part but here its simple, here is how it goes:

*IF* the key exists on the schema data, parse it using the given schema
*IF* the key key exists on the references (therefore doesn't exist on the data) append it using the `ReferenceArray` helper
*IF* both of the above checks fail then its data the user saved without defining on the schema, just append it as is.

Parsing list:

```txt
IF date
number (in ms) -> Date

IF point
"longitude,latitude" -> point

IF object
recursive in a way

IF array
recursive (same reason mentioned in the saving)

IF vector
array -> Float32Array _OR_ Float64Array (It checks the vector options)
```

### HASH

*Oh boy what a pain this is...*

Hashes has to be the most complex and overthought parser in this library... maintaining and editing this is a great pain and i still have no idea how to improve it.

Anyway... lets move on...

We attempt to split the keys to check if we are currently interacting with a tuple or not, this is due to how the data is saved on the db currently. See: [Saving Process](#saving-process)

*IF* it splits we check to see if its a tuple or an object and shift to remove the key/field name of the array 
*IF* it is a tuple we do the following:

*IF* the length its 1 that means that it is a primitive value we are dealing with (not an object) so we can just tell it to parse the data with the element on that position
*ELSE* we know we are dealing with something else inside a tuple so we have to get the position on the array that has the information and parse it.

*IF* it is an object we do the following:

We get the last key of the string and attempt to gather its information from the schema to parse it.

Otherwise the last step its pretty much the same as JSON

# The types

At first glance the types of the library may look way to overcomplicated but they are the only way i could find to do a proper translation from the js code into all the different types we need without using decorators or explicit types, this way the library will have types everywhere even for js users and ts users wont need to write any extra types.

Lets make a quick breakdown of the most important type transformations that go on.

## Parsing the Schema (`ParseSchema`)

The first complex type you come across in the library is the `ParseSchema` type.

Looking at it at first might get you thinking "why?" or "what does it do?" well let me explain.

The type does exactly what the [Schema Parsing](#parsing) does but on the type level with some workarounds to make tuples work properly.

## Mapping the Schema (`ReturnDocument`)

The most common type and the one you will come across the most is the `MapSchema` type.

This is almost the most complicated type of the library (the crown still goes for the search strings) it is responsible of transforming all the objects into working types, let me explain.

As mentioned before the `ParseSchema` type does the same as its runtime counterpart, this means that it is pure objects and strings, there are no actual types on it, and thats where the `MapSchema` type comes in, it takes all the information of the objects and strings and converts them into types, lets visualize it with an example.

This is our initial value:

```ts
str: "string"
```

It goes through the `ParseSchema` which will return:

```ts
{
    data: {
        str: {
            type: "string",
            optional: false,
            sortable: false,
            index: true,
            default: undefined
        }
    }
}
```

We would pass it to `MapSchema` which would return the following type:

```ts
str: string
```

**If** `optional` was set to `true` it would return:

```ts
str?: string | undefined
```

## Mapping the Search fields (`ParseSearchSchema`)

This is the most daunting and arguably most complex type of the entire library, this is due to the amount of string manipulation that goes on that makes it hard to wrap your head around it.

But with that said, what the type does its pretty simple, its literally half of what the [Model Parsing](#parsing-the-schema) does, being converting a field into the map key, aka:

This:

```ts
object: {
    type: "object",
    properties: {
        property: {
            type: "string",
            ...
        }
    },
    ...
}
```

Into:

```ts
"object.property": "string"
```

This is all for the intellisense so when you do `search().where()` it will show you all the fields you can use in `where` (if they are not indexable they wont show up) and give you the right `SearchField` type as well.