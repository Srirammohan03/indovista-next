"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { MOCK_PRODUCTS } from '@/data/mock';
import { Search, Plus, Snowflake, Leaf, Thermometer, Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { AddProductModal } from '@/components/AddProductModal';

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'FROZEN' | 'SPICE'>('ALL');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filtered = products.filter(p => {
    const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.hsCode.includes(searchTerm);
    const matchesType = filterType === 'ALL' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
        setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
        // Update existing
        setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
        // Create new
        setProducts([...products, product]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Product master for frozen foods and spices</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <Card noPadding className="overflow-hidden border border-gray-200">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
            <div className="relative w-full md:max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search products or HS codes..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
                 <span className="text-sm text-gray-500 whitespace-nowrap">Category:</span>
                 <div className="flex bg-gray-100 p-1 rounded-lg flex-1 md:flex-none">
                    <button 
                        onClick={() => setFilterType('ALL')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filterType === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilterType('FROZEN')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${filterType === 'FROZEN' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <Snowflake className="w-3 h-3" /> Frozen Foods
                    </button>
                    <button 
                        onClick={() => setFilterType('SPICE')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${filterType === 'SPICE' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <Leaf className="w-3 h-3" /> Spices
                    </button>
                 </div>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">Product Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">HS Code</th>
                        <th className="px-6 py-4">Temperature</th>
                        <th className="px-6 py-4">Pack Size</th>
                        <th className="px-6 py-4">Shelf Life</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No products found.</td>
                        </tr>
                    )}
                    {filtered.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    {product.type === 'FROZEN' ? (
                                        <Snowflake className="w-4 h-4 text-blue-400" />
                                    ) : (
                                        <Leaf className="w-4 h-4 text-green-500" />
                                    )}
                                    <span className="font-medium text-gray-900">{product.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{product.category}</td>
                            <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                    {product.hsCode}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                <div className="flex items-center gap-1.5">
                                    <Thermometer className="w-3.5 h-3.5 text-gray-400" />
                                    {product.temperature}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{product.packSize}</td>
                            <td className="px-6 py-4 text-gray-600">{product.shelfLife}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(product)}
                                        className="p-1.5 hover:bg-blue-50 rounded text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit Product"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(product.id)}
                                        className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete Product"
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

      <AddProductModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />
    </div>
  );
};

export default ProductList;
    