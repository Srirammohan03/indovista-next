"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { MOCK_QUOTES } from '@/data/mock';
import { Quote } from '@/types';
import { Search, Plus, Ship, Plane, Truck, ArrowRight, FileText, Pencil, Trash2 } from 'lucide-react';
import { AddQuoteModal } from '@/components/AddQuoteModal';

const QuoteList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const filtered = quotes.filter(q => 
    q.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
    q.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveQuote = (quote: Quote) => {
    if (editingQuote) {
        setQuotes(quotes.map(q => q.id === quote.id ? quote : q));
    } else {
        setQuotes([...quotes, quote]);
    }
    setEditingQuote(null);
  };

  const handleEdit = (quote: Quote) => {
      setEditingQuote(quote);
      setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
      if (confirm('Are you sure you want to delete this quote?')) {
          setQuotes(quotes.filter(q => q.id !== id));
      }
  };

  const handleAddNew = () => {
      setEditingQuote(null);
      setIsModalOpen(true);
  };

  const formatCurrency = (val: number, curr: string) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: curr, maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-gray-500 mt-1">Create and manage shipping quotations</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Quote
        </button>
      </div>

      <Card noPadding className="overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search quotes, customer@." 
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
                        <th className="px-6 py-4">Reference</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Route</th>
                        <th className="px-6 py-4">Mode</th>
                        <th className="px-6 py-4">Commodity</th>
                        <th className="px-6 py-4">Est. Value</th>
                        <th className="px-6 py-4">Valid Till</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={9} className="px-6 py-8 text-center text-gray-500">No quotes found.</td>
                        </tr>
                    )}
                    {filtered.map((quote) => (
                        <tr key={quote.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    {quote.reference}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{quote.customer}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span>{quote.origin.city}, {quote.origin.country}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span>{quote.destination.city}, {quote.destination.country}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    {quote.mode === 'SEA' && <Ship className="w-4 h-4 text-blue-500" />}
                                    {quote.mode === 'AIR' && <Plane className="w-4 h-4 text-purple-500" />}
                                    {quote.mode === 'ROAD' && <Truck className="w-4 h-4 text-orange-500" />}
                                    {quote.mode.charAt(0) + quote.mode.slice(1).toLowerCase()}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {quote.commodity === 'FROZEN' ? 'Frozen Foods' : 'Spices'}
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {formatCurrency(quote.estValue, quote.currency)}
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                                {quote.validTill}
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={quote.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(quote)}
                                        className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-blue-600"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(quote.id)}
                                        className="p-1.5 hover:bg-red-100 rounded text-gray-500 hover:text-red-600"
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

      <AddQuoteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuote}
        initialData={editingQuote}
      />
    </div>
  );
};

export default QuoteList;
