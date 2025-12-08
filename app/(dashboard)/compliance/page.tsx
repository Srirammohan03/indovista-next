"use client";
import React from 'react';
import { Card } from '@/components/ui/Card';
import { MOCK_AUDIT_LOGS, MOCK_COMPLIANCE_TASKS } from '@/data/mock';
import { 
    ShieldCheck, 
    Users, 
    FileText, 
    AlertTriangle, 
    User, 
    File, 
    CreditCard, 
    Settings,
    ArrowRight
} from 'lucide-react';
import { AuditLogEntry } from '@/types';
import Link from "next/link";
import { useRouter } from "next/navigation";


const CompliancePage = () => {
  const router = useRouter();
  const pendingCount = MOCK_COMPLIANCE_TASKS.filter(t => t.status === 'PENDING').length;

  const getRoleColor = (role: string) => {
      switch(role) {
          case 'Admin': return 'bg-blue-100 text-blue-600';
          case 'Ops': return 'bg-cyan-100 text-cyan-600';
          case 'Documentation': return 'bg-green-100 text-green-600';
          case 'Finance': return 'bg-orange-100 text-orange-600';
          case 'Sales': return 'bg-purple-100 text-purple-600';
          case 'Read-only': return 'bg-gray-100 text-gray-600';
          case 'System': return 'bg-sky-100 text-sky-600';
          default: return 'bg-gray-100 text-gray-600';
      }
  };

  const getLogIcon = (type: AuditLogEntry['iconType']) => {
      switch(type) {
          case 'user': return <User className="w-5 h-5 text-gray-500" />;
          case 'document': return <File className="w-5 h-5 text-gray-500" />;
          case 'invoice': return <CreditCard className="w-5 h-5 text-gray-500" />;
          case 'alert': return <AlertTriangle className="w-5 h-5 text-gray-500" />;
          default: return <Settings className="w-5 h-5 text-gray-500" />;
      }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance & Audit</h1>
        <p className="text-gray-500 mt-1">Audit trail and compliance monitoring</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="p-6 flex items-center justify-between border-l-4 border-blue-500">
             <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Total Actions</p>
                 <p className="text-2xl font-bold text-gray-900">{MOCK_AUDIT_LOGS.length}</p>
                 <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
             </div>
             <div className="p-3 bg-blue-50 rounded-lg">
                 <FileText className="w-6 h-6 text-blue-600" />
             </div>
        </Card>
        <Card className="p-6 flex items-center justify-between border-l-4 border-cyan-500">
             <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
                 <p className="text-2xl font-bold text-gray-900">12</p>
                 <p className="text-xs text-gray-400 mt-1">Across all roles</p>
             </div>
             <div className="p-3 bg-cyan-50 rounded-lg">
                 <Users className="w-6 h-6 text-cyan-600" />
             </div>
        </Card>
        <Card className="p-6 flex items-center justify-between border-l-4 border-green-500">
             <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Compliance Score</p>
                 <p className="text-2xl font-bold text-green-600">98%</p>
                 <p className="text-xs text-gray-400 mt-1">All checks passed</p>
             </div>
             <div className="p-3 bg-green-50 rounded-lg">
                 <ShieldCheck className="w-6 h-6 text-green-600" />
             </div>
        </Card>
        <Card className="p-6 flex items-center justify-between border-l-4 border-amber-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/compliance/tasks')}>
             <div>
                 <p className="text-sm font-medium text-gray-500 mb-1">Pending Reviews</p>
                 <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                 <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">Requires attention <ArrowRight className="w-3 h-3" /></p>
             </div>
             <div className="p-3 bg-amber-50 rounded-lg">
                 <AlertTriangle className="w-6 h-6 text-amber-600" />
             </div>
        </Card>
      </div>

      {/* User Roles */}
      <Card className="p-8">
          <h3 className="font-bold text-gray-900 mb-6">User Roles</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
              {[
                  {role: 'Admin', count: '2 users', color: 'bg-blue-500'},
                  {role: 'Ops', count: '4 users', color: 'bg-cyan-500'},
                  {role: 'Documentation', count: '2 users', color: 'bg-green-500'},
                  {role: 'Finance', count: '2 users', color: 'bg-orange-400'},
                  {role: 'Sales', count: '1 users', color: 'bg-purple-500'},
                  {role: 'Read-only', count: '1 users', color: 'bg-gray-500'},
              ].map((item) => (
                  <div key={item.role} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-3 ${item.color}`}>
                          <User className="w-6 h-6" />
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">{item.role}</div>
                      <div className="text-xs text-gray-500">{item.count}</div>
                  </div>
              ))}
          </div>
      </Card>

      {/* Audit Trail */}
      <Card>
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-gray-900" />
                  <h3 className="font-bold text-gray-900">Recent Audit Trail</h3>
              </div>
              <Link href="/compliance/audit-logs" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  View Full History <ArrowRight className="w-4 h-4" />
              </Link>
          </div>
          
          <div className="space-y-4">
              {MOCK_AUDIT_LOGS.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="mt-1 p-2 bg-gray-100 rounded-full">
                          {getLogIcon(log.iconType)}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{log.action}</span>
                              <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded font-mono border border-gray-200">
                                  {log.entityRef}
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getRoleColor(log.role)}`}>
                                  {log.role}
                              </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                              <User className="w-3 h-3" />
                              <span>{log.user}</span>
                              <span>•</span>
                              <span>{log.timestamp}</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </Card>

    </div>
  );
};

export default CompliancePage;
