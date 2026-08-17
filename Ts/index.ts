import express from "express";

const app = express();

app.use(express.json)

let USER_INDEX = 0;

const USERS: {
    id: number,
    username: string,
    password: string
}[] = [];

app.post("/signup", (req,res) => {
    const { username, password} = req.body;

    if (USERS.find(u => u.username === username)) {
        res.status(403).json({
            message: "user not found"
        })
        return;
    }

    USERS.push({
        id: USER_INDEX++,
        username,
        password
    })

    res.json({
        message: "successfully signed up"
    })
})


app.listen(3000);