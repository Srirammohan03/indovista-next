"use client";

import React, { useMemo, useRef, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Driver, DriverRole, TransportMode } from "@/types/driver";
import type { Vehicle } from "@/types/vehicle";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<any>;
  initialData: Driver | null;
  vehicles: Vehicle[];
  enabledModes: TransportMode[];
};

const roleOptions: DriverRole[] = ["DRIVER", "OPERATOR"];
const fallbackModes: TransportMode[] = ["ROAD", "SEA", "AIR"];

const fieldBase =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-[15px] " +
  "outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500";

const labelBase = "mb-1 block text-sm font-semibold text-gray-700";
const helperBase = "mt-1 text-xs text-gray-500";

export function DriverModal({ isOpen, onClose, onSave, initialData, vehicles, enabledModes }: Props) {
  const [saving, setSaving] = useState(false);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const contactRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);


  const modes = enabledModes?.length ? enabledModes : fallbackModes;

  const [form, setForm] = useState<any>(() => ({
    id: initialData?.id ?? "",
    name: initialData?.name ?? "",
    age: initialData?.age ?? "",
    role: (initialData?.role ?? "DRIVER") as DriverRole,

    profession: initialData?.profession ?? "",
    education: initialData?.education ?? "",
    languages: initialData?.languages ?? "",
    licenseNumber: initialData?.licenseNumber ?? "",
    contactNumber: initialData?.contactNumber ?? "",
    email: initialData?.email ?? "",
    address: initialData?.address ?? "",

    transportMode: (initialData?.transportMode ?? modes?.[0] ?? "ROAD") as TransportMode,
    medicalCondition: initialData?.medicalCondition ?? "",
    notes: initialData?.notes ?? "",

    vehicleIds: (initialData?.vehicles ?? []).map((v: any) => v.vehicle.id),
  }));

  React.useEffect(() => {
    if (!isOpen) return;

    const nextModes = enabledModes?.length ? enabledModes : fallbackModes;

    setForm({
      id: initialData?.id ?? "",
      name: initialData?.name ?? "",
      age: initialData?.age ?? "",
      role: (initialData?.role ?? "DRIVER") as DriverRole,

      profession: initialData?.profession ?? "",
      education: initialData?.education ?? "",
      languages: initialData?.languages ?? "",
      licenseNumber: initialData?.licenseNumber ?? "",
      contactNumber: initialData?.contactNumber ?? "",
      email: initialData?.email ?? "",
      address: initialData?.address ?? "",

      transportMode: (initialData?.transportMode ?? nextModes?.[0] ?? "ROAD") as TransportMode,
      medicalCondition: initialData?.medicalCondition ?? "",
      notes: initialData?.notes ?? "",

      vehicleIds: (initialData?.vehicles ?? []).map((v: any) => v.vehicle.id),
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

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => v.transportMode === form.transportMode);
  }, [vehicles, form.transportMode]);

  const toggleVehicle = (id: string) => {
    setForm((p: any) => {
      const exists = p.vehicleIds.includes(id);
      return {
        ...p,
        vehicleIds: exists ? p.vehicleIds.filter((x: string) => x !== id) : [...p.vehicleIds, id],
      };
    });
  };

  if (!isOpen) return null;

  const toNumberOrNull = (v: any) => {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  };
  const digitsOnly = (v: any) => String(v ?? "").replace(/\D/g, ""); // removes alphabets/symbols
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const save = async () => {
    if (saving) return;

    const name = String(form.name || "").trim();
    if (!name) {
      toast.error("Driver name is required");
      nameRef.current?.focus();
      return;
    }

    const age = toNumberOrNull(form.age);
    if (Number.isNaN(age)) {
      toast.error("Age must be a valid number");
      return;
    }
const rawContact = String(form.contactNumber || "").trim();
const contact = digitsOnly(rawContact);

if (!contact) {
  toast.error("Contact number is required");
  contactRef.current?.focus();
  return;
}
if (contact.length < 7 || contact.length > 15) {
  toast.error("Contact number must be 7 to 15 digits");
  contactRef.current?.focus();
  return;
}


const email = String(form.email || "").trim();
if (email && !isValidEmail(email)) {
  toast.error("Please enter a valid email address");
  emailRef.current?.focus();
  return;
}


    const payload = {
      ...(String(form.id || "").trim() ? { id: String(form.id).trim() } : {}),
      name,
      age,
      role: form.role,

      profession: form.profession || null,
      education: form.education || null,
      languages: form.languages || null,
      licenseNumber: form.licenseNumber || null,
      contactNumber: contact,
      email: email ? email : null,
      address: form.address || null,

      transportMode: form.transportMode,
      medicalCondition: form.medicalCondition || null,
      notes: form.notes || null,

      vehicleIds: form.vehicleIds || [],
    };

    const isEdit = !!String(form.id || "").trim();

    setSaving(true);
    try {
      await toast.promise(onSave(payload), {
        loading: "Saving driver…",
        success: isEdit ? "Driver updated successfully" : "Driver created successfully",
        error: (e) => e?.message ?? "Failed to save driver",
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
                  {String(form.id || "").trim() ? "Edit Driver / Operator" : "Add Driver / Operator"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Driver/operator master with vehicle assignments
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className={labelBase}>
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={nameRef}
                  className={fieldBase}
                  value={form.name}
                  onChange={(e) => setForm((p: any) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelBase}>Age</label>
                <input
                  className={fieldBase}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.age}
                  onChange={(e) => setForm((p: any) => ({ ...p, age: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelBase}>Role</label>
                <select
                  className={fieldBase}
                  value={form.role}
                  onChange={(e) => setForm((p: any) => ({ ...p, role: e.target.value }))}
                >
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelBase}>Transport Mode</label>
                <select
                  className={fieldBase}
                  value={form.transportMode}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, transportMode: e.target.value, vehicleIds: [] }))
                  }
                >
                  {modes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <p className={helperBase}>Vehicle list filters based on this mode.</p>
              </div>

              <div>
                <label className={labelBase}>License</label>
                <input
                  className={fieldBase}
                  value={form.licenseNumber}
                  onChange={(e) => setForm((p: any) => ({ ...p, licenseNumber: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelBase}>Contact No <span className="text-red-500">*</span></label>
                <input
  ref={contactRef}
  className={fieldBase}
  type="tel"
  inputMode="numeric"
  pattern="[0-9]*"
  maxLength={15}
  value={form.contactNumber}
  onChange={(e) =>
    setForm((p: any) => ({ ...p, contactNumber: e.target.value.replace(/\D/g, "") }))
  }
  placeholder="Digits only"
/>
<p className={helperBase}>Only numbers allowed (7–15 digits).</p>

              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelBase}>Profession</label>
                <input
                  className={fieldBase}
                  value={form.profession}
                  onChange={(e) => setForm((p: any) => ({ ...p, profession: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelBase}>Education</label>
                <input
                  className={fieldBase}
                  value={form.education}
                  onChange={(e) => setForm((p: any) => ({ ...p, education: e.target.value }))}
                />
              </div>

              <div>
                <label className={labelBase}>Languages</label>
                <input
                  className={fieldBase}
                  value={form.languages}
                  onChange={(e) => setForm((p: any) => ({ ...p, languages: e.target.value }))}
                  placeholder="English, Telugu, Hindi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelBase}>Email</label>
                <input
  ref={emailRef}
  className={fieldBase}
  type="email"
  inputMode="email"
  autoComplete="email"
  value={form.email}
  onChange={(e) => setForm((p: any) => ({ ...p, email: e.target.value }))}
  placeholder="name@example.com"
/>

              </div>
              <div>
                <label className={labelBase}>Medical Condition</label>
                <input
                  className={fieldBase}
                  value={form.medicalCondition}
                  onChange={(e) =>
                    setForm((p: any) => ({ ...p, medicalCondition: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className={labelBase}>Address</label>
              <textarea
                className={fieldBase + " min-h-[90px] resize-y"}
                value={form.address}
                onChange={(e) => setForm((p: any) => ({ ...p, address: e.target.value }))}
              />
            </div>

            <div>
              <div className="flex items-end justify-between gap-3 mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Assigned Vehicle(s) <span className="text-gray-400">(same mode)</span>
                </label>
                <span className="text-xs text-gray-500">Selected: {form.vehicleIds?.length ?? 0}</span>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                {filteredVehicles.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">No vehicles for this mode.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-auto pr-1">
                    {filteredVehicles.map((v) => (
                      <label
                        key={v.id}
                        className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-800 hover:border-blue-300"
                      >
                        <input
                          type="checkbox"
                          checked={form.vehicleIds.includes(v.id)}
                          onChange={() => toggleVehicle(v.id)}
                        />
                        <div className="flex flex-col leading-tight min-w-0">
                          <span className="font-medium truncate">{v.name}</span>
                          <span className="text-xs text-gray-500 truncate">{v.number}</span>
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
