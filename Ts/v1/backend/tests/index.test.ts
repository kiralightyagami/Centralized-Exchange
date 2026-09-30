import { test, expect } from "bun:test";

const BASE_URL = "http://localhost:3000";

const username = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const password = "password123";

let token: string;

test("signup", async () => {
    const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const body = await res.json() as { id: number };

    expect(res.status).toBe(200);
    expect(body.id).toBeDefined();
});

test("signin", async () => {
    const res = await fetch(`${BASE_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const body = await res.json() as { token: string };

    expect(res.status).toBe(200);
    expect(body.token).toBeDefined();

    token = body.token;
});


test("onramp", async () => {
    const res = await fetch(`${BASE_URL}/onramp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: token,
        },
        body: JSON.stringify({ usd: 100 }),
    });
    const body = await res.json() as { message: string };

    expect(res.status).toBe(200);
    expect(body.message).toBe("Onramp completed");
});

test("get_balance", async () => {
    const res = await fetch(`${BASE_URL}/balance`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            authorization: token,
        },
    });
    const body = await res.json() as { balance: number };

    expect(res.status).toBe(200);
    expect(body.balance).toBe(100);
});


test("deposit", async () => {
    const res = await fetch(`${BASE_URL}/deposit`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: token,
        },
        body: JSON.stringify({ ticker: "SOL", qty: 100 }),
    });

    const body = await res.json() as { message: string };

    expect(res.status).toBe(200);
});