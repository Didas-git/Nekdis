export function $add(array: Array<number>): number {
    return array.reduce((x, y) => x + y);
}