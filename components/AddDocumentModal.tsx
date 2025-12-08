"use client";
import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { Document } from '../types';
import { MOCK_SHIPMENTS } from '../data/mock';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (doc: Document) => void;
}

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    type: 'BILL_LADING',
    shipmentRef: '',
    status: 'DRAFT',
    expiryDate: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shipment = MOCK_SHIPMENTS.find(s => s.reference === formData.shipmentRef);
    const newDoc: Document = {
      id: `DOC-${Math.floor(Math.random() * 10000)}`,
      name: formatDocType(formData.type),
      type: formData.type as any,
      status: formData.status as any,
      shipmentRef: formData.shipmentRef,
      customerName: shipment ? shipment.customer : 'Unknown',
      expiryDate: formData.expiryDate || '—'
    };
    onAdd(newDoc);
    onClose();
  };

  const formatDocType = (type: string) => {
      return type.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add Document</h2>
              <p className="text-sm text-gray-500">Track a new compliance document</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Document Type *</label>
            <select 
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="BILL_LADING">Bill of Lading</option>
              <option value="INVOICE">Commercial Invoice</option>
              <option value="PACKING_LIST">Packing List</option>
              <option value="HEALTH_CERT">Health Certificate</option>
              <option value="ORIGIN_CERT">Certificate of Origin</option>
              <option value="INSURANCE">Insurance Certificate</option>
            </select>
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-1">Link to Shipment *</label>
             <select 
                required
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.shipmentRef}
                onChange={(e) => setFormData({...formData, shipmentRef: e.target.value})}
             >
                <option value="" disabled>Select a shipment</option>
                {MOCK_SHIPMENTS.map(s => (
                    <option key={s.id} value={s.reference}>{s.reference} - {s.customer}</option>
                ))}
             </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select 
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="FINAL">Final</option>
                <option value="NOT_RECEIVED">Not Received</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
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
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
