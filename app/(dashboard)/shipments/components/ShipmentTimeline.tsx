// components/ShipmentTimeline.tsx
"use client";

import React from "react";
import { formatISTDateTime, prettyEnum } from "@/lib/time";

type Shipment = {
  originCity: string;
  originCountry: string;
  destCity: string;
  destCountry: string;
};

type ShipmentEvent = {
  id: string;
  status: string;
  timestamp: string;
  location?: string | null;
  description?: string | null;
  user?: string | null;
};

function bestLocation(ev: ShipmentEvent, s: Shipment) {
  if (ev.location) return ev.location;
  const originStages = ["BOOKED", "PICKED_UP", "IN_TRANSIT_ORIGIN", "AT_PORT_ORIGIN", "CUSTOMS_EXPORT", "ON_VESSEL"];
  const isOrigin = originStages.includes(ev.status);
  const city = isOrigin ? s.originCity : s.destCity;
  const country = isOrigin ? s.originCountry : s.destCountry;
  return city && country ? `${city}, ${country}` : isOrigin ? "Origin location not set" : "Destination location not set";
}

function bestDescription(ev: ShipmentEvent) {
  if (ev.description) return ev.description;
  return `Moved to ${prettyEnum(ev.status)}.`;
}

function bestUser(ev: ShipmentEvent) {
  return ev.user || "System";
}

export function ShipmentTimeline({ shipment, events }: { shipment: Shipment; events: ShipmentEvent[] }) {
  if (!events?.length) {
    return <div className="text-sm text-gray-500 italic">No timeline updates yet. (First event is created automatically.)</div>;
  }

  return (
    <div className="space-y-3">
      {events.map((ev) => (
        <div key={ev.id} className="p-4 border border-gray-200 rounded-xl bg-gray-50">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-gray-900">{prettyEnum(ev.status)}</div>
            <div className="text-xs text-gray-500">{formatISTDateTime(ev.timestamp)}</div>
          </div>

          <div className="mt-2 text-sm text-gray-700">{bestDescription(ev)}</div>

          <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3">
            <span>📍 {bestLocation(ev, shipment)}</span>
            <span>👤 {bestUser(ev)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
