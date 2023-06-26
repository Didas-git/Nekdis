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
  - [Model.search().returnPage(0, 10000)](#modelsearchreturnpage0-10000)
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
  - [Repository.search().returnPage(0, 10000)](#repositorysearchreturnpage0-10000)
    - [JSON](#json-10)
    - [HASH](#hash-10)
- [Conclusion](#conclusion)

# Test Environment:

Redis Stack (v6.2.6-v7) Docker Image Running on MacOS.

- OS: Windows 11 Pro (22H2 22621.1848)
- CPU: AMD Ryzen 9 5950X
- Ram: 64GB 3200MHz
- Node: v20.0.0

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

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 3ms   | 23.5ms | 212.7ms | 2140.4ms | 21351.3ms |        |
| Request Time Average  | 0.3ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.5ms | 1.5ms  | 10.7ms  | 115.5ms  | 1291.4ms  |        |

##### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 2.7ms | 20.7ms | 200.1ms | 1992.2ms | 20070.2ms |        |
| Request Time Average  | 0.3ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.4ms | 1.1ms  | 7.7ms   | 81.9ms   | 950.7ms   |        |

#### Without Validation

##### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 2.5ms | 21.5ms | 216.2ms | 2190.4ms | 21637.4ms |        |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.4ms | 1.4ms  | 11.7ms  | 131.8ms  | 1425.5ms  |        |

##### HASH

| Current               | 10    | 100    | 1000    | 10000   | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | ------- | --------- | ------ |
| Total Time Running    | 2.3ms | 19.8ms | 193.2ms | 1984ms  | 20209.8ms |        |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms   | 0.2ms     |        |
| Batch Request Average | 0.4ms | 1ms    | 9.1ms   | 103.9ms | 1121.1ms  |        |

### Full Feature

#### With Validation

##### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 2.9ms | 23.5ms | 224.3ms | 2308.8ms | 23176.2ms |        |
| Request Time Average  | 0.3ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.5ms | 2ms    | 16.5ms  | 185.3ms  | 1942ms    |        |

##### HASH

| Current               | 10    | 100    | 1000    | 10000   | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | ------- | --------- | ------ |
| Total Time Running    | 2.8ms | 21.7ms | 211.5ms | 2168ms  | 21830.4ms |        |
| Request Time Average  | 0.3ms | 0.2ms  | 0.2ms   | 0.2ms   | 0.2ms     |        |
| Batch Request Average | 0.5ms | 1.6ms  | 15.9ms  | 163.1ms | 1743.9ms  |        |

#### Without Validation

##### JSON

| Current               | 10    | 100   | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ----- | ------- | -------- | --------- | ------ |
| Total Time Running    | 2.5ms | 22ms  | 227.3ms | 2234.3ms | 22914.9ms |        |
| Request Time Average  | 0.2ms | 0.2ms | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.5ms | 1.6ms | 15.5ms  | 152.7ms  | 1662.1ms  |        |

##### HASH

| Current               | 10    | 100    | 1000    | 10000   | 100000   | 350000 |
| --------------------- | ----- | ------ | ------- | ------- | -------- | ------ |
| Total Time Running    | 2.2ms | 20.8ms | 207.7ms | 2113ms  | 21535ms  |        |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms   | 0.2ms    |        |
| Batch Request Average | 0.4ms | 1.4ms  | 12.5ms  | 137.4ms | 1470.2ms |        |

## Model.get

### Redis-OM Limited

#### JSON

| Current               | 10    | 100    | 1000  | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ----- | -------- | --------- | ------ |
| Total Time Running    | 2.3ms | 21.2ms | 207ms | 2085.8ms | 21015.8ms |        |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.4ms | 1.2ms  | 7.6ms | 100.7ms  | 1034.1ms  |        |

#### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 2.2ms | 21.5ms | 206.4ms | 2060.4ms | 20790.5ms |        |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.4ms | 1.4ms  | 10.4ms  | 134.2ms  | 1328.1ms  |        |

### Full Feature

#### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 2.4ms | 21.7ms | 213.3ms | 2156.6ms | 21896.2ms |        |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.4ms | 1.4ms  | 9.8ms   | 128.5ms  | 1301ms    |        |

#### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 2.5ms | 22.8ms | 223.9ms | 2272.5ms | 23015.6ms |        |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.5ms | 2.3ms  | 20.3ms  | 226ms    | 2261.1ms  |        |

## Model.search().returnPage(0, 10000)

Due to the limitations of redis with the default config we cannot fetch 10K or more at once using search

### Redis-OM Limited

#### JSON

| Current | 10    | 100   | 1000   | 10000   |
| ------- | ----- | ----- | ------ | ------- |
|         | 0.5ms | 1.5ms | 10.4ms | 110.7ms |

#### HASH

| Current | 10    | 100   | 1000   | 10000   |
| ------- | ----- | ----- | ------ | ------- |
|         | 0.5ms | 1.7ms | 11.7ms | 125.3ms |

### Full Feature

#### JSON

| Current | 10    | 100   | 1000   | 10000 |
| ------- | ----- | ----- | ------ | ----- |
|         | 0.5ms | 1.8ms | 13.3ms | 142ms |

#### HASH

| Current | 10    | 100   | 1000   | 10000 |
| ------- | ----- | ----- | ------ | ----- |
|         | 0.7ms | 2.9ms | 21.3ms | 228ms |

# Redis-OM

There is something to remember about this tests:
- Redis-OM does not have as many array methods (its only has strings)
- Redis-OM does not have references
- Redis-OM does not have nested objects on hashes

## Repository.save

### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 3.6ms | 30.4ms | 271.8ms | 2811.4ms | 28620.5ms |        |
| Request Time Average  | 0.3ms | 0.3ms  | 0.3ms   | 0.3ms    | 0.3ms     |        |
| Batch Request Average | 0.6ms | 2.9ms  | 22.2ms  | 226.3ms  | 2483.5s   |        |

### HASH

| Current               | 10    | 100   | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ----- | ------- | -------- | --------- | ------ |
| Total Time Running    | 3.3ms | 28ms  | 265.6ms | 2724.1ms | 27444.3ms |        |
| Request Time Average  | 0.3ms | 0.3ms | 0.3ms   | 0.3ms    | 0.3ms     |        |
| Batch Request Average | 0.6ms | 2.2ms | 22.8ms  | 264.5ms  | 3275.5ms  |        |

## Repository.fetch

### JSON

| Current               | 10    | 100    | 1000    | 10000    | 100000    | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | --------- | ------ |
| Total Time Running    | 2.7ms | 23.5ms | 234.8ms | 2388.7ms | 24454.3ms |        |
| Request Time Average  | 0.3ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms     |        |
| Batch Request Average | 0.5ms | 2.4ms  | 22.1ms  | 226.2ms  | 2405.5ms  |        |

### HASH

| Current               | 10    | 100    | 1000    | 10000    | 100000   | 350000 |
| --------------------- | ----- | ------ | ------- | -------- | -------- | ------ |
| Total Time Running    | 2.3ms | 21.7ms | 212.4ms | 2132.5ms | 21974ms  |        |
| Request Time Average  | 0.2ms | 0.2ms  | 0.2ms   | 0.2ms    | 0.2ms    |        |
| Batch Request Average | 0.4ms | 1.4ms  | 12.5ms  | 129.9ms  | 1322.1ms |        |

## Repository.search().returnPage(0, 10000)

Due to the limitations of redis with the default config we cannot fetch 10K or more at once using search

### JSON

| Current | 10    | 100   | 1000   | 10000   |
| ------- | ----- | ----- | ------ | ------- |
|         | 0.6ms | 2.4ms | 18.9ms | 193.3ms |

### HASH

| Current | 10    | 100   | 1000   | 10000   |
| ------- | ----- | ----- | ------ | ------- |
|         | 0.4ms | 1.4ms | 10.9ms | 111.3ms |

# Conclusion

When the 350K tests are over i will write this section