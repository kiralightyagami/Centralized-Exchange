
export interface User {
    id: number;
    username: string;
    password: string;
}

export interface Claims {
    sub: number;
    exp: number;
}

export interface SignupInput {
    username: string;
    password: string;
}

export interface SigninInput {
    username: string;
    password: string;
}

export interface SignupResponse {
    message: string;
}

export interface SigninResponse {
    token: string;
}

export interface DepositRequest {
    qty: number;
}

export interface OnRampRequest {
    qty: number;
}

export interface DepositResponse {
    message: string;
}

export interface OnRampResponse {
    message: string;
}

export interface BalanceResponse {
    usd: number;
    assets: Record<string, number>;
}