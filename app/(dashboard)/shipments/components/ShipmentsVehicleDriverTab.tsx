// components/ShipmentsVehicleDriverTab.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { formatISTDateTime, prettyEnum } from "@/lib/time";

type ShipmentRow = {
  id: string;
  reference: string;
  mode: string;
  direction: string;
  status: string;
  etd?: string | null;
  eta?: string | null;
  updatedAt: string;
  customer: { customerCode: string; companyName: string };
  vehicle: { id: string; name: string; number: string; transportMode: string } | null;
  driver: { id: string; name: string; transportMode: string } | null;
};

export function ShipmentsVehicleDriverTab() {
  const [rows, setRows] = useState<ShipmentRow[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/shipments");
      const data = await res.json();
      setRows(data);
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;

    return rows.filter((r) => {
      return (
        r.reference.toLowerCase().includes(s) ||
        r.customer.companyName.toLowerCase().includes(s) ||
        r.customer.customerCode.toLowerCase().includes(s) ||
        (r.vehicle?.number || "").toLowerCase().includes(s) ||
        (r.vehicle?.name || "").toLowerCase().includes(s) ||
        (r.driver?.name || "").toLowerCase().includes(s) ||
        r.mode.toLowerCase().includes(s) ||
        r.status.toLowerCase().includes(s)
      );
    });
  }, [rows, q]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-gray-900">Vehicle / Driver / Mode</div>
          <div className="text-sm text-gray-500">Quick view of assignment + shipment status (IST times).</div>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ref, customer, vehicle, driver…"
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="overflow-auto border border-gray-200 rounded-xl">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-3">Shipment</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Mode</th>
              <th className="text-left p-3">Vehicle</th>
              <th className="text-left p-3">Driver</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Last Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-gray-200 hover:bg-white">
                <td className="p-3 font-mono text-gray-900">{r.reference}</td>
                <td className="p-3 text-gray-700">
                  <div className="font-semibold">{r.customer.companyName}</div>
                  <div className="text-xs text-gray-500">{r.customer.customerCode}</div>
                </td>
                <td className="p-3 text-gray-700">{prettyEnum(r.mode)}</td>
                <td className="p-3 text-gray-700">
                  {r.vehicle ? (
                    <div>
                      <div className="font-semibold">{r.vehicle.name}</div>
                      <div className="text-xs text-gray-500">{r.vehicle.number}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not assigned</span>
                  )}
                </td>
                <td className="p-3 text-gray-700">
                  {r.driver ? <span className="font-semibold">{r.driver.name}</span> : <span className="text-gray-400">Not assigned</span>}
                </td>
                <td className="p-3 text-gray-700">{prettyEnum(r.status)}</td>
                <td className="p-3 text-gray-700">{formatISTDateTime(r.updatedAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={7}>
                  No matching shipments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
