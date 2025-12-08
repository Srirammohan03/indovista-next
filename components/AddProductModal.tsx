"use client";

import React, { useState, useEffect } from 'react';
import { X, Package, Snowflake, Leaf } from 'lucide-react';
import { Product } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: 'FROZEN' as 'FROZEN' | 'SPICE',
    hsCode: '',
    temperature: '',
    packSize: '',
    shelfLife: ''
  });

  useEffect(() => {
    if (initialData) {
        setFormData({
            name: initialData.name,
            category: initialData.category,
            type: initialData.type,
            hsCode: initialData.hsCode,
            temperature: initialData.temperature,
            packSize: initialData.packSize,
            shelfLife: initialData.shelfLife
        });
    } else {
        setFormData({
            name: '',
            category: '',
            type: 'FROZEN',
            hsCode: '',
            temperature: '',
            packSize: '',
            shelfLife: ''
        });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: initialData ? initialData.id : `PROD-${Math.floor(Math.random() * 1000)}`,
      ...formData
    };
    onSave(product);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Product' : 'Add Product'}</h2>
              <p className="text-sm text-gray-500">{initialData ? 'Update product details' : 'Add new item to master list'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'FROZEN'})}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-1 transition-all ${formData.type === 'FROZEN' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Snowflake className="w-3 h-3" /> Frozen
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'SPICE'})}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded flex items-center justify-center gap-1 transition-all ${formData.type === 'SPICE' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    <Leaf className="w-3 h-3" /> Spice
                  </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <input 
                type="text" 
                placeholder="e.g. Frozen Meat"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">HS Code</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                value={formData.hsCode}
                onChange={(e) => setFormData({...formData, hsCode: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Temperature</label>
              <input 
                type="text" 
                placeholder="e.g. -18°C"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.temperature}
                onChange={(e) => setFormData({...formData, temperature: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pack Size</label>
              <input 
                type="text" 
                placeholder="e.g. 1kg"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.packSize}
                onChange={(e) => setFormData({...formData, packSize: e.target.value})}
              />
            </div>
             <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Shelf Life</label>
              <input 
                type="text" 
                placeholder="e.g. 12 months"
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.shelfLife}
                onChange={(e) => setFormData({...formData, shelfLife: e.target.value})}
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
              {initialData ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
    