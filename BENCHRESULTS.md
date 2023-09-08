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

> **Warning**
> Be aware that the tests will wipe the entire DB they run on so please be careful and run them on a new docker instance or dev db.

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

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 3.12ms | 27.27ms | 231.66ms | 2279.39ms | 22653.80ms |
| Request Time Average  | 0.29ms | 0.25ms  | 0.22ms   | 0.21ms    | 0.21ms     |
| Batch Request Average | 0.76ms | 1.90ms  | 14.99ms  | 142.01ms  | 1511.94ms  |

##### HASH

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 2.94ms | 23.93ms | 221.72ms | 2111.97ms | 21596.66ms |
| Request Time Average  | 0.27ms | 0.22ms  | 0.21ms   | 0.20      | 0.20ms     |
| Batch Request Average | 0.51ms | 1.41ms  | 9.70ms   | 105.37ms  | 1081.66ms  |

#### Full Feature

##### JSON

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 3.79ms | 30.94ms | 295.54ms | 2985.83ms | 30473.53ms |
| Request Time Average  | 0.35ms | 0.29ms  | 0.28ms   | 0.28ms    | 0.29ms     |
| Batch Request Average | 1.09ms | 6.64ms  | 64.22ms  | 648.15ms  | 7014.24ms  |

##### HASH

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 3.81ms | 31.20ms | 301.04ms | 3033.35ms | 32393.78ms |
| Request Time Average  | 0.36ms | 0.29ms  | 0.28ms   | 0.28ms    | 0.30ms     |
| Batch Request Average | 1.25ms | 8.24ms  | 81.19ms  | 780.81ms  | 8735.30ms  |

### Without Validation

#### Redis-OM Limited

##### JSON

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 2.72ms | 22.35ms | 218.83ms | 2214.90ms | 23443.50ms |
| Request Time Average  | 0.25ms | 0.21ms  | 0.20ms   | 0.21ms    | 0.22ms     |
| Batch Request Average | 0.44ms | 1.33ms  | 10.40ms  | 121.94ms  | 1346.60ms  |

##### HASH

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 2.44ms | 21.22ms | 200.82ms | 2077.87ms | 21732.12ms |
| Request Time Average  | 0.23ms | 0.20ms  | 0.19ms   | 0.19ms    | 0.20ms     |
| Batch Request Average | 0.39ms | 1.05ms  | 7.19ms   | 102.95ms  | 1100.54ms  |

#### Full Feature

##### JSON

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 3.22ms | 29.84ms | 278.71ms | 2746.65ms | 29267.87ms |
| Request Time Average  | 0.30ms | 0.28ms  | 0.26ms   | 0.26ms    | 0.27ms     |
| Batch Request Average | 0.76ms | 4.40ms  | 41.74ms  | 422.19ms  | 4561.44ms  |

##### HASH

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 3.12ms | 27.89ms | 274.24ms | 2796.04ms | 28593.87ms |
| Request Time Average  | 0.29ms | 0.26ms  | 0.26ms   | 0.26ms    | 0.27ms     |
| Batch Request Average | 0.84ms | 5.93ms  | 57.43ms  | 542.91ms  | 6120.16ms  |


## Model.get

### Redis-OM Limited

#### JSON

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 2.54ms | 24.67ms | 224.43ms | 2174.31ms | 22505.80ms |
| Request Time Average  | 0.24ms | 0.23ms  | 0.21ms   | 0.20ms    | 0.21ms     |
| Batch Request Average | 0.40ms | 1.21ms  | 7.68ms   | 97.58ms   | 1028.53ms  |

#### HASH

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 2.63ms | 24.21ms | 221.36ms | 2146.55ms | 22454.33ms |
| Request Time Average  | 0.25ms | 0.23ms  | 0.21ms   | 0.20ms    | 0.21ms     |
| Batch Request Average | 0.44ms | 1.32ms  | 9.04ms   | 117.72ms  | 1265.95ms  |

### Full Feature

