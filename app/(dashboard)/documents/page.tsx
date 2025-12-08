"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { MOCK_ALL_DOCUMENTS } from '@/data/mock';
import { Document } from '@/types';
import { Search, Plus, FileText, AlertTriangle, Clock } from 'lucide-react';
import { AddDocumentModal } from '@/components/AddDocumentModal';

const DocumentList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<Document[]>(MOCK_ALL_DOCUMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = documents.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.shipmentRef && d.shipmentRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.customerName && d.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddDocument = (newDoc: Document) => {
    setDocuments([...documents, newDoc]);
  };

  const pendingCount = documents.filter(d => d.status === 'PENDING' || d.status === 'MISSING' || d.status === 'NOT_RECEIVED').length;
  const expiringCount = documents.filter(d => d.expiryDate && d.expiryDate.startsWith('2025')).length; // Mock logic

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Central repository for all trade documentation</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center p-6 border-l-4 border-blue-500">
             <div className="p-3 bg-blue-50 rounded-full mr-4">
                <FileText className="w-6 h-6 text-blue-600" />
             </div>
             <div>
                <p className="text-sm font-medium text-gray-500">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
             </div>
        </Card>
        <Card className="flex items-center p-6 border-l-4 border-orange-500">
             <div className="p-3 bg-orange-50 rounded-full mr-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
             </div>
             <div>
                <p className="text-sm font-medium text-gray-500">Pending/Missing</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
             </div>
        </Card>
        <Card className="flex items-center p-6 border-l-4 border-red-500">
             <div className="p-3 bg-red-50 rounded-full mr-4">
                <Clock className="w-6 h-6 text-red-600" />
             </div>
             <div>
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{expiringCount}</p>
             </div>
        </Card>
      </div>

      <Card noPadding className="overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 bg-white">
            <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search documents..." 
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
                        <th className="px-6 py-4">Document Type</th>
                        <th className="px-6 py-4">Shipment</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Expiry</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No documents found.</td>
                        </tr>
                    )}
                    {filtered.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-gray-900">{doc.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                                    {doc.shipmentRef || '—'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{doc.customerName || '—'}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={doc.status} />
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-mono text-xs">{doc.expiryDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      <AddDocumentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDocument}
      />
    </div>
  );
};

export default DocumentList;
