import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization as string;

    try {
        const { id } = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (!id) {
            throw new Error("Incorrect id found");
        }

        //@ts-ignore (todo: fix this type error)
        req.id = id;
        next()
    } catch(e) {
        res.status(403).json({
            message: "Incorrect auth header"
        })
    }
}