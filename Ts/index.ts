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

app.post("/signin", (req,res) => {
    const { username, password } = req.body;
    const user = USERS.find(u => u.username === username);
    if (!user) {
        res.status(404).json({
            message: "user not found"
        });
        return;
    }
    if (user.password !== password) {
        res.status(401).json({
            message: "invalid password"
        });
        return;
    }
    res.json({
        message: "successfully signed in"
    });

    
})

app.post("/balance/onramp", (req,res) => {
    
})

app.post("/balance/deposit", (req,res) => {
    
})

app.get("/balance/usd", (req,res) => {
    
})

app.get("/balance", (req,res) => {
    
})

app.post("/order", (req,res) => {
    
})


app.listen(3000);