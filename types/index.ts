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
export type InvoiceLineItem = {
  description: string;
  hsnCode?: string;
  quantity: number;
  rate: number;
  taxRate?: number;
  taxableValue?: number;
  amount?: number; // taxable + GST (optional)
};

export type Payment = {
  id: string;
  shipmentId: string;
  invoiceId?: string | null;
  amount: number;
  currency: string;
  method: "UPI" | "CASH" | "ACCOUNT" | "CHEQUE" | "OTHER";
  transactionNum?: string | null;
  date: string;
  notes?: string | null;
  status: "PENDING" | "COMPLETED" | "FAILED";
};

export type Invoice = {
  id: string;
  shipmentId: string;
  invoiceNumber: string;
  customerName: string;
  customerGstin?: string | null;
  placeOfSupply?: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  tdsRate: number;
  status: string; // DRAFT/SENT/PAID/OVERDUE
  items: InvoiceLineItem[];
  subtotal: number;
  totalTax: number;
  tdsAmount: number;
  amount: number;
  shipmentRef?: string | null;
  payments?: Payment[];
   paidAmount?: number;
  balanceAmount?: number;
};
