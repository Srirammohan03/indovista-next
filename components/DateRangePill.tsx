"use client";

import React from "react";
import { format } from "date-fns";
import { DateRangePicker, Range, createStaticRanges } from "react-date-range";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// If you already have Popover, use that. Otherwise swap to a Dialog.
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const quickRanges = createStaticRanges([
  { label: "Today", range: () => ({ startDate: new Date(), endDate: new Date() }) },
  { label: "Yesterday", range: () => {
      const d = new Date(); d.setDate(d.getDate() - 1);
      return { startDate: d, endDate: d };
    }
  },
  { label: "Last 7 days", range: () => {
      const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 6);
      return { startDate: start, endDate: end };
    }
  },
  { label: "Last 30 days", range: () => {
      const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 29);
      return { startDate: start, endDate: end };
    }
  },
  { label: "Last 90 days", range: () => {
      const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 89);
      return { startDate: start, endDate: end };
    }
  },
]);

export function DateRangePill({
  value,
  onChange,
  className,
}: {
  value: { startDate: Date; endDate: Date };
  onChange: (v: { startDate: Date; endDate: Date }) => void;
  className?: string;
}) {
  const [draft, setDraft] = React.useState<Range>({
    key: "selection",
    startDate: value.startDate,
    endDate: value.endDate,
  });

  const label =
    value.startDate.toDateString() === value.endDate.toDateString()
      ? format(value.startDate, "MMM dd, yyyy")
      : `${format(value.startDate, "MMM dd")} — ${format(value.endDate, "MMM dd, yyyy")}`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 rounded-xl px-3 text-slate-800 border-slate-200 bg-white",
            className
          )}
        >
          <span className="text-slate-500">📅</span>
          <span className="whitespace-nowrap">{label}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[820px] max-w-[95vw] p-0 overflow-hidden rounded-2xl border-slate-200">
        <div className="p-3 flex items-center justify-between border-b border-slate-200">
          <div className="text-sm font-semibold text-slate-900">Date range</div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => {
              setDraft({ key: "selection", startDate: value.startDate, endDate: value.endDate });
            }}>Cancel</Button>
            <Button onClick={() => {
              onChange({
                startDate: draft.startDate || value.startDate,
                endDate: draft.endDate || value.endDate,
              });
            }}>Apply</Button>
          </div>
        </div>

        <DateRangePicker
          onChange={(item) => setDraft(item.selection)}
          moveRangeOnFirstSelection={false}
          ranges={[draft]}
          months={2}
          direction="horizontal"
          staticRanges={quickRanges}
          inputRanges={[]}
          showDateDisplay={true}
        />
      </PopoverContent>
    </Popover>
  );
}
