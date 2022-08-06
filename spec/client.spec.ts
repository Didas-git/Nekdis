import { createClient } from "redis";
import { client, Schema, Model } from "../src/index";

client.connect();

const userSchema = client.schema({
    name: "string",
    age: "number"
})

const userModel = client.model("User", userSchema);

describe("client", () => {

    test.todo("connect")
    test.todo("disconnect")
    test.todo("should be open")
    test.todo("should be closed")

    test("create schema", () => {
        expect(userSchema).toStrictEqual(new Schema({ name: "string", age: "number" }))
    })


    describe("model", () => {
        test.todo("create model", () => {
            expect(userModel).toStrictEqual(new Model(userSchema, createClient()))
        })

        describe("fetch model from client cache", () => {
            test("fetch non existent", () => {
                expect(() => client.model("Non")).toThrowError()
            })

            test("fetch existent", () => {
                expect(client.model("User")).toEqual(new Model(userSchema, createClient()))
            })
        })
    })

    describe("document", () => {
        test.todo("creates a new document with the properties and methods defined", () => {
            expect(client.model("User").create()).toBeDefined()
        })
    })
})