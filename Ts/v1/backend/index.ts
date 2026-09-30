import express from "express"
import jwt from "jsonwebtoken";
import { CreateUserSchema, DepositSchema, OnrampSchema, SigninSchema } from "./types";
import { Pool } from "pg";
import { DATABASE_URL, JWT_SECRET } from "./config";
import { AuthMiddleware } from "./middleware";
import { createClient } from "redis";

const QUEUE_NAME = "queue-" + Math.random().toString().substring(0, 5); // 0.1351

const CALLBACKS = {}

const client = createClient();
client.connect();

const receiveClient = createClient();

const app = express();


console.log(DATABASE_URL);
const pool = new Pool({
    connectionString: DATABASE_URL
});

app.use(express.json());

app.post("/signup", async (req, res) => {
    const { data, success } = CreateUserSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await pool.query(`SELECT * FROM users WHERE username=$1`, [data.username]);
    if (existingUser.rowCount != 0) {
        return res.status(411).json({
            message: "User already exists with given username"
        })
    }


    const newUser = await pool.query(`INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id;`, [data.username, data.password]);

    res.json({
        id: newUser.rows[0].id,
        message: "Signup successful"
    })
})


app.post("/signin", async (req, res) => {

    const { data, success } = SigninSchema.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await pool.query(`SELECT * FROM users WHERE username=$1`, [data.username]);
    if (existingUser.rowCount == 0) {
        return res.status(403).json({
            message: "User does not exist with given username"
        })
    }

    if (existingUser.rows[0].password != data.password) {
        return res.status(403).json({
            message: "Password incorrect"
        })
    }

    const token = jwt.sign({
        id: existingUser.rows[0].id
    }, JWT_SECRET);

    res.json({
        token,
    })
})

app.post("/onramp", AuthMiddleware, async(req, res) => {
    const {data, success} = OnrampSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    await client.lPush("engine-queue", JSON.stringify({
        type: "onramp",
        payload: {
            // @ts-ignore (todo: fix this)
            userId: req.id,
            amount: data.usd
        }
    }))

    // todo: wait for acknowledgement and then res.
    res.json({
        message: "Onramp completed"
    })
})

app.post("/deposit", AuthMiddleware, async(req, res) => {
    const {data, success} = DepositSchema.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    await client.lPush("engine-queue", JSON.stringify({
        type: "deposit",
        payload: {
            //@ts-ignore (fix-this)
            userId: req.id,
            qty: data.qty,
            ticker: data.ticker
        }
    }))

    res.json({
        message: "Deposit successful"
    })
})

app.post("/order", AuthMiddleware, (req, res) => {

})

app.post("/cancel", AuthMiddleware, (req, res) => {

})

app.get("/balance", AuthMiddleware, async (req, res) => {
    const callbackId = Math.random();
    await client.lPush("engine-queue", JSON.stringify({
        type: "get_balances",
        payload: {
            //@ts-ignore (todo:fix-this)
            userId: req.id,
        },
        queue: QUEUE_NAME,
        callbackId
    }))

    console.log("hi");
    const balance = await new Promise((resolve) => {
        //@ts-ignore (todo:fix-this)
        CALLBACKS[callbackId] = resolve;
    })
    console.log("after callback got called");
    // loopback logic
    // read from the queue

    res.json({
        balance
    })
})

receiveClient.connect().then(async () => {
    while(1) {
        const res = await receiveClient.blPop(QUEUE_NAME, 1000);
        console.log("reading from queue")
        if (!res) {
            continue;
        }
        console.log("read message")
        console.log(res);
        const parsedData = JSON.parse(res.element);
        const callbackId = parsedData.callbackId;
        const balance = parsedData.balance;
        //@ts-ignore (fix-this)
        CALLBACKS[callbackId](balance);
    }
});


app.listen(3000);