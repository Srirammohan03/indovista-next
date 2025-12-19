export * from "./user";
// Keep these in sync with your Prisma enum Role
export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "OPERATOR"
  | "FINANCE"
  | "DOCUMENTOR";

// Matches your Prisma User model (dynamic users table)
export interface SystemUser {
  id: number;
  loginId: string;
  password?: string; // never send from API; keep optional for UI payloads only
  role: Role;
  name: string;
  email: string | null;
  createdAt: string; // ISO string from API
}

// Useful for auth/topbar (what you return from /api/login)
export interface AuthUser {
  id: number;
  loginId: string;
  name: string;
  role: Role;
  email?: string | null;
}
