import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const modelMap: any = {
  ports: prisma.port,
  incoterms: prisma.incoterm,
  "status-codes": prisma.statusCode,
  currencies: prisma.currency,
  "temp-presets": prisma.temperature,
};

export async function GET(req: Request, { params }: any) {
  const { type } = params;
  const model = modelMap[type];

  if (!model) return NextResponse.json([]);

  const data = await model.findMany({
    orderBy: { id: "asc" },
  });

  // Always return array
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: any) {
  const { type } = params;
  const model = modelMap[type];
  if (!model) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const body = await req.json();

  // 🔹 Bulk create (array of objects)
  if (Array.isArray(body)) {
    const created: any[] = [];
    for (const item of body) {
      const row = await model.create({ data: item });
      created.push(row);
    }
    return NextResponse.json(created);
  }

  // 🔹 Single create
  const created = await model.create({
    data: body,
  });

  return NextResponse.json(created);
}
