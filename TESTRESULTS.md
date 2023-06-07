# Table of contents

- [Table of contents](#table-of-contents)
- [Nekdis](#nekdis)
  - [Local](#local)
    - [Model.get](#modelget)
      - [JSON](#json)
      - [HASH](#hash)
  - [Remote](#remote)
- [Redis-OM](#redis-om)
  - [Local](#local-1)
    - [Repository.fetch](#repositoryfetch)
      - [JSON](#json-1)
      - [HASH](#hash-1)

Environment:

Redis Stack Image Running on Ubuntu via WSL Windows.

Image ID: `f6a0917d0704c21b5f6e64f817d026f96284a5b6e4349556d1852e068ec07915`

- OS: Win 11 Pro (22H2, 22621.1702)
- CPU: Ryzen 9 5950X
- Ram: 64GB 3200MHz

The values are all ceiled to cut the decimal point of `performance.now`

> NOTE: The values of the last test on each category is not an average and the real time it took to do it 15 times.

# Nekdis

## Local

### Model.get

#### JSON

| Current                     | 10  | 100  | 1000  | 10000  | 100000  | 350000                          |
| --------------------------- | --- | ---- | ----- | ------ | ------- | ------------------------------- |
| Simple loop                 | 3ms | 25ms | 219ms | 2135ms | 21827ms | 75047ms                         |
| Promise.all loop            | 1ms | 2ms  | 10ms  | 120ms  | 1230ms  | 4436ms                          |
| Simple loop with references | 1ms | 2ms  | 10ms  | 133ms  | 1167ms  | 4466ms                          |
| Promise.all with references | 7ms | 18ms | 175ms | 1906ms | 21518ms | `JavaScript heap out of memory` |

#### HASH

| Current                     | 10  | 100  | 1000  | 10000  | 100000  | 350000                          |
| --------------------------- | --- | ---- | ----- | ------ | ------- | ------------------------------- |
| Simple loop                 | 4ms | 25ms | 226ms | 2200ms | 21848ms | 75985ms                         |
| Promise.all loop            | 1ms | 2ms  | 15ms  | 176ms  | 1772ms  | 6674ms                          |
| Simple loop with references | 1ms | 3ms  | 16ms  | 195ms  | 1756ms  | 6666ms                          |
| Promise.all with references | 4ms | 32ms | 297ms | 2921ms | 34932ms | `JavaScript heap out of memory` |

## Remote

During remote tests i came across one of node-redis's limitations which rly impacted the tests that do not use `Promise.all`

This does also affect the library to some extend due to using node-redis on the background

I wont be adding the results here since i could not run tests for that long and from the few results i got i can ensure you the only issue i came across was really node-redis's limitations but the parsing still sat at 0.13~0.21ms per doc.

# Redis-OM

Currently redis-om does not have references nor tuples so those cannot be tested nor included into the docs

## Local

### Repository.fetch

#### JSON

| Current                     | 10  | 100  | 1000  | 10000  | 100000  | 350000  |
| --------------------------- | --- | ---- | ----- | ------ | ------- | ------- |
| Simple loop                 | 4ms | 27ms | 251ms | 2307ms | 23516ms | 85170ms |
| Promise.all loop            | 1ms | 3ms  | 23ms  | 217ms  | 2317ms  | 9330ms  |
| Simple loop with references | NAN | NAN  | NAN   | NAN    | NAN     | NAN     |
| Promise.all with references | NAN | NAN  | NAN   | NAN    | NAN     | NAN     |

#### HASH

Hashes cannot contain objects in redis-om

| Current                     | 10  | 100  | 1000  | 10000  | 100000  | 350000  |
| --------------------------- | --- | ---- | ----- | ------ | ------- | ------- |
| Simple loop                 | 3ms | 25ms | 230ms | 2293ms | 22080ms | 76441ms |
| Promise.all loop            | 1ms | 2ms  | 12ms  | 130ms  | 1389ms  | 5354ms  |
| Simple loop with references | NAN | NAN  | NAN   | NAN    | NAN     | NAN     |
| Promise.all with references | NAN | NAN  | NAN   | NAN    | NAN     | NAN     |