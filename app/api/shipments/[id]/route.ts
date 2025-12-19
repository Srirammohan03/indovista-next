import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const parseDate = (v?: string | null) => (v ? new Date(v) : null);

const fallbackCode = (city?: string | null) => {
  const c = (city || "").trim();
  if (!c) return "---";
  return c.slice(0, 3).toUpperCase();
};

function defaultLocationForStatus(s: any, shipment: any) {
  const originStages = [
    "BOOKED",
    "PICKED_UP",
    "IN_TRANSIT_ORIGIN",
    "AT_PORT_ORIGIN",
    "CUSTOMS_EXPORT",
    "ON_VESSEL",
  ];
  const isOrigin = originStages.includes(String(s));
  const city = isOrigin ? shipment.originCity : shipment.destCity;
  const country = isOrigin ? shipment.originCountry : shipment.destCountry;
  return city && country ? `${city}, ${country}` : isOrigin ? "Origin" : "Destination";
}

function defaultDescriptionForStatus(s: any) {
  return `Status updated to ${String(s).replaceAll("_", " ").toLowerCase()}`;
}

async function findShipmentRecord(idOrRef: string) {
  // 1) Try as String id
  try {
    const s = await prisma.shipment.findUnique({
      where: { id: idOrRef as any },
      include: {
        customer: true,
        items: { include: { product: true } },
        documents: true,
        events: { orderBy: { timestamp: "desc" } },
      },
    });
    if (s) return s;
  } catch {
    // ignore and try other ways
  }

  // 2) Try as Int id (if your Prisma id is Int)
  if (/^\d+$/.test(idOrRef)) {
    try {
      const s = await prisma.shipment.findUnique({
        where: { id: Number(idOrRef) as any },
        include: {
          customer: true,
          items: { include: { product: true } },
          documents: true,
          events: { orderBy: { timestamp: "desc" } },
        },
      });
      if (s) return s;
    } catch {
      // ignore and fallback
    }
  }

  // 3) Fallback: allow loading by reference (IMP-FZ-001 etc)
  // NOTE: If your SHP-YYYY-001 is stored in a different field (shipmentId), add a query for it in your schema & here.
  const byRef = await prisma.shipment.findFirst({
    where: { reference: idOrRef },
    include: {
      customer: true,
      items: { include: { product: true } },
      documents: true,
      events: { orderBy: { timestamp: "desc" } },
    },
  });

  return byRef;
}

async function shapeShipment(idOrRef: string) {
  const s: any = await findShipmentRecord(idOrRef);
  if (!s) return null;

  // Fetch relations by IDs safely (no fragile include relation names on Shipment)
  const [originPort, destPort, incoterm, containerType, temperature, currency, vehicle, driver] = await Promise.all([
    s.originPortId ? prisma.port.findUnique({ where: { id: s.originPortId } }) : Promise.resolve(null),
    s.destPortId ? prisma.port.findUnique({ where: { id: s.destPortId } }) : Promise.resolve(null),
    s.incotermId ? prisma.incoterm.findUnique({ where: { id: s.incotermId } }) : Promise.resolve(null),
    s.containerTypeId ? prisma.containerType.findUnique({ where: { id: s.containerTypeId } }) : Promise.resolve(null),
    s.temperatureId ? prisma.temperature.findUnique({ where: { id: s.temperatureId } }) : Promise.resolve(null),
    s.currencyId ? prisma.currency.findUnique({ where: { id: s.currencyId } }) : Promise.resolve(null),

    // Vehicle (safe fetch)
    s.vehicleId
      ? prisma.vehicle.findUnique({
          where: { id: s.vehicleId },
          include: { drivers: { include: { driver: true } } },
        })
      : Promise.resolve(null),

    // Driver (safe fetch)
    s.driverId ? prisma.driver.findUnique({ where: { id: s.driverId } }) : Promise.resolve(null),
  ]);

  const originCode = (originPort as any)?.code || fallbackCode(s.originCity);
  const destCode = (destPort as any)?.code || fallbackCode(s.destCity);

  return {
    id: s.id,
    reference: s.reference,
    masterDoc: s.masterDoc,
    mode: s.mode,
    direction: s.direction,
    commodity: s.commodity,
    status: s.status,
    slaStatus: s.slaStatus,
    etd: s.etd,
    eta: s.eta,

    customer: s.customer?.companyName || "",

    origin: {
      code: originCode,
      city: s.originCity || "",
      country: s.originCountry || "",
      contact: s.originContact || null,
    },
    destination: {
      code: destCode,
      city: s.destCity || "",
      country: s.destCountry || "",
      contact: s.destContact || null,
    },

    incoterm: incoterm ? { code: (incoterm as any).code, name: (incoterm as any).name } : null,
    containerType: containerType ? { code: (containerType as any).code, name: (containerType as any).name } : null,
    temperature: temperature
      ? {
          setPoint: (temperature as any).setPoint,
          unit: (temperature as any).unit,
          range: (temperature as any).range,
        }
      : null,

    vehicle: vehicle
      ? {
          id: (vehicle as any).id,
          name: (vehicle as any).name,
          number: (vehicle as any).number,
          transportMode: (vehicle as any).transportMode,
          assignedDrivers: (((vehicle as any).drivers || []) as any[]).map((vd: any) => ({
            id: vd.driver?.id,
            name: vd.driver?.name,
            role: vd.driver?.role,
            contactNumber: vd.driver?.contactNumber,
          })).filter(Boolean),
        }
      : null,

    // If you assign driver directly on shipment
    driver: driver
      ? {
          id: (driver as any).id,
          name: (driver as any).name,
          role: (driver as any).role,
          transportMode: (driver as any).transportMode,
          contactNumber: (driver as any).contactNumber,
          licenseNumber: (driver as any).licenseNumber,
        }
      : null,

    cargo: (s.items || []).map((it: any) => ({
      id: it.id,
      productName: it.product?.name || it.productName || "Product",
      hsCode: it.product?.hsCode || it.hsCode || "",
      quantity: it.quantity,
      unit: it.unit,
      weightKg: it.weightKg,
      tempReq: it.product?.tempReq || it.tempReq || "",
      packaging: it.packaging,
    })),

    documents: s.documents || [],
    events: s.events || [],

    financials: {
      currency: (currency as any)?.currencyCode || "INR",
      revenue: s.revenue ?? 0,
      cost: s.cost ?? 0,
      margin: s.margin ?? (Number(s.revenue ?? 0) - Number(s.cost ?? 0)),
      invoiceStatus: s.invoiceStatus || "",
    },
  };
}

