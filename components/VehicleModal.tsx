"use client";

import React, { useMemo, useRef, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Vehicle, FuelType, VehicleOwnership, TransportMode } from "@/types/vehicle";
import type { Driver } from "@/types/driver";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<any>; // ✅ keep type only
  initialData: Vehicle | null;
  drivers: Driver[];
  enabledModes: TransportMode[];
};

const fuelOptions: FuelType[] = ["PETROL", "DIESEL", "CNG", "LPG", "ELECTRIC", "OTHER"];
const ownershipOptions: VehicleOwnership[] = ["OWN", "RENT"];

const isoDate = (v?: string | Date | null) => {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
};

const fieldBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] " +
  "outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500";

const labelBase = "mb-1 block text-sm font-semibold text-gray-700";
const helperBase = "mt-1 text-xs text-gray-500";

export function VehicleModal({ isOpen, onClose, onSave, initialData, drivers, enabledModes }: Props) {
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const numberRef = useRef<HTMLInputElement | null>(null);
  const fuelOtherRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<any>(() => ({
    id: initialData?.id ?? "",
    name: initialData?.name ?? "",
    number: initialData?.number ?? "",
    ownership: (initialData?.ownership ?? "OWN") as VehicleOwnership,
    transportMode: (initialData?.transportMode ?? enabledModes?.[0] ?? "ROAD") as TransportMode,

    engineType: initialData?.engineType ?? "",
    fuel: (initialData?.fuel ?? "DIESEL") as FuelType,
    fuelOther: initialData?.fuelOther ?? "",
    fuelCapacity: initialData?.fuelCapacity ?? "",
    loadingCapacity: initialData?.loadingCapacity ?? "",

    rcNumber: initialData?.rcNumber ?? "",
    rcExpiry: isoDate(initialData?.rcExpiry),
    pollutionExpiry: isoDate(initialData?.pollutionExpiry),

    isRegistered: initialData?.isRegistered ?? true,
    registeredAt: isoDate(initialData?.registeredAt),

    docs: initialData?.docs ?? "",
    managingVehicle: initialData?.managingVehicle ?? "",
    medicalSupport: initialData?.medicalSupport ?? "",
    notes: initialData?.notes ?? "",

    driverIds: (initialData?.assignedDrivers ?? []).map((d: any) => d.id),
  }));

  React.useEffect(() => {
    if (!isOpen) return;

    setForm({
      id: initialData?.id ?? "",
      name: initialData?.name ?? "",
      number: initialData?.number ?? "",
      ownership: (initialData?.ownership ?? "OWN") as VehicleOwnership,
      transportMode: (initialData?.transportMode ?? enabledModes?.[0] ?? "ROAD") as TransportMode,

      engineType: initialData?.engineType ?? "",
      fuel: (initialData?.fuel ?? "DIESEL") as FuelType,
      fuelOther: initialData?.fuelOther ?? "",
      fuelCapacity: initialData?.fuelCapacity ?? "",
      loadingCapacity: initialData?.loadingCapacity ?? "",

      rcNumber: initialData?.rcNumber ?? "",
      rcExpiry: isoDate(initialData?.rcExpiry),
      pollutionExpiry: isoDate(initialData?.pollutionExpiry),

      isRegistered: initialData?.isRegistered ?? true,
      registeredAt: isoDate(initialData?.registeredAt),

      docs: initialData?.docs ?? "",
      managingVehicle: initialData?.managingVehicle ?? "",
      medicalSupport: initialData?.medicalSupport ?? "",
      notes: initialData?.notes ?? "",

      driverIds: (initialData?.assignedDrivers ?? []).map((d: any) => d.id),
    });
  }, [isOpen, initialData, enabledModes]);

  // ESC to close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => d.transportMode === form.transportMode);
  }, [drivers, form.transportMode]);

  if (!isOpen) return null;

  const toggleDriver = (id: string) => {
    setForm((p: any) => {
      const exists = p.driverIds.includes(id);
      return {
        ...p,
        driverIds: exists ? p.driverIds.filter((x: string) => x !== id) : [...p.driverIds, id],
      };
    });
  };

  const toNumberOrNull = (v: any) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };

  const save = async () => {
    if (saving) return;

    const name = String(form.name || "").trim();
    const number = String(form.number || "").trim().toUpperCase();

    if (!name) {
      toast.error("Vehicle name is required");
      nameRef.current?.focus();
      return;
    }
    if (!number) {
      toast.error("Vehicle number is required");
      numberRef.current?.focus();
      return;
    }
    if (form.fuel === "OTHER" && !String(form.fuelOther || "").trim()) {
      toast.error("Fuel Other is required when Fuel is OTHER");
      fuelOtherRef.current?.focus();
      return;
    }

    const fuelCapacity = toNumberOrNull(form.fuelCapacity);
    if (Number.isNaN(fuelCapacity)) {
      toast.error("Fuel Capacity must be a valid number");
      return;
    }

    const loadingCapacity = toNumberOrNull(form.loadingCapacity);
    if (Number.isNaN(loadingCapacity)) {
      toast.error("Loading Capacity must be a valid number");
      return;
    }

    const payload = {
      ...(String(form.id || "").trim() ? { id: String(form.id).trim() } : {}),
      name,
      number,
      ownership: form.ownership,
      transportMode: form.transportMode,

      engineType: form.engineType || null,
      fuel: form.fuel,
      fuelOther: form.fuel === "OTHER" ? (String(form.fuelOther || "").trim() || null) : null,
      fuelCapacity,
      loadingCapacity,

      rcNumber: form.rcNumber || null,
      rcExpiry: form.rcExpiry ? new Date(form.rcExpiry).toISOString() : null,
      pollutionExpiry: form.pollutionExpiry ? new Date(form.pollutionExpiry).toISOString() : null,

      isRegistered: !!form.isRegistered,
      registeredAt: form.isRegistered && form.registeredAt ? new Date(form.registeredAt).toISOString() : null,

      docs: form.docs || null,
      managingVehicle: form.managingVehicle || null,
      medicalSupport: form.medicalSupport || null,
      notes: form.notes || null,

      driverIds: form.driverIds || [],
    };

    const isEdit = !!String(form.id || "").trim();

    setSaving(true);
    try {
      await toast.promise(onSave(payload), {
        loading: "Saving vehicle…",
        success: isEdit ? "Vehicle updated successfully" : "Vehicle created successfully",
        error: (e) => e?.message ?? "Failed to save vehicle",
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-[100svh] items-end sm:items-center sm:justify-center p-0 sm:p-4">
        <div
          className={
            "w-full bg-white shadow-2xl " +
            "h-[100svh] sm:h-auto sm:max-h-[85vh] " +
            "sm:max-w-3xl " +
            "rounded-t-2xl sm:rounded-2xl overflow-hidden"
          }
        >
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100">
            <div className="flex items-start justify-between gap-3 p-4 sm:p-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {form.id ? "Edit Vehicle" : "Add Vehicle"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Own/Rent vehicle master with driver assignments
                </p>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100svh-148px)] sm:max-h-[calc(85vh-148px)] overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>Transport Mode</label>
                  <select
                    className={fieldBase}
                    value={form.transportMode}
                    onChange={(e) =>
                      setForm((p: any) => ({ ...p, transportMode: e.target.value, driverIds: [] }))
                    }
                  >
                    {(enabledModes?.length ? enabledModes : (["ROAD", "SEA", "AIR"] as TransportMode[])).map(
                      (m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className={labelBase}>Ownership</label>
                  <select
                    className={fieldBase}
                    value={form.ownership}
                    onChange={(e) => setForm((p: any) => ({ ...p, ownership: e.target.value }))}
                  >
                    {ownershipOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelBase}>Engine Type</label>
                  <input
                    className={fieldBase}
                    value={form.engineType}
                    onChange={(e) => setForm((p: any) => ({ ...p, engineType: e.target.value }))}
                    placeholder="e.g., Diesel Engine"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelBase}>
                    Vehicle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={nameRef}
                    className={fieldBase}
                    value={form.name}
                    onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Tata 407"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className={labelBase}>
                    Vehicle Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={numberRef}
                    className={fieldBase}
                    value={form.number}
                    onChange={(e) =>
                      setForm((p: any) => ({ ...p, number: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g., TS09AB1234"
                    autoComplete="off"
                  />
                  <p className={helperBase}>We’ll auto-uppercase this field.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className={labelBase}>Fuel</label>
                  <select
                    className={fieldBase}
                    value={form.fuel}
                    onChange={(e) => {
                      const next = e.target.value;
                      setForm((p: any) => ({
                        ...p,
                        fuel: next,
                        fuelOther: next === "OTHER" ? p.fuelOther : "",
                      }));
                    }}
                  >
                    {fuelOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelBase}>Fuel Capacity</label>
                  <input
                    className={fieldBase}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={form.fuelCapacity}
                    onChange={(e) => setForm((p: any) => ({ ...p, fuelCapacity: e.target.value }))}
                    placeholder="Liters"
                  />
                </div>

                <div>
                  <label className={labelBase}>Loading Capacity</label>
                  <input
                    className={fieldBase}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={form.loadingCapacity}
                    onChange={(e) => setForm((p: any) => ({ ...p, loadingCapacity: e.target.value }))}
                    placeholder="Kg / Ton"
                  />
                </div>

                <div>
                  <label className={labelBase}>
                    Fuel Other {form.fuel === "OTHER" && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    ref={fuelOtherRef}
                    className={fieldBase}
                    value={form.fuelOther}
                    onChange={(e) => setForm((p: any) => ({ ...p, fuelOther: e.target.value }))}
                    placeholder={form.fuel === "OTHER" ? "Required" : "Optional"}
                    disabled={form.fuel !== "OTHER"}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelBase}>RC Number</label>
                  <input
                    className={fieldBase}
                    value={form.rcNumber}
                    onChange={(e) => setForm((p: any) => ({ ...p, rcNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelBase}>RC Exp Date</label>
                  <input
                    type="date"
                    className={fieldBase}
                    value={form.rcExpiry}
                    onChange={(e) => setForm((p: any) => ({ ...p, rcExpiry: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelBase}>Pollution Check Exp</label>
                  <input
                    type="date"
                    className={fieldBase}
                    value={form.pollutionExpiry}
                    onChange={(e) => setForm((p: any) => ({ ...p, pollutionExpiry: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-3">
                  <input
                    id="reg"
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={!!form.isRegistered}
                    onChange={(e) =>
                      setForm((p: any) => ({
                        ...p,
                        isRegistered: e.target.checked,
                        registeredAt: e.target.checked ? p.registeredAt : "",
                      }))
                    }
                  />
                  <div>
                    <label htmlFor="reg" className="text-sm font-semibold text-gray-800">
                      Registered vehicle?
                    </label>
                    <p className={helperBase}>If unchecked, registered date will be cleared.</p>
                  </div>
                </div>

                <div className="w-full sm:max-w-[280px]">
                  <label className={labelBase}>Registered Date</label>
                  <input
                    type="date"
                    className={fieldBase}
                    disabled={!form.isRegistered}
                    value={form.registeredAt}
                    onChange={(e) => setForm((p: any) => ({ ...p, registeredAt: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelBase}>Managing Vehicle</label>
                <input
                  className={fieldBase}
                  value={form.managingVehicle}
                  onChange={(e) => setForm((p: any) => ({ ...p, managingVehicle: e.target.value }))}
                  placeholder="Manager / Vendor"
                />
              </div>
              <div>
                <label className={labelBase}>Medical Support</label>
                <input
                  className={fieldBase}
                  value={form.medicalSupport}
                  onChange={(e) => setForm((p: any) => ({ ...p, medicalSupport: e.target.value }))}
                  placeholder="First Aid / Hospital"
                />
              </div>
              <div>
                <label className={labelBase}>Docs</label>
                <input
                  className={fieldBase}
                  value={form.docs}
                  onChange={(e) => setForm((p: any) => ({ ...p, docs: e.target.value }))}
                  placeholder="Doc links / notes"
                />
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-3 mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Assigned Drivers <span className="text-gray-400">(same mode)</span>
                </label>
                <span className="text-xs text-gray-500">Selected: {form.driverIds?.length ?? 0}</span>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                {filteredDrivers.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">No drivers for this mode.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-auto pr-1">
                    {filteredDrivers.map((d) => (
                      <label
                        key={d.id}
                        className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-800 hover:border-blue-300"
                      >
                        <input
                          type="checkbox"
                          checked={form.driverIds.includes(d.id)}
                          onChange={() => toggleDriver(d.id)}
                        />
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium">{d.name}</span>
                          <span className="text-xs text-gray-500">{d.role}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={labelBase}>Notes</label>
              <textarea
                className={fieldBase + " min-h-[110px] resize-y"}
                value={form.notes}
                onChange={(e) => setForm((p: any) => ({ ...p, notes: e.target.value }))}
                placeholder="Any notes about this vehicle…"
              />
            </div>
          </div>

          <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur border-t border-gray-100">
            <div className="p-4 sm:p-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={save}
                disabled={saving}
                className="w-full sm:w-auto px-5 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200 inline-flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
