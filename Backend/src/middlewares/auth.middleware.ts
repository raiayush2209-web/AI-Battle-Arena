import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import UserModel from "../models/user.model.js";


// ✅ Extend Express Request type to include `user`
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

export async function authUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  // Check if token is blacklisted in Redis
  

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // ✅ Strongly typed now
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
