"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Search, Phone, Truck, Ship, Plane } from "lucide-react";

type Mode = "ROAD" | "SEA" | "AIR";

type DriverLite = {
  id: string;
  name: string;
  role?: string | null;
  contactNumber?: string | null;
  transportMode?: Mode;
};

type VehicleLite = {
  id: string;
  name: string;
  number: string;
  transportMode: Mode;
  assignedDrivers?: DriverLite[];
};

const modeIcon = (m: Mode) =>
  m === "ROAD" ? <Truck className="w-4 h-4" /> : m === "SEA" ? <Ship className="w-4 h-4" /> : <Plane className="w-4 h-4" />;

export function VehicleDriverAssignModal({
  isOpen,
  onClose,
  shipmentId,
  shipmentMode,
  currentVehicleId,
  currentDriverId,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  shipmentMode: Mode;
  currentVehicleId?: string | null;
  currentDriverId?: string | null;
  onSaved: () => Promise<void> | void;
}) {
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>("");

  // init selection on open
  useEffect(() => {
    if (!isOpen) return;
    setErr("");
    setSaving(false);
    setVehicleId(currentVehicleId || null);
    setDriverId(currentDriverId || null);
    setQ("");
  }, [isOpen, currentVehicleId, currentDriverId]);

  const { data: vehicles, isLoading, isError, error, refetch } = useQuery<VehicleLite[]>({
    queryKey: ["vehiclesForMode", shipmentMode],
    queryFn: async () => {
      const res = await fetch(`/api/vehicles?mode=${shipmentMode}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();

      // Defensive shaping (in case API returns slightly different structure)
      const list = Array.isArray(json) ? json : [];
      return list.map((v: any) => ({
        id: v.id,
        name: v.name,
        number: v.number,
        transportMode: v.transportMode,
        assignedDrivers: Array.isArray(v.assignedDrivers) ? v.assignedDrivers : [],
      }));
    },
    enabled: isOpen && !!shipmentMode,
    staleTime: 30_000,
  });

  const selectedVehicle = useMemo(
    () => (vehicles || []).find((v) => v.id === vehicleId) || null,
    [vehicles, vehicleId]
  );

  const filteredVehicles = useMemo(() => {
    const list = vehicles || [];
    const qq = q.trim().toLowerCase();
    if (!qq) return list;
    return list.filter((v) => {
      const s = `${v.name} ${v.number}`.toLowerCase();
      return s.includes(qq);
    });
  }, [vehicles, q]);

  const availableDrivers: DriverLite[] = useMemo(() => {
    if (!selectedVehicle) return [];
    return (selectedVehicle.assignedDrivers || []).filter((d) => (d.transportMode ? d.transportMode === shipmentMode : true));
  }, [selectedVehicle, shipmentMode]);

  // If user switches vehicle, reset driver if it doesn’t belong
  useEffect(() => {
    if (!vehicleId) {
      setDriverId(null);
      return;
    }
    if (!driverId) return;
    const ok = availableDrivers.some((d) => d.id === driverId);
    if (!ok) setDriverId(null);
  }, [vehicleId, availableDrivers, driverId]);

  const handleSave = async () => {
    setErr("");
    setSaving(true);
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicleId || null,
          driverId: driverId || null,
          user: "UI",
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to update assignment");
      }

      await onSaved();
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Failed to update assignment");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl border border-gray-200">
          {/* header */}
          <div className="flex items-start justify-between gap-3 p-4 border-b border-gray-200">
            <div className="min-w-0">
              <div className="text-sm text-gray-500">Shipment mode</div>
              <div className="font-bold text-gray-900 inline-flex items-center gap-2">
                {modeIcon(shipmentMode)} {shipmentMode}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Pick a vehicle (mode-matched) and optionally choose one of that vehicle’s drivers.
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* body */}
          <div className="p-4 space-y-4">
            {err ? (
              <div className="p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700 whitespace-pre-wrap">
                {err}
              </div>
            ) : null}

            {/* Search */}
            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search vehicles by name or number…"
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button
                onClick={() => refetch()}
                className="px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-semibold hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>

            {/* Vehicle list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="font-semibold text-gray-900">Select Vehicle</div>
                  <button
                    onClick={() => {
                      setVehicleId(null);
                      setDriverId(null);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-500"
                  >
                    Unassign Vehicle
                  </button>
                </div>

                <div className="max-h-[360px] overflow-auto">
                  {isLoading ? (
                    <div className="p-4 text-sm text-gray-500">Loading vehicles…</div>
                  ) : isError ? (
                    <div className="p-4 text-sm text-gray-500 whitespace-pre-wrap">
                      Failed to load vehicles. {(error as any)?.message || ""}
                    </div>
                  ) : filteredVehicles.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No vehicles found for {shipmentMode}.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredVehicles.map((v) => {
                        const active = v.id === vehicleId;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setVehicleId(v.id)}
                            className={`w-full text-left p-4 hover:bg-gray-50 ${
                              active ? "bg-blue-50" : "bg-white"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate">
                                  {v.name}{" "}
                                  <span className="text-gray-500 font-semibold">({v.number})</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 inline-flex items-center gap-2">
                                  {modeIcon(v.transportMode)} {v.transportMode}
                                  <span className="text-gray-300">•</span>
                                  <span>{v.assignedDrivers?.length || 0} driver(s)</span>
                                </div>
                              </div>

                              <div
                                className={`mt-1 h-4 w-4 rounded-full border ${
                                  active ? "border-blue-600 bg-blue-600" : "border-gray-300"
                                }`}
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Drivers on selected vehicle */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="font-semibold text-gray-900">Select Driver (optional)</div>
                  <button
                    onClick={() => setDriverId(null)}
                    className={`text-xs font-semibold hover:text-blue-600 ${
                      driverId ? "text-blue-700" : "text-gray-400"
                    }`}
                    disabled={!driverId}
                  >
                    Clear Driver
                  </button>
                </div>

                <div className="p-4">
                  {!selectedVehicle ? (
                    <div className="text-sm text-gray-500">
                      Select a vehicle first to see available drivers.
                    </div>
                  ) : availableDrivers.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      This vehicle has no drivers assigned. (You can still save vehicle assignment.)
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableDrivers.map((d) => {
                        const active = d.id === driverId;
                        return (
                          <button
                            key={d.id}
                            onClick={() => setDriverId(d.id)}
                            className={`w-full text-left p-3 rounded border ${
                              active ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 truncate">{d.name}</div>
                                <div className="text-xs text-gray-500 truncate">{d.role || "Driver"}</div>
                              </div>
                              {d.contactNumber ? (
                                <a
                                  href={`tel:${d.contactNumber}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
                                >
                                  <Phone className="w-4 h-4" /> {d.contactNumber}
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">No contact</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* selection summary */}
            <div className="p-3 rounded border border-gray-200 bg-gray-50 text-sm text-gray-700">
              <div>
                <span className="font-semibold">Vehicle:</span>{" "}
                {selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.number})` : "Unassigned"}
              </div>
              <div className="mt-1">
                <span className="font-semibold">Driver:</span>{" "}
                {driverId
                  ? availableDrivers.find((d) => d.id === driverId)?.name || "Selected"
                  : "Not assigned"}
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 bg-white rounded-md text-sm font-semibold hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Assignment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
