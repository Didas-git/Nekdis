import { inspect } from "node:util";

export namespace ParsingError {
    export function Object(key: string) {
        return inspect({
            [key]: {
                type: "object"
            }
        }, { colors: true, compact: false })
    }

    export function Tuple(key: string) {
        return inspect({
            [key]: {
                type: "tuple",
                elements: ["string"]
            }
        }, { colors: true, compact: false })
    }

    export namespace Info {
        export const Object = inspect({
            artist: {
                type: "object",
                data: {
                    name: "string",
                    age: "number",
                    hobbies: "array"
                }
            }
        }, { colors: true })

        export const Tuple = inspect({
            information: {
                type: "tuple",
                elements: ["string", "number", { createdAt: "date", joinedAt: "date" }, "array"]
            }
        }, { colors: true, depth: null })
    }
}