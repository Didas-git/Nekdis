export const RecordRegex = new RegExp(/:(.+)/);

export function extractIdFromRecord(record: string): string {
    const match = RecordRegex.exec(record);

    if (match === null) return record;
    return match[1];
}