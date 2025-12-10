// app/(dashboard)/customers/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Search, Plus, CheckCircle, XCircle } from "lucide-react";
import { AddCustomerModal } from "@/components/AddCustomerModal";
import { Customer } from "@/types";

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = (await res.json()) as Customer[];
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = () => {
    fetchCustomers();
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCustomerType = (type: Customer["type"]) => {
    switch (type) {
      case "RetailChain":
        return "Retail Chain";
      case "RestaurantGroup":
        return "Restaurant Group";
      default:
        return type;
    }
  };

  const filtered = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(term) ||
      c.country.toLowerCase().includes(term) ||
      c.customerCode.toLowerCase().includes(term) ||
      (c.contactPerson || "").toLowerCase().includes(term)
    );
  });

  const statusClass = (status: Customer["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border-green-200";
      case "INACTIVE":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "SUSPENDED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    
    <div className="space-y-6">
      {/* Header */}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">
            Manage importers, distributors, and retail partners
          </p>
        </div>
        <div className="flex gap-2">
  <button
    onClick={() => {
      window.location.href = "/api/customers/export";
    }}
    className="flex items-center px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
  >
    Export All
  </button>

  <label className="flex items-center px-3 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 cursor-pointer">
    Import
    <input
      type="file"
      accept="application/json"
      className="hidden"
      onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        try {
          const json = JSON.parse(text);
          const res = await fetch("/api/customers/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(json),
          });
          if (!res.ok) {
            const err = await res.json();
            alert(`Import failed: ${err.message || res.statusText}`);
            return;
          }
          alert("Import successful");
          // Refresh list
          fetchCustomers(); // or refetch if using React Query
        } catch (err) {
          console.error(err);
          alert("Invalid JSON file");
        }
      }}
    />
  </label>

  <button
    onClick={() => setIsModalOpen(true)}
    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
  >
    <Plus className="w-4 h-4 mr-2" />
    Add Customer
  </button>
</div>
        
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, country, code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Loading customers...
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((customer) => (
                <Link
                  href={`/customers/${customer.customerCode}`}
                  key={customer.customerCode}
                  className="block group"
                >
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer relative border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                          {customer.companyName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {formatCustomerType(customer.type)} •{" "}
                          {customer.country}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Code: {customer.customerCode}
                        </p>
                        {customer.phone && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Phone: {customer.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100 bg-blue-50 text-blue-600 uppercase">
                          {customer.currency}
                        </span>
                        <span
                          className={`mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusClass(
                            customer.status
                          )}`}
                        >
                          {customer.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-500">Contact</span>
                        <span className="text-sm font-medium text-gray-900 text-right">
                          {customer.contactPerson || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-500">
                          Credit Limit
                        </span>
                        <span className="text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(
                            customer.creditLimit || 0,
                            customer.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-500">
                          Used Credits
                        </span>
                        <span className="text-sm font-bold text-orange-600 text-right">
                          {formatCurrency(
                            customer.usedCredits || 0,
                            customer.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-500">
                          Total Amount
                        </span>
                        <span className="text-sm font-bold text-gray-900 text-right">
                          {formatCurrency(
                            customer.totalAmount || 0,
                            customer.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-500">
                          Payment Terms
                        </span>
                        <span className="text-sm font-medium text-gray-900 text-right">
                          {customer.paymentTerms || "—"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
                      <div
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                          customer.kycStatus
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {customer.kycStatus ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        KYC
                      </div>
                      <div
                        className={`flex items-center gap-1.5 text-xs font-medium ${
                          customer.sanctionsCheck
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {customer.sanctionsCheck ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        Sanctions
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                No customers found matching your search.
              </div>
            )}
          </>
        )}
      </div>

      <AddCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCustomer}
      />
    </div>
  );
};

export default CustomerList;
