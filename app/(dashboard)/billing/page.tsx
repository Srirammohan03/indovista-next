
"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { MOCK_INVOICES } from '@/data/mock';
import { Invoice } from '@/types';
import { Plus, Search, DollarSign, AlertCircle, CheckCircle, FileText, Download } from 'lucide-react';
import { CreateInvoiceModal } from '@/components/CreateInvoiceModal';

const BillingPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateInvoice = (newInvoice: Invoice) => {
    setInvoices([newInvoice, ...invoices]);
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
          <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
          <p className="text-gray-500 mt-1">Invoice management and payment tracking</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
         <Card className="p-6 flex items-center justify-between border-l-4 border-gray-500">
             <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Total Invoices</p>
                 <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
             </div>
             <div className="p-3 bg-gray-100 rounded-lg">
                 <FileText className="w-6 h-6 text-gray-600" />
             </div>
         </Card>
         <Card className="p-6 flex items-center justify-between border-l-4 border-blue-500">
             <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Outstanding</p>
                 <p className="text-2xl font-bold text-gray-900">$130,000</p>
             </div>
             <div className="p-3 bg-blue-50 rounded-lg">
                 <DollarSign className="w-6 h-6 text-blue-600" />
             </div>
         </Card>
         <Card className="p-6 flex items-center justify-between border-l-4 border-red-500">
             <div className="bg-red-50 p-6 absolute inset-0 opacity-10"></div>
             <div className="relative z-10">
                 <p className="text-sm font-medium text-gray-500 mb-1">Overdue</p>
                 <p className="text-2xl font-bold text-red-600">$85,000</p>
             </div>
             <div className="p-3 bg-red-100 rounded-lg relative z-10">
                 <AlertCircle className="w-6 h-6 text-red-600" />
             </div>
         </Card>
         <Card className="p-6 flex items-center justify-between border-l-4 border-green-500">
             <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Paid This Month</p>
                 <p className="text-2xl font-bold text-green-600">$12,500</p>
             </div>
             <div className="p-3 bg-green-50 rounded-lg">
                 <CheckCircle className="w-6 h-6 text-green-600" />
             </div>
         </Card>
      </div>

      {/* Aging Report Widget */}
      <Card className="p-6">
         <h3 className="font-bold text-gray-900 mb-6">Aging Report</h3>
         <div className="relative pt-2 pb-6">
            <div className="flex h-3 rounded-full overflow-hidden w-full bg-gray-100">
                <div style={{ width: '25%' }} className="bg-green-500 h-full"></div>
                <div style={{ width: '15%' }} className="bg-amber-400 h-full"></div>
                <div style={{ width: '10%' }} className="bg-orange-500 h-full"></div>
                <div style={{ width: '50%' }} className="bg-red-500 h-full"></div>
            </div>
            
            <div className="flex justify-between mt-4 text-center">
                <div className="w-1/4">
                    <div className="text-xs font-semibold text-gray-500">0-30 days</div>
                    <div className="text-sm font-bold text-gray-900">$45,000</div>
                    <div className="h-1 w-full bg-green-500 mt-1 rounded-full opacity-50"></div>
                </div>
                <div className="w-[15%]">
                    <div className="text-xs font-semibold text-gray-500">31-60 days</div>
                    <div className="text-sm font-bold text-gray-900">$28,000</div>
                    <div className="h-1 w-full bg-amber-400 mt-1 rounded-full opacity-50"></div>
                </div>
                <div className="w-[10%]">
                    <div className="text-xs font-semibold text-gray-500">61-90 days</div>
                    <div className="text-sm font-bold text-gray-900">$12,000</div>
                    <div className="h-1 w-full bg-orange-500 mt-1 rounded-full opacity-50"></div>
                </div>
                <div className="w-1/2">
                    <div className="text-xs font-semibold text-gray-500">90+ days</div>
                    <div className="text-sm font-bold text-gray-900">$85,000</div>
                    <div className="h-1 w-full bg-red-500 mt-1 rounded-full opacity-50"></div>
                </div>
            </div>
         </div>
      </Card>

      {/* Invoices Table */}
      <Card noPadding className="overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search invoices by number or customer@." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">Invoice No.</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Shipment</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Issue Date</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 && (
                        <tr>
                             <td colSpan={8} className="px-6 py-8 text-center text-gray-500">No invoices found.</td>
                        </tr>
                    )}
                    {filtered.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                            <td className="px-6 py-4 text-gray-700">{invoice.customerName}</td>
                            <td className="px-6 py-4">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                    {invoice.shipmentRef}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-gray-900">
                                {formatCurrency(invoice.amount, invoice.currency)}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{invoice.issueDate}</td>
                            <td className="px-6 py-4 text-gray-600">{invoice.dueDate}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={invoice.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-gray-400 hover:text-blue-600 transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      <CreateInvoiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateInvoice}
      />
    </div>
  );
};

export default BillingPage;
