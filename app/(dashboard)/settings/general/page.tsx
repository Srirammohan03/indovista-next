"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import Link from "next/link";

const GeneralSettings = () => {
  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/settings" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Settings
          </Link>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="w-6 h-6 text-gray-600" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
                <p className="text-gray-500 text-sm">System preferences and configuration</p>
             </div>
          </div>
        </div>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 shadow-sm transition-colors">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         <div className="lg:col-span-2 space-y-6">
            <Card>
                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg bg-gray-50" defaultValue="INDOVISTA Logistics" />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">GSTIN</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg bg-gray-50" defaultValue="27AAAAA0000A1Z5" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                        <textarea rows={2} className="w-full px-4 py-2 border rounded-lg bg-gray-50" defaultValue="123 Corporate Park, Mumbai, Maharashtra, 400001" />
                    </div>
                </div>
            </Card>

            <Card>
                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Localization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Timezone</label>
                        <select className="w-full px-4 py-2 border rounded-lg bg-white">
                            <option>UTC+05:30 (India Standard Time)</option>
                            <option>UTC+00:00 (GMT)</option>
                            <option>UTC-05:00 (EST)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Date Format</label>
                        <select className="w-full px-4 py-2 border rounded-lg bg-white">
                            <option>YYYY-MM-DD (2024-12-31)</option>
                            <option>DD/MM/YYYY (31/12/2024)</option>
                            <option>MM/DD/YYYY (12/31/2024)</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Default Currency</label>
                        <select className="w-full px-4 py-2 border rounded-lg bg-white">
                            <option>INR (₹)</option>
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                        </select>
                    </div>
                </div>
            </Card>
         </div>

         <div className="space-y-6">
            <Card>
                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">Notifications</h3>
                <div className="space-y-3">
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                        <span className="text-sm text-gray-700">Email alerts for Exceptions</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                        <span className="text-sm text-gray-700">Daily Digest Email</span>
                    </label>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                        <span className="text-sm text-gray-700">System Maintenance Alerts</span>
                    </label>
                </div>
            </Card>
            
            <Card>
                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">System Version</h3>
                <div className="text-sm text-gray-600">
                    <div className="flex justify-between py-1">
                        <span>Version</span>
                        <span className="font-mono">v2.4.0</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span>Last Build</span>
                        <span className="font-mono">2024-12-05</span>
                    </div>
                </div>
            </Card>
         </div>

      </div>
    </div>
  );
};

export default GeneralSettings;
