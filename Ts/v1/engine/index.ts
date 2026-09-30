import { createClient } from "redis";

const client = createClient();
const sendClient = createClient();
sendClient.connect();

const USER_USD_BALANCES: Record<number, number> = {};

const STOCK_BALANCES: Record<number, Record<string, number>> = {};

client.connect()
    .then(async () => {
        while (1) {
            const value = await client.brPop("engine-queue", 1000);

            if (!value) {
                continue;
            }

            const parsedData = JSON.parse(value.element);

            if (parsedData.type == "onramp") {
                const userId = parsedData.payload.userId;
                if (!USER_USD_BALANCES[userId]) {
                    USER_USD_BALANCES[userId] = 0;
                }
                USER_USD_BALANCES[userId] += parsedData.payload.amount;
            }

            if (parsedData.type == "deposit") {
                const userId = parsedData.payload.userId;
                const ticker = parsedData.payload.ticker;
                const qty = parsedData.payload.qty;

                if (!STOCK_BALANCES[userId]) {
                    STOCK_BALANCES[userId] = {}
                }

                if (!STOCK_BALANCES[userId][ticker]) {
                    STOCK_BALANCES[userId][ticker] = 0;
                }

                STOCK_BALANCES[userId][ticker] += qty;
            }

            if (parsedData.type == "get_balances") {
                console.log("get balance called")
                const userId = parsedData.payload.userId;
                const balance = USER_USD_BALANCES[userId] ?? 0;

                const return_queue = parsedData.queue;

                console.log("pushed to queue " + return_queue);

                sendClient.lPush(return_queue, JSON.stringify({ balance: balance, callbackId: parsedData.callbackId }))
            }

            // TODO: write this
            if (parsedData.type == "create_order") {

            }

            // TODO: write this
            if (parsedData.type == "cancel_order") {

            }

        }
    });