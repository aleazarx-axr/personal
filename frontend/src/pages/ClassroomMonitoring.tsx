// src/pages/ClassroomMonitoring.tsx
import React, { useState, useEffect } from 'react';
import { Monitor, Plus, Trash2, Edit, X, Search, ChevronDown, ChevronUp, MapPin, Users } from 'lucide-react';
import { UnderDevelopment } from '../components/UnderDevelopment';

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

export const ClassroomMonitoring: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("portalUser") || "{}");
  if (user.role !== "Superuser") return <UnderDevelopment />;

  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const initialForm = { room_number: '', building: '', capacity: 30, status: 'Available', remarks: '' };
  const [formData, setFormData] = useState(initialForm);
  const [editData, setEditData] = useState({ id: 0, ...initialForm });

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classrooms`);
      if (res.ok) setClassrooms(await res.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClassrooms(); }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classrooms`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      if (res.ok) { setIsCreateModalOpen(false); setFormData(initialForm); fetchClassrooms(); }
    } catch (error) { console.error(error); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classrooms/${editData.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editData)
      });
      if (res.ok) { setIsEditModalOpen(false); fetchClassrooms(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this classroom?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/classrooms/${id}`, { method: 'DELETE' });
      fetchClassrooms();
    } catch (error) { console.error(error); }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Available': return <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-full border border-green-200">Available</span>;
      case 'Occupied': return <span className="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded-full border border-red-200">Occupied</span>;
      case 'Maintenance': return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-[10px] font-bold uppercase rounded-full border border-orange-200">Maintenance</span>;
      default: return null;
    }
  };

  const filteredClassrooms = classrooms.filter(item => 
    item.room_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <>
      
      {/* HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search room or building..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10 shadow-sm`} />
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto h-[42px] bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 text-sm font-medium rounded-md flex items-center justify-center transition-colors shadow-sm shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Add Classroom
        </button>
      </div>

      <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden pb-10 md:pb-0">
        
        {/* MOBILE VIEW */}
        <div className="md:hidden flex flex-col gap-3 pb-6">
          {filteredClassrooms.length === 0 ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">No classrooms found.</div>
          ) : (
            filteredClassrooms.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 flex gap-4 items-start">
                  <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-md w-14 h-14 shrink-0 mt-0.5">
                    <Monitor className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900 text-base leading-snug">{item.room_number}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <span className="text-xs text-gray-600 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {item.building}</span>
                    <span className="text-xs text-gray-600 flex items-center mt-1"><Users className="w-3.5 h-3.5 mr-1 text-gray-400" /> Capacity: {item.capacity}</span>
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
              <th className="px-6 py-3 font-semibold">Room Name / Number</th>
              <th className="px-6 py-3 font-semibold w-64">Building / Location</th>
              <th className="px-6 py-3 font-semibold w-32 text-center">Capacity</th>
              <th className="px-6 py-3 font-semibold w-40 text-center">Status</th>
              <th className="px-6 py-3 font-semibold w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
            {filteredClassrooms.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500 font-medium text-sm">No classrooms registered.</td></tr>
            ) : (
              filteredClassrooms.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 font-bold text-gray-900 align-middle">
                    <div className="flex flex-col">
                      <span>{item.room_number}</span>
                      {item.remarks && <span className="text-[10px] text-gray-500 font-normal mt-0.5 truncate max-w-[200px]">{item.remarks}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 align-middle text-sm font-medium">{item.building}</td>
                  <td className="px-6 py-4 text-center align-middle font-semibold text-gray-700">{item.capacity}</td>
                  <td className="px-6 py-4 text-center align-middle">{getStatusBadge(item.status)}</td>
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
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Monitor className="w-5 h-5 mr-2 text-gray-500" /> Add Classroom</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form id="createRoomForm" onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Room Name/Number *</label>
                  <input type="text" value={formData.room_number} onChange={(e) => setFormData({...formData, room_number: e.target.value})} required className={inputClass} placeholder="e.g. Lab A" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Capacity</label>
                  <input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Building / Location *</label>
                <input type="text" value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} required className={inputClass} placeholder="e.g. IT Building" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Remarks / Details</label>
                <input type="text" value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} className={inputClass} placeholder="Equipment status, notes, etc." />
              </div>
              {/* Dropdown placed at bottom to allow it to open upwards safely */}
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Current Status</label>
                <CustomSelect 
                  value={formData.status} 
                  onChange={(val) => setFormData({...formData, status: val})} 
                  options={[{value: 'Available', label: 'Available'}, {value: 'Occupied', label: 'Occupied'}, {value: 'Maintenance', label: 'Under Maintenance'}]} 
                />
              </div>
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" form="createRoomForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm">Save Classroom</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Edit className="w-5 h-5 mr-2 text-gray-500" /> Edit Classroom</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form id="editRoomForm" onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Room Name/Number *</label>
                  <input type="text" value={editData.room_number} onChange={(e) => setEditData({...editData, room_number: e.target.value})} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Capacity</label>
                  <input type="number" value={editData.capacity} onChange={(e) => setEditData({...editData, capacity: parseInt(e.target.value) || 0})} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Building / Location *</label>
                <input type="text" value={editData.building} onChange={(e) => setEditData({...editData, building: e.target.value})} required className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Remarks / Details</label>
                <input type="text" value={editData.remarks} onChange={(e) => setEditData({...editData, remarks: e.target.value})} className={inputClass} />
              </div>
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Current Status</label>
                <CustomSelect 
                  value={editData.status} 
                  onChange={(val) => setEditData({...editData, status: val})} 
                  options={[{value: 'Available', label: 'Available'}, {value: 'Occupied', label: 'Occupied'}, {value: 'Maintenance', label: 'Under Maintenance'}]} 
                />
              </div>
            </form>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
              <button type="submit" form="editRoomForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};