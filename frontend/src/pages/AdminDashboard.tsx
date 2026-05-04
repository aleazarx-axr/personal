// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { Link, useLocation } from 'react-router-dom';

interface User { id: number; first_name: string; last_name: string; name: string; email: string; role_id: number; role: string; status: string; }

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '', role_id: 3 });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: 0, first_name: '', last_name: '', email: '', role_id: 3 });

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      setUsers(await response.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = showArchived ? user.status === 'Archived' : user.status === 'Active';
    return matchesSearch && matchesTab;
  });

  const handleArchive = async (id: number, currentStatus: string) => {
    if (currentStatus === 'Archived') return alert("User is already archived.");
    if (!window.confirm("Are you sure you want to archive this user?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}/archive`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to archive');
      setUsers(users.map(user => user.id === id ? { ...user, status: 'Archived' } : user));
    } catch (err) { alert("Failed to archive user."); }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm("Restore this user's system access?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}/restore`, { method: 'PUT' });
      if (!response.ok) throw new Error('Failed to restore');
      setUsers(users.map(user => user.id === id ? { ...user, status: 'Active' } : user));
    } catch (err) { alert("Failed to restore user."); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Creation failed');
      setIsModalOpen(false);
      setFormData({ first_name: '', last_name: '', email: '', password: '', role_id: 3 });
      fetchUsers();
    } catch (err: any) { alert(err.message); }
  };

  const openEditModal = (user: User) => {
    setEditFormData({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role_id: user.role_id });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editFormData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editFormData),
      });
      if (!response.ok) throw new Error('Update failed');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <PortalLayout pageTitle="User Management">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex gap-4 w-full sm:w-auto">
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-72 p-2 pl-3 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C] rounded-none" />
          <button onClick={() => setShowArchived(!showArchived)} className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border rounded-none whitespace-nowrap transition-colors ${showArchived ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
            {showArchived ? 'View Active' : 'View Archives'}
          </button>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-semibold uppercase tracking-wider rounded-none shadow-sm">
          + Create User
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-[#9B1C1C] border border-red-200 text-sm">{error}</div>}

      <div className="border border-gray-300 rounded-none bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="p-4 border-r border-gray-200">Name</th>
              <th className="p-4 border-r border-gray-200">Email Address</th>
              <th className="p-4 border-r border-gray-200">System Role</th>
              <th className="p-4 border-r border-gray-200">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">Loading system users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium">No users found.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium border-r border-gray-200">{user.name}</td>
                  <td className="p-4 border-r border-gray-200 text-gray-600">{user.email}</td>
                  <td className="p-4 border-r border-gray-200">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-none ${user.role === 'Superuser' ? 'bg-[#9B1C1C] text-white border-[#9B1C1C]' : 'bg-gray-200 text-gray-800 border-gray-300'}`}>{user.role}</span>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <span className={`font-bold text-xs uppercase tracking-wider ${user.status === 'Active' ? 'text-green-700' : 'text-red-700'}`}>{user.status}</span>
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Edit</button>
                    {showArchived ? (
                      <button onClick={() => handleRestore(user.id)} className="text-green-600 hover:text-green-800 font-bold text-xs uppercase tracking-wider">Restore</button>
                    ) : (
                      <button onClick={() => handleArchive(user.id, user.status)} className="text-gray-500 hover:text-red-900 font-bold text-xs uppercase tracking-wider">Archive</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- CREATE MODAL OVERLAY --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-gray-300 rounded-none shadow-xl">
             <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
               <h3 className="font-bold text-gray-800 uppercase tracking-wider">Create New User</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 font-bold">X</button>
             </div>
             <form onSubmit={handleCreateUser} className="p-6 space-y-4">
               <div className="flex gap-4">
                 <div className="w-1/2">
                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name</label>
                   <input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]" />
                 </div>
                 <div className="w-1/2">
                   <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label>
                   <input type="text" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]" />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                 <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                 <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]" />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-700 uppercase mb-1">System Role</label>
                 <select value={formData.role_id} onChange={(e) => setFormData({...formData, role_id: Number(e.target.value)})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]">
                   <option value={1}>Superuser</option>
                   <option value={2}>Admin</option>
                   <option value={3}>Staff</option>
                   <option value={4}>Student</option>
                 </select>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 uppercase tracking-wider">Cancel</button>
                 <button type="submit" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-bold uppercase tracking-wider">Save User</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* --- EDIT USER MODAL OVERLAY --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-gray-300 rounded-none shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
              <h3 className="font-bold text-gray-800 uppercase tracking-wider">Edit User Profile</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800 font-bold text-lg">X</button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name</label>
                  <input type="text" required value={editFormData.first_name} onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name</label>
                  <input type="text" required value={editFormData.last_name} onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input type="email" required value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">System Role</label>
                <select value={editFormData.role_id} onChange={(e) => setEditFormData({...editFormData, role_id: Number(e.target.value)})} className="w-full p-2 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C]">
                  <option value={1}>Superuser</option>
                  <option value={2}>Admin</option>
                  <option value={3}>Staff</option>
                  <option value={4}>Student</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 uppercase tracking-wider hover:bg-gray-100">Cancel</button>
                 <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};