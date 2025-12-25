"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import {
  Plus,
  Search,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Invoice } from "@/types";
import { openInvoicePdfInNewTab } from "@/types/invoiceUtils";
import { CreateInvoiceModal } from "@/components/CreateInvoiceModal";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  shipmentId: string;
  shipmentRef: string;
  customerName: string;
  customerGstin?: string | null;
  placeOfSupply?: string | null;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
};

const BillingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  const {
    data: invoices = [],
    isLoading: isLoadingInvoices,
    refetch: refetchInvoices,
  } = useQuery<InvoiceRow[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load invoices");
      return res.json();
    },
  });

  const openCreateModal = () => {
    setModalMode("create");
    setEditingInvoiceId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (invoiceId: string) => {
    setModalMode("edit");
    setEditingInvoiceId(invoiceId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInvoiceId(null);
  };

  const onSaved = async () => {
    await refetchInvoices();
  };

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return invoices.filter(
      (inv) =>
        (inv.invoiceNumber || "").toLowerCase().includes(t) ||
        (inv.customerName || "").toLowerCase().includes(t) ||
        (inv.shipmentRef || "").toLowerCase().includes(t) ||
        (inv.shipmentId || "").toLowerCase().includes(t)
    );
  }, [invoices, searchTerm]);

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));
    } catch {
      return `${amount}`;
    }
  };

  const parseDate = (s?: string) => {
    if (!s) return null;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const today0 = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  // KPIs using balanceAmount (truth from payments)
  const totals = useMemo(() => {
    const outstanding = invoices.filter((i) => Number(i.balanceAmount || 0) > 0);
    const overdue = invoices.filter((i) => i.status === "OVERDUE");
    const paid = invoices.filter((i) => i.status === "PAID");

    const sum = (list: InvoiceRow[], key: "amount" | "balanceAmount" | "paidAmount") =>
      list.reduce((a, b) => a + (Number((b as any)[key]) || 0), 0);

    const paidThisMonth = paid.filter((i) => {
      const d = parseDate(i.issueDate);
      if (!d) return false;
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    return {
      totalCount: invoices.length,
      outstandingAmount: sum(outstanding, "balanceAmount"),
      overdueAmount: sum(overdue, "balanceAmount"),
      paidThisMonthAmount: sum(paidThisMonth, "amount"),
      currency: invoices[0]?.currency || "INR",
      outstanding,
    };
  }, [invoices]);

  // Aging buckets (only unpaid balances)
  const aging = useMemo(() => {
    const buckets = { b0_30: 0, b31_60: 0, b61_90: 0, b90p: 0 };

    totals.outstanding.forEach((inv) => {
      const due = parseDate(inv.dueDate);
      const bal = Number(inv.balanceAmount || 0);

      if (!due) {
        buckets.b0_30 += bal;
        return;
      }

      due.setHours(0, 0, 0, 0);
      const days = Math.max(0, Math.floor((today0.getTime() - due.getTime()) / 86400000));

      if (days <= 30) buckets.b0_30 += bal;
      else if (days <= 60) buckets.b31_60 += bal;
      else if (days <= 90) buckets.b61_90 += bal;
      else buckets.b90p += bal;
    });

    const total = buckets.b0_30 + buckets.b31_60 + buckets.b61_90 + buckets.b90p;
    const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);
    return { ...buckets, total, pct };
  }, [totals.outstanding, today0]);

  const handleDownload = async (row: InvoiceRow) => {
    const res = await fetch(`/api/invoices/${encodeURIComponent(row.id)}`, { cache: "no-store" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.message || "Failed to load invoice for PDF");
      return;
    }

    const data = await res.json();

    const invoice: Invoice = {
      id: data.id,
      invoiceNumber: data.invoiceNumber,
      shipmentId: data.shipmentId || row.shipmentId,
      customerName: data.customerName,
      customerGstin: data.customerGstin || "",
      placeOfSupply: data.placeOfSupply || "",
      shipmentRef: data.shipmentRef || row.shipmentRef,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      subtotal: Number(data.subtotal || 0),
      totalTax: Number(data.totalTax || 0),
      tdsRate: Number(data.tdsRate || 0),
      tdsAmount: Number(data.tdsAmount || 0),
      amount: Number(data.amount || 0),
      currency: data.currency || row.currency,
      status: data.status,
      items: Array.isArray(data.items) ? data.items : [],
      paidAmount: Number(data.paidAmount || 0),
      balanceAmount: Number(data.balanceAmount || 0),
    };

    openInvoicePdfInNewTab(invoice);
  };

  const handleDelete = async (invoiceId: string) => {
    const ok = confirm("Are you sure you want to delete this invoice?");
    if (!ok) return;

    const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`, { method: "DELETE" });
    const j = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(j.message || "Failed to delete invoice");
      return;
    }
    await onSaved();
  };

  return (
    <div className="space-y-6">
      <CreateInvoiceModal
        isOpen={isModalOpen}
        mode={modalMode}
        invoiceId={editingInvoiceId}
        onClose={closeModal}
        onSaved={onSaved}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-500 mt-1">Invoices are created from shipments (multiple invoices per shipment supported)</p>
        </div>
        <button
          onClick={openCreateModal}
          type="button"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center justify-between border-l-4 border-gray-500">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-900">{totals.totalCount}</p>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg">
            <FileText className="w-6 h-6 text-gray-600" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between border-l-4 border-blue-500">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Outstanding (Balance)</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(totals.outstandingAmount, totals.currency)}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between border-l-4 border-red-500 relative overflow-hidden">
          <div className="bg-red-50 absolute inset-0 opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500 mb-1">Overdue (Balance)</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.overdueAmount, totals.currency)}
            </p>
          </div>
          <div className="p-3 bg-red-100 rounded-lg relative z-10">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-between border-l-4 border-green-500">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Paid This Month</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.paidThisMonthAmount, totals.currency)}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Aging */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-6">Aging Report (Balance)</h3>
        <div className="relative pt-2 pb-6">
          <div className="flex h-3 rounded-full overflow-hidden w-full bg-gray-100">
            <div style={{ width: `${aging.pct(aging.b0_30)}%` }} className="bg-green-500 h-full"></div>
            <div style={{ width: `${aging.pct(aging.b31_60)}%` }} className="bg-amber-400 h-full"></div>
            <div style={{ width: `${aging.pct(aging.b61_90)}%` }} className="bg-orange-500 h-full"></div>
            <div style={{ width: `${aging.pct(aging.b90p)}%` }} className="bg-red-500 h-full"></div>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card noPadding className="overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices by number, shipment, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoadingInvoices ? (
          <div className="px-6 py-10 text-center text-gray-500">Loading invoices…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Invoice No.</th>
                  <th className="px-6 py-4">Shipment</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Invoice Amount</th>
                  <th className="px-6 py-4">Paid</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                      No invoices found.
                    </td>
                  </tr>
                )}

                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.invoiceNumber}</td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/shipments/${row.shipmentId}`}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono hover:bg-gray-200 inline-block"
                      >
                        {row.shipmentRef || row.shipmentId}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-gray-700">{row.customerName}</td>

                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatCurrency(row.amount, row.currency)}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {formatCurrency(row.paidAmount, row.currency)}
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(row.balanceAmount, row.currency)}
                    </td>

                    <td className="px-6 py-4 text-gray-600">{row.issueDate}</td>
                    <td className="px-6 py-4 text-gray-600">{row.dueDate}</td>

                    <td className="px-6 py-4">
                      <StatusBadge status={row.status as any} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => handleDownload(row)}
                          className="text-gray-400 hover:text-blue-600"
                          title="Download Invoice PDF"
                          type="button"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEditModal(row.id)}
                          className="text-gray-400 hover:text-gray-900"
                          title="Edit Invoice"
                          type="button"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete Invoice"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BillingPage;
