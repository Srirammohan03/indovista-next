"use client";
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { MOCK_AUDIT_LOGS } from '@/data/mock';
import { Search, ArrowLeft, Filter, Download, User, File, CreditCard, AlertTriangle, Settings, ShieldCheck } from 'lucide-react';
import Link from "next/link";
import { AuditLogEntry } from '@/types';

const AuditLogList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  
  const filtered = MOCK_AUDIT_LOGS.filter(log => {
      const matchesSearch = 
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityRef.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'ALL' || log.role === filterRole;
      
      return matchesSearch && matchesRole;
  });

  const getLogIcon = (type: AuditLogEntry['iconType']) => {
      switch(type) {
          case 'user': return <User className="w-4 h-4 text-gray-500" />;
          case 'document': return <File className="w-4 h-4 text-gray-500" />;
          case 'invoice': return <CreditCard className="w-4 h-4 text-gray-500" />;
          case 'alert': return <AlertTriangle className="w-4 h-4 text-gray-500" />;
          case 'check': return <ShieldCheck className="w-4 h-4 text-gray-500" />;
          default: return <Settings className="w-4 h-4 text-gray-500" />;
      }
  };

  const getRoleBadge = (role: string) => {
    let color = 'bg-gray-100 text-gray-600';
    if(role === 'Admin') color = 'bg-blue-100 text-blue-600';
    if(role === 'Ops') color = 'bg-cyan-100 text-cyan-600';
    if(role === 'Finance') color = 'bg-orange-100 text-orange-600';
    if(role === 'Sales') color = 'bg-purple-100 text-purple-600';
    
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
            {role}
        </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/compliance" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Overview
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-gray-500 mt-1">Complete history of system actions and events</p>
        </div>
        <button className="flex items-center px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      <Card noPadding className="border border-gray-200">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-white flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search logs by user, action or ID@." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Role:</span>
                <select 
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="ALL">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Ops">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="Documentation">Documentation</option>
                    <option value="System">System</option>
                </select>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4">Timestamp</th>
                        <th className="px-6 py-4">User / Role</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Entity</th>
                        <th className="px-6 py-4">Description</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filtered.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono text-xs">
                                {log.timestamp}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{log.user}</span>
                                    <div className="mt-1">{getRoleBadge(log.role)}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-gray-100 rounded">
                                        {getLogIcon(log.iconType)}
                                    </div>
                                    <span className="font-medium text-gray-700">{log.action}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase">{log.entityType}</span>
                                    <span className="font-mono text-xs bg-gray-50 px-1 py-0.5 rounded border border-gray-200 w-fit">
                                        {log.entityRef}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {log.description}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogList;
