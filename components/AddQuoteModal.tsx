"use client";
import React, { useState, useEffect } from 'react';
import { X, FileText, Ship, Plane, Truck } from 'lucide-react';
import { Quote, Mode, CommodityType } from '../types';

interface AddQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quote: Quote) => void;
  initialData?: Quote | null;
}

export const AddQuoteModal: React.FC<AddQuoteModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    customer: '',
    originCity: '',
    originCountry: '',
    destCity: '',
    destCountry: '',
    mode: 'SEA' as Mode,
    commodity: 'FROZEN' as CommodityType,
    estValue: '',
    currency: 'INR',
    validTill: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        customer: initialData.customer,
        originCity: initialData.origin.city,
        originCountry: initialData.origin.country,
        destCity: initialData.destination.city,
        destCountry: initialData.destination.country,
        mode: initialData.mode,
        commodity: initialData.commodity,
        estValue: String(initialData.estValue),
        currency: initialData.currency,
        validTill: initialData.validTill,
        status: initialData.status
      });
    } else {
        // Reset
        setFormData({
            customer: '',
            originCity: '',
            originCountry: '',
            destCity: '',
            destCountry: '',
            mode: 'SEA',
            commodity: 'FROZEN',
            estValue: '',
            currency: 'INR',
            validTill: '',
            status: 'DRAFT'
        });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quote: Quote = {
      id: initialData ? initialData.id : `QT-2024-${Math.floor(Math.random() * 10000)}`,
      reference: initialData ? initialData.reference : `QT-2024-${Math.floor(Math.random() * 10000)}`,
      customer: formData.customer,
      origin: { city: formData.originCity, country: formData.originCountry },
      destination: { city: formData.destCity, country: formData.destCountry },
      mode: formData.mode,
      commodity: formData.commodity,
      estValue: Number(formData.estValue),
      currency: formData.currency,
      validTill: formData.validTill,
      status: formData.status as any
    };
    onSave(quote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Quote' : 'New Quote'}</h2>
              <p className="text-sm text-gray-500">{initialData ? 'Update existing quotation' : 'Create a new shipping quote'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Customer *</label>
            <input 
              required
              type="text"
              placeholder="e.g. Nordic Foods AS"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.customer}
              onChange={(e) => setFormData({...formData, customer: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Origin City</label>
              <input 
                type="text"
                placeholder="City"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.originCity}
                onChange={(e) => setFormData({...formData, originCity: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Origin Country</label>
              <input 
                type="text"
                placeholder="Country"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.originCountry}
                onChange={(e) => setFormData({...formData, originCountry: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dest. City</label>
              <input 
                type="text"
                placeholder="City"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.destCity}
                onChange={(e) => setFormData({...formData, destCity: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dest. Country</label>
              <input 
                type="text"
                placeholder="Country"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.destCountry}
                onChange={(e) => setFormData({...formData, destCountry: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Mode</label>
               <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button type="button" onClick={() => setFormData({...formData, mode: 'SEA'})} className={`flex-1 p-1 rounded transition-colors ${formData.mode === 'SEA' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Ship className="w-4 h-4 mx-auto"/></button>
                  <button type="button" onClick={() => setFormData({...formData, mode: 'AIR'})} className={`flex-1 p-1 rounded transition-colors ${formData.mode === 'AIR' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}><Plane className="w-4 h-4 mx-auto"/></button>
                  <button type="button" onClick={() => setFormData({...formData, mode: 'ROAD'})} className={`flex-1 p-1 rounded transition-colors ${formData.mode === 'ROAD' ? 'bg-white shadow text-orange-600' : 'text-gray-500'}`}><Truck className="w-4 h-4 mx-auto"/></button>
               </div>
             </div>
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Commodity</label>
               <select 
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.commodity}
                  onChange={(e) => setFormData({...formData, commodity: e.target.value as CommodityType})}
               >
                 <option value="FROZEN">Frozen Foods</option>
                 <option value="SPICE">Spices</option>
               </select>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Est. Value</label>
               <div className="relative">
                  <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-4 pr-12 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.estValue}
                    onChange={(e) => setFormData({...formData, estValue: e.target.value})}
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">{formData.currency}</span>
               </div>
             </div>
             <div>
               <label className="block text-sm font-semibold text-gray-700 mb-1">Valid Till</label>
               <input 
                 type="date"
                 className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                 value={formData.validTill}
                 onChange={(e) => setFormData({...formData, validTill: e.target.value})}
               />
             </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
             <select 
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
             >
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
             </select>
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
              {initialData ? 'Update Quote' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};