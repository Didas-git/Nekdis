# Table of contents

- [Table of contents](#table-of-contents)
- [Test Environment:](#test-environment)
- [Running the tests](#running-the-tests)
- [Nekdis](#nekdis)
  - [Model.createAndSave](#modelcreateandsave)
    - [With Validation](#with-validation)
      - [Redis-OM Limited](#redis-om-limited)
        - [JSON](#json)
        - [HASH](#hash)
      - [Full Feature](#full-feature)
        - [JSON](#json-1)
        - [HASH](#hash-1)
    - [Without Validation](#without-validation)
      - [Redis-OM Limited](#redis-om-limited-1)
        - [JSON](#json-2)
        - [HASH](#hash-2)
      - [Full Feature](#full-feature-1)
        - [JSON](#json-3)
        - [HASH](#hash-3)
  - [Model.get](#modelget)
    - [Redis-OM Limited](#redis-om-limited-2)
      - [JSON](#json-4)
      - [HASH](#hash-4)
    - [Full Feature](#full-feature-2)
      - [JSON](#json-5)
      - [HASH](#hash-5)
  - [Model.search().returnPage(0, 1000)](#modelsearchreturnpage0-1000)
    - [Redis-OM Limited](#redis-om-limited-3)
      - [JSON](#json-6)
      - [HASH](#hash-6)
    - [Full Feature](#full-feature-3)
      - [JSON](#json-7)
      - [HASH](#hash-7)
- [Redis-OM](#redis-om)
  - [Repository.save](#repositorysave)
    - [JSON](#json-8)
    - [HASH](#hash-8)
  - [Repository.fetch](#repositoryfetch)
    - [JSON](#json-9)
    - [HASH](#hash-9)
  - [Repository.search().returnPage(0, 10000)](#repositorysearchreturnpage0-10000)
    - [JSON](#json-10)
    - [HASH](#hash-10)

# Test Environment:

Redis Stack (v7.2.0-v0) Docker Image Running on Windows WSL Ubuntu.

- OS: Windows 11 Pro
- CPU: AMD Ryzen 9 5950X
- Ram: 64GB 3200MHz
- Node: v20.4.0

> **Note**
> All tests were ran locally because the idea is to test the parsing speeds and not network latency

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

### With Validation

#### Redis-OM Limited

##### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.8ms | 29.3ms | 225.2ms | 2133.4ms | 23778.6ms |
| Request Time Average  | 0.3ms | 0.3ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.5ms | 1.6ms  | 10.3ms  | 110.3ms  | 1172.8ms  |

##### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.6ms | 23.5ms | 201.8ms | 2023.4ms | 22442.3ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.5ms | 1.2ms  | 6.6ms   | 84ms     | 889ms     |

#### Full Feature

##### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.7ms | 24.8ms | 228.5ms | 2255.9ms | 25033.6ms |
| Request Time Average  | 0.3ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.6ms | 1.9ms  | 15.9ms  | 171.1ms  | 1836.4ms  |

##### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000   |
| --------------------- | ----- | ------ | ------- | -------- | -------- |
| Total Time Running    | 2.7ms | 23.1ms | 220.8ms | 2175.3ms | 24172ms  |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms    |
| Batch Request Average | 0.6ms | 1.7ms  | 15.6ms  | 160ms    | 1752.4ms |

### Without Validation

#### Redis-OM Limited

##### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.5ms | 20.8ms | 212.7ms | 2173.9ms | 24038.4ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.4ms | 1.3ms  | 10.3ms  | 116.2ms  | 1231.6ms  |

##### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.4ms | 20.6ms | 197.8ms | 2038.3ms | 22486.2ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.4ms | 1ms    | 7.3ms   | 99ms     | 1039.2ms  |

#### Full Feature

##### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.5ms | 21.8ms | 223.5ms | 2253.2ms | 24776.3ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.5ms | 1.5ms  | 14.3ms  | 146.3ms  | 1584.7ms  |

##### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.3ms | 20.4ms | 215.1ms | 2157.1ms | 23688.4ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.5ms | 1.3ms  | 13.2ms  | 137.2ms  | 1491ms    |



## Model.get

### Redis-OM Limited

#### JSON

| Current               | 10    | 100    | 1000  | 10000    | 100000    |
| --------------------- | ----- | ------ | ----- | -------- | --------- |
| Total Time Running    | 2.5ms | 23.3ms | 212ms | 2128.5ms | 23744.2ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.4ms | 1.1ms  | 7.4ms | 96.6ms   | 1032.8ms  |

#### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.5ms | 21.9ms | 212.3ms | 2069.1ms | 23211.6ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.4ms | 1.3ms  | 9.2ms   | 113.1ms  | 1206.4ms  |

### Full Feature

#### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.4ms | 22.1ms | 219.6ms | 2233.1ms | 24176.8ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.4ms | 1.4ms  | 10.2ms  | 124.7ms  | 1336.2ms  |

#### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.5ms | 23.3ms | 232.2ms | 2288.1ms | 24798.2ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.6ms | 2.3ms  | 19.2ms  | 213.8ms  | 2270.3ms  |

## Model.search().returnPage(0, 1000)

Due to the limitations of redis with the default config we cannot fetch 10K or more at once using search

### Redis-OM Limited

#### JSON

| Current | 10    | 100   | 1000   | 10000 |
| ------- | ----- | ----- | ------ | ----- |
|         | 0.5ms | 1.3ms | 10.4ms | 100ms |

#### HASH

| Current | 10    | 100   | 1000   | 10000 |
| ------- | ----- | ----- | ------ | ----- |
|         | 0.5ms | 1.4ms | 10.1ms | 101ms |

### Full Feature

#### JSON

| Current | 10    | 100 | 1000   | 10000 |
| ------- | ----- | --- | ------ | ----- |
|         | 0.6ms | 2ms | 13.7ms | 142ms |

#### HASH

| Current | 10    | 100 | 1000   | 10000   |
| ------- | ----- | --- | ------ | ------- |
|         | 0.8ms | 3ms | 21.2ms | 209.4ms |

# Redis-OM

There is something to remember about this tests:
- Redis-OM does not have as many array methods (its only has strings)
- Redis-OM does not have references
- Redis-OM does not have nested objects on hashes

## Repository.save

### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 3.9ms | 30.5ms | 285.9ms | 2824.5ms | 30343.1ms |
| Request Time Average  | 0.4ms | 0.3ms  | 0.3ms   | 0.3ms    | 0.3ms     |
| Batch Request Average | 0.9ms | 3.1ms  | 24.2ms  | 226.7ms  | 2479.5ms  |

### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 3.3ms | 28.4ms | 281.9ms | 2764.6ms | 29676.7ms |
| Request Time Average  | 0.3ms | 0.3ms  | 0.3ms   | 0.3ms    | 0.3ms     |
| Batch Request Average | 0.7ms | 2.4ms  | 25.8ms  | 278.2ms  | 3273.6ms  |

## Repository.fetch

### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 3ms   | 24.5ms | 243.2ms | 2655.5ms | 26300.1ms |
| Request Time Average  | 0.3ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.5ms | 2.3ms  | 22.7ms  | 238.8ms  | 2569.8ms  |

### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    |
| --------------------- | ----- | ------ | ------- | -------- | --------- |
| Total Time Running    | 2.6ms | 21.4ms | 216.5ms | 2323.7ms | 23255.1ms |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |
| Batch Request Average | 0.4ms | 1.4ms  | 11.1ms  | 129.5ms  | 1398.3ms  |

## Repository.search().returnPage(0, 10000)

Due to the limitations of redis with the default config we cannot fetch 10K or more at once using search

### JSON

| Current | 10    | 100   | 1000   | 10000   |
| ------- | ----- | ----- | ------ | ------- |
|         | 0.7ms | 2.8ms | 22.1ms | 208.1ms |

### HASH

| Current | 10    | 100   | 1000   | 10000   |
| ------- | ----- | ----- | ------ | ------- |
|         | 0.5ms | 1.6ms | 11.1ms | 113.5ms |