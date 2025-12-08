"use client";
import React, { useState } from 'react';
import { X, FileText, Plus, Trash2 } from 'lucide-react';
import { Invoice, InvoiceLineItem } from '../types';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerGstin: '',
    placeOfSupply: '',
    shipmentRef: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    currency: 'INR',
    tdsRate: 0,
  });

  const [items, setItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: '', hsnCode: '', quantity: 1, rate: 0, taxRate: 18, amount: 0, taxableValue: 0 }
  ]);

  if (!isOpen) return null;

  // Assume Company's State is Maharashtra for Demo
  const COMPANY_STATE = 'Maharashtra';
  const isInterState = formData.placeOfSupply && formData.placeOfSupply.toLowerCase() !== COMPANY_STATE.toLowerCase();

  const updateItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalculate amounts
        if (field === 'quantity' || field === 'rate' || field === 'taxRate') {
            const qty = field === 'quantity' ? Number(value) : item.quantity;
            const rate = field === 'rate' ? Number(value) : item.rate;
            const tax = field === 'taxRate' ? Number(value) : item.taxRate;
            
            const taxable = qty * rate;
            const gstAmount = taxable * (tax / 100);
            
            updated.taxableValue = taxable;
            updated.amount = taxable + gstAmount;
        }
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', hsnCode: '', quantity: 1, rate: 0, taxRate: 18, amount: 0, taxableValue: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.taxableValue || 0), 0);
    const totalTax = items.reduce((sum, item) => sum + (item.amount - (item.taxableValue || 0)), 0);
    const totalAmount = subtotal + totalTax;
    const tdsAmount = subtotal * (formData.tdsRate / 100);
    const payable = totalAmount - tdsAmount;

    return { subtotal, totalTax, totalAmount, tdsAmount, payable };
  };

  const totals = calculateTotals();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `IV-INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      customerName: formData.customerName,
      customerGstin: formData.customerGstin,
      placeOfSupply: formData.placeOfSupply,
      shipmentRef: formData.shipmentRef,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      subtotal: totals.subtotal,
      totalTax: totals.totalTax,
      tdsRate: formData.tdsRate,
      tdsAmount: totals.tdsAmount,
      amount: totals.payable, // Storing final payable as the main amount for list view
      currency: formData.currency,
      status: 'DRAFT',
      items: items
    };
    onSave(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-200">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Tax Invoice</h2>
              <p className="text-sm text-gray-500">GST Compliant Invoice Generator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
          
          {/* Section 1: Customer & Logistics Details */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 
                Customer & Shipment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name</label>
                    <input required type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" 
                        value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} placeholder="Enter customer name" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer GSTIN</label>
                    <input type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono uppercase" 
                        value={formData.customerGstin} onChange={(e) => setFormData({...formData, customerGstin: e.target.value})} placeholder="e.g. 27AAAAA0000A1Z5" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Place of Supply</label>
                    <input type="text" list="states" className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                        value={formData.placeOfSupply} onChange={(e) => setFormData({...formData, placeOfSupply: e.target.value})} placeholder="State Name" />
                    <datalist id="states">
                        <option value="Maharashtra" />
                        <option value="Karnataka" />
                        <option value="Delhi" />
                        <option value="Tamil Nadu" />
                        <option value="Gujarat" />
                    </datalist>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shipment Ref</label>
                   <input type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    value={formData.shipmentRef} onChange={(e) => setFormData({...formData, shipmentRef: e.target.value})} placeholder="e.g. SHP-2024-001" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Invoice Date</label>
                   <input type="date" className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    value={formData.issueDate} onChange={(e) => setFormData({...formData, issueDate: e.target.value})} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Due Date</label>
                   <input required type="date" className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
                    value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                </div>
            </div>
          </div>

          {/* Section 2: Line Items */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 
                Services & Products
            </h3>
            
            <div className="border rounded-lg overflow-hidden mb-4">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 font-bold border-b text-xs uppercase">
                        <tr>
                            <th className="px-3 py-3 w-[25%]">Description</th>
                            <th className="px-3 py-3 w-[10%]">HSN/SAC</th>
                            <th className="px-3 py-3 w-[8%] text-center">Qty</th>
                            <th className="px-3 py-3 w-[12%] text-right">Rate</th>
                            <th className="px-3 py-3 w-[12%] text-right">Taxable</th>
                            <th className="px-3 py-3 w-[10%] text-center">GST %</th>
                            <th className="px-3 py-3 w-[15%] text-right">Total</th>
                            <th className="px-3 py-3 w-[8%]"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <tr key={item.id} className="group hover:bg-blue-50/50 transition-colors">
                                <td className="p-2">
                                    <input type="text" className="w-full px-2 py-1.5 border border-transparent group-hover:border-gray-300 rounded bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="Item Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                                </td>
                                <td className="p-2">
                                    <input type="text" className="w-full px-2 py-1.5 border border-transparent group-hover:border-gray-300 rounded bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs transition-all"
                                        placeholder="9967" value={item.hsnCode} onChange={(e) => updateItem(item.id, 'hsnCode', e.target.value)} />
                                </td>
                                <td className="p-2">
                                    <input type="number" min="1" className="w-full px-2 py-1.5 border border-transparent group-hover:border-gray-300 rounded bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-center transition-all"
                                        value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} />
                                </td>
                                <td className="p-2">
                                    <input type="number" min="0" className="w-full px-2 py-1.5 border border-transparent group-hover:border-gray-300 rounded bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-right transition-all"
                                        value={item.rate} onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))} />
                                </td>
                                <td className="p-2 text-right font-mono text-gray-700">
                                    {(item.taxableValue || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="p-2">
                                    <select className="w-full px-1 py-1.5 border border-transparent group-hover:border-gray-300 rounded bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-center text-xs font-semibold"
                                        value={item.taxRate} onChange={(e) => updateItem(item.id, 'taxRate', Number(e.target.value))}>
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </select>
                                </td>
                                <td className="p-2 text-right font-bold text-gray-900 font-mono">
                                    {item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                                <td className="p-2 text-center">
                                    {items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <button type="button" onClick={addItem} className="flex items-center text-sm text-blue-600 font-semibold hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Add Service Line
            </button>
          </div>

          {/* Section 3: Summary & TDS */}
          <div className="flex flex-col md:flex-row gap-6 justify-end">
              
              {/* TDS Configuration */}
              <div className="w-full md:w-64 bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-fit">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">TDS Deduction</h4>
                  <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-gray-700">TDS Rate (%)</label>
                      <input type="number" min="0" max="20" className="w-16 px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                          value={formData.tdsRate} onChange={(e) => setFormData({...formData, tdsRate: Number(e.target.value)})} />
                  </div>
                  <div className="text-xs text-gray-500 italic">
                      TDS is calculated on the taxable subtotal.
                  </div>
              </div>

              {/* Final Calculations */}
              <div className="w-full md:w-96 bg-gray-900 text-white p-6 rounded-xl shadow-lg">
                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-400">
                          <span>Subtotal (Taxable)</span>
                          <span className="font-mono">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      
                      {/* GST Breakdown */}
                      {!isInterState ? (
                          <>
                            <div className="flex justify-between text-gray-400">
                                <span>CGST (Output)</span>
                                <span className="font-mono">+ ₹{(totals.totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                                <span>SGST (Output)</span>
                                <span className="font-mono">+ ₹{(totals.totalTax / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </>
                      ) : (
                          <div className="flex justify-between text-gray-400">
                                <span>IGST (Output)</span>
                                <span className="font-mono">+ ₹{totals.totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                      )}

                      <div className="border-t border-gray-700 my-2 pt-2 flex justify-between font-bold text-lg">
                          <span>Invoice Total</span>
                          <span className="font-mono">₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>

                      {formData.tdsRate > 0 && (
                          <div className="flex justify-between text-orange-300 text-xs font-medium">
                              <span>Less: TDS @ {formData.tdsRate}%</span>
                              <span className="font-mono">- ₹{totals.tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                      )}
                      
                      <div className="border-t border-gray-700 pt-3 mt-1">
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-400">Net Payable</span>
                            <span className="text-2xl font-bold text-green-400 font-mono">₹{totals.payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                  </div>
              </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-white">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform active:scale-95">
              Generate Invoice
            </button>
        </div>
      </div>
    </div>
  );
};
