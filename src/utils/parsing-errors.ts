import { inspect } from "node:util";

export const ParsingErrors = {
    Fix: {
        Object: (key: string): string => inspect({
            [key]: {
                type: "object"
            }
        }, { colors: true, compact: false }),
        Reference: (key: string): string => inspect({
            [key]: {
                type: "reference",
                schema: "`SchemaInstance`"
            }
        }, { colors: true, compact: false })
    },
    Info: {
        Object: inspect({
            artist: {
                type: "object",
                properties: {
                    name: "string",
                    age: "number",
                    hobbies: "array"
                }
            }
        }, { colors: true })
    }
};