"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BulkImportModalProps {
  open: boolean;
  onClose: () => void;
  fields: { key: string; label: string }[];
  onBulkSave: (rows: any[]) => void;
}

export default function BulkImportModal({
  open,
  onClose,
  fields,
  onBulkSave,
}: BulkImportModalProps) {
  const [rows, setRows] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    try {
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (!lines.length) {
        setRows([]);
        setError("File is empty.");
        return;
      }

      let startIndex = 0;

      // If first row looks like header (matches labels), skip it
      const firstParts = lines[0].split(",").map((p) => p.trim().toLowerCase());
      const labels = fields.map((f) => f.label.toLowerCase());
      const looksLikeHeader = labels.every((lab) => firstParts.includes(lab));
      if (looksLikeHeader) startIndex = 1;

      const parsed: any[] = [];
      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim());
        if (parts.every((p) => p === "")) continue;

        const obj: any = {};
        fields.forEach((f, idx) => {
          obj[f.key] = parts[idx] ?? "";
        });
        parsed.push(obj);
      }

      setRows(parsed);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not parse CSV. Please check format.");
      setRows([]);
    }
  };

  const handleImport = () => {
    if (!rows.length) return;
    onBulkSave(rows);
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogHeader>
        <DialogTitle>Bulk Import (CSV)</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-3 text-sm">
          <p className="text-gray-600">
            Upload a <span className="font-semibold">.csv</span> file. Columns
            should be in this exact order:
          </p>
          <div className="px-3 py-2 bg-gray-50 rounded border text-xs text-gray-700">
            {fields.map((f, idx) => (
              <span key={f.key}>
                {idx + 1}. {f.label}
                {idx < fields.length - 1 && ", "}
              </span>
            ))}
          </div>

          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {rows.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 text-sm">
                  Preview ({rows.length} rows)
                </span>
              </div>
              <div className="max-h-48 overflow-auto border rounded-md">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {fields.map((f) => (
                        <th key={f.key} className="px-2 py-1 text-left">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((row, idx) => (
                      <tr key={idx} className="border-t">
                        {fields.map((f) => (
                          <td key={f.key} className="px-2 py-1">
                            {row[f.key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {rows.length > 20 && (
                      <tr>
                        <td
                          colSpan={fields.length}
                          className="px-2 py-1 text-center text-gray-500"
                        >
                          + {rows.length - 20} more rows…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!rows.length}
            className={`px-4 py-2 text-sm rounded-lg ${
              rows.length
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Import {rows.length ? `(${rows.length})` : ""}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
