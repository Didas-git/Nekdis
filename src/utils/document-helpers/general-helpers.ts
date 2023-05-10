export function dateToNumber(val: Date | string | number): number {
    if (val instanceof Date) return val.getTime();
    if (typeof val === "string" || typeof val === "number") return new Date(val).getTime();
    throw new Error();
}

export function numberToDate(val: number): Date {
    return new Date(val);
}