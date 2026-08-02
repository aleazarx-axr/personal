// src/pages/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Archive, RefreshCw, AlertCircle, CheckCircle2, X, Shield, Mail, User as UserIcon, ChevronDown } from 'lucide-react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  role_id: number;
  role: string;
  status: 'Active' | 'Archived';
  setup_token?: string | null;
  username: string;
}

// --- CUSTOM OVERLAY DROPDOWN (For Filters) ---
const CustomSelect = ({ value, onChange, options, className = "h-[42px]" }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative w-full ${className}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors shadow-sm`}
      >
        <span className="text-gray-700 truncate mr-2">{selected?.label || value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-[100] w-full top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${opt.value === value ? 'bg-red-50 text-[#9B1C1C] font-semibold border-l-2 border-[#9B1C1C]' : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- CUSTOM OVERLAY DROPDOWN (For Modals - Pops Upwards) ---
const CustomRoleSelect = ({ value, onChange }: { value: number, onChange: (val: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const roles = [
    { id: 1, label: 'Superuser' },
    { id: 2, label: 'Admin' },
    { id: 3, label: 'Staff' }
  ];
  const selected = roles.find(r => r.id === value);

  return (
    <div className="relative w-full h-[42px]">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors`}
      >
        <span className="text-gray-700">{selected?.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-50 w-full bottom-0 left-0 bg-white border border-gray-300 rounded-md shadow-2xl overflow-hidden">
            {roles.map(role => (
              <div 
                key={role.id}
                onClick={() => { onChange(role.id); setIsOpen(false); }}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${role.id === value ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600' : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'}`}
              >
                {role.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tab state transformed into dropdown state
  const [activeTab, setActiveTab] = useState<string>('Active');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    icon?: 'archive' | 'mail';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm'
  });

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Forms
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '', role_id: 2 }); 
  const [editData, setEditData] = useState<{ id: number; first_name: string; last_name: string; email: string; role_id: number }>({ id: 0, first_name: '', last_name: '', email: '', role_id: 2 });

  const loggedInUserString = localStorage.getItem('portalUser');
  const loggedInUser = loggedInUserString ? JSON.parse(loggedInUserString) : { role: 'Student', id: 0 };

  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      showNotify("Failed to fetch users from server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const displayRole = (roleName: string) => {
    return roleName;
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to create user');
      
      showNotify("User created successfully!", "success");
      setIsCreateModalOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '', role_id: 2 });
      fetchUsers();
    } catch (error: any) {
      showNotify(error.message, "error");
    }
  };

  const openEditModal = (user: User) => {
    setEditData({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role_id: user.role_id });
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${editData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (!response.ok) throw new Error('Failed to update user');
      
      showNotify("User details updated successfully!", "success");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      showNotify(error.message, "error");
    }
  };

  const requestToggleArchive = (id: number, currentStatus: string) => {
    const action = currentStatus === 'Active' ? 'archive' : 'restore';
    const confirmMessage = currentStatus === 'Active' 
      ? "Are you sure you want to suspend this account? They will lose access to the portal."
      : "Are you sure you want to restore this account's access?";
      
    setConfirmModal({
        isOpen: true,
        title: currentStatus === 'Active' ? 'Suspend Account' : 'Restore Account',
        message: confirmMessage,
        icon: 'archive',
        confirmText: currentStatus === 'Active' ? 'Suspend' : 'Restore',
        onConfirm: async () => {
            setConfirmModal(prev => ({...prev, isOpen: false}));
            try {
              const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/${action}`, { method: 'PUT' });
              if (!response.ok) throw new Error(`Failed to ${action} user`);
              showNotify(`User account successfully ${action}d.`, "success");
              fetchUsers();
            } catch (error: any) {
              showNotify(error.message, "error");
            }
        }
    });
  };

  const requestSendResetLink = (user: User) => {
    setConfirmModal({
        isOpen: true,
        title: 'Send Reset Link',
        message: `Are you sure you want to send a password reset link to ${user.name}?`,
        icon: 'mail',
        confirmText: 'Send Link',
        onConfirm: async () => {
            setConfirmModal(prev => ({...prev, isOpen: false}));
            try {
              const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: user.username })
              });
              
              const data = await response.json();
              if (!response.ok) throw new Error(data.message || 'Failed to send reset link');
              
              showNotify(`Reset link sent successfully to ${user.email}.`, "success");
            } catch (error: any) {
              showNotify(error.message, "error");
            }
        }
    });
  };

  const getDisplayStatus = (user: User) => {
    if (user.status === 'Archived') return 'Inactive';
    if (user.setup_token) return 'Pending';
    return 'Active';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Inactive') return 'bg-red-50 text-red-700 border-red-200';
    if (status === 'Pending') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-green-50 text-green-700 border-green-200';
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    const displayStatus = getDisplayStatus(user);
    const matchesTab = (activeTab === 'All') || (displayStatus === activeTab);
    const searchString = `${user.first_name} ${user.last_name} ${user.email} ${displayRole(user.role)}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <>
      
      {/* Formal Top Right Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-700'}`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-80 hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or role..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className={`${inputClass} pl-10 shadow-sm`} 
            />
          </div>
          
          <div className="w-full sm:w-48">
            <CustomSelect 
              value={activeTab} 
              onChange={(val) => setActiveTab(val)} 
              options={[
                {value: 'All', label: 'All Accounts'},
                {value: 'Active', label: 'Active Accounts'},
                {value: 'Pending', label: 'Pending Setup'},
                {value: 'Inactive', label: 'Inactive Accounts'}
              ]}
            />
          </div>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="w-full sm:w-auto h-[42px] bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 text-sm font-medium rounded-md flex items-center justify-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Register New User
        </button>
      </div>

      <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden">
        
        {/* --- MOBILE COMPACT VIEW (ACCOUNT CARDS) --- */}
        <div className="md:hidden flex flex-col gap-3 pb-6">
          {loading ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">Loading directory...</div>
          ) : filteredUsers.length === 0 ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">No matching users found.</div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col overflow-hidden">
                
                {/* Mobile Card Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                  <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    <Shield className={`w-3.5 h-3.5 mr-1.5 ${user.role === 'Superuser' ? 'text-purple-600' : user.role === 'Admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                    {displayRole(user.role)}
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded border ${getStatusColor(getDisplayStatus(user))}`}>
                    {getDisplayStatus(user)}
                  </span>
                </div>

                {/* Mobile Card Body (Profile) */}
                <div className="p-4 flex items-center">
                  <div className="h-10 w-10 rounded bg-gray-100 border border-gray-200 flex flex-shrink-0 items-center justify-center text-[#9B1C1C] font-semibold text-lg mr-4">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm leading-snug truncate">{user.name}</h4>
                    <div className="text-xs text-gray-500 mt-1 flex items-center truncate">
                      <Mail className="w-3 h-3 mr-1.5 shrink-0" /> {user.email}
                    </div>
                  </div>
                </div>

                {/* Mobile Card Footer (Actions) */}
                <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap justify-end gap-2 bg-white">
                  <button 
                    onClick={() => requestSendResetLink(user)} 
                    disabled={user.status === 'Archived'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${user.status === 'Archived' ? 'text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed' : 'text-[#9B1C1C] bg-white border border-[#9B1C1C] hover:bg-red-50'}`}
                  >
                    <Mail className="w-3.5 h-3.5" /> Reset Link
                  </button>
                  <button 
                    onClick={() => openEditModal(user)} 
                    disabled={user.status === 'Archived'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${user.status === 'Archived' ? 'text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed' : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'}`}
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button 
                    onClick={() => requestToggleArchive(user.id, user.status)} 
                    disabled={loggedInUser.id === user.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${loggedInUser.id === user.id ? 'text-gray-300 bg-gray-50 border border-gray-100 cursor-not-allowed' : user.status === 'Active' ? 'text-red-700 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200' : 'text-green-700 bg-white border border-gray-300 hover:bg-green-50 hover:border-green-200'}`}
                  >
                    {user.status === 'Active' ? <Archive className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />} 
                    {user.status === 'Active' ? 'Suspend' : 'Restore'}
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* --- DESKTOP VIEW (FORMAL TABLE) --- */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3 font-semibold">User Profile</th>
              <th className="px-6 py-3 font-semibold w-48">System Role</th>
              <th className="px-6 py-3 font-semibold w-32 text-center">Status</th>
              <th className="px-6 py-3 font-semibold w-32 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium text-sm">Loading directory...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium text-sm">No matching users found.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/80 transition-colors group">
                  
                  {/* User Profile Column */}
                  <td className="px-6 py-3 align-middle">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded bg-gray-100 border border-gray-200 flex flex-shrink-0 items-center justify-center text-[#9B1C1C] font-semibold text-lg mr-4">
                        {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 leading-snug">{user.name}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <Mail className="w-3.5 h-3.5 mr-1.5" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Column */}
                  <td className="px-6 py-3 align-middle">
                    <div className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                      <Shield className={`w-4 h-4 mr-2 ${user.role === 'Superuser' ? 'text-purple-600' : user.role === 'Admin' ? 'text-blue-600' : 'text-gray-400'}`} />
                      {displayRole(user.role)}
                    </div>
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-3 text-center align-middle">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded border ${getStatusColor(getDisplayStatus(user))}`}>
                      {getDisplayStatus(user)}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-3 text-center align-middle">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => requestSendResetLink(user)} 
                        disabled={user.status === 'Archived'}
                        className={`p-1.5 rounded border transition-colors ${user.status === 'Archived' ? 'text-gray-300 border-transparent cursor-not-allowed' : 'text-gray-400 border-transparent hover:text-[#9B1C1C] hover:bg-white hover:border-[#9B1C1C] hover:shadow-sm'}`} 
                        title="Send Password Reset Link"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openEditModal(user)} 
                        disabled={user.status === 'Archived'}
                        className={`p-1.5 rounded border transition-colors ${user.status === 'Archived' ? 'text-gray-300 border-transparent cursor-not-allowed' : 'text-gray-400 border-transparent hover:text-[#9B1C1C] hover:bg-white hover:border-gray-200 hover:shadow-sm'}`} 
                        title="Edit User Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {/* Prevent logged in user from archiving themselves */}
                      <button 
                        onClick={() => requestToggleArchive(user.id, user.status)} 
                        disabled={loggedInUser.id === user.id}
                        className={`p-1.5 rounded border transition-colors ${loggedInUser.id === user.id ? 'text-gray-200 border-transparent cursor-not-allowed' : user.status === 'Active' ? 'text-gray-400 border-transparent hover:text-red-600 hover:bg-white hover:border-gray-200 hover:shadow-sm' : 'text-gray-400 border-transparent hover:text-green-600 hover:bg-white hover:border-gray-200 hover:shadow-sm'}`}
                        title={user.status === 'Active' ? "Suspend Account" : "Restore Account"}
                      >
                        {user.status === 'Active' ? <Archive className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- ADD NEW USER MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-900 text-base flex items-center">
                <UserIcon className="w-5 h-5 text-gray-500 mr-2" /> Register New Account
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 bg-white overflow-y-auto max-h-[70vh]">
              <form id="createUserForm" onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
                    <input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
                    <input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder="name@wmsu.edu.ph" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">System Role</label>
                    <CustomRoleSelect 
                      value={formData.role_id} 
                      onChange={(newRole) => setFormData({ ...formData, role_id: newRole })} 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Initial Temp Password (Optional)</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} minLength={6} className={inputClass} placeholder="Leave blank to auto-generate" />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" form="createUserForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm transition-colors">Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-900 text-base flex items-center">
                <Edit className="w-5 h-5 text-gray-500 mr-2" /> Update Profile
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 bg-white overflow-y-auto max-h-[70vh]">
              <form id="editUserForm" onSubmit={handleEditUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
                    <input type="text" required value={editData.first_name} onChange={(e) => setEditData({ ...editData, first_name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
                    <input type="text" required value={editData.last_name} onChange={(e) => setEditData({ ...editData, last_name: e.target.value })} className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                  <input type="email" required value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className={inputClass} />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">System Role</label>
                  <CustomRoleSelect 
                    value={editData.role_id} 
                    onChange={(newRole) => setEditData({ ...editData, role_id: newRole })} 
                  />
                </div>
              </form>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" form="editUserForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white max-w-sm w-full rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
              {confirmModal.icon === 'mail' ? (
                <Mail className="w-6 h-6 text-[#9B1C1C]" />
              ) : (
                <AlertCircle className="w-6 h-6 text-[#9B1C1C]" />
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmModal.message}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-[#9B1C1C] hover:bg-[#7a1515] rounded-lg shadow-sm transition-colors"
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};