#### JSON
| Current               | 10     | 100     | 1000     | 10000    | 100000     |
| --------------------- | ------ | ------- | -------- | -------- | ---------- |
| Total Time Running    | 2.91ms | 26.59ms | 266.08ms | 2655ms   | 27013.13ms |
| Request Time Average  | 0.27ms | 0.25ms  | 0.25ms   | 0.25ms   | 0.25ms     |
| Batch Request Average | 0.68ms | 3.50ms  | 34ms     | 344.74ms | 3981.83ms  |

#### HASH

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 3.61ms | 30.25ms | 303.23ms | 3094.38ms | 32080.72ms |
| Request Time Average  | 0.34ms | 0.28ms  | 0.28ms   | 0.29ms    | 0.3ms      |
| Batch Request Average | 1.09ms | 7.19ms  | 76.38ms  | 791.16ms  | 8992.06ms  |

## Model.search().returnPage(0, 1000)

Due to the limitations of redis with the default config we cannot fetch 10K or more at once using search

### Redis-OM Limited

#### JSON

| Current | 10     | 100    | 1000    | 10000    |
| ------- | ------ | ------ | ------- | -------- |
|         | 0.53ms | 1.69ms | 10.18ms | 100.95ms |

#### HASH

| Current | 10     | 100    | 1000    | 10000    |
| ------- | ------ | ------ | ------- | -------- |
|         | 0.51ms | 1.70ms | 10.54ms | 102.04ms |

### Full Feature

#### JSON

| Current | 10     | 100    | 1000    | 10000    |
| ------- | ------ | ------ | ------- | -------- |
|         | 0.85ms | 5.07ms | 43.93ms | 459.16ms |

#### HASH

| Current | 10     | 100    | 1000    | 10000    |
| ------- | ------ | ------ | ------- | -------- |
|         | 1.72ms | 9.84ms | 86.49ms | 910.23ms |

# Redis-OM

There is something to remember about this tests:
- Redis-OM does not have as many array methods (its only has strings)
- Redis-OM does not have references

## Repository.save

### JSON

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 3.82ms | 32.69ms | 302.09ms | 2948.73ms | 30010.52ms |
| Request Time Average  | 0.36ms | 0.31ms  | 0.28ms   | 0.28ms    | 0.28ms     |
| Batch Request Average | 0.95ms | 3.10ms  | 28.46ms  | 266.44ms  | 2838.49ms  |

### HASH

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 3.39ms | 29.24ms | 283.67ms | 2859.38ms | 28624.78ms |
| Request Time Average  | 0.32ms | 0.27ms  | 0.27ms   | 0.27ms    | 0.27ms     |
| Batch Request Average | 0.73ms | 2.44ms  | 25.43ms  | 289.84ms  | 3210.21ms  |

## Repository.fetch

### JSON

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 2.89ms | 24.91ms | 247.19ms | 2533.28ms | 26183.07ms |
| Request Time Average  | 0.27ms | 0.23ms  | 0.23ms   | 0.24ms    | 0.25ms     |
| Batch Request Average | 0.59ms | 2.64ms  | 24.84ms  | 261.48ms  | 2733.04ms  |

### HASH

| Current               | 10     | 100     | 1000     | 10000     | 100000     |
| --------------------- | ------ | ------- | -------- | --------- | ---------- |
| Total Time Running    | 2.46ms | 22.49ms | 218.73ms | 2222.15ms | 23965.37ms |
| Request Time Average  | 0.23ms | 0.21ms  | 0.20ms   | 0.21ms    | 0.22ms     |
| Batch Request Average | 0.39ms | 1.31ms  | 10.80ms  | 127.13ms  | 1321.98ms  |

## Repository.search().returnPage(0, 10000)

Due to the limitations of redis with the default config we cannot fetch 10K or more at once using search

### JSON

| Current | 10     | 100    | 1000    | 10000    |
| ------- | ------ | ------ | ------- | -------- |
|         | 0.82ms | 3.36ms | 24.27ms | 234.73ms |

### HASH

| Current | 10     | 100    | 1000    | 10000    |
| ------- | ------ | ------ | ------- | -------- |
|         | 0.54ms | 1.57ms | 10.89ms | 110.49ms |