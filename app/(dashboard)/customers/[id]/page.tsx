"use client";

import React from 'react';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MOCK_CUSTOMERS, MOCK_SHIPMENTS } from '@/data/mock';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { ArrowLeft, Mail, MapPin, Building, CreditCard, Pencil, Trash2, ArrowRight } from 'lucide-react';
import { Shipment } from '@/types';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const customer = MOCK_CUSTOMERS.find(c => c.id === id);

  // In a real app, this would be a filtered query
  const customerShipments = MOCK_SHIPMENTS.filter(s => s.customerId === id);

  if (!customer) {
    return <div className="p-8 text-center text-gray-500">Customer not found</div>;
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this customer?')) {
        // Logic to delete would go here
        alert('Customer deleted (mock)');
        router.push('/customers');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/customers" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Customers
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
             <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">
                {customer.type}
             </span>
          </div>
          <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
             <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {customer.city}, {customer.country}</span>
             <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" /> {customer.email}</span>
          </div>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 bg-white rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700 flex items-center">
                <Pencil className="w-4 h-4 mr-2" /> Edit Profile
            </button>
            <button 
                onClick={handleDelete}
                className="px-4 py-2 border border-red-200 bg-red-50 rounded-md text-sm font-medium hover:bg-red-100 text-red-700 flex items-center"
            >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Financials */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Financials
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">Currency</span>
                        <span className="font-mono font-medium">{customer.currency}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">Credit Limit</span>
                        <span className="font-bold text-gray-900">{formatCurrency(customer.creditLimit, customer.currency)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">Used Credit</span>
                        <span className="font-bold text-orange-600">{formatCurrency(customer.creditLimit * 0.45, customer.currency)}</span>
                    </div>
                     <div className="flex justify-between items-center py-2">
                        <span className="text-gray-500 text-sm">Payment Terms</span>
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded text-xs">{customer.paymentTerms}</span>
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                    <Building className="w-4 h-4" /> Company Info
                </h3>
                <div className="space-y-3">
                     <div>
                        <div className="text-xs text-gray-500 mb-1">Main Contact</div>
                        <div className="font-medium">{customer.contactPerson}</div>
                     </div>
                     <div>
                        <div className="text-xs text-gray-500 mb-1">Billing Address</div>
                        <div className="text-sm text-gray-600">
                            123 Logistics Way<br />
                            {customer.city}, {customer.country}<br />
                            Postal Code: 10101
                        </div>
                     </div>
                </div>
            </Card>
        </div>

        {/* Right Column: Transaction History */}
        <div className="lg:col-span-2">
            <Card className="h-full">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">Shipment History</h3>
                    <Link href="/shipments" className="text-sm text-blue-600 hover:underline">View All</Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
                            <tr>
                                <th className="px-4 py-3">Reference</th>
                                <th className="px-4 py-3">Route</th>
                                <th className="px-4 py-3">Mode</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customerShipments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        No shipment history found for this customer.
                                    </td>
                                </tr>
                            )}
                            {customerShipments.map(shipment => (
                                <tr key={shipment.id} className="hover:bg-gray-50 group cursor-pointer" onClick={() => router.push(`/shipments/${shipment.id}`)}>
                                    <td className="px-4 py-3 font-medium text-blue-600 group-hover:underline">
                                        {shipment.reference}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {shipment.origin.code} <ArrowRight className="inline w-3 h-3 mx-1" /> {shipment.destination.code}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs uppercase">
                                        {shipment.mode}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                                        {shipment.etd}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={shipment.status} />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                        {shipment.financials.currency} {shipment.financials.revenue}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
};

export default CustomerDetail;
