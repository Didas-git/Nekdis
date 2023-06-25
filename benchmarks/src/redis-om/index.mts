import { client } from "./setup.mjs";

export async function main() {
    await client.disconnect();
}