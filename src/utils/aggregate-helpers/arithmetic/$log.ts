export function $log(x: number, base: number): number {
    return Math.log(x) / (base ? Math.log(base) : 1);
}