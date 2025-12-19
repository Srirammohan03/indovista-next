// components/ShipmentVehicleDriverPanel.tsx
"use client";

import React from "react";
import { prettyEnum } from "@/lib/time";

export function ShipmentVehicleDriverPanel({ shipment }: { shipment: any }) {
  const v = shipment.vehicle;
  const d = shipment.driver;

  return (
    <div className="p-5 border border-gray-200 rounded-xl bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-gray-500 uppercase tracking-wide">Vehicle / Driver / Mode</div>
        <div className="text-xs text-gray-500">Mode: <span className="font-mono">{shipment.mode}</span></div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="text-xs text-gray-500">Vehicle</div>
          <div className="mt-1 font-semibold text-gray-900">
            {v ? `${v.name} (${v.number})` : "Not assigned"}
          </div>
          {v && <div className="text-xs text-gray-500 mt-1">Vehicle ID: <span className="font-mono">{v.id}</span></div>}
        </div>

        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="text-xs text-gray-500">Driver</div>
          <div className="mt-1 font-semibold text-gray-900">{d ? d.name : "Not assigned"}</div>
          {d && <div className="text-xs text-gray-500 mt-1">Driver ID: <span className="font-mono">{d.id}</span></div>}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Tip: Vehicle & Driver are filtered by Mode while creating shipment to avoid mismatch.
      </div>
    </div>
  );
}
