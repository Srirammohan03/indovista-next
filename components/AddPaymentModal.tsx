"use client";
import React, { useMemo, useState } from "react";
import { X, Loader2, Save, Trash2 } from "lucide-react";
import type { Payment } from "@/types/index";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  invoiceId?: string | null;
  currency?: string;
  maxAmountHint?: number; // outstanding
  onSaved: () => void;

  // optional: edit mode
  paymentToEdit?: Payment | null;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function methodLabel(method: string) {
  switch (method) {
    case "UPI":
      return "UPI Reference ID";
    case "ACCOUNT":
      return "Bank UTR / Ref No.";
    case "CHEQUE":
      return "Cheque No.";
    case "CASH":
      return "Receipt / Ref (Optional)";
    default:
      return "Reference / Transaction (Optional)";
  }
}

export const AddPaymentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  shipmentId,
  invoiceId = null,
  currency = "INR",
  maxAmountHint,
  onSaved,
  paymentToEdit = null,
}) => {
  const isEdit = !!paymentToEdit;

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    amount: String(paymentToEdit?.amount ?? ""),
    method: (paymentToEdit?.method ?? "UPI") as any,
    transactionNum: paymentToEdit?.transactionNum ?? "",
    date: paymentToEdit?.date ? String(paymentToEdit.date).slice(0, 10) : todayISO(),
    notes: paymentToEdit?.notes ?? "",
    status: (paymentToEdit?.status ?? "COMPLETED") as any,
  });

  const txLabel = useMemo(() => methodLabel(String(form.method)), [form.method]);

  const validate = () => {
    const amt = Number(form.amount);
    if (!amt || amt <= 0) return "Please enter a valid amount";
    if (maxAmountHint && amt > maxAmountHint * 5) {
      // safety: allow advance or multi-invoice payments; keep soft guard
      return `Amount looks very high vs outstanding (${maxAmountHint}). Please double-check.`;
    }
    // For non-cash, strongly encourage transaction ref
    if (String(form.method) !== "CASH" && !String(form.transactionNum || "").trim()) {
      return "Transaction / Reference is required for this payment method";
    }
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        shipmentId,
        invoiceId,
        amount: Number(form.amount),
        currency,
        method: form.method,
        transactionNum: form.transactionNum?.trim() ? form.transactionNum.trim() : null,
        date: form.date,
        notes: form.notes?.trim() ? form.notes.trim() : null,
        status: form.status,
      };

      const res = await fetch(isEdit ? `/api/payments/${paymentToEdit!.id}` : "/api/payments", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Failed to save payment");
      }

      onSaved();
      onClose();
    } catch (e: any) {
      alert(e?.message || "Payment save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!paymentToEdit) return;
    if (!confirm("Delete this payment?")) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/payments/${paymentToEdit.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Failed to delete payment");
      }
      onSaved();
      onClose();
    } catch (e: any) {
      alert(e?.message || "Payment delete failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {isEdit ? "Edit Payment" : "Record Payment"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {invoiceId ? "Payment linked to selected invoice" : "Payment linked to shipment (unapplied)"}
              {typeof maxAmountHint === "number" ? ` • Outstanding: ${maxAmountHint.toFixed(2)} ${currency}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Amount Received</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
              <div className="text-xs text-gray-500 mt-1">Currency: {currency}</div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value as any })}
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="ACCOUNT">Bank Transfer / NEFT / RTGS</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{txLabel}</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.transactionNum}
                onChange={(e) => setForm({ ...form, transactionNum: e.target.value })}
                placeholder="Enter reference"
              />
              {String(form.method) !== "CASH" && (
                <div className="text-xs text-gray-500 mt-1">Required for {String(form.method).toUpperCase()}.</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Add bank name, payer name, cheque bank, etc..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            >
              <option value="PENDING">Pending Clearance</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed / Bounced</option>
            </select>
          </div>
        </div>

        <div className="p-5 sm:p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
          {isEdit && (
            <button
              onClick={remove}
              disabled={saving}
              className="px-5 py-2.5 border border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-60 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Save Changes" : "Record Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};
