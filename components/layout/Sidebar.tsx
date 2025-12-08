"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ship,
  Users,
  Package,
  FileText,
  DollarSign,
  ShieldCheck,
  Settings,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: Ship, label: "Shipments", href: "/shipments" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Package, label: "Products", href: "/products" },
    { icon: FileText, label: "Documents", href: "/documents" },
    { icon: ClipboardList, label: "Quotes", href: "/quotes" },
    { icon: DollarSign, label: "Billing", href: "/billing" },
    { icon: ShieldCheck, label: "Compliance", href: "/compliance" },
  ];

  return (
    <div className="flex flex-col w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">IV</span>
          </div>
          <span className="font-bold text-lg tracking-tight">INDOVISTA</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto">
        <p className="px-6 text-xs font-semibold text-slate-500 uppercase mb-2">
          Operations
        </p>

        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white border-r-4 border-blue-300"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}

        {/* System Section */}
        <div className="mt-8">
          <p className="px-6 text-xs font-semibold text-slate-500 uppercase mb-2">
            System
          </p>

          <Link
            href="/settings"
            className="flex items-center px-6 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-800"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
