export type Role = "SUPER_ADMIN" | "ADMIN" | "OPERATOR" | "FINANCE" | "DOCUMENTOR";

export interface SystemUser {
  id: number;
  loginId: string;
  name: string;
  email: string | null;
  role: Role;
  createdAt: string; // ISO string from API
}
