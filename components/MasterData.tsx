"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  Pencil,
  Upload,
  ArrowUpDown,
  Globe,
  Ship,
  Clock,
  DollarSign,
  Thermometer,
} from "lucide-react";
import Link from "next/link";
import EditModal from "@/components/EditModal";
import AddEntryModal from "@/components/AddEntryModal";
import BulkImportModal from "@/components/BulkImportModal";
import Pagination from "@/components/Pagination";

type MasterDataType =
  | "ports"
  | "incoterms"
  | "status-codes"
  | "currencies"
  | "temp-presets";

interface MasterDataEntry {
  id: number;
  [key: string]: any;
}

interface MasterDataProps {
  type: MasterDataType;
}

const PAGE_SIZE = 10;

const MasterData: React.FC<MasterDataProps> = ({ type }) => {
  const [data, setData] = useState<MasterDataEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const configMap = {
    ports: {
      title: "Ports & Airports",
      subtitle: "UN/LOCODE Database",
      icon: <Globe className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50",
      columns: [
        { key: "code", label: "Code" },
        { key: "city", label: "City" },
        { key: "country", label: "Country" },
      ],
    },
    incoterms: {
      title: "Incoterms",
      subtitle: "Incoterms 2020 Rules",
      icon: <Ship className="w-6 h-6 text-green-600" />,
      bg: "bg-green-50",
      columns: [
        { key: "code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
      ],
    },
    "status-codes": {
      title: "Status Codes",
      subtitle: "Shipment Tracking Milestones",
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      bg: "bg-orange-50",
      columns: [
        { key: "code", label: "Code" },
        { key: "description", label: "Description" },
        { key: "stage", label: "Stage" },
      ],
    },
    currencies: {
      title: "Currencies",
      subtitle: "Supported Exchange Rates",
      icon: <DollarSign className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50",
      columns: [
        { key: "currencyCode", label: "Currency Code" },
        { key: "name", label: "Name" },
        { key: "exchangeRate", label: "Exch. Rate (to INR)" },
      ],
    },
    "temp-presets": {
      title: "Temperature Presets",
      subtitle: "Cold Chain Configuration",
      icon: <Thermometer className="w-6 h-6 text-cyan-600" />,
      bg: "bg-cyan-50",
      columns: [
        { key: "name", label: "Preset Name" },
        { key: "range", label: "Range" },
        { key: "tolerance", label: "Tolerance" },
      ],
    },
  };

  const config = configMap[type];

  // 🔹 helper: parse numeric fields
  const normalizeForType = (record: any) => {
    const copy: any = { ...record };

    if (type === "currencies" && copy.exchangeRate !== undefined) {
      const num = parseFloat(copy.exchangeRate);
      copy.exchangeRate = isNaN(num) ? null : num;
    }

    return copy;
  };

  // 🔹 load data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/master-data/${type}`);
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
        setPage(1);
      } catch (err) {
        console.error(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type]);

  // 🔹 delete
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this entry?")) return;

    await fetch(`/api/master-data/${type}/${id}`, {
      method: "DELETE",
    });

    setData((prev) => prev.filter((item) => item.id !== id));
  };

  // 🔹 open edit
  const openEdit = (item: any) => {
    setEditItem(item);
    setEditOpen(true);
  };

  // 🔹 save edit
  const handleSaveEdit = async (updated: any) => {
    const payload = normalizeForType(updated);

    const res = await fetch(`/api/master-data/${type}/${editItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    setData((prev) => prev.map((i) => (i.id === json.id ? json : i)));
    setEditOpen(false);
  };

  // 🔹 save add
  const handleSaveAdd = async (values: any) => {
    const payload = normalizeForType(values);

    const res = await fetch(`/api/master-data/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setData((prev) => [...prev, json]);
    setAddOpen(false);
  };

  // 🔹 bulk save
  const handleBulkSave = async (rows: any[]) => {
    const normalized = rows.map(normalizeForType);

    const res = await fetch(`/api/master-data/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });

    const json = await res.json();
    const toAdd = Array.isArray(json) ? json : [];
    setData((prev) => [...prev, ...toAdd]);
    setBulkOpen(false);
  };

  // 🔹 search + sort + pagination
  const processed = useMemo(() => {
    const base = Array.isArray(data) ? data : [];

    // Search filter
    const filtered = base.filter((item) =>
      Object.values(item).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );

    // Sorting
    let sorted = filtered;
    if (sortKey) {
      sorted = [...filtered].sort((a, b) => {
        const va = a[sortKey!];
        const vb = b[sortKey!];

        if (va == null && vb == null) return 0;
        if (va == null) return sortDir === "asc" ? -1 : 1;
        if (vb == null) return sortDir === "asc" ? 1 : -1;

        if (typeof va === "number" && typeof vb === "number") {
          return sortDir === "asc" ? va - vb : vb - va;
        }

        return sortDir === "asc"
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const paginated = sorted.slice(start, start + PAGE_SIZE);

    return { filtered: sorted, paginated, total, currentPage };
  }, [data, searchTerm, sortKey, sortDir, page]);

  // Keep page in sync when data length changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(processed.total / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [processed.total, page]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <>
      {/* Modals */}
      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        fields={config.columns}
        values={editItem || {}}
        onSave={handleSaveEdit}
      />
      <AddEntryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fields={config.columns}
        onSave={handleSaveAdd}
      />
      <BulkImportModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        fields={config.columns}
        onBulkSave={handleBulkSave}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/settings"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Settings
            </Link>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${config.bg}`}>{config.icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {config.title}
                </h1>
                <p className="text-gray-500 text-sm">{config.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBulkOpen(true)}
              className="inline-flex items-center px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Import
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Table card */}
        <Card noPadding className="border border-gray-200 overflow-hidden">
          {/* Top bar */}
          <div className="p-4 border-b border-gray-200 bg-white flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {loading && (
              <span className="text-xs text-gray-400 animate-pulse">
                Loading…
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                <tr>
                  {config.columns.map((col) => {
                    const active = sortKey === col.key;
                    return (
                      <th
                        key={col.key}
                        className="px-6 py-3 cursor-pointer select-none"
                        onClick={() => toggleSort(col.key)}
                      >
                        <div className="inline-flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown
                            className={`w-3 h-3 ${
                              active ? "text-blue-600" : "text-gray-400"
                            }`}
                          />
                          {active && (
                            <span className="text-[10px] text-blue-600">
                              {sortDir === "asc" ? "ASC" : "DESC"}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {processed.paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {config.columns.map((col, idx) => (
                      <td
                        key={col.key}
                        className={`px-6 py-3 ${
                          idx === 0
                            ? "font-medium text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {item[col.key] ?? "-"}
                      </td>
                    ))}
                    <td className="px-6 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center justify-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {!processed.paginated.length && !loading && (
                  <tr>
                    <td
                      colSpan={config.columns.length + 1}
                      className="px-6 py-6 text-center text-sm text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={processed.currentPage}
            pageSize={PAGE_SIZE}
            total={processed.total}
            onPageChange={setPage}
          />
        </Card>
      </div>
    </>
  );
};

export default MasterData;
