"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Search, Plus, User, Trash2, Mail, Shield, Pencil, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SystemUser, Role } from "@/types/user";
import { UserModal } from "@/components/UserModal";

const fetchUsers = async (): Promise<SystemUser[]> => {
  const res = await fetch("/api/users", { cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Failed to fetch users");
  return body;
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  const queryClient = useQueryClient();

  const usersQ = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const createUser = useMutation({
    mutationFn: async (payload: { loginId: string; name: string; email: string | null; role: Role; password?: string }) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to create user");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (e: any) => alert(e?.message || "Failed"),
  });

  const updateUser = useMutation({
    mutationFn: async (payload: { id: number; loginId: string; name: string; email: string | null; role: Role; password?: string }) => {
      const res = await fetch(`/api/users/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to update user");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (e: any) => alert(e?.message || "Failed"),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to delete user");
      return body;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (e: any) => alert(e?.message || "Failed"),
  });

  const users = usersQ.data ?? [];
  const q = searchTerm.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return users;
    return users.filter((u) =>
      `${u.name} ${u.loginId} ${u.email ?? ""} ${u.role}`.toLowerCase().includes(q)
    );
  }, [users, q]);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (u: SystemUser) => {
    setEditingUser(u);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (payload: any) => {
    if (payload.id) {
      await updateUser.mutateAsync(payload);
    } else {
      await createUser.mutateAsync(payload);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const anyLoading = usersQ.isLoading || createUser.isPending || updateUser.isPending || deleteUser.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/settings" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system access and roles</p>
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      <Card noPadding className="border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between gap-4">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {anyLoading && <span className="text-xs text-gray-400 animate-pulse">Loading…</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Login ID</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {!usersQ.isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}

              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-gray-500 text-xs flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {u.email ?? "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono text-xs text-gray-700">{u.loginId}</td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                      <Shield className="w-3 h-3 text-gray-500" />
                      {u.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                    {new Date(u.createdAt).toLocaleString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit User"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to remove this user?")) deleteUser.mutate(u.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove User"
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
      </Card>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        initialData={editingUser}
      />
    </div>
  );
}
