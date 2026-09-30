import express from "express"
import jwt from "jsonwebtoken";
import { CreateUserSchema, OnrampSchema, SigninSchema } from "./types";
import { Pool } from "pg";
import { DATABASE_URL, JWT_SECRET } from "./config";
import { AuthMiddleware } from "./middleware";
import { createClient } from "redis";

const client = createClient();
client.connect();

const receiveClient = createClient();

const app = express();
app.use(express.json());

console.log(DATABASE_URL);
const pool = new Pool({
    connectionString: DATABASE_URL
});

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

app.post("/deposit", AuthMiddleware, (req, res) => {

})

app.post("/order", AuthMiddleware, (req, res) => {

})

app.post("/cancel", AuthMiddleware, (req, res) => {

})

app.get("/balance", AuthMiddleware, (req, res) => {

})


app.listen(3000);