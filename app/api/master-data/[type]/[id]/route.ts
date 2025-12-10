import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const modelMap: any = {
  ports: prisma.port,
  incoterms: prisma.incoterm,
  "status-codes": prisma.statusCode,
  currencies: prisma.currency,
  "temp-presets": prisma.temperature,
};

export async function DELETE(req: Request, { params }: any) {
  const { type, id } = params;
  const model = modelMap[type];

  if (!model) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  await model.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request, { params }: any) {
  const { type, id } = params;
  const model = modelMap[type];

  if (!model) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const body = await req.json();

  const updated = await model.update({
    where: { id: Number(id) },
    data: body,
  });

  return NextResponse.json(updated);
}
