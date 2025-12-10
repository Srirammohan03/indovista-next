// app/api/customers/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { code: string };

interface RouteContext {
  params: Promise<Params>; // 👈 params is a Promise now
}

// GET /api/customers/:code
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    // ✅ unwrap the promise first
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { message: "Customer code is required" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findUnique({
      where: { customerCode: code },
    });

    if (!customer) {
      return NextResponse.json(
        { message: "Customer not found" },
        { status: 404 }
      );
    }

    // success payload = customer
    return NextResponse.json(customer);
  } catch (error) {
    console.error("[GET /api/customers/[code]] Error:", error);
    return NextResponse.json(
      { message: "Server error while fetching customer" },
      { status: 500 }
    );
  }
}

// PUT /api/customers/:code
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { message: "Customer code is required" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const updated = await prisma.customer.update({
      where: { customerCode: code },
      data: {
        companyName: body.companyName,
        type: body.type,
        contactPerson: body.contactPerson,
        phone: body.phone ?? null,
        email: body.email,
        address: body.address ?? null,
        city: body.city ?? null,
        country: body.country,
        currency: body.currency,
        creditLimit: Number(body.creditLimit ?? 0),
        usedCredits: Number(body.usedCredits ?? 0),
        totalAmount: Number(body.totalAmount ?? 0),
        paymentTerms: body.paymentTerms ?? null,
        kycStatus: Boolean(body.kycStatus),
        sanctionsCheck: Boolean(body.sanctionsCheck),
        status: body.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/customers/[code]] Error:", error);
    return NextResponse.json(
      { message: "Server error while updating customer" },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/:code
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { message: "Customer code is required" },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { customerCode: code },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/customers/[code]] Error:", error);
    return NextResponse.json(
      { message: "Server error while deleting customer" },
      { status: 500 }
    );
  }
}
