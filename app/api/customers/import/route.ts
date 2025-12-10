// app/api/customers/import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { message: "Payload must be an array of customers" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const raw of body) {
        // Allow `shipments` field in the JSON, but ignore it for now.
        const {
          shipments, // eslint-disable-line @typescript-eslint/no-unused-vars
          customerCode,
          companyName,
          type,
          contactPerson,
          phone,
          email,
          address,
          city,
          country,
          currency,
          creditLimit,
          usedCredits,
          totalAmount,
          paymentTerms,
          kycStatus,
          sanctionsCheck,
          status,
          ...rest
        } = raw;

        if (!customerCode || !companyName || !email || !country) {
          throw new Error(
            `Missing required fields for customerCode: ${customerCode ?? "UNKNOWN"}`
          );
        }

        // Upsert by customerCode so you can re-import safely
        await tx.customer.upsert({
          where: { customerCode },
          create: {
            customerCode,
            companyName,
            type,
            contactPerson,
            phone: phone ?? null,
            email,
            address: address ?? null,
            city: city ?? null,
            country,
            currency: currency ?? "INR",
            creditLimit: Number(creditLimit ?? 0),
            usedCredits: Number(usedCredits ?? 0),
            totalAmount: Number(totalAmount ?? 0),
            paymentTerms: paymentTerms ?? null,
            kycStatus: Boolean(kycStatus),
            sanctionsCheck: Boolean(sanctionsCheck),
            status: status ?? "ACTIVE",
            ...rest,
          },
          update: {
            companyName,
            type,
            contactPerson,
            phone: phone ?? null,
            email,
            address: address ?? null,
            city: city ?? null,
            country,
            currency: currency ?? "INR",
            creditLimit: Number(creditLimit ?? 0),
            usedCredits: Number(usedCredits ?? 0),
            totalAmount: Number(totalAmount ?? 0),
            paymentTerms: paymentTerms ?? null,
            kycStatus: Boolean(kycStatus),
            sanctionsCheck: Boolean(sanctionsCheck),
            status: status ?? "ACTIVE",
            ...rest,
          },
        });

        // 🚧 FUTURE: Once you have a Shipment model:
        //
        // 1) Delete existing shipments for this customer
        // await tx.shipment.deleteMany({
        //   where: { customerCode },
        // });
        //
        // 2) Insert shipments from `shipments` array in the JSON
        // if (Array.isArray(shipments) && shipments.length > 0) {
        //   await tx.shipment.createMany({
        //     data: shipments.map((s) => ({
        //       ...s,
        //       customerCode, // FK
        //     })),
        //   });
        // }
      }
    });

    return NextResponse.json({ message: "Customers imported successfully" });
  } catch (error) {
    console.error("[POST /api/customers/import] Error:", error);
    return NextResponse.json(
      { message: "Server error while importing customers" },
      { status: 500 }
    );
  }
}
