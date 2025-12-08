"use client";
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Lock, CheckCircle, XCircle } from 'lucide-react';
import { SystemUser } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: SystemUser & { password?: string }) => void;
  initialData?: SystemUser | null;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Read Only',
    status: 'Active',
    password: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        status: initialData.status,
        password: '' // Don't show existing password
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Read Only',
        status: 'Active',
        password: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData: any = {
      id: initialData ? initialData.id : `U${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      lastLogin: initialData ? initialData.lastLogin : 'Never'
    };
    
    if (formData.password) {
      userData.password = formData.password;
    }

    onSave(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit User' : 'Add User'}</h2>
              <p className="text-sm text-gray-500">{initialData ? 'Update account details' : 'Create new system account'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
               <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                required
                type="text" 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                required
                type="email" 
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <div className="relative">
                   <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <select 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Operations">Operations</option>
                      <option value="Finance">Finance</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Sales">Sales</option>
                      <option value="Read Only">Read Only</option>
                   </select>
                </div>
             </div>
             <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <div className="relative">
                   {formData.status === 'Active' ? 
                     <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" /> :
                     <XCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                   }
                   <select 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                   </select>
                </div>
             </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
                {initialData ? 'Reset Password' : 'Password *'}
            </label>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input 
                required={!initialData}
                type="password" 
                placeholder={initialData ? "Leave blank to keep current" : "Enter password"}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              {initialData ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
