# Table of contents

- [Table of contents](#table-of-contents)
- [Test Environment:](#test-environment)
- [Running the tests](#running-the-tests)
- [Nekdis](#nekdis)
  - [Model.createAndSave](#modelcreateandsave)
    - [Redis-OM Limited](#redis-om-limited)
      - [With Validation](#with-validation)
        - [JSON](#json)
        - [HASH](#hash)
      - [Without Validation](#without-validation)
        - [JSON](#json-1)
        - [HASH](#hash-1)
    - [Full Feature](#full-feature)
      - [With Validation](#with-validation-1)
        - [JSON](#json-2)
        - [HASH](#hash-2)
      - [Without Validation](#without-validation-1)
        - [JSON](#json-3)
        - [HASH](#hash-3)
  - [Model.get](#modelget)
    - [Redis-OM Limited](#redis-om-limited-1)
      - [JSON](#json-4)
      - [HASH](#hash-4)
    - [Full Feature](#full-feature-1)
      - [JSON](#json-5)
      - [HASH](#hash-5)
  - [Model.search().returnPage(0, 9999)](#modelsearchreturnpage0-9999)
    - [Redis-OM Limited](#redis-om-limited-2)
      - [JSON](#json-6)
      - [HASH](#hash-6)
    - [Full Feature](#full-feature-2)
      - [JSON](#json-7)
      - [HASH](#hash-7)
- [Redis-OM](#redis-om)
  - [Repository.save](#repositorysave)
    - [JSON](#json-8)
    - [HASH](#hash-8)
  - [Repository.fetch](#repositoryfetch)
    - [JSON](#json-9)
    - [HASH](#hash-9)
  - [Repository.search().returnPage(0, 9999)](#repositorysearchreturnpage0-9999)
    - [JSON](#json-10)
    - [HASH](#hash-10)

# Test Environment:

Redis Stack (v6.2.6-v7) Docker Image Running on MacOS.

- OS: MacOS Ventura (13.4.1)
- CPU: Apple M1
- Ram: 16GB

> NOTE: All tests were ran locally because the idea is to test how the new data types and parsing system impacts performance compared to redis-om

# Running the tests

**Warning:** Be aware that the tests will wipe the entire DB they run on so please be careful and run them on a new docker instance or dev db.

To run the tests its pretty simples, just clone the repository, build the library using `pnpm run build` and run the benchmarks by doing `pnpm run bench`.

The benchmark script accept 3 arguments:

`pnpm run bench [iterations] [documents] [spv]`

Defaults (See: [bench](./benchmarks/src/index.mts)):
- Iterations - 15
- Documents - 1000
- SPV - `Skip Page Validation` should only be set to true if and only if you have overwritten the default redis config, otherwise it will crash saying that RediSearch cant return more than 10K documents

# Nekdis

A few notes on the tests, to make them as close as possible to reality the Nekdis tests are each one divided into 2 categories, `Redis-OM Limited` and `Full Feature` and here is the meaning of that:

- `Redis-OM Limited` - This tests only use the same features available in redis-om, that means no objects in hashes, no number arrays or any other Nekdis-only feature
- `Full Feature` - This tests are ran while using almost all features of Nekdis, from number arrays to references, the feature that isn't explicitly counted on the benchmarks is the `default` option because either way it is checked already by default (See: [Source](https://github.com/Didas-git/Nekdis/blob/main/src/document/json-document.ts#L110))

## Model.createAndSave

### Redis-OM Limited

#### With Validation

##### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

##### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

#### Without Validation

##### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

##### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

### Full Feature

#### With Validation

##### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

##### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

#### Without Validation

##### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

##### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

## Model.get

### Redis-OM Limited

#### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

#### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

### Full Feature

#### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

#### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

## Model.search().returnPage(0, 9999)

Due to the limitations of redis with the default config we cannot fetch 10K or more at once using search

### Redis-OM Limited

#### JSON

| Current | 10  | 100 | 1000 | 9999 |
| ------- | --- | --- | ---- | ---- |
|         |     |     |      |      |

#### HASH

| Current | 10  | 100 | 1000 | 9999 |
| ------- | --- | --- | ---- | ---- |
|         |     |     |      |      |

### Full Feature

#### JSON

| Current | 10  | 100 | 1000 | 9999 |
| ------- | --- | --- | ---- | ---- |
|         |     |     |      |      |

#### HASH

| Current | 10  | 100 | 1000 | 9999 |
| ------- | --- | --- | ---- | ---- |
|         |     |     |      |      |

# Redis-OM

There is something to remember about this tests:
- Redis-OM does not have as many array methods (its only has strings)
- Redis-OM does not have references
- Redis-OM does not have nested objects on hashes

## Repository.save

### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

## Repository.fetch

### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

## Repository.search().returnPage(0, 9999)

Due to the limitations of redis with the default config we cannot fetch 10K or more at once using search

### JSON

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |

### HASH

| Current | 10  | 100 | 1000 | 10000 | 100000 | 350000 |
| ------- | --- | --- | ---- | ----- | ------ | ------ |
|         |     |     |      |       |        |        |