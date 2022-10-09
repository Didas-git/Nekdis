import { Client } from "./src";

const c = new Client();
(async () => {
    await c.connect();

    const sch = c.schema({
        name: "string",
        age: "number"
    });

    const mod = c.model("t", sch);

    await mod.createIndex();

    await mod.createAndSave({
        name: "DidaS"
    });

    console.log(await mod.search().where("name").eq("DidaS").returnAll());

    await c.disconnect()
})()