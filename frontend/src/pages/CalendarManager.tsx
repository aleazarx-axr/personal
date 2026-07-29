// src/pages/CalendarManager.tsx
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { Calendar, Plus, Trash2, Edit, X, Search, ChevronDown, ChevronUp } from 'lucide-react';

// --- FIXED CUSTOM OVERLAY DROPDOWN ---
// This version is designed to pop UPWARDS (bottom-full) to prevent clipping at the bottom of modals
const CustomSelect = ({ value, onChange, options, className = "h-[42px]" }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative w-full ${className}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors shadow-sm`}
      >
        <span className={`truncate mr-2 ${selected ? 'text-gray-900' : 'text-gray-500'}`}>{selected?.label || 'Select...'}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />}
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          {/* Changed to 'bottom-full mb-1' so it expands UPWARDS from the input box */}
          <div className="absolute z-[100] w-full bottom-full mb-1 left-0 bg-white border border-gray-200 rounded-md shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
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

// Smart Date Formatter Helper
export const formatDateRange = (startStr: string, endStr: string | null) => {
  const start = new Date(startStr);
  const startMonth = start.toLocaleString('default', { month: 'short' });
  const startDay = start.getDate();

  if (!endStr) return `${startMonth} ${startDay}, ${start.getFullYear()}`;

  const end = new Date(endStr);
  const endMonth = end.toLocaleString('default', { month: 'short' });
  const endDay = end.getDate();

  if (start.getTime() === end.getTime()) return `${startMonth} ${startDay}, ${start.getFullYear()}`;
  
  if (startMonth === endMonth && start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${startDay} - ${endDay}, ${start.getFullYear()}`;
  }
  
  if (start.getFullYear() === end.getFullYear()) {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${start.getFullYear()}`;
  }

  return `${startMonth} ${startDay}, ${start.getFullYear()} - ${endMonth} ${endDay}, ${end.getFullYear()}`;
};

export const CalendarManager: React.FC = () => {
  const [dates, setDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', target_audience: '', event_date: '', end_date: '' });
  const [editData, setEditData] = useState({ id: 0, title: '', target_audience: '', event_date: '', end_date: '' });

  const fetchDates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/academic-dates`);
      if (res.ok) setDates(await res.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDates(); }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.target_audience) return alert("Please select a target audience.");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/academic-dates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsCreateModalOpen(false);
        setFormData({ title: '', target_audience: '', event_date: '', end_date: '' });
        fetchDates();
      }
    } catch (error) { console.error(error); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/academic-dates/${editData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData)
      });
      if (res.ok) { setIsEditModalOpen(false); fetchDates(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/academic-dates/${id}`, { method: 'DELETE' });
      fetchDates();
    } catch (error) { console.error(error); }
  };

  const openEditModal = (item: any) => {
    const formattedDate = new Date(item.event_date).toISOString().split('T')[0];
    const formattedEndDate = item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '';
    setEditData({ id: item.id, title: item.title, target_audience: item.target_audience, event_date: formattedDate, end_date: formattedEndDate });
    setIsEditModalOpen(true);
  };

  const filteredDates = dates.filter(item => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <PortalLayout pageTitle="Academic Calendar">
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10 shadow-sm`} />
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto h-[42px] bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 text-sm font-medium rounded-md flex items-center justify-center transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Calendar Event
        </button>
      </div>

      <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden pb-10 md:pb-0">
        
        {/* MOBILE VIEW */}
        <div className="md:hidden flex flex-col gap-3 pb-6">
          {filteredDates.length === 0 ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">No events found.</div>
          ) : (
            filteredDates.map((item) => {
              const eventDate = new Date(item.event_date);
              return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 flex gap-4 items-start">
                  <div className="flex flex-col items-center justify-center bg-red-50 border border-red-100 rounded-md w-12 h-12 shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#9B1C1C] uppercase">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-extrabold text-[#9B1C1C] leading-none">{eventDate.getDate()}</span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-gray-900 text-sm leading-snug">{item.title}</span>
                    <span className="text-xs font-semibold text-[#9B1C1C] mt-1">{formatDateRange(item.event_date, item.end_date)}</span>
                    <span className="text-xs text-gray-500 mt-1">{item.target_audience}</span>
                  </div>
                </div>
                <div className="px-4 py-3 bg-gray-50/50 flex justify-end gap-2 border-t border-gray-100">
                  <button onClick={() => openEditModal(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm"><Edit className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded shadow-sm text-red-700 bg-white border border-gray-300 hover:bg-red-50 hover:border-red-200"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                </div>
              </div>
            )})
          )}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3 font-semibold w-64">Date(s)</th>
              <th className="px-6 py-3 font-semibold">Event Title</th>
              <th className="px-6 py-3 font-semibold w-56">Target Audience</th>
              <th className="px-6 py-3 font-semibold w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
            {filteredDates.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium text-sm">No events on the calendar.</td></tr>
            ) : (
              filteredDates.map((item) => {
                const eventDate = new Date(item.event_date);
                return (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-md w-10 h-10 shrink-0 group-hover:bg-[#9B1C1C] transition-colors">
                        <span className="text-[9px] font-bold text-gray-500 uppercase group-hover:text-red-100 transition-colors">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-base font-extrabold text-gray-700 leading-none group-hover:text-white transition-colors">{eventDate.getDate()}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{formatDateRange(item.event_date, item.end_date)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 align-middle">{item.title}</td>
                  <td className="px-6 py-4 text-gray-600 align-middle text-xs font-medium">{item.target_audience}</td>
                  <td className="px-6 py-4 text-center align-middle">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 rounded border border-transparent text-gray-400 hover:text-[#9B1C1C] hover:bg-white hover:border-gray-200 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded border border-transparent text-gray-400 hover:text-red-600 hover:bg-white hover:border-gray-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Calendar className="w-5 h-5 mr-2 text-gray-500" /> Add Calendar Event</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form id="createDateForm" onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Event Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className={inputClass} placeholder="e.g. Intramurals Week" />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                <div>
                  <label className="block text-xs font-medium text-[#9B1C1C] mb-1.5">Start Date *</label>
                  <input type="date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">End Date (Optional)</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className={inputClass} />
                </div>
              </div>
              {/* Moved Target Audience below dates so the upward dropdown has room to open */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 mt-2">Target Audience</label>
                <CustomSelect 
                  value={formData.target_audience} 
                  onChange={(val) => setFormData({...formData, target_audience: val})} 
                  options={[
                    {value: 'All students & staff', label: 'All students & staff'}, 
                    {value: 'All undergraduate programs', label: 'All undergraduate programs'}, 
                    {value: 'Graduating students', label: 'Graduating students'}, 
                    {value: 'Faculty & Administration', label: 'Faculty & Administration'}, 
                    {value: 'University-wide holiday', label: 'University-wide holiday'}
                  ]} 
                />
              </div>
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" form="createDateForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm">Save Event</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Edit className="w-5 h-5 mr-2 text-gray-500" /> Edit Event</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form id="editDateForm" onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Event Title</label>
                <input type="text" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-2">
                <div>
                  <label className="block text-xs font-medium text-[#9B1C1C] mb-1.5">Start Date *</label>
                  <input type="date" value={editData.event_date} onChange={(e) => setEditData({...editData, event_date: e.target.value})} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">End Date (Optional)</label>
                  <input type="date" value={editData.end_date} onChange={(e) => setEditData({...editData, end_date: e.target.value})} className={inputClass} />
                </div>
              </div>
              {/* Moved Target Audience below dates so the upward dropdown has room to open */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 mt-2">Target Audience</label>
                <CustomSelect 
                  value={editData.target_audience} 
                  onChange={(val) => setEditData({...editData, target_audience: val})} 
                  options={[
                    {value: 'All students & staff', label: 'All students & staff'}, 
                    {value: 'All undergraduate programs', label: 'All undergraduate programs'}, 
                    {value: 'Graduating students', label: 'Graduating students'}, 
                    {value: 'Faculty & Administration', label: 'Faculty & Administration'}, 
                    {value: 'University-wide holiday', label: 'University-wide holiday'}
                  ]} 
                />
              </div>
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" form="editDateForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};