import { createClient } from "redis";

const client = createClient();
client.connect();

while(1) {
    const element = await client.RPOP("engine");

    if(!element) {
        continue;
    }
}