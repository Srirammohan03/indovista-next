// import jwt from "jsonwebtoken";

// const SECRET = process.env.JWT_SECRET!;

// Create JWT token
// export function createToken(payload: any) {
//     return jwt.sign(payload, SECRET, { expiresIn: "1d" });
// }

// Verify JWT token
// export function verifyToken(token: string) {
//     return jwt.verify(token, SECRET);
// }

// lib/jwt.ts
import jwt from "jsonwebtoken";

type TokenPayload = {
  id: number;
  loginId: string;
  role: string;
};

export function createToken(payload: TokenPayload) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not set");
  return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
}
