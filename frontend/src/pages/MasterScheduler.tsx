// src/pages/MasterScheduler.tsx
import React, { useState } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { 
  Zap, Calendar, Database, Settings, Download, Upload, 
  Search, Plus, Filter, Users, BookOpen, MapPin, Layers,
  Play, X, Edit, Trash2
} from 'lucide-react';

export const MasterScheduler: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'timetable' | 'registries'>('timetable');
  const [activeRegistry, setActiveRegistry] = useState<'subjects' | 'faculty' | 'sections' | 'rooms'>('subjects');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Engine Configuration State
  const [settings, setSettings] = useState({ lec_hours_per_unit: 1, lab_hours_per_unit: 3 });

  // --- DYNAMIC WMSU DATA REGISTRIES ---
  const [subjects, setSubjects] = useState([
    { code: 'CC 100', title: 'Introduction to Computing', lec: 2, lab: 1 },
    { code: 'CC 101', title: 'Computer Programming 1', lec: 2, lab: 1 },
    { code: 'MATH 100', title: 'Mathematics in the Modern World', lec: 3, lab: 0 }
  ]);

  const [faculty, setFaculty] = useState([
    { id: 'T1', name: 'Mark Kevin Sanig', subjects: 'CC 100', limit: 30 },
    { id: 'T2', name: 'Mark Fuji Fajiculay', subjects: 'CC 101, CS 102', limit: 40 },
    { id: 'T4', name: 'Jessie James Awid', subjects: 'MATH 100', limit: 30 }
  ]);

  const [sections, setSections] = useState([
    { code: 'BSCS 1A', name: 'BSCS 1A', level: 1, students: 50 },
    { code: 'BSCS 1B', name: 'BSCS 1B', level: 1, students: 50 }
  ]);

  const [rooms, setRooms] = useState([
    { id: 'L1R1', name: 'L1R1', capacity: 50, type: 'Classroom' },
    { id: 'COMLAB', name: 'COMLAB', capacity: 50, type: 'Laboratory' }
  ]);

  const [schedule, setSchedule] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});

  // --- CORE FUNCTIONS ---
  const handleGenerate = () => {
    if (!window.confirm("Initialize WMSU scheduling algorithm? This will process all constraints and overwrite the current timetable.")) return;
    setLoading(true);
    
    // Simulate generation algorithm, then populate timetable
    setTimeout(() => {
      setLoading(false);
      setSchedule([
        { day: 'Monday', time: '07:00 - 09:00', section: 'BSCS 1A', code: 'CC 100', title: 'Introduction to Computing', type: 'Lecture', faculty: 'Mark Kevin Sanig', room: 'L1R1' },
        { day: 'Wednesday', time: '10:30 - 12:00', section: 'BSCS 1A', code: 'CC 101', title: 'Computer Programming 1', type: 'Lecture', faculty: 'Mark Fuji Fajiculay', room: 'L1R1' },
        { day: 'Thursday', time: '13:00 - 16:00', section: 'BSCS 1B', code: 'CC 101', title: 'Computer Programming 1', type: 'Laboratory', faculty: 'Mark Fuji Fajiculay', room: 'COMLAB' },
        { day: 'Friday', time: '13:00 - 16:00', section: 'BSCS 1A', code: 'CC 100', title: 'Introduction to Computing', type: 'Laboratory', faculty: 'Mark Kevin Sanig', room: 'COMLAB' }
      ]);
      setActiveTab('timetable');
    }, 2500);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRegistry === 'subjects') setSubjects([...subjects, formData]);
    if (activeRegistry === 'faculty') setFaculty([...faculty, formData]);
    if (activeRegistry === 'sections') setSections([...sections, formData]);
    if (activeRegistry === 'rooms') setRooms([...rooms, formData]);
    
    setFormData({});
    setIsAddModalOpen(false);
  };

  const handleDelete = (registry: string, identifier: string) => {
    if(!window.confirm(`Are you sure you want to remove ${identifier} from the institutional registry?`)) return;
    if (registry === 'subjects') setSubjects(subjects.filter(s => s.code !== identifier));
    if (registry === 'faculty') setFaculty(faculty.filter(f => f.id !== identifier));
    if (registry === 'sections') setSections(sections.filter(s => s.code !== identifier));
    if (registry === 'rooms') setRooms(rooms.filter(r => r.id !== identifier));
  };

  const openAddModal = () => {
    setFormData({});
    setIsAddModalOpen(true);
  };

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <PortalLayout pageTitle="Academic Scheduling Engine">
      
      {/* FULL-SCREEN LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[100] flex items-center justify-center flex-col">
          <div className="relative flex justify-center items-center mb-6">
            <div className="absolute animate-ping w-20 h-20 bg-red-100 rounded-full" />
            <div className="w-16 h-16 border-4 border-gray-100 border-t-[#9B1C1C] rounded-full animate-spin relative z-10" />
            <Zap className="w-6 h-6 text-[#9B1C1C] absolute z-20" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Timetable...</h3>
          <p className="text-sm font-medium text-gray-500 mt-2">Resolving institutional constraints & faculty collisions.</p>
        </div>
      )}

      {/* HEADER & GLOBAL CONTROLS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        
        {/* Sleek Segmented Control */}
        <div className="bg-white border border-gray-200 p-1 rounded-lg inline-flex shadow-sm w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center justify-center px-6 py-2 text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap ${
              activeTab === 'timetable' ? 'bg-red-50 text-[#9B1C1C] shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" /> Timetable
          </button>
          <button
            onClick={() => setActiveTab('registries')}
            className={`flex items-center justify-center px-6 py-2 text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap ${
              activeTab === 'registries' ? 'bg-red-50 text-[#9B1C1C] shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Database className="w-4 h-4 mr-2" /> Directories
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full lg:w-auto shrink-0">
          <button onClick={() => setIsSettingsModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center h-[42px] px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center h-[42px] px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Upload className="w-4 h-4 mr-2 text-gray-400" /> Load JSON
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center h-[42px] px-4 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Download className="w-4 h-4 mr-2 text-gray-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OFFICIAL MASTER TIMETABLE                          */}
      {/* ========================================================= */}
      {activeTab === 'timetable' && (
        <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden pb-10 md:pb-0">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-0 md:p-4 bg-transparent md:bg-gray-50/50 border-b border-gray-200">
            <div className="flex gap-2 w-full md:w-auto">
              <select className={`${inputClass} w-full md:w-40 font-medium text-gray-700`}>
                <option>All Days</option>
                <option>Monday</option>
                <option>Tuesday</option>
              </select>
              <select className={`${inputClass} w-full md:w-40 font-medium text-gray-700`}>
                <option>All Sections</option>
                <option>BSCS 1A</option>
                <option>BSCS 1B</option>
              </select>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Live search schedule..." className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px] hidden md:table">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Time Allotment</th>
                  <th className="px-6 py-3 w-28">Section</th>
                  <th className="px-6 py-3">Course Block</th>
                  <th className="px-6 py-3 w-24 text-center">Format</th>
                  <th className="px-6 py-3 w-48">Instructor</th>
                  <th className="px-6 py-3 w-32">Location</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
                {schedule.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">No timetable generated. Navigate to 'Directories' to run the engine.</td></tr>
                ) : (
                  schedule.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 align-middle whitespace-nowrap">
                        <div className="font-bold text-gray-900">{entry.day}</div>
                        <div className="text-xs text-gray-500 font-medium">{entry.time}</div>
                      </td>
                      <td className="px-6 py-4 font-black text-[#9B1C1C] align-middle">{entry.section}</td>
                      <td className="px-6 py-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{entry.code}</span>
                          <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{entry.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center align-middle">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border ${entry.type === 'Lecture' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800 align-middle">{entry.faculty}</td>
                      <td className="px-6 py-4 font-black text-gray-700 align-middle">{entry.room}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ACADEMIC REGISTRIES                                */}
      {/* ========================================================= */}
      {activeTab === 'registries' && (
        <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden pb-10 md:pb-0">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-0 md:p-4 bg-transparent md:bg-gray-50/50 border-b border-gray-200 gap-4">
            
            {/* Inner Tabs for Registries */}
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 md:pb-0">
              <SubNavTab label="Subjects" icon={<BookOpen />} isActive={activeRegistry === 'subjects'} onClick={() => setActiveRegistry('subjects')} />
              <SubNavTab label="Faculty" icon={<Users />} isActive={activeRegistry === 'faculty'} onClick={() => setActiveRegistry('faculty')} />
              <SubNavTab label="Blocks" icon={<Layers />} isActive={activeRegistry === 'sections'} onClick={() => setActiveRegistry('sections')} />
              <SubNavTab label="Rooms" icon={<MapPin />} isActive={activeRegistry === 'rooms'} onClick={() => setActiveRegistry('rooms')} />
            </div>

            {/* Powerful Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input type="text" placeholder={`Search ${activeRegistry}...`} className={`${inputClass} pl-10`} />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={openAddModal} className="flex-1 sm:flex-none flex items-center justify-center h-[42px] px-4 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">
                  <Plus className="w-4 h-4 mr-1.5" /> Add
                </button>
                <button onClick={handleGenerate} className="flex-1 sm:flex-none flex items-center justify-center h-[42px] px-6 bg-[#9B1C1C] hover:bg-[#7a1515] text-white rounded-md text-sm font-bold shadow-sm transition-colors uppercase tracking-wide">
                  <Play className="w-4 h-4 mr-2" /> Generate
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px] hidden md:table">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Code / ID</th>
                  <th className="px-6 py-3">Description / Name</th>
                  <th className="px-6 py-3 w-48">Attributes</th>
                  <th className="px-6 py-3 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
                
                {/* --- RENDER SUBJECTS --- */}
                {activeRegistry === 'subjects' && subjects.map((sub, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 align-middle">{sub.code}</td>
                    <td className="px-6 py-4 font-medium text-gray-700 align-middle">{sub.title}</td>
                    <td className="px-6 py-4 align-middle">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold mr-1.5 border border-gray-200">{sub.lec} Lec</span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold border border-gray-200">{sub.lab} Lab</span>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      <button onClick={() => handleDelete('subjects', sub.code)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}

                {/* --- RENDER FACULTY --- */}
                {activeRegistry === 'faculty' && faculty.map((fac, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 align-middle">{fac.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-700 align-middle">{fac.name}</td>
                    <td className="px-6 py-4 align-middle text-xs text-gray-500 font-medium truncate max-w-[200px]">{fac.subjects}</td>
                    <td className="px-6 py-4 text-center align-middle">
                      <button onClick={() => handleDelete('faculty', fac.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}

                {/* --- RENDER SECTIONS --- */}
                {activeRegistry === 'sections' && sections.map((sec, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 align-middle">{sec.code}</td>
                    <td className="px-6 py-4 font-medium text-gray-700 align-middle">{sec.name}</td>
                    <td className="px-6 py-4 align-middle text-xs font-bold text-gray-600">{sec.students} Students</td>
                    <td className="px-6 py-4 text-center align-middle">
                      <button onClick={() => handleDelete('sections', sec.code)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}

                {/* --- RENDER ROOMS --- */}
                {activeRegistry === 'rooms' && rooms.map((rm, i) => (
                  <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 align-middle">{rm.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-700 align-middle">{rm.name}</td>
                    <td className="px-6 py-4 align-middle">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-bold mr-1.5 border border-gray-200 uppercase">{rm.type}</span>
                      <span className="text-xs font-bold text-gray-500">{rm.capacity} Cap</span>
                    </td>
                    <td className="px-6 py-4 text-center align-middle">
                      <button onClick={() => handleDelete('rooms', rm.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD DYNAMIC REGISTRY ENTRY                         */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white max-w-md w-full rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base flex items-center capitalize">
                <Plus className="w-5 h-5 mr-2 text-gray-500" /> New {activeRegistry.slice(0,-1)} Entry
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-200 rounded transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            <form id="addEntryForm" onSubmit={handleAddSubmit} className="p-6 space-y-4">
              
              {/* SUBJECT INPUTS */}
              {activeRegistry === 'subjects' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Course Code *</label>
                    <input type="text" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className={inputClass} placeholder="e.g. IT 311" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Descriptive Title *</label>
                    <input type="text" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className={inputClass} placeholder="Systems Integration" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Lecture Units</label>
                      <input type="number" required value={formData.lec || ''} onChange={e => setFormData({...formData, lec: parseInt(e.target.value) || 0})} className={inputClass} min="0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Lab Units</label>
                      <input type="number" required value={formData.lab || ''} onChange={e => setFormData({...formData, lab: parseInt(e.target.value) || 0})} className={inputClass} min="0" />
                    </div>
                  </div>
                </>
              )}

              {/* FACULTY INPUTS */}
              {activeRegistry === 'faculty' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Faculty ID *</label>
                    <input type="text" required value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} className={inputClass} placeholder="e.g. T5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Full Name *</label>
                    <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="e.g. Dr. Juan Dela Cruz" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Authorized Subjects (Comma Separated)</label>
                    <input type="text" required value={formData.subjects || ''} onChange={e => setFormData({...formData, subjects: e.target.value})} className={inputClass} placeholder="e.g. CC 100, IT 311" />
                  </div>
                </>
              )}

              {/* SECTION INPUTS */}
              {activeRegistry === 'sections' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Section Code *</label>
                    <input type="text" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className={inputClass} placeholder="e.g. BSIT 2A" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Year Level</label>
                      <input type="number" required value={formData.level || ''} onChange={e => setFormData({...formData, level: parseInt(e.target.value) || 1})} className={inputClass} min="1" max="5" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Student Count</label>
                      <input type="number" required value={formData.students || ''} onChange={e => setFormData({...formData, students: parseInt(e.target.value) || 0})} className={inputClass} min="1" />
                    </div>
                  </div>
                </>
              )}

              {/* ROOMS INPUTS */}
              {activeRegistry === 'rooms' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Room Designation *</label>
                    <input type="text" required value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} className={inputClass} placeholder="e.g. L2R5" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Capacity</label>
                      <input type="number" required value={formData.capacity || ''} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} className={inputClass} min="1" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">Type</label>
                      <select required value={formData.type || 'Classroom'} onChange={e => setFormData({...formData, type: e.target.value})} className={`${inputClass} text-gray-700`}>
                        <option>Classroom</option>
                        <option>Laboratory</option>
                        <option>Gym</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

            </form>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors">Cancel</button>
              <button type="submit" form="addEntryForm" className="px-6 py-2 text-sm font-medium text-white bg-[#9B1C1C] hover:bg-[#7a1515] rounded-md shadow-sm transition-colors">Save Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: INSTITUTIONAL SETTINGS                             */}
      {/* ========================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-900 text-base flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-500" /> Institutional Constraints
              </h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-200 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Unit Conversion Equivalencies</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Hours per Lecture Unit</label>
                    <input type="number" value={settings.lec_hours_per_unit} onChange={(e) => setSettings({...settings, lec_hours_per_unit: Number(e.target.value)})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Hours per Lab Unit</label>
                    <input type="number" value={settings.lab_hours_per_unit} onChange={(e) => setSettings({...settings, lab_hours_per_unit: Number(e.target.value)})} className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Advanced Engine Rules</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#9B1C1C] hover:shadow-sm transition-all group">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-[#9B1C1C]">Configure Merged Sections</span>
                      <span className="text-xs text-gray-500 mt-0.5">Combine multiple sections for specific subjects.</span>
                    </div>
                  </button>
                  <button className="w-full flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#9B1C1C] hover:shadow-sm transition-all group">
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-[#9B1C1C]">Configure 1-Day Blocks</span>
                      <span className="text-xs text-gray-500 mt-0.5">Force subjects to render in a single continuous session.</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button onClick={() => setIsSettingsModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors">
                Cancel
              </button>
              <button onClick={() => setIsSettingsModalOpen(false)} className="px-6 py-2 text-sm font-medium text-white bg-[#9B1C1C] hover:bg-[#7a1515] rounded-md shadow-sm transition-colors">
                Save Rules
              </button>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};

// --- SLEEK UI COMPONENTS ---

const SubNavTab = ({ label, icon, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap border ${
      isActive 
        ? 'bg-[#9B1C1C]/10 text-[#9B1C1C] border-[#9B1C1C]/20 shadow-sm' 
        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
    }`}
  >
    {React.cloneElement(icon, { className: "w-3.5 h-3.5 mr-1.5" })}
    {label}
  </button>
);