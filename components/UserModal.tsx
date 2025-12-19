"use client";

import React, { useEffect, useState } from "react";
import { X, User, Mail, Shield, Lock, IdCard } from "lucide-react";
import type { Role, SystemUser } from "@/types/user";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: {
    id?: number;
    loginId: string;
    name: string;
    email: string | null;
    role: Role;
    password?: string;
  }) => Promise<any>;
  initialData?: SystemUser | null;
};

const ROLE_OPTIONS: Role[] = ["SUPER_ADMIN", "ADMIN", "OPERATOR", "FINANCE", "DOCUMENTOR"];

export function UserModal({ isOpen, onClose, onSave, initialData }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    loginId: "",
    name: "",
    email: "",
    role: "OPERATOR" as Role,
    password: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setForm({
        loginId: initialData.loginId,
        name: initialData.name,
        email: initialData.email ?? "",
        role: initialData.role,
        password: "",
      });
    } else {
      setForm({ loginId: "", name: "", email: "", role: "OPERATOR", password: "" });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginId = form.loginId.trim();
    const name = form.name.trim();
    if (!loginId) return alert("loginId is required");
    if (!name) return alert("name is required");
    if (!initialData && !form.password) return alert("password is required for new users");

    setSaving(true);
    try {
      await onSave({
        ...(initialData ? { id: initialData.id } : {}),
        loginId,
        name,
        email: form.email.trim() ? form.email.trim() : null,
        role: form.role,
        ...(form.password ? { password: form.password } : {}),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? "Edit User" : "Add User"}
              </h2>
              <p className="text-sm text-gray-500">
                {initialData ? "Update account details" : "Create new system account"}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Login ID *</label>
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.loginId}
                onChange={(e) => setForm((p) => ({ ...p, loginId: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email (optional)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as Role }))}
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {initialData ? "Reset Password (optional)" : "Password *"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder={initialData ? "Leave blank to keep current" : "Enter password"}
                required={!initialData}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {initialData ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
