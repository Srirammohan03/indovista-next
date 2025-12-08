"use client";

import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Topbar = () => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search shipments, containers, or documents..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
           <Bell className="w-5 h-5 text-gray-500 hover:text-gray-700" />
           <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        
        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">Alex Morgan</p>
            <p className="text-xs text-gray-500">Logistics Mgr.</p>
          </div>
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;