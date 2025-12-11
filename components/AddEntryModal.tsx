// components/AddEntryModal.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddEntryModalProps {
  open: boolean;
  onClose: () => void;
  fields: { key: string; label: string }[];
  onSave: (values: any) => void;
}

export default function AddEntryModal({
  open,
  onClose,
  fields,
  onSave,
}: AddEntryModalProps) {
  const [form, setForm] = React.useState<any>({});

  React.useEffect(() => {
    if (open) {
      const empty: any = {};
      fields.forEach((f) => (empty[f.key] = ""));
      setForm(empty);
    }
  }, [open, fields]);

  const handleChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {f.label}
              </label>
              <input
                type="text"
                value={form[f.key] ?? ""}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
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
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
