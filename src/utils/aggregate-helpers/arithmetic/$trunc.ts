export function $trunc(x: number, place: number): number {
    const multiplier = Math.pow(10, place),
        adjustedNum = x * multiplier,
        truncatedNum = Math[adjustedNum < 0 ? "ceil" : "floor"](adjustedNum);

    return truncatedNum / multiplier;
}