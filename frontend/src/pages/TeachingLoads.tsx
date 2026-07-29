// src/pages/TeachingLoads.tsx
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { BookOpen, Plus, Trash2, Edit, X, Search, ChevronDown, ChevronUp, MapPin, Clock, UserCheck } from 'lucide-react';

// Reusing the CustomSelect for consistent dropdowns
const CustomSelect = ({ value, onChange, options, className = "h-[42px]" }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative w-full ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors shadow-sm">
        <span className={`truncate mr-2 ${selected ? 'text-gray-900' : 'text-gray-500'}`}>{selected?.label || 'Select...'}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-[100] w-full bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden max-h-60 overflow-y-auto">
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${opt.value === value ? 'bg-red-50 text-[#9B1C1C] font-semibold border-l-2 border-[#9B1C1C]' : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'}`}>
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const TeachingLoads: React.FC = () => {
  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const initialForm = { instructor_name: '', subject_code: '', subject_title: '', units: 3, schedule: '', room: '', semester: '1st Semester' };
  const [formData, setFormData] = useState(initialForm);
  const [editData, setEditData] = useState({ id: 0, ...initialForm });

  const fetchLoads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/teaching-loads`);
      if (res.ok) setLoads(await res.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLoads(); }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/teaching-loads`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (res.ok) { setIsCreateModalOpen(false); setFormData(initialForm); fetchLoads(); }
    } catch (error) { console.error(error); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/teaching-loads/${editData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData)
      });
      if (res.ok) { setIsEditModalOpen(false); fetchLoads(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this teaching load?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/teaching-loads/${id}`, { method: 'DELETE' });
      fetchLoads();
    } catch (error) { console.error(error); }
  };

  const filteredLoads = loads.filter(item => 
    item.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.subject_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <PortalLayout pageTitle="Teaching Loads">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search instructor, subject code or title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10 shadow-sm`} />
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto h-[42px] bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 text-sm font-medium rounded-md flex items-center justify-center transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Assign Load
        </button>
      </div>

      <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden pb-10 md:pb-0">
        
        {/* MOBILE VIEW */}
        <div className="md:hidden flex flex-col gap-3 pb-6">
          {filteredLoads.length === 0 ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">No teaching loads assigned.</div>
          ) : (
            filteredLoads.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 flex gap-4 items-start">
                  <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-md w-14 h-14 shrink-0 mt-0.5">
                    <BookOpen className="w-6 h-6 text-[#9B1C1C]" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-[#9B1C1C] uppercase font-bold bg-red-50 w-max px-2 py-0.5 rounded mb-1">{item.subject_code}</span>
                    <span className="font-bold text-gray-900 text-base leading-snug">{item.subject_title}</span>
                    <span className="text-xs font-semibold text-gray-700 flex items-center mt-1.5"><UserCheck className="w-3.5 h-3.5 mr-1 text-gray-400" /> {item.instructor_name}</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                       <span className="text-[10px] text-gray-600 flex items-center"><Clock className="w-3 h-3 mr-1 text-gray-400" /> {item.schedule}</span>
                       <span className="text-[10px] text-gray-600 flex items-center"><MapPin className="w-3 h-3 mr-1 text-gray-400" /> {item.room}</span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50/50 flex justify-end gap-2 border-t border-gray-100">
                  <button onClick={() => { setEditData(item); setIsEditModalOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"><Edit className="w-3.5 h-3.5" /> Edit</button>
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
              <th className="px-6 py-3 font-semibold">Subject & Title</th>
              <th className="px-6 py-3 font-semibold w-56">Instructor</th>
              <th className="px-6 py-3 font-semibold w-64">Schedule & Room</th>
              <th className="px-6 py-3 font-semibold w-32 text-center">Semester</th>
              <th className="px-6 py-3 font-semibold w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
            {filteredLoads.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium text-sm">No teaching loads registered.</td></tr>
            ) : (
              filteredLoads.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#9B1C1C] text-xs">{item.subject_code} ({item.units} Units)</span>
                      <span className="font-semibold text-gray-900">{item.subject_title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-800 align-middle font-medium">{item.instructor_name}</td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-700 flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> {item.schedule}</span>
                      <span className="text-xs text-gray-700 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400" /> {item.room}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center align-middle">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded text-[10px] font-bold uppercase border border-gray-200">{item.semester}</span>
                  </td>
                  <td className="px-6 py-4 text-center align-middle">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => { setEditData(item); setIsEditModalOpen(true); }} className="p-1.5 rounded border border-transparent text-gray-400 hover:text-[#9B1C1C] hover:bg-white hover:border-gray-200 transition-colors"><Edit className="w-4 h-4" /></button>
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
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><BookOpen className="w-5 h-5 mr-2 text-gray-500" /> Assign Teaching Load</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form id="createLoadForm" onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Instructor Name *</label>
                <input type="text" value={formData.instructor_name} onChange={(e) => setFormData({...formData, instructor_name: e.target.value})} required className={inputClass} placeholder="e.g. Dr. Roberto M. Sala" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Code *</label>
                  <input type="text" value={formData.subject_code} onChange={(e) => setFormData({...formData, subject_code: e.target.value})} required className={inputClass} placeholder="IT 311" />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject Title *</label>
                  <input type="text" value={formData.subject_title} onChange={(e) => setFormData({...formData, subject_title: e.target.value})} required className={inputClass} placeholder="Systems Integration and Architecture" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 mt-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Schedule *</label>
                  <input type="text" value={formData.schedule} onChange={(e) => setFormData({...formData, schedule: e.target.value})} required className={inputClass} placeholder="e.g. MWF 9:00AM - 10:00AM" />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Units</label>
                  <input type="number" value={formData.units} onChange={(e) => setFormData({...formData, units: parseInt(e.target.value) || 0})} required className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Room / Lab *</label>
                  <input type="text" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} required className={inputClass} placeholder="e.g. Room 101" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Semester</label>
                  <CustomSelect 
                    value={formData.semester} 
                    onChange={(val) => setFormData({...formData, semester: val})} 
                    options={[{value: '1st Semester', label: '1st Semester'}, {value: '2nd Semester', label: '2nd Semester'}, {value: 'Summer', label: 'Summer'}]} 
                  />
                </div>
              </div>
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" form="createLoadForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm">Save Load</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Edit className="w-5 h-5 mr-2 text-gray-500" /> Edit Teaching Load</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form id="editLoadForm" onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Instructor Name *</label>
                <input type="text" value={editData.instructor_name} onChange={(e) => setEditData({...editData, instructor_name: e.target.value})} required className={inputClass} />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Code *</label>
                  <input type="text" value={editData.subject_code} onChange={(e) => setEditData({...editData, subject_code: e.target.value})} required className={inputClass} />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject Title *</label>
                  <input type="text" value={editData.subject_title} onChange={(e) => setEditData({...editData, subject_title: e.target.value})} required className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4 mt-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Schedule *</label>
                  <input type="text" value={editData.schedule} onChange={(e) => setEditData({...editData, schedule: e.target.value})} required className={inputClass} />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Units</label>
                  <input type="number" value={editData.units} onChange={(e) => setEditData({...editData, units: parseInt(e.target.value) || 0})} required className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Room / Lab *</label>
                  <input type="text" value={editData.room} onChange={(e) => setEditData({...editData, room: e.target.value})} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Semester</label>
                  <CustomSelect 
                    value={editData.semester} 
                    onChange={(val) => setEditData({...editData, semester: val})} 
                    options={[{value: '1st Semester', label: '1st Semester'}, {value: '2nd Semester', label: '2nd Semester'}, {value: 'Summer', label: 'Summer'}]} 
                  />
                </div>
              </div>
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" form="editLoadForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};