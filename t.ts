import { Client } from "./src";

(async () => {
    const client = await new Client().connect();

    const UserSchema = client.schema({
        name: { type: "string", required: true },
        age: { type: "number", required: true },
        hobbies: { type: "array", default: [] }
    });

    const UserModel = client.model("User", UserSchema);

    await UserModel.createIndex();

    await UserModel.createAndSave({
        _id: 3,
        name: "DidaS",
        age: 18
    });

    await UserModel.createAndSave({
        _id: 2,
        name: "Nightmaretopia",
        age: 16
    });

    await UserModel.createAndSave({
        _id: 1,
        name: "Niek",
        age: 18
    });

    console.log("By Name:", await UserModel.search().where("name").equals("DidaS").returnFirst());
    console.log("By Age:", await UserModel.search().where("age").equals(18).returnAll());

    await UserModel.deleteIndex();
    await UserModel.delete(3);

    await client.disconnect();
})();