export function $subtract(numbers: Array<number>): number {
    return numbers.reduce((x, y) => x - y);
}