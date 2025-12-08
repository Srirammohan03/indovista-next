"use client";
import React, { useState } from 'react';
import { X, Ship, Plane, Truck, Snowflake, Leaf } from 'lucide-react';
import { Mode, Direction, CommodityType } from '../types';

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export const NewShipmentModal: React.FC<NewShipmentModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    // Step 1
    customer: '',
    direction: 'EXPORT' as Direction,
    mode: 'SEA' as Mode,
    incoterm: 'FOB',
    commodity: 'FROZEN' as CommodityType,
    // Step 2
    originCity: '',
    originCode: '',
    originCountry: '',
    destCity: '',
    destCode: '',
    destCountry: '',
    // Step 3
    containerType: "40' Reefer",
    tempRange: '',
    pieces: '',
    weight: '',
    volume: '',
    instructions: ''
  });

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => (Math.min(prev + 1, 3) as Step));
  const handleBack = () => setStep((prev) => (Math.max(prev - 1, 1) as Step));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Ship className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Shipment</h2>
              <p className="text-sm text-gray-500">Step {step} of 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-8 py-6">
          <div className="relative flex items-center justify-between">
            {/* Background Line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-10"></div>
            
            {/* Active Line */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 -z-10 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            ></div>

            {/* Step 1 */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>1</div>

            {/* Step 2 */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>2</div>

            {/* Step 3 */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>3</div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-8 pt-2 flex-1">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Customer *</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 appearance-none"
                  value={formData.customer}
                  onChange={(e) => setFormData({...formData, customer: e.target.value})}
                >
                  <option value="" disabled>Select customer</option>
                  <option value="Nordic Foods AS">Nordic Foods AS</option>
                  <option value="Spice World GmbH">Spice World GmbH</option>
                  <option value="Fresh Mart LLC">Fresh Mart LLC</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Direction</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setFormData({...formData, direction: 'EXPORT'})}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${formData.direction === 'EXPORT' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Export
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, direction: 'IMPORT'})}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${formData.direction === 'IMPORT' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      Import
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setFormData({...formData, mode: 'SEA'})}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${formData.mode === 'SEA' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Ship className="w-4 h-4" /> Sea
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, mode: 'AIR'})}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${formData.mode === 'AIR' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Plane className="w-4 h-4" /> Air
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, mode: 'ROAD'})}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${formData.mode === 'ROAD' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Truck className="w-4 h-4" /> Road
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Incoterm</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                      value={formData.incoterm}
                      onChange={(e) => setFormData({...formData, incoterm: e.target.value})}
                    >
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="EXW">EXW</option>
                      <option value="DAP">DAP</option>
                    </select>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Commodity Type</label>
                   <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setFormData({...formData, commodity: 'FROZEN'})}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${formData.commodity === 'FROZEN' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Snowflake className="w-4 h-4" /> Frozen Foods
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, commodity: 'SPICE'})}
                      className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${formData.commodity === 'SPICE' ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <Leaf className="w-4 h-4" /> Spices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Route Info */}
          {step === 2 && (
            <div className="space-y-8">
              
              {/* Origin Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Origin</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Mumbai"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.originCity}
                      onChange={(e) => setFormData({...formData, originCity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Port/Airport Code *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., INMAA"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                      value={formData.originCode}
                      onChange={(e) => setFormData({...formData, originCode: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                    <input 
                      type="text" 
                      placeholder="e.g., India"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.originCountry}
                      onChange={(e) => setFormData({...formData, originCountry: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Destination Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Destination</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Rotterdam"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.destCity}
                      onChange={(e) => setFormData({...formData, destCity: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Port/Airport Code *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., NLRTM"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                      value={formData.destCode}
                      onChange={(e) => setFormData({...formData, destCode: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Netherlands"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      value={formData.destCountry}
                      onChange={(e) => setFormData({...formData, destCountry: e.target.value})}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: Cargo Details */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Cargo Details</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Container/ULD Type</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      value={formData.containerType}
                      onChange={(e) => setFormData({...formData, containerType: e.target.value})}
                    >
                      <option value="40' Reefer">40' Reefer</option>
                      <option value="20' Reefer">20' Reefer</option>
                      <option value="40' Standard">40' Standard</option>
                      <option value="Air ULD (LD3)">Air ULD (LD3)</option>
                    </select>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Temperature Range</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                      value={formData.tempRange}
                      onChange={(e) => setFormData({...formData, tempRange: e.target.value})}
                    >
                      <option value="" disabled>Select range</option>
                      <option value="-18C to -22C">-18C to -22C (Deep Freeze)</option>
                      <option value="2C to 8C">2C to 8C (Chilled)</option>
                      <option value="Ambient">Ambient</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pieces / Cartons</label>
                  <input 
                    type="number" 
                    placeholder="e.g., 1200"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.pieces}
                    onChange={(e) => setFormData({...formData, pieces: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gross Weight (kg)</label>
                  <input 
                    type="number" 
                    placeholder="e.g., 24000"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Volume (CBM)</label>
                  <input 
                    type="number" 
                    placeholder="e.g., 58"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.volume}
                    onChange={(e) => setFormData({...formData, volume: e.target.value})}
                  />
              </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                  <textarea 
                    rows={3}
                    placeholder="Any special handling requirements..."
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  />
              </div>

            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )}
          
          {step < 3 ? (
            <button 
              onClick={handleNext}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              Continue
            </button>
          ) : (
             <button 
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              Create Shipment
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
