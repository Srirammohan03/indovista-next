import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const parseDate = (v?: string | null) => (v ? new Date(v) : null);

const fallbackCode = (city?: string | null) => {
  const c = (city || "").trim();
  if (!c) return "---";
  return c.slice(0, 3).toUpperCase();
};

export async function GET() {
  try {
    const shipments = await prisma.shipment.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        customer: true,
        driver: true, // ✅ add this
        vehicle: {
          include: {
            drivers: { include: { driver: true } },
          },
        },
      },
    });

    const portIds = Array.from(
      new Set(
        shipments
          .flatMap((s: any) => [s.originPortId, s.destPortId])
          .filter(Boolean)
      )
    );

    let portById = new Map<any, any>();
    if (portIds.length) {
      const ports = await prisma.port.findMany({
        where: { id: { in: portIds as any[] } },
      });
      portById = new Map(ports.map((p: any) => [p.id, p]));
    }

    const shaped = shipments.map((s: any) => {
      const op = s.originPortId ? portById.get(s.originPortId) : null;
      const dp = s.destPortId ? portById.get(s.destPortId) : null;

      const originCode = op?.code || fallbackCode(s.originCity);
      const destCode = dp?.code || fallbackCode(s.destCity);

      return {
        id: s.id,
        reference: s.reference,
        masterDoc: s.masterDoc,
        customer: s.customer?.companyName || "",

        origin: {
          code: originCode,
          city: s.originCity || "",
          country: s.originCountry || "",
        },
        destination: {
          code: destCode,
          city: s.destCity || "",
          country: s.destCountry || "",
        },

        mode: s.mode,
        direction: s.direction,
        commodity: s.commodity,
        status: s.status,
        slaStatus: s.slaStatus,
        eta: s.eta,

        // ✅ driver assigned directly to shipment (optional, UI can ignore)
        driver: s.driver ? { id: s.driver.id, name: s.driver.name, contactNumber: s.driver.contactNumber } : null,

        vehicle: s.vehicle
          ? {
              id: s.vehicle.id,
              name: s.vehicle.name,
              number: s.vehicle.number,
              transportMode: s.vehicle.transportMode,
              assignedDrivers: (s.vehicle.drivers || []).map((vd: any) => ({
                id: vd.driver.id,
                name: vd.driver.name,
                contactNumber: vd.driver.contactNumber,
              })),
            }
          : null,
      };
    });

    return NextResponse.json(shaped);
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || "Failed to fetch shipments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.json();

  let currencyId: number | null = null;
  const currencyCode = body?.financials?.currency;
  if (currencyCode) {
    const cur = await prisma.currency.findUnique({ where: { currencyCode } });
    currencyId = cur?.id ?? null;
  }

  const mode = String(body.mode || "").toUpperCase();

  if (body.vehicleId) {
    const v = await prisma.vehicle.findUnique({ where: { id: body.vehicleId } });
    if (!v) return new NextResponse("Invalid vehicleId", { status: 400 });
    if (v.transportMode !== mode) return new NextResponse("Vehicle mode mismatch", { status: 400 });
  }

  if (body.driverId) {
    const d = await prisma.driver.findUnique({ where: { id: body.driverId } });
    if (!d) return new NextResponse("Invalid driverId", { status: 400 });
    if (d.transportMode !== mode) return new NextResponse("Driver mode mismatch", { status: 400 });
  }

  const revenue = Number(body?.financials?.revenue ?? 0);
  const cost = Number(body?.financials?.cost ?? 0);

  const created = await prisma.shipment.create({
    data: {
      reference: String(body.reference || "").trim(),
      masterDoc: body.masterDoc ? String(body.masterDoc).trim() : null,

      customerId: body.customerId,
      direction: body.direction,
      mode: body.mode,
      commodity: body.commodity,

      incotermId: body.incotermId ? Number(body.incotermId) : null,

      originCity: body.origin.city,
      originCountry: body.origin.country,
      originContact: body.origin.contact || null,
      originPortId: body.origin.portId ? Number(body.origin.portId) : null,

      destCity: body.destination.city,
      destCountry: body.destination.country,
      destContact: body.destination.contact || null,
      destPortId: body.destination.portId ? Number(body.destination.portId) : null,

      containerTypeId: body.containerTypeId ? Number(body.containerTypeId) : null,
      temperatureId: body.temperatureId ? Number(body.temperatureId) : null,

      status: body.status,
      etd: parseDate(body.etd),
      eta: parseDate(body.eta),
      slaStatus: body.slaStatus,

      currencyId,
      revenue,
      cost,
      margin: revenue - cost,
      invoiceStatus: body?.financials?.invoiceStatus ?? "DRAFT",

      vehicleId: body.vehicleId || null,
      driverId: body.driverId || null,

      items: {
        create: (body.items || []).map((it: any) => ({
          productId: it.productId,
          quantity: Number(it.quantity || 0),
          unit: it.unit || "Unit",
          weightKg: it.weightKg != null ? Number(it.weightKg) : null,
          packaging: it.packaging || null,
        })),
      },

      events: {
        create: {
          status: body.status || "BOOKED",
          location: body.origin?.city ? `${body.origin.city}, ${body.origin.country}` : "Origin",
          description: "Shipment created",
          user: body.user || "System",
        },
      },
    },
    select: { id: true, reference: true },
  });

  return NextResponse.json(created);
}
