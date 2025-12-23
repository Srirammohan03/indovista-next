"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { QuoteCharge, QuoteDetail } from "@/types/quote";

type ShipmentMini = {
  id: string;
  reference: string;
  customer: string;
  origin: { code: string; city: string; country: string };
  destination: { code: string; city: string; country: string };
  mode: "SEA" | "AIR" | "ROAD";
  commodity: string;
};

type ShipmentDetail = any;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void> | void;
  initialData?: QuoteDetail | null;
};

const toNum = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp0 = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

// ✅ Qty=0 stays 0 (never becomes 1), null/undefined defaults to 1
const calcSubtotal = (charges: QuoteCharge[]) =>
  charges.reduce((sum, c) => {
    const qty = c.quantity == null ? 1 : clamp0(toNum(c.quantity, 0));
    const rate = clamp0(toNum(c.amount, 0));
    return sum + rate * qty;
  }, 0);

// Tax % helpers (stored in taxAmount field)
const calcTaxValue = (subtotal: number, taxPercent: number, taxesIncluded: boolean) => {
  const p = clamp0(toNum(taxPercent, 0));
  if (!p || subtotal <= 0) return 0;

  if (taxesIncluded) {
    // tax is included inside subtotal => compute included portion
    const divisor = 1 + p / 100;
    return divisor > 1 ? subtotal - subtotal / divisor : 0;
  }

  // excluded => added on top
  return subtotal * (p / 100);
};

