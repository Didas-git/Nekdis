import { client } from "./index";

(async () => {
    // await client.connect();
    const userSchema = client.schema({
        name: "string",
        age: "number",
        friends: {
            type: "array",
            elements: "array"
        }
    }, {
        newSave: async function (s: string) {
            return <any>this.save
        }
    });

    const userModel = client.model("User", userSchema)
    const doc = userModel.create()

    doc.friends
    // await client.disconnect();
})()