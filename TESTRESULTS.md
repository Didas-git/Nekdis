# TESTS

Environment:

Redis Stack Image Running on Ubuntu via WSL Windows.

Image ID: `f6a0917d0704c21b5f6e64f817d026f96284a5b6e4349556d1852e068ec07915`

- OS: Win 11 Pro (22H2, 22621.1702)
- CPU: Ryzen 9 5950X
- Ram: 64GB 3200MHz

The values are all ceiled to cut the decimal point of `performance.now`

## Model.get

### JSON

#### Async

| Current                     | 10   | 100  | 1000  | 10000  | 100000  | 350000                          |
| --------------------------- | ---- | ---- | ----- | ------ | ------- | ------------------------------- |
| Simple loop                 | 4ms  | 26ms | 230ms | 2162ms | 21451ms | 75057ms                         |
| Promise.all loop            | 1ms  | 2ms  | 11ms  | 120ms  | 1153ms  | 4272ms                          |
| Simple loop with references | 1ms  | 3ms  | 10ms  | 129ms  | 1118ms  | 4208ms                          |
| Promise.all with references | 11ms | 33ms | 182ms | 1762ms | 21456ms | `JavaScript heap out of memory` |


#### Workers

| 2 Threads                   | 10  | 100  | 1000  | 10000  | 100000  | 350000   |
| --------------------------- | --- | ---- | ----- | ------ | ------- | -------- |
| Simple loop                 | 7ms | 38ms | 326ms | 3510ms | 36144ms | 127687ms |
| Promise.all loop            | 2ms | 8ms  | 47ms  | 486ms  | 8140ms  | 53512ms  |
| Simple loop with references | 2ms | 8ms  | 59ms  | 616ms  | 9042ms  | 58516ms  |
| Promise.all with references | NAN | NAN  | NAN   | NAN    | NAN     | NAN      |



| 6 Threads                   | 10  | 100  | 1000  | 10000  | 100000  | 350000   |
| --------------------------- | --- | ---- | ----- | ------ | ------- | -------- |
| Simple loop                 | 7ms | 40ms | 354ms | 3277ms | 34866ms | 117773ms |
| Promise.all loop            | 1ms | 6ms  | 43ms  | 457ms  | 7607ms  | 52627ms  |
| Simple loop with references | 2ms | 7ms  | 54ms  | 571ms  | 8993ms  | 58143ms  |
| Promise.all with references | NAN | NAN  | NAN   | NAN    | NAN     | NAN      |

> NAN: The current load balancing strategy doesn't support fetching the same id multiple times, refactoring this would require all the tests to be reran