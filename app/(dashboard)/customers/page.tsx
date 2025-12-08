"use client";

import React, { useState } from 'react';
import Link from "next/link";
import { Card } from '@/components/ui/Card';
import { MOCK_CUSTOMERS } from '@/data/mock';
import { Search, Plus, CheckCircle, XCircle } from 'lucide-react';
import { AddCustomerModal } from '@/components/AddCustomerModal';
import { Customer } from '@/types';

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers([...customers, newCustomer]);
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
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 mt-1">Manage importers, distributors, and retail partners</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(customer => (
            <Link href={`/customers/${customer.id}`} key={customer.id} className="block group">
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer relative border border-gray-200">
                
                {/* Header Section */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {customer.type} • {customer.country}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-100 bg-blue-50 text-blue-600 uppercase">
                    {customer.currency}
                  </span>
                </div>

                {/* Details Section */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500">Contact</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{customer.contactPerson}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500">Credit Limit</span>
                    <span className="text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(customer.creditLimit, customer.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-gray-500">Payment Terms</span>
                    <span className="text-sm font-medium text-gray-900 text-right">{customer.paymentTerms}</span>
                  </div>
                </div>

                {/* Footer Section - Compliance */}
                <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${customer.kycStatus ? 'text-green-600' : 'text-gray-400'}`}>
                    {customer.kycStatus ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    KYC
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${customer.sanctionsCheck ? 'text-green-600' : 'text-gray-400'}`}>
                    {customer.sanctionsCheck ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    Sanctions
                  </div>
                </div>

              </Card>
            </Link>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No customers found matching your search.
          </div>
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
