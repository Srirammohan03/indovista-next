// lib/customerCode.ts
import { prisma } from "./prisma";

// Generates next customer code: CUST-001, CUST-002, ...
export async function generateCustomerCode(): Promise<string> {
  const last = await prisma.customer.findFirst({
    orderBy: { customerCode: "desc" },
    select: { customerCode: true },
  });

  if (!last) return "CUST-001";

  const numericPart = parseInt(last.customerCode.replace("CUST-", ""), 10);
  const next = numericPart + 1;

  return `CUST-${String(next).padStart(3, "0")}`;
}
