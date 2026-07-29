// src/pages/OfficialsManager.tsx
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { Users, Plus, Trash2, Edit, X, Search, Upload, Shield } from 'lucide-react';

export const OfficialsManager: React.FC = () => {
  const [officials, setOfficials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', title: '', rank_order: 0, image: null as File | null });
  const [editData, setEditData] = useState({ id: 0, name: '', title: '', rank_order: 0, image: null as File | null, existing_image_url: '' });

  const fetchOfficials = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/administrators`);
      if (res.ok) setOfficials(await res.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOfficials(); }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('title', formData.title);
    data.append('rank_order', formData.rank_order.toString());
    if (formData.image) data.append('image', formData.image);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/administrators`, {
        method: 'POST', body: data
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setFormData({ name: '', title: '', rank_order: 0, image: null });
        fetchOfficials();
      }
    } catch (error) { console.error(error); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', editData.name);
    data.append('title', editData.title);
    data.append('rank_order', editData.rank_order.toString());
    if (editData.image) data.append('image', editData.image);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/administrators/${editData.id}`, {
        method: 'PUT', body: data
      });
      if (res.ok) { 
        setIsEditModalOpen(false); 
        fetchOfficials(); 
      }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this official?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/administrators/${id}`, { method: 'DELETE' });
      fetchOfficials();
    } catch (error) { console.error(error); }
  };

  const openEditModal = (item: any) => {
    setEditData({ 
      id: item.id, 
      name: item.name, 
      title: item.title, 
      rank_order: item.rank_order, 
      image: null,
      existing_image_url: item.image_url 
    });
    setIsEditModalOpen(true);
  };

  const filteredOfficials = officials.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <PortalLayout pageTitle="Manage Key Officials">
      
      {/* HEADER CONTROLS (Matched to CalendarManager) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search officials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10 shadow-sm`} />
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto h-[42px] bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 text-sm font-medium rounded-md flex items-center justify-center transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Official
        </button>
      </div>

      <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden pb-10 md:pb-0">
        
        {/* MOBILE VIEW */}
        <div className="md:hidden flex flex-col gap-3 pb-6">
          {filteredOfficials.length === 0 ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">No officials found.</div>
          ) : (
            filteredOfficials.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                     <img 
                        src={item.image_url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL}${item.image_url}` : item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                     />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-gray-900 text-sm leading-snug truncate">{item.name}</span>
                    <span className="text-xs font-semibold text-[#9B1C1C] mt-0.5 truncate">{item.title}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold mt-1 bg-gray-100 w-max px-2 py-0.5 rounded">Rank: {item.rank_order}</span>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50/50 flex justify-end gap-2 border-t border-gray-100">
                  <button onClick={() => openEditModal(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"><Edit className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded shadow-sm text-red-700 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3 font-semibold w-24 text-center">Photo</th>
              <th className="px-6 py-3 font-semibold">Official Name</th>
              <th className="px-6 py-3 font-semibold w-64">Job Title</th>
              <th className="px-6 py-3 font-semibold w-32 text-center">Display Rank</th>
              <th className="px-6 py-3 font-semibold w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
            {filteredOfficials.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium text-sm">No officials registered in the system.</td></tr>
            ) : (
              filteredOfficials.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-3 align-middle text-center flex justify-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 group-hover:border-[#9B1C1C] transition-colors">
                       <img 
                          src={item.image_url.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL}${item.image_url}` : item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                       />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 align-middle">{item.name}</td>
                  <td className="px-6 py-4 text-[#9B1C1C] align-middle text-xs font-bold">{item.title}</td>
                  <td className="px-6 py-4 text-center align-middle">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-xs font-bold border border-gray-200">{item.rank_order}</span>
                  </td>
                  <td className="px-6 py-4 text-center align-middle">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 rounded border border-transparent text-gray-400 hover:text-[#9B1C1C] hover:bg-white hover:border-gray-200 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded border border-transparent text-gray-400 hover:text-red-600 hover:bg-white hover:border-gray-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Users className="w-5 h-5 mr-2 text-gray-500" /> Add Official</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form id="createOfficialForm" onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className={inputClass} placeholder="e.g. Dr. Juan Dela Cruz" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Job Title / Position *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className={inputClass} placeholder="e.g. Campus Administrator" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Display Rank</label>
                  <input type="number" value={formData.rank_order} onChange={(e) => setFormData({...formData, rank_order: parseInt(e.target.value) || 0})} required className={inputClass} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Profile Photo (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <input type="file" accept="image/*" onChange={e => setFormData({...formData, image: e.target.files?.[0] || null})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs font-medium text-gray-600">{formData.image ? formData.image.name : 'Click to upload a photo'}</span>
                </div>
              </div>
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm">Cancel</button>
              <button type="submit" form="createOfficialForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm transition-colors">Save Official</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Edit className="w-5 h-5 mr-2 text-gray-500" /> Edit Official</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form id="editOfficialForm" onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
                <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} required className={inputClass} />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Job Title / Position *</label>
                  <input type="text" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} required className={inputClass} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Display Rank</label>
                  <input type="number" value={editData.rank_order} onChange={(e) => setEditData({...editData, rank_order: parseInt(e.target.value) || 0})} required className={inputClass} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Update Photo (Leave empty to keep current)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <input type="file" accept="image/*" onChange={e => setEditData({...editData, image: e.target.files?.[0] || null})} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-xs font-medium text-gray-600">{editData.image ? editData.image.name : 'Click to upload new photo'}</span>
                </div>
              </div>
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm">Cancel</button>
              <button type="submit" form="editOfficialForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};