export const AddQuoteModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const isEdit = Boolean(initialData?.id);
  const [saving, setSaving] = useState(false);

  const { data: shipments = [] } = useQuery<ShipmentMini[]>({
    queryKey: ["shipments-mini-for-quotes"],
    queryFn: async () => {
      const res = await fetch("/api/shipments", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load shipments");
      return res.json();
    },
    enabled: isOpen && !isEdit,
  });

  const [shipmentId, setShipmentId] = useState<string>("");

  const { data: shipmentDetail } = useQuery<ShipmentDetail>({
    queryKey: ["shipment-detail-for-quote", shipmentId],
    queryFn: async () => {
      const res = await fetch(`/api/shipments/${encodeURIComponent(shipmentId)}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: isOpen && !isEdit && !!shipmentId,
  });

  // ✅ taxAmount is now TAX PERCENT (e.g. 18)
  const [form, setForm] = useState({
    validityDays: 7,
    validTill: "",
    status: "DRAFT",
    preparedBy: "",
    currencyCode: "INR",
    taxesIncluded: false,
    taxPercent: 18, // default
    notesIncluded: "",
    notesExcluded: "",
    disclaimer: "Rates are subject to space & carrier availability. Prices may change due to fuel/currency fluctuations.",
  });

  const [charges, setCharges] = useState<QuoteCharge[]>([
    { name: "Freight Charges (Estimated)", chargeType: "FLAT", currencyCode: "INR", amount: 0, quantity: 1 },
    { name: "Origin Handling", chargeType: "FLAT", currencyCode: "INR", amount: 0, quantity: 1 },
    { name: "Destination Handling", chargeType: "FLAT", currencyCode: "INR", amount: 0, quantity: 1 },
    { name: "Documentation Charges", chargeType: "FLAT", currencyCode: "INR", amount: 0, quantity: 1 },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && initialData) {
      setShipmentId(initialData.shipmentId || "");
      setForm({
        validityDays: toNum(initialData.validityDays ?? 7, 7),
        validTill: initialData.validTill || "",
        status: initialData.status || "DRAFT",
        preparedBy: initialData.preparedBy || "",
        currencyCode: initialData.currencyCode || "INR",
        taxesIncluded: Boolean(initialData.taxesIncluded),
        taxPercent: clamp0(toNum(initialData.taxAmount ?? 0, 0)), // ✅ stored as percent
        notesIncluded: initialData.notesIncluded || "",
        notesExcluded: initialData.notesExcluded || "",
        disclaimer: initialData.disclaimer || "",
      });

      setCharges(
        (initialData.charges || []).map((c) => ({
          id: c.id,
          name: c.name,
          chargeType: c.chargeType,
          currencyCode: c.currencyCode,
          quantity: c.quantity ?? 1,
          unitLabel: c.unitLabel ?? null,
          amount: toNum(c.amount, 0),
        }))
      );
    } else {
      setShipmentId("");
      setForm({
        validityDays: 7,
        validTill: "",
        status: "DRAFT",
        preparedBy: "",
        currencyCode: "INR",
        taxesIncluded: false,
        taxPercent: 18,
        notesIncluded: "",
        notesExcluded: "",
        disclaimer: "Rates are subject to space & carrier availability. Prices may change due to fuel/currency fluctuations.",
      });

      setCharges([
        { name: "Freight Charges (Estimated)", chargeType: "FLAT", currencyCode: "INR", amount: 0, quantity: 1 },
        { name: "Origin Handling", chargeType: "FLAT", currencyCode: "INR", amount: 0, quantity: 1 },
        { name: "Destination Handling", chargeType: "FLAT", currencyCode: "INR", amount: 0, quantity: 1 },
        { name: "Documentation Charges", chargeType: "FLAT", currencyCode: "INR", amount: 0, quantity: 1 },
      ]);
    }
  }, [isOpen, isEdit, initialData]);

  useEffect(() => {
    if (!shipmentDetail || isEdit) return;

    const currency = shipmentDetail?.financials?.currency || "INR";
    const revenue = toNum(shipmentDetail?.financials?.revenue, 0);

    setForm((p) => ({ ...p, currencyCode: currency }));
    setCharges((prev) => {
      const next = prev.map((c) => ({ ...c, currencyCode: currency }));
      if (next[0]) next[0] = { ...next[0], amount: revenue || 0 };
      return next;
    });
  }, [shipmentDetail, isEdit]);

  const subtotal = useMemo(() => calcSubtotal(charges), [charges]);

  const taxValue = useMemo(() => calcTaxValue(subtotal, form.taxPercent, form.taxesIncluded), [subtotal, form.taxPercent, form.taxesIncluded]);

  const total = useMemo(() => (form.taxesIncluded ? subtotal : subtotal + taxValue), [subtotal, taxValue, form.taxesIncluded]);

  if (!isOpen) return null;

  const addCharge = () => {
    setCharges((p) => [
      ...p,
      { name: "New Charge", chargeType: "FLAT", currencyCode: form.currencyCode || "INR", amount: 0, quantity: 1, unitLabel: null },
    ]);
  };

  const removeCharge = (idx: number) => setCharges((p) => p.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        shipmentId: isEdit ? initialData?.shipmentId : shipmentId,

        validityDays: toNum(form.validityDays || 7, 7),
        validTill: form.validTill || undefined,
        status: form.status,
        preparedBy: form.preparedBy || undefined,

        currencyCode: form.currencyCode || "INR",
        taxesIncluded: Boolean(form.taxesIncluded),

        // ✅ send tax percent in the existing taxAmount field (backend updated to treat as %)
        taxAmount: clamp0(toNum(form.taxPercent, 0)),

        notesIncluded: form.notesIncluded || undefined,
        notesExcluded: form.notesExcluded || undefined,
        disclaimer: form.disclaimer || undefined,

        charges: charges.map((c) => ({
          name: c.name,
          chargeType: c.chargeType,
          currencyCode: c.currencyCode || form.currencyCode || "INR",

          // ✅ qty=0 stays 0
          quantity: c.quantity == null ? 1 : clamp0(toNum(c.quantity, 0)),
          unitLabel: c.unitLabel ?? null,
          amount: clamp0(toNum(c.amount, 0)),
        })),
      };

      if (!isEdit && !payload.shipmentId) {
        alert("Please select a Shipment.");
        return;
      }

      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isEdit ? `Edit Quote ${initialData?.id}` : "Create Quote"}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit ? "Snapshot fields are read-only. Edit charges/tax/validity/status." : "Select a shipment. Customer/route/cargo are auto-fetched from shipment."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!isEdit && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Select Shipment</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.reference} • {s.customer} • {s.origin.code} → {s.destination.code} • {s.mode}
                  </option>
                ))}
              </select>

              {shipmentDetail && (
                <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                  <div className="font-semibold text-gray-900 mb-1">Preview (Fetched from Shipment)</div>
                  <div>
                    Customer: <span className="font-semibold">{shipmentDetail.customer}</span>
                  </div>
                  <div>
                    Route: {shipmentDetail.origin.code} → {shipmentDetail.destination.code}
                  </div>
                  <div>Commodity: {shipmentDetail.commodity}</div>
                  <div>Mode: {shipmentDetail.mode}</div>
                  <div>Currency: {shipmentDetail.financials.currency}</div>
                </div>
              )}
            </div>
          )}

          {isEdit && initialData && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
              <div className="font-bold text-gray-900 mb-2">Snapshot (Read-only)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                <div>
                  <span className="font-semibold">Customer:</span> {initialData.customerName}
                </div>
                <div>
                  <span className="font-semibold">Email:</span> {initialData.email || "-"}
                </div>
                <div>
                  <span className="font-semibold">Route:</span> {initialData.originCity} → {initialData.destCity}
                </div>
                <div>
                  <span className="font-semibold">Mode:</span> {initialData.mode}
                </div>
                <div>
                  <span className="font-semibold">Commodity:</span> {initialData.commodity}
                </div>
                <div>
                  <span className="font-semibold">Incoterm:</span> {initialData.incotermCode || "-"}
                </div>
              </div>
            </div>
          )}

          {/* Editable fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="DRAFT">DRAFT</option>
                <option value="SENT">SENT</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Validity (Days)</label>
              <input
                type="number"
                min={1}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.validityDays}
                onChange={(e) => setForm((p) => ({ ...p, validityDays: toNum(e.target.value, 7) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Valid Till (optional)</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.validTill}
                onChange={(e) => setForm((p) => ({ ...p, validTill: e.target.value }))}
              />
            </div>
          </div>

          {/* Tax UI (Included/Excluded + %) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Currency</label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.currencyCode}
                onChange={(e) => setForm((p) => ({ ...p, currencyCode: e.target.value.toUpperCase() }))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tax Mode</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.taxesIncluded ? "INCLUDED" : "EXCLUDED"}
                onChange={(e) => setForm((p) => ({ ...p, taxesIncluded: e.target.value === "INCLUDED" }))}
              >
                <option value="EXCLUDED">Tax Excluded (Add on top)</option>
                <option value="INCLUDED">Tax Included (Inside prices)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tax % ({form.taxesIncluded ? "Included" : "Excluded"})
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.taxPercent}
                onChange={(e) => setForm((p) => ({ ...p, taxPercent: clamp0(toNum(e.target.value, 0)) }))}
              />
              <div className="text-xs text-gray-500 mt-1">
                {form.taxesIncluded
                  ? `Included tax amount (calculated): ${form.currencyCode} ${taxValue.toFixed(2)}`
                  : `Tax to be added: ${form.currencyCode} ${taxValue.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Charges */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">Cost Breakdown</div>
                <div className="text-xs text-gray-500">Line items (subtotal auto-calculated)</div>
              </div>
              <button
                onClick={addCharge}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Charge
              </button>
            </div>

            <div className="p-4 space-y-3">
              {charges.map((c, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-gray-200 rounded-lg p-3">
                  <div className="md:col-span-5">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Charge Name</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={c.name}
                      onChange={(e) => setCharges((p) => p.map((x, i) => (i === idx ? { ...x, name: e.target.value } : x)))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={c.chargeType}
                      onChange={(e) => setCharges((p) => p.map((x, i) => (i === idx ? { ...x, chargeType: e.target.value as any } : x)))}
                    >
                      <option value="FLAT">FLAT</option>
                      <option value="PER_UNIT">PER_UNIT</option>
                    </select>
                  </div>

                  {/* ✅ Qty fixed: wider + value visible + 0 allowed */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Qty</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      className="w-full min-w-[45px] px-2 py-2 border border-gray-300 rounded-lg text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={c.quantity ?? 1}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const nextQty = raw === "" ? 0 : clamp0(toNum(raw, 0));
                        setCharges((p) => p.map((x, i) => (i === idx ? { ...x, quantity: nextQty } : x)));
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Label</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={c.unitLabel ?? ""}
                      placeholder="e.g., CBM"
                      onChange={(e) => setCharges((p) => p.map((x, i) => (i === idx ? { ...x, unitLabel: e.target.value || null } : x)))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Rate</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={c.amount}
                      onChange={(e) => setCharges((p) => p.map((x, i) => (i === idx ? { ...x, amount: clamp0(toNum(e.target.value, 0)) } : x)))}
                    />
                  </div>

                  <div className="flex justify-end md:col-span-12">
                    <button onClick={() => removeCharge(idx)} className="p-2 hover:bg-red-50 rounded text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-mono font-semibold">
                    {form.currencyCode} {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Tax ({form.taxesIncluded ? "Included" : "Excluded"} • {clamp0(toNum(form.taxPercent, 0)).toFixed(2)}%)
                  </span>
                  <span className="font-mono font-semibold">
                    {form.currencyCode} {taxValue.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between pt-1 border-t border-gray-200 mt-1">
                  <span className="text-gray-900 font-semibold">Total</span>
                  <span className="font-mono font-bold">
                    {form.currencyCode} {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes Included</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[80px]"
                value={form.notesIncluded}
                onChange={(e) => setForm((p) => ({ ...p, notesIncluded: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes Excluded</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[80px]"
                value={form.notesExcluded}
                onChange={(e) => setForm((p) => ({ ...p, notesExcluded: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Disclaimer</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg min-h-[70px]"
              value={form.disclaimer}
              onChange={(e) => setForm((p) => ({ ...p, disclaimer: e.target.value }))}
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Quote
          </button>
        </div>
      </div>
    </div>
  );
};
