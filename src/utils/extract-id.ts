export const RecordRegex = new RegExp(/:(.+)/);

export function extractIdFromRecord(record: string): string {
    const match = RecordRegex.exec(record);

    if (match === null) throw new PrettyError();

    return match[1];
}