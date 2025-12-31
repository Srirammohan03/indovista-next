"use client";

import * as React from "react";
import {  Area,  AreaChart,  CartesianGrid,  Cell,  Legend,  Pie,  PieChart,  ResponsiveContainer,  Tooltip,  XAxis,  YAxis,} from "recharts";
import {  Calendar as CalendarIcon,  RefreshCw,  Ship,  Plane,  Truck,  Layers,  Wallet,  ClipboardList,  AlertTriangle,  CheckCircle2,  Clock3,  FileText,  Users,  Search,} from "lucide-react";

import { format, addDays, startOfDay } from "date-fns";
//import { DateRangePicker as RDateRangePicker, RangeKeyDict } from "react-date-range";
import { DateRange as RDRDateRange, RangeKeyDict } from "react-date-range";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {  Table,  TableBody,  TableCell,  TableHead,  TableHeader,  TableRow,} from "@/components/ui/table";

// -----------------------------
// Types + demo data (swap with your API)
// -----------------------------

type Mode = "AIR" | "SEA" | "ROAD";
type SLAStatus = "ON_TIME" | "AT_RISK" | "BREACHED";
type ShipmentStatus = "BOOKED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";

type Shipment = {
  ref: string;
  customer: string;
  mode: Mode;
  status: ShipmentStatus;
  slaStatus: SLAStatus;
  amount: number;
  docsCount: number;
  createdAt: string; // ISO date
};

const SLA_COLORS: Record<string, string> = {
  "On-time": "#10b981",
  "At-risk": "#f59e0b",
  "Breached": "#f43f5e",
};

// const DEMO_SHIPMENTS: Shipment[] = [
//   { ref: "IMP-MX-001", customer: "Developer Team", mode: "SEA", status: "DELIVERED", slaStatus: "ON_TIME", amount: 50, docsCount: 1, createdAt: "2025-12-04" },
//   { ref: "EXP-OT-001", customer: "Outright creators", mode: "ROAD", status: "BOOKED", slaStatus: "ON_TIME", amount: 2376, docsCount: 1, createdAt: "2025-12-06" },
//   { ref: "EXP-FZ-004", customer: "Outright creators", mode: "AIR", status: "PICKED_UP", slaStatus: "ON_TIME", amount: 354000, docsCount: 1, createdAt: "2025-12-08" },
//   { ref: "EXP-FZ-002", customer: "FouziNex", mode: "SEA", status: "BOOKED", slaStatus: "ON_TIME", amount: 0, docsCount: 0, createdAt: "2025-12-10" },
//   { ref: "EXP-FZ-003", customer: "Outright creators", mode: "SEA", status: "BOOKED", slaStatus: "ON_TIME", amount: 0, docsCount: 0, createdAt: "2025-12-12" },
//   { ref: "IMP-SP-002", customer: "FouziNex", mode: "ROAD", status: "BOOKED", slaStatus: "AT_RISK", amount: 400000, docsCount: 1, createdAt: "2025-12-14" },
//   { ref: "IMP-FZ-001", customer: "FouziNex", mode: "AIR", status: "BOOKED", slaStatus: "ON_TIME", amount: 999999, docsCount: 1, createdAt: "2025-12-18" },
//   { ref: "IMP-SP-001", customer: "Outright creators", mode: "ROAD", status: "PICKED_UP", slaStatus: "ON_TIME", amount: 150, docsCount: 1, createdAt: "2025-12-20" },
//   { ref: "EXP-IN-008", customer: "FouziNex", mode: "SEA", status: "IN_TRANSIT", slaStatus: "ON_TIME", amount: 0, docsCount: 1, createdAt: "2025-12-28" },
// ];

// -----------------------------
// Helpers
// -----------------------------

function parseISODate(iso: string) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function inRange(date: Date, from: Date, to: Date) {
  const t = date.getTime();
  return t >= from.getTime() && t <= to.getTime();
}

function fmtINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);
}

// -----------------------------
// Date Range Picker (pill + dropdown like your screenshot)
// -----------------------------

type DateRange = { from: Date; to: Date };

type Preset = { label: string; range: () => DateRange };

function makePresets(): Preset[] {
  const now = startOfDay(new Date());
  return [
    { label: "Today", range: () => ({ from: now, to: now }) },
    { label: "Yesterday", range: () => ({ from: addDays(now, -1), to: addDays(now, -1) }) },
    { label: "Last 7 days", range: () => ({ from: addDays(now, -6), to: now }) },
    { label: "Last 30 days", range: () => ({ from: addDays(now, -29), to: now }) },
    { label: "Last 90 days", range: () => ({ from: addDays(now, -89), to: now }) },
    { label: "Last 365 days", range: () => ({ from: addDays(now, -364), to: now }) },
  ];
}

function formatRangeLabel(from: Date, to: Date) {
  const same = from.toDateString() === to.toDateString();
  return same ? format(from, "MMM dd, yyyy") : `${format(from, "MMM dd, yyyy")} — ${format(to, "MMM dd, yyyy")}`;
}

function DateRangePill({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange>(value);

  React.useEffect(() => {
    setDraft(value);
  }, [value.from.getTime(), value.to.getTime()]);

  const presets = React.useMemo(() => makePresets(), []);

  const selection = React.useMemo(
    () => ({
      startDate: draft.from,
      endDate: draft.to,
      key: "selection",
    }),
    [draft.from, draft.to]
  );

  function apply() {
    const f = startOfDay(draft.from);
    const t = startOfDay(draft.to);
    onChange(f.getTime() <= t.getTime() ? { from: f, to: t } : { from: t, to: f });
    setOpen(false);
  }

  function cancel() {
    setDraft(value);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 justify-start rounded-full px-3 text-left font-normal",
            "bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60",
            "shadow-sm hover:bg-white"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="truncate">{formatRangeLabel(value.from, value.to)}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        collisionPadding={12}
        className={cn(
          // ✅ viewport-safe width so right side never gets cut
          "p-0",
          "w-[min(980px,calc(100vw-1.5rem))]",
          // ✅ height-safe so content scrolls, header stays visible
          "max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        )}
      >
        {/* ✅ Sticky header (Apply/Cancel always visible) */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">Select range</div>
              <div className="text-xs text-slate-500">Pick start + end dates</div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" className="rounded-full" onClick={cancel}>
                Cancel
              </Button>
              <Button className="rounded-full" onClick={apply}>
                Apply
              </Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800">
              {format(draft.from, "MMMM dd, yyyy")}
            </div>
            <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800">
              {format(draft.to, "MMMM dd, yyyy")}
            </div>
          </div>
        </div>

        {/* Body scroll */}
        <div className="overflow-y-auto">
          {/* ✅ Desktop (lg+): presets left + 2 months */}
          <div className="hidden lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="border-r border-slate-200 bg-white">
              <div className="p-4">
                <div className="text-sm font-semibold text-slate-900">Quick ranges</div>
                <div className="text-xs text-slate-500">One click selection</div>
              </div>

              <div className="max-h-[420px] overflow-auto px-2 pb-3">
                {presets.map((p) => {
                  const r = p.range();
                  const active =
                    draft.from.getTime() === r.from.getTime() &&
                    draft.to.getTime() === r.to.getTime();

                  return (
                    <Button
                      key={p.label}
                      variant="ghost"
                      className={cn(
                        "mb-1 w-full justify-start rounded-xl",
                        active ? "bg-slate-100 hover:bg-slate-100" : "hover:bg-slate-50"
                      )}
                      onClick={() => setDraft(r)}
                    >
                      {p.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="min-w-0 bg-white p-4">
              {/* ✅ calendar never clips; it scrolls horizontally if needed */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
                <div
                  className={cn(
                    "w-max min-w-full",
                    "[&_.rdrCalendarWrapper]:w-max [&_.rdrDateRangeWrapper]:w-max",
                    "[&_.rdrMonthsHorizontal]:gap-6",
                    "[&_.rdrMonthAndYearWrapper]:px-2 [&_.rdrWeekDays]:px-2 [&_.rdrDays]:px-2"
                  )}
                >
                  <RDRDateRange
                    ranges={[selection]}
                    months={2}
                    direction="horizontal"
                    moveRangeOnFirstSelection={false}
                    showDateDisplay={false}
                    rangeColors={["#2563eb"]}
                    onChange={(ranges: RangeKeyDict) => {
                      const r = ranges.selection;
                      const start = r?.startDate ? startOfDay(r.startDate) : draft.from;
                      const end = r?.endDate ? startOfDay(r.endDate) : draft.to;
                      setDraft({ from: start, to: end });
                    }}
                  />
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                Tip: Use Quick ranges on the left, or pick start + end dates.
              </div>
            </div>
          </div>

          {/* ✅ Mobile/tablet (<lg): chips + 1 month */}
          <div className="lg:hidden bg-white p-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {presets.map((p) => {
                const r = p.range();
                const active =
                  draft.from.getTime() === r.from.getTime() &&
                  draft.to.getTime() === r.to.getTime();

                return (
                  <Button
                    key={p.label}
                    variant={active ? "default" : "outline"}
                    className="h-9 shrink-0 rounded-full px-3"
                    onClick={() => setDraft(r)}
                  >
                    {p.label}
                  </Button>
                );
              })}
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2">
              <div
                className={cn(
                  "w-max min-w-full",
                  "[&_.rdrCalendarWrapper]:w-max [&_.rdrDateRangeWrapper]:w-max",
                  "[&_.rdrMonthAndYearWrapper]:px-2 [&_.rdrWeekDays]:px-2 [&_.rdrDays]:px-2"
                )}
              >
                <RDRDateRange
                  ranges={[selection]}
                  months={1}
                  direction="horizontal"
                  moveRangeOnFirstSelection={false}
                  showDateDisplay={false}
                  rangeColors={["#2563eb"]}
                  onChange={(ranges: RangeKeyDict) => {
                    const r = ranges.selection;
                    const start = r?.startDate ? startOfDay(r.startDate) : draft.from;
                    const end = r?.endDate ? startOfDay(r.endDate) : draft.to;
                    setDraft({ from: start, to: end });
                  }}
                />
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-500">Tip: Tap start date, then end date.</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


// -----------------------------
// Small UI helpers
// -----------------------------

function ModePill({
  mode,
  active,
  onClick,
}: {
  mode: "ALL" | Mode;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = mode === "ALL" ? Layers : mode === "AIR" ? Plane : mode === "SEA" ? Ship : Truck;

  return (
    <Button
      onClick={onClick}
      variant={active ? "default" : "outline"}
      className={cn("h-10 rounded-full px-4", active ? "shadow-sm" : "bg-white/70 hover:bg-white")}
    >
      <Icon className="mr-2 h-4 w-4" />
      {mode === "ALL" ? "All" : mode[0] + mode.slice(1).toLowerCase()}
    </Button>
  );
}

function StatusBadge({ value }: { value: ShipmentStatus }) {
  const styles: Record<ShipmentStatus, string> = {
    BOOKED: "bg-sky-50 text-sky-700 border-sky-200",
    PICKED_UP: "bg-indigo-50 text-indigo-700 border-indigo-200",
    IN_TRANSIT: "bg-amber-50 text-amber-700 border-amber-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return <Badge className={cn("rounded-full px-3 py-1 border", styles[value])}>{value}</Badge>;
}

function SLABadge({ value }: { value: SLAStatus }) {
  const styles: Record<SLAStatus, string> = {
    ON_TIME: "bg-emerald-50 text-emerald-700 border-emerald-200",
    AT_RISK: "bg-amber-50 text-amber-700 border-amber-200",
    BREACHED: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <Badge className={cn("rounded-full px-3 py-1 border", styles[value])}>{value}</Badge>;
}

// -----------------------------
// Main Page
// -----------------------------

export default function OperationsDashboardClean() {
  // default to Dec 2025 for demo
  const [range, setRange] = React.useState<DateRange>({
    from: new Date(2025, 11, 1),
    to: new Date(2025, 11, 31),
  });

  const [mode, setMode] = React.useState<"ALL" | Mode>("ALL");
  const [query, setQuery] = React.useState<string>("");

  //const shipmentsAll = React.useMemo<Shipment[]>(() => DEMO_SHIPMENTS, []);
  const [shipmentsAll, setShipmentsAll] = React.useState<Shipment[]>([]);
const [loading, setLoading] = React.useState(true);

React.useEffect(() => {
  async function loadShipments() {
    try {
      const res = await fetch("/api/shipments", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch shipments");

      const data = await res.json();

      // 🔁 map backend → existing UI shape (UI remains untouched)
      const mapped: Shipment[] = data.map((s: any) => ({
        ref: s.reference,
        customer: s.customerName,
        mode: s.mode,
        status: s.status,
        slaStatus: s.slaStatus,
        amount: Number(s.amount || 0),
        docsCount: s.documentsCount ?? (s.documents?.length ?? 0) ?? 0,
        createdAt: s.createdAt?.slice(0, 10),
      }));

      setShipmentsAll(mapped);
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  }

  loadShipments();
}, []);


  const shipments = React.useMemo<Shipment[]>(() => {
    const from = startOfDay(range.from);
    const to = startOfDay(range.to);

    return shipmentsAll
      .filter((s) => inRange(parseISODate(s.createdAt), from, to))
      .filter((s) => (mode === "ALL" ? true : s.mode === mode))
      .filter((s) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          s.ref.toLowerCase().includes(q) ||
          s.customer.toLowerCase().includes(q) ||
          s.mode.toLowerCase().includes(q)
        );
      });
  }, [range.from, range.to, mode, query, shipmentsAll]);

  const totals = React.useMemo(() => {
    const totalValue = shipments.reduce((sum, s) => sum + (s.amount || 0), 0);
    const delivered = shipments.filter((s) => s.status === "DELIVERED").length;
    const active = Math.max(shipments.length - delivered, 0);

    const onTime = shipments.filter((s) => s.slaStatus === "ON_TIME").length;
    const atRisk = shipments.filter((s) => s.slaStatus === "AT_RISK").length;
    const breached = shipments.filter((s) => s.slaStatus === "BREACHED").length;
    const slaPct = shipments.length ? Math.round((onTime / shipments.length) * 100) : 0;

    const docsOk = shipments.filter((s) => s.docsCount > 0).length;
    const docsPct = shipments.length ? Math.round((docsOk / shipments.length) * 100) : 0;
    const missingDocs = shipments.filter((s) => s.docsCount === 0).length;

    const opsHealth = Math.round(slaPct * 0.65 + docsPct * 0.35);

    return {
      totalValue,
      delivered,
      active,
      onTime,
      atRisk,
      breached,
      slaPct,
      docsPct,
      missingDocs,
      opsHealth,
    };
  }, [shipments]);

  const monthlyRevenue = React.useMemo(() => {
    const from = startOfDay(range.from);
    const to = startOfDay(range.to);

    const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
    const end = new Date(to.getFullYear(), to.getMonth(), 1);

    const months: string[] = [];
    while (cursor.getTime() <= end.getTime()) {
      months.push(monthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const agg: Record<string, { month: string; AIR: number; SEA: number; ROAD: number }> = {};
    for (const k of months) agg[k] = { month: monthLabel(k), AIR: 0, SEA: 0, ROAD: 0 };

    shipmentsAll
      .filter((s) => inRange(parseISODate(s.createdAt), from, to))
      .forEach((s) => {
        const k = monthKey(parseISODate(s.createdAt));
        if (!agg[k]) agg[k] = { month: monthLabel(k), AIR: 0, SEA: 0, ROAD: 0 };
        agg[k][s.mode] += s.amount || 0;
      });

    const rows = months.map((k) => agg[k]);

    if (mode !== "ALL") {
      return rows.map((r) => ({
        ...r,
        AIR: mode === "AIR" ? r.AIR : 0,
        SEA: mode === "SEA" ? r.SEA : 0,
        ROAD: mode === "ROAD" ? r.ROAD : 0,
      }));
    }

    return rows;
  }, [range.from, range.to, mode, shipmentsAll]);

  const slaDonut = React.useMemo(() => {
    const data = [
      { name: "On-time", value: totals.onTime },
      { name: "At-risk", value: totals.atRisk },
      { name: "Breached", value: totals.breached },
    ];
    return data.filter((x) => x.value > 0);
  }, [totals.onTime, totals.atRisk, totals.breached]);

  const customersCount = React.useMemo(() => {
    const set = new Set<string>(shipments.map((s) => s.customer));
    return set.size;
  }, [shipments]);

  const shipmentsCount = shipments.length;

  const headerRangeText = formatRangeLabel(range.from, range.to);
if (loading) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span className="text-sm text-slate-500">Loading dashboard…</span>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Operations Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Clean real-time view — shipments, docs health, SLA, and alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="rounded-full bg-white/70 shadow-sm hover:bg-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white">
              {shipmentsCount} shipments
            </Badge>
            <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white">
              {customersCount} customers
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mt-6 border-slate-200/70 bg-white/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div className="relative w-full sm:max-w-[360px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search shipment ref / customer…"
                    className="h-10 rounded-full pl-9"
                  />
                </div>

                {/* Date pill */}
                <DateRangePill value={range} onChange={setRange} />
              </div>

              {/* Mode pills */}
              <div className="flex flex-wrap items-center gap-2">
                <ModePill mode="ALL" active={mode === "ALL"} onClick={() => setMode("ALL")} />
                <ModePill mode="AIR" active={mode === "AIR"} onClick={() => setMode("AIR")} />
                <ModePill mode="SEA" active={mode === "SEA"} onClick={() => setMode("SEA")} />
                <ModePill mode="ROAD" active={mode === "ROAD"} onClick={() => setMode("ROAD")} />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                  Range
                </Badge>
                <span className="font-medium text-slate-700">{headerRangeText}</span>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                  Currency
                </Badge>
                <span className="font-medium text-slate-700">INR</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Value"
            value={fmtINR(totals.totalValue)}
            subtitle={`Across ${shipmentsCount} shipment(s)`}
            icon={<Wallet className="h-5 w-5" />}
            iconClass="bg-gradient-to-br from-sky-500 to-blue-600"
          />
          <KpiCard
            title="Active Shipments"
            value={String(totals.active)}
            subtitle={`Delivered: ${totals.delivered}`}
            icon={<Ship className="h-5 w-5" />}
            iconClass="bg-gradient-to-br from-emerald-500 to-green-600"
          />
          <KpiCard
            title="SLA On-time"
            value={`${totals.slaPct}%`}
            subtitle={`${totals.onTime} on-time · ${totals.atRisk} at-risk · ${totals.breached} breached`}
            icon={<Clock3 className="h-5 w-5" />}
            iconClass="bg-gradient-to-br from-orange-500 to-amber-500"
          />
          <KpiCard
            title="Docs Completion"
            value={`${totals.docsPct}%`}
            subtitle={`Missing docs (by shipment): ${totals.missingDocs}`}
            icon={<FileText className="h-5 w-5" />}
            iconClass="bg-gradient-to-br from-yellow-400 to-orange-500"
          />
        </div>

        {/* Ops health + Revenue chart */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-5 overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-emerald-500 to-yellow-400 text-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Ops Health</CardTitle>
                  <div className="mt-2 text-4xl font-semibold">{totals.opsHealth}%</div>
                  <div className="mt-1 text-sm/5 text-white/90">
                    Blended score: SLA + Docs (in selected range)
                  </div>
                </div>

                <Badge className="rounded-full bg-white/15 px-3 py-1 text-white">
                  {mode === "ALL" ? "All modes" : mode}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-3">
              <div className="grid grid-cols-3 gap-3">
                <MiniStat label="Shipments" value={shipmentsCount} />
                <MiniStat label="On-time" value={totals.onTime} />
                <MiniStat label="Missing Docs" value={totals.missingDocs} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="rounded-full bg-white/15 px-3 py-1 text-white">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  On-time: {totals.onTime}
                </Badge>
                <Badge className="rounded-full bg-white/15 px-3 py-1 text-white">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                  At-risk: {totals.atRisk}
                </Badge>
                <Badge className="rounded-full bg-white/15 px-3 py-1 text-white">
                  <ClipboardList className="mr-1 h-3.5 w-3.5" />
                  Missing docs: {totals.missingDocs}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-7 border-slate-200/70 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Revenue by Mode</CardTitle>
                  <div className="mt-1 text-sm text-slate-500">Monthly totals in selected range</div>
                </div>
                <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                  INR
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gAir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gRoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    tickFormatter={(v: number) => (v >= 100000 ? `${Math.round(v / 1000)}k` : String(v))}
                  />
                  <Tooltip
                    formatter={(v: number | string) => fmtINR(Number(v))}
                    contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb" }}
                  />
                  <Legend />

                  <Area type="monotone" dataKey="AIR" name="Air" stroke="#3b82f6" fill="url(#gAir)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Area type="monotone" dataKey="SEA" name="Sea" stroke="#10b981" fill="url(#gSea)" strokeWidth={2} dot={false} isAnimationActive={false} />
                  <Area type="monotone" dataKey="ROAD" name="Road" stroke="#f59e0b" fill="url(#gRoad)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* SLA donut + Alerts */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-5 border-slate-200/70 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">SLA Health</CardTitle>
                  <div className="mt-1 text-sm text-slate-500">On-time % in current selection</div>
                </div>
                <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                  <Users className="mr-1 h-3.5 w-3.5" />
                  {customersCount}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={slaDonut.length ? slaDonut : [{ name: "On-time", value: 1 }]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={84}
                        paddingAngle={2}
                        isAnimationActive={false}
                      >
                        {(slaDonut.length ? slaDonut : [{ name: "On-time", value: 1 }]).map((entry, i) => (
                          <Cell key={`${entry.name}-${i}`} fill={SLA_COLORS[entry.name] ?? "#64748b"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="-mt-[140px] flex flex-col items-center justify-center text-center">
                    <div className="text-3xl font-semibold text-slate-900">{totals.slaPct}%</div>
                    <div className="text-xs text-slate-500">SLA On-time</div>
                    <div className="mt-1 text-xs text-slate-500">
                      {totals.onTime} / {shipmentsCount || 0}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <LegendRow dot="bg-emerald-500" label="On-time" value={totals.onTime} />
                  <LegendRow dot="bg-amber-500" label="At-risk" value={totals.atRisk} />
                  <LegendRow dot="bg-rose-500" label="Breached" value={totals.breached} />

                  <div className="pt-3 text-xs text-slate-500">
                    Uses shipment SLAStatus (ON_TIME / AT_RISK / BREACHED).
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-7 border-slate-200/70 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Alerts</CardTitle>
              <div className="text-sm text-slate-500">Items needing attention</div>
            </CardHeader>

            <CardContent className="space-y-3">
              <AlertRow tone="danger" title={`${totals.breached} SLA breached`} subtitle="slaStatus = BREACHED" />
              <AlertRow tone="warn" title={`${totals.atRisk} At-risk`} subtitle="slaStatus = AT_RISK" />
              <AlertRow tone="info" title={`${totals.missingDocs} Missing docs`} subtitle="Shipments with zero documents" />
            </CardContent>
          </Card>
        </div>

        {/* Recent Shipments */}
        <Card className="mt-6 border-slate-200/70 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Recent Shipments</CardTitle>
                <div className="text-sm text-slate-500">Filtered by date + mode + search</div>
              </div>
              <div className="text-sm font-medium text-slate-700">{headerRangeText}</div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Ref</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="w-[90px]">Mode</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                    <TableHead className="w-[140px] text-right">Amount</TableHead>
                    <TableHead className="w-[140px]">SLA</TableHead>
                    <TableHead className="w-[110px] text-right">Docs</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {shipments.map((s) => (
                    <TableRow key={s.ref} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{s.ref}</TableCell>
                      <TableCell>{s.customer}</TableCell>
                      <TableCell>
                        <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                          {s.mode}
                        </Badge>
                      </TableCell>
                      <TableCell><StatusBadge value={s.status} /></TableCell>
                      <TableCell className="text-right font-medium">{fmtINR(s.amount)}</TableCell>
                      <TableCell><SLABadge value={s.slaStatus} /></TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-1 border",
                            s.docsCount > 0
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-sky-50 text-sky-700 border-sky-200"
                          )}
                        >
                          {s.docsCount > 0 ? `${s.docsCount} ok` : "missing"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                  {!shipments.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                        No shipments match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
              {shipments.map((s) => (
                <Card key={s.ref} className="border-slate-200/70 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{s.ref}</div>
                        <div className="mt-1 text-xs text-slate-500">{s.customer}</div>
                      </div>
                      <Badge className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                        {s.mode}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-500">Status</div>
                        <StatusBadge value={s.status} />
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-[11px] text-slate-500">Amount</div>
                        <div className="text-sm font-semibold">{fmtINR(s.amount)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-500">SLA</div>
                        <SLABadge value={s.slaStatus} />
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-[11px] text-slate-500">Docs</div>
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-1 border",
                            s.docsCount > 0
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-sky-50 text-sky-700 border-sky-200"
                          )}
                        >
                          {s.docsCount > 0 ? `${s.docsCount} ok` : "missing"}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-slate-500">Created: {s.createdAt}</div>
                  </CardContent>
                </Card>
              ))}

              {!shipments.length && (
                <div className="py-10 text-center text-sm text-slate-500">
                  No shipments match the selected filters.
                </div>
              )}
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Tip: Use search + mode pills + date range to slice the data quickly.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// -----------------------------
// Small components
// -----------------------------

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <Card className="h-full border-slate-200/70 bg-white shadow-sm">
      <CardContent className="flex h-full flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold tracking-wide text-slate-500">{title.toUpperCase()}</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
          </div>
          <div className={cn("grid h-11 w-11 place-items-center rounded-2xl text-white shadow-sm", iconClass)}>
            {icon}
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-600">{subtitle}</div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 px-3 py-3">
      <div className="text-xs text-white/85">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

function AlertRow({
  tone,
  title,
  subtitle,
}: {
  tone: "danger" | "warn" | "info";
  title: string;
  subtitle: string;
}) {
  const styles =
    tone === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-sky-200 bg-sky-50 text-sky-700";

  const Icon = tone === "danger" ? AlertTriangle : tone === "warn" ? Clock3 : FileText;

  return (
    <div className={cn("rounded-2xl border p-4", styles)}>
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/60">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs opacity-90">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function LegendRow({ dot, label, value }: { dot: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
        <span className="text-sm text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
