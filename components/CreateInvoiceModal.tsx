// components\CreateInvoiceModal.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { X, Loader2, Save, Plus, Trash2 } from "lucide-react";
import type { InvoiceLineItem } from "@/types";

type ShipmentPick = {
  id: string;
  reference: string;
  customerName: string;
  currency: string;
  customerGstin?: string;
  placeOfSupply?: string;
};

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  invoiceId?: string | null;
  shipmentId?: string; // ✅ optional, backward-safe
  onClose: () => void;
  onSaved: () => void;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export const CreateInvoiceModal: React.FC<Props> = ({
  isOpen,
  mode,
  invoiceId,
  shipmentId,
  onClose,
  onSaved,
}) => {
  const isEdit = mode === "edit";

  const [loadingShipments, setLoadingShipments] = useState(false);
  const [shipments, setShipments] = useState<ShipmentPick[]>([]);
  const [shipmentQuery, setShipmentQuery] = useState("");

  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [saving, setSaving] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);

  const [form, setForm] = useState({
    shipmentId: "",
    shipmentRef: "",
    customerName: "",
    customerGstin: "",
    placeOfSupply: "",
    issueDate: todayISO(),
    dueDate: todayISO(),
    currency: "INR",
    tdsRate: "0",
    status: "DRAFT",
  });

  const [items, setItems] = useState<InvoiceLineItem[]>([
    {
      id: "",
      description: "Freight Charges",
      quantity: 1,
      rate: 0,
      taxRate: 0,
      hsnCode: "",
      amount: 0,
    },
  ]);
  const preloadShipment = async (id: string) => {
    const res = await fetch(`/api/shipments/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Shipment not found");
    const s = await res.json();

    setForm((p) => ({
      ...p,
      shipmentId: s.id,
      shipmentRef: s.reference,
      customerName:
        s.customer || s.customer?.companyName || s.customer?.name || "-",
      customerGstin: s.customer?.gstin || "",
      placeOfSupply: s.placeOfSupply || "",
      currency: s.financials?.currency || "INR",
    }));
  };

  const canSave = useMemo(() => {
    if (!isEdit && !form.shipmentId) return false;
    if (!items.length) return false;
    if (items.some((i) => !String(i.description || "").trim())) return false;
    if (items.some((i) => Number(i.quantity || 0) <= 0)) return false;
    return true;
  }, [form.shipmentId, items, isEdit]);

  const loadShipments = async (q: string) => {
    setLoadingShipments(true);
    try {
      const res = await fetch(
        `/api/shipments?q=${encodeURIComponent(q || "")}&take=50`,
        {
          cache: "no-store",
        }
      );
      const data = await res.json();

      const normalized: ShipmentPick[] = Array.isArray(data)
        ? data.map((s: any) => ({
            id: s.id,
            reference: s.reference || s.id,
            customerName:
              s.customerName ||
              s.customer?.companyName ||
              s.customer?.name ||
              s.customer ||
              "-",
            currency:
              s.currency || s.currencyCode || s.customer?.currency || "INR",
            customerGstin: s.customerGstin || s.customer?.gstin || "",
            placeOfSupply: s.placeOfSupply || s.customer?.placeOfSupply || "",
          }))
        : [];

      setShipments(normalized);
    } catch {
      setShipments([]);
    } finally {
      setLoadingShipments(false);
    }
  };

  const loadInvoice = async (id: string) => {
    setLoadingInvoice(true);
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Invoice not found");

      setInvoiceNumber(String(data.invoiceNumber || ""));
      setPaidAmount(Number(data.paidAmount || 0));
      setBalanceAmount(Number(data.balanceAmount || 0));

      setForm({
        shipmentId: String(data.shipmentId || ""),
        shipmentRef: String(data.shipmentRef || ""),
        customerName: String(data.customerName || ""),
        customerGstin: String(data.customerGstin || ""),
        placeOfSupply: String(data.placeOfSupply || ""),
        issueDate: String(data.issueDate || todayISO()),
        dueDate: String(data.dueDate || todayISO()),
        currency: String(data.currency || "INR"),
        tdsRate: String(data.tdsRate ?? "0"),
        status: String(data.status || "DRAFT"),
      });

      setItems(
        Array.isArray(data.items) && data.items.length ? data.items : []
      );
    } catch (e: any) {
      alert(e?.message || "Failed to load invoice");
      onClose();
    } finally {
      setLoadingInvoice(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // always reset
    setInvoiceNumber("");
    setPaidAmount(0);
    setBalanceAmount(0);

    // edit mode = unchanged
    if (isEdit) {
      if (invoiceId) loadInvoice(invoiceId);
      return;
    }

    // ✅ Shipment-bound create (NEW, SAFE)
    if (shipmentId) {
      preloadShipment(shipmentId);
      return;
    }

    // 🟢 OLD behavior (UNCHANGED)
    setForm({
      shipmentId: "",
      shipmentRef: "",
      customerName: "",
      customerGstin: "",
      placeOfSupply: "",
      issueDate: todayISO(),
      dueDate: todayISO(),
      currency: "INR",
      tdsRate: "0",
      status: "DRAFT",
    });

    setItems([
      {
        id: "",
        description: "Freight Charges",
        quantity: 1,
        rate: 0,
        taxRate: 0,
        hsnCode: "",
        amount: 0,
      },
    ]);

    loadShipments("");
  }, [isOpen, isEdit, invoiceId, shipmentId]);

  const onSelectShipment = async (shipmentId: string) => {
    const pick = shipments.find((s) => s.id === shipmentId);
    if (!pick) return;

    setForm((p) => ({
      ...p,
      shipmentId: pick.id,
      shipmentRef: pick.reference,
      customerName: pick.customerName,
      customerGstin: pick.customerGstin || "",
      placeOfSupply: pick.placeOfSupply || "",
      currency: pick.currency || "INR",
    }));
  };

  const addItem = () => {
    setItems((p) => [
      ...p,
      {
        id: "",
        description: "",
        quantity: 1,
        rate: 0,
        taxRate: 0,
        hsnCode: "",
        amount: 0,
      },
    ]);
  };

  const removeItem = (idx: number) => {
    setItems((p) => p.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, patch: Partial<InvoiceLineItem>) => {
    setItems((p) => p.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const save = async () => {
    if (!canSave) {
      alert("Please fill required fields and add at least 1 valid line item.");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        customerGstin: form.customerGstin?.trim() || null,
        placeOfSupply: form.placeOfSupply?.trim() || null,
        issueDate: form.issueDate,
        dueDate: form.dueDate,
        currency: form.currency,
        tdsRate: Number(form.tdsRate || 0),
        status: form.status,
        items,
      };

      let res: Response;

      if (isEdit) {
        if (!invoiceId) throw new Error("Missing invoiceId");
        res = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        payload.shipmentId = form.shipmentId;

        // ✅ do NOT send invoiceNumber (server generates globally & uniquely)
        res = await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.message || "Save failed");

      await onSaved();
      onClose();
    } catch (e: any) {
      alert(e?.message || "Invoice save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]  flex items-center justify-center h-full bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {isEdit ? "Edit Invoice" : "Create Invoice"}
            </h2>
            {isEdit ? (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Invoice No:{" "}
                <span className="font-mono">{invoiceNumber || "-"}</span>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Select Shipment Ref → auto-fill Customer
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {loadingInvoice ? (
            <div className="py-12 text-center text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
              Loading invoice...
            </div>
          ) : (
            <>
              {/* Summary for edit */}
              {isEdit && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div>
                    <div className="text-xs text-gray-500">Paid</div>
                    <div className="font-bold text-gray-900">
                      {paidAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Balance</div>
                    <div className="font-bold text-gray-900">
                      {balanceAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Shipment</div>
                    <div className="font-mono text-gray-900">
                      {form.shipmentRef || form.shipmentId || "-"}
                    </div>
                  </div>
                </div>
              )}

              {/* Shipment selector (create only) */}
              {!isEdit && !shipmentId && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Search Shipment Ref
                    </label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={shipmentQuery}
                        onChange={(e) => setShipmentQuery(e.target.value)}
                        placeholder="Type reference..."
                      />
                      <button
                        onClick={() => loadShipments(shipmentQuery)}
                        className="px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                        type="button"
                      >
                        {loadingShipments ? "..." : "Search"}
                      </button>
                    </div>

                    <div className="mt-2">
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.shipmentId}
                        onChange={(e) => onSelectShipment(e.target.value)}
                      >
                        <option value="">Select Shipment</option>
                        {shipments.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.reference} • {s.customerName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Customer
                    </label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      value={form.customerName}
                      readOnly
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Auto-filled from shipment.
                    </div>
                  </div>
                </div>
              )}

              {/* Header fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.issueDate}
                    onChange={(e) =>
                      setForm({ ...form, issueDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Currency
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={form.currency}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Customer GSTIN (Optional)
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.customerGstin}
                    onChange={(e) =>
                      setForm({ ...form, customerGstin: e.target.value })
                    }
                    placeholder="GSTIN"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Place of Supply (Optional)
                  </label>
                  <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.placeOfSupply}
                    onChange={(e) =>
                      setForm({ ...form, placeOfSupply: e.target.value })
                    }
                    placeholder="State / City"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <div className="font-semibold text-gray-800">Line Items</div>
                  <button
                    onClick={addItem}
                    type="button"
                    className="px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="p-3 space-y-3">
                  {items.map((it, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 border border-gray-100 rounded-lg p-3"
                    >
                      <div className="sm:col-span-5">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Description
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          value={it.description}
                          onChange={(e) =>
                            updateItem(idx, { description: e.target.value })
                          }
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          HSN/SAC
                        </label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          value={it.hsnCode || ""}
                          onChange={(e) =>
                            updateItem(idx, { hsnCode: e.target.value })
                          }
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Qty
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          value={it.quantity}
                          onChange={(e) =>
                            updateItem(idx, {
                              quantity: Number(e.target.value || 0),
                            })
                          }
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          Rate
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          value={it.rate}
                          onChange={(e) =>
                            updateItem(idx, {
                              rate: Number(e.target.value || 0),
                            })
                          }
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          GST%
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          value={it.taxRate || 0}
                          onChange={(e) =>
                            updateItem(idx, {
                              taxRate: Number(e.target.value || 0),
                            })
                          }
                        />
                      </div>

                      <div className="sm:col-span-1 flex items-end justify-end">
                        <button
                          onClick={() => removeItem(idx)}
                          type="button"
                          className="px-3 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TDS + status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    TDS Rate %
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.tdsRate}
                    onChange={(e) =>
                      setForm({ ...form, tdsRate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-5 sm:p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={saving || loadingInvoice || !canSave}
            type="button"
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? "Save Changes" : "Create Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};