export async function GET(_: Request, ctx: { params: { id: string } }) {
  try {
    const shipment = await shapeShipment(ctx.params.id);
    if (!shipment) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(shipment);
  } catch (e: any) {
    console.error("GET /api/shipments/[id] failed:", e);
    return NextResponse.json({ message: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const idOrRef = ctx.params.id;

  try {
    const body = await req.json();

    // Load existing by id OR reference
    const existing: any = await findShipmentRecord(idOrRef);
    if (!existing) return new NextResponse("Not found", { status: 404 });

    const id = existing.id; // real DB id (string/int)

    const mode = body.mode ?? existing.mode;

    if (body.vehicleId !== undefined && body.vehicleId) {
      const v = await prisma.vehicle.findUnique({ where: { id: body.vehicleId } });
      if (!v) return new NextResponse("Invalid vehicleId", { status: 400 });
      if ((v as any).transportMode !== mode) return new NextResponse("Vehicle mode mismatch", { status: 400 });
    }

    if (body.driverId !== undefined && body.driverId) {
      const d = await prisma.driver.findUnique({ where: { id: body.driverId } });
      if (!d) return new NextResponse("Invalid driverId", { status: 400 });
      if ((d as any).transportMode !== mode) return new NextResponse("Driver mode mismatch", { status: 400 });
    }

    const statusChanged = body.status && body.status !== existing.status;

    await prisma.shipment.update({
      where: { id },
      data: {
        status: body.status ?? undefined,
        etd: body.etd !== undefined ? parseDate(body.etd) : undefined,
        eta: body.eta !== undefined ? parseDate(body.eta) : undefined,
        slaStatus: body.slaStatus ?? undefined,

        vehicleId: body.vehicleId !== undefined ? (body.vehicleId || null) : undefined,
        driverId: body.driverId !== undefined ? (body.driverId || null) : undefined,

        ...(statusChanged
          ? {
              events: {
                create: {
                  status: body.status,
                  location: body.location || defaultLocationForStatus(body.status, existing),
                  description: body.description || defaultDescriptionForStatus(body.status),
                  user: body.user || "System",
                },
              },
            }
          : {}),
      },
    });

    const shipment = await shapeShipment(String(id));
    return NextResponse.json(shipment);
  } catch (e: any) {
    console.error("PATCH /api/shipments/[id] failed:", e);
    return NextResponse.json({ message: e?.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const idOrRef = ctx.params.id;

  try {
    const existing: any = await findShipmentRecord(idOrRef);
    if (!existing) return new NextResponse("Not found", { status: 404 });

    await prisma.shipment.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("DELETE /api/shipments/[id] failed:", e);
    return NextResponse.json({ message: e?.message || "Failed to delete shipment" }, { status: 500 });
  }
}
