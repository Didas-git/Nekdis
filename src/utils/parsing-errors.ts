import { inspect } from "node:util";

export const ParsingError = {
    Object: (key: string): string => {
        return inspect({
            [key]: {
                type: "object"
            }
        }, { colors: true, compact: false });
    },
    Info: {
        Object: inspect({
            artist: {
                type: "object",
                data: {
                    name: "string",
                    age: "number",
                    hobbies: "array"
                }
            }
        }, { colors: true }),
    }
};