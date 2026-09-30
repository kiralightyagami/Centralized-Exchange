import { createClient } from "redis";

const client = createClient();
const sendClient = createClient();
sendClient.connect();

client.connect()
    .then(async () => {
        while (1) {
            const element = await client.brPop("engine-queue", 1000);

            if (!element) {
                continue;
            }

            console.log(element);
        }
    });