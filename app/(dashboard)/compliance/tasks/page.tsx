// app/(dashboard)/compliance/tasks/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, CheckCircle, XCircle, Calendar, User } from "lucide-react";
import Link from "next/link";

type Task = {
  id: string;
  type: "KYC_REVIEW" | "SANCTIONS_CHECK" | "DOC_VALIDATION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "APPROVED" | "REJECTED";
  entityType: string;
  entityId: string;
  entityName: string;
  entityRef: string | null;
  description: string;
  dueDate: string | null;
  assignedTo: string | null;
};

type CustomerMini = {
  id: string;
  customerCode: string;
  companyName: string;
  status: string;
  kycStatus: boolean;
  sanctionsCheck: boolean;
  updatedAt: string;
};

type DocumentMini = {
  id: string;
  name: string;
  type: string;
  status: string;
  uploadedAt: string;
  expiryDate: string;
  shipmentRef: string;
  customerName: string;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseDateOnly(s: string) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map((v) => Number(v));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

const ComplianceTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customers, setCustomers] = useState<CustomerMini[]>([]);
  const [documents, setDocuments] = useState<DocumentMini[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [taskData, custs, docs] = await Promise.all([
        fetch("/api/compliance/tasks?status=PENDING", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/customers?take=2000", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/documents", { cache: "no-store" }).then((r) => r.json()),
      ]);

      setTasks(Array.isArray(taskData) ? taskData : []);
      setCustomers(Array.isArray(custs) ? custs : []);
      setDocuments(Array.isArray(docs) ? docs : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (!confirm(`Are you sure you want to ${action} this task?`)) return;

    const note = prompt("Optional note for audit log (press OK to skip):") || "";

    const res = await fetch(`/api/compliance/tasks/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }

    await load();
  };

  const getPriorityColor = (p: string) => {
    if (p === "HIGH") return "text-red-600 bg-red-50 border-red-200";
    if (p === "MEDIUM") return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const customerByCode = useMemo(() => {
    const m = new Map<string, CustomerMini>();
    customers.forEach((c) => m.set(c.customerCode, c));
    return m;
  }, [customers]);

  const customerById = useMemo(() => {
    const m = new Map<string, CustomerMini>();
    customers.forEach((c) => m.set(c.id, c));
    return m;
  }, [customers]);

  const documentById = useMemo(() => {
    const m = new Map<string, DocumentMini>();
    documents.forEach((d) => m.set(d.id, d));
    return m;
  }, [documents]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const expiringCutoff = useMemo(() => {
    const x = new Date(today);
    x.setDate(x.getDate() + 30);
    return x;
  }, [today]);

  // ✅ Status should be shown INSIDE existing badge only (no extra UI blocks)
  const getTypeMeta = (task: Task) => {
    // customer match: prefer entityRef as customerCode; fallback by entityId
    const code = (task.entityRef || "").trim();
    const customer =
      (code ? customerByCode.get(code) : undefined) || customerById.get(task.entityId);

    if (task.type === "KYC_REVIEW") {
      if (!customer) {
        return { label: "KYC Review", cls: "bg-gray-100 text-gray-700 border-gray-200" };
      }
      const done = Boolean(customer.kycStatus);
      return {
        label: `KYC Review • ${done ? "COMPLETED" : "PENDING"}`,
        cls: done
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    if (task.type === "SANCTIONS_CHECK") {
      if (!customer) {
        return { label: "Sanctions Check", cls: "bg-gray-100 text-gray-700 border-gray-200" };
      }
      const done = Boolean(customer.sanctionsCheck);
      return {
        label: `Sanctions • ${done ? "CLEARED" : "PENDING"}`,
        cls: done
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    // DOC_VALIDATION
    const doc =
      documentById.get(task.entityId) ||
      (task.entityRef ? documentById.get(task.entityRef) : undefined);

    if (!doc) {
      return { label: "Doc Review", cls: "bg-gray-100 text-gray-700 border-gray-200" };
    }

    const docStatus = String(doc.status || "UNKNOWN").toUpperCase();
    const exp = parseDateOnly(doc.expiryDate);
    const expired = exp ? exp < today : false;
    const expSoon = exp ? exp >= today && exp <= expiringCutoff : false;

    if (docStatus === "MISSING") {
      return { label: "Doc Review • MISSING", cls: "bg-red-50 text-red-700 border-red-200" };
    }
    if (docStatus === "REJECTED") {
      return { label: "Doc Review • REJECTED", cls: "bg-red-50 text-red-700 border-red-200" };
    }
    if (expired) {
      return { label: "Doc Review • EXPIRED", cls: "bg-red-50 text-red-700 border-red-200" };
    }
    if (expSoon) {
      return { label: "Doc Review • EXPIRING", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (docStatus === "PENDING") {
      return { label: "Doc Review • PENDING", cls: "bg-amber-50 text-amber-700 border-amber-200" };
    }

    return { label: `Doc Review • ${docStatus}`, cls: "bg-green-50 text-green-700 border-green-200" };
  };

  const getDocMetaLine = (task: Task) => {
    if (task.type !== "DOC_VALIDATION") return null;
    const doc =
      documentById.get(task.entityId) ||
      (task.entityRef ? documentById.get(task.entityRef) : undefined);
    if (!doc) return null;

    const exp = parseDateOnly(doc.expiryDate);
    const expired = exp ? exp < today : false;
    const expSoon = exp ? exp >= today && exp <= expiringCutoff : false;

    const expiryText = doc.expiryDate
      ? expired
        ? `Expiry: ${doc.expiryDate} (EXPIRED)`
        : expSoon
        ? `Expiry: ${doc.expiryDate} (≤30d)`
        : `Expiry: ${doc.expiryDate}`
      : "Expiry: N/A";

    return (
      <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-600">Doc:</span>
          <span className="text-gray-500">{doc.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-600">{expiryText}</span>
        </div>
        {doc.shipmentRef ? (
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-600">Shipment:</span>
            <span className="text-gray-500">{doc.shipmentRef}</span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/compliance" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Overview
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Pending Reviews</h1>
          <p className="text-gray-500 mt-1">Manage KYC, Sanctions, and Document approval tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading && <Card className="p-6 text-gray-500">Loading…</Card>}

        {!loading && tasks.length === 0 && (
          <Card className="p-8 text-center text-gray-500">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
            <p>No pending compliance tasks requiring your attention.</p>
          </Card>
        )}

        {!loading &&
          tasks.map((task) => {
            const typeMeta = getTypeMeta(task);

            return (
              <Card
                key={task.id}
                className={`border-l-4 ${
                  task.status === "PENDING"
                    ? "border-l-blue-500"
                    : task.status === "APPROVED"
                    ? "border-l-green-500"
                    : "border-l-red-500"
                } transition-all`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority} Priority
                      </span>

                      <span className="text-xs font-mono text-gray-400">ID: {task.id}</span>

                      {/* ✅ Type badge now includes LIVE status (no extra block) */}
                      <span className={`text-xs font-mono px-2 py-0.5 rounded border ${typeMeta.cls}`}>
                        {typeMeta.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {task.entityName}
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({task.entityRef || task.entityId})
                      </span>
                    </h3>

                    <p className="text-gray-600 mb-2">{task.description}</p>

                    <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {task.dueDate}</span>
                        </div>
                      )}
                      {task.assignedTo && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          <span>Assigned: {task.assignedTo}</span>
                        </div>
                      )}
                    </div>

                    {/* ✅ For DOC tasks, show doc name + expiry in the same existing section (not a separate badge block) */}
                    {getDocMetaLine(task)}
                  </div>

                  {task.status === "PENDING" ? (
                    <div className="flex flex-row md:flex-col gap-3">
                      <button
                        onClick={() => handleAction(task.id, "APPROVE")}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(task.id, "REJECT")}
                        className="flex items-center px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`px-4 py-2 rounded-lg font-bold text-sm border flex items-center gap-2 ${
                        task.status === "APPROVED"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}
                    >
                      {task.status === "APPROVED" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {task.status}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};

export default ComplianceTasks;
