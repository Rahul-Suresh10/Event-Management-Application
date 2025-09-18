import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Extend Request type to include user
interface JwtPayload {
  id: number;
  role: string;
}

export const authenticateToken = (
  req: Request & { user?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user as JwtPayload;
    next();
  });
};

export const authorizeRole = (role: string) => {
  return (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "User not authenticated" });
    if (req.user.role !== role) return res.status(403).json({ error: "Access denied" });
    next();
  };
};
