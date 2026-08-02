// src/pages/AssessmentGenerator.tsx
import React, { useState, useEffect } from 'react';
import { Printer, Loader2, Save, Search, CheckCircle2, AlertCircle, X, Calculator, FileText, ChevronDown, Settings, Upload, Building2, GraduationCap, CreditCard, Tag, Trash2, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { UnderDevelopment } from '../components/UnderDevelopment';

const CustomSelect = ({ value, onChange, options, className = "h-[42px]" }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className={`relative w-full ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className={`w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm flex justify-between items-center cursor-pointer hover:border-gray-400 shadow-sm`}>
        <span className="text-gray-700 truncate mr-2">{selected?.label || value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-[100] w-full top-full mt-1 left-0 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto">
            {options.map(opt => (
              <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`px-3 py-2.5 text-sm cursor-pointer ${opt.value === value ? 'bg-red-50 text-[#9B1C1C] font-semibold border-l-2 border-[#9B1C1C]' : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'}`}>{opt.label}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const AssessmentGenerator: React.FC = () => {
  const userString = localStorage.getItem('portalUser');
  const loggedInUser = userString ? JSON.parse(userString) : { id: null, role: 'Student' };

  if (loggedInUser.role !== "Superuser") return <UnderDevelopment />;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({ programs: [], statuses: [], fees: [], students: [], settings: {} });
  
  const [searchName, setSearchName] = useState('');
  const [formData, setFormData] = useState({ student_id: '', student_name: '', program_id: '', semester: '2nd', sy: '2025-2026', level: '1', status: 'REGULAR' });
  const [feeState, setFeeState] = useState<Record<string, any>>({});
  
  const [isPrinting, setIsPrinting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // --- SETTINGS MODAL STATE ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sync' | 'campus' | 'programs' | 'fees' | 'statuses'>('sync');
  const [isUploading, setIsUploading] = useState(false);

  // Settings Forms State
  const [campusForm, setCampusForm] = useState({ campus_name: '', campus_address: '', coordinator_name: '', coordinator_title: '' });
  const [newProgram, setNewProgram] = useState({ program_name: '', major: '', college: '' });
  const [newFee, setNewFee] = useState({ description: '', amount: '' });
  const [newStatus, setNewStatus] = useState('');

  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchInitData = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/assessment/data`)
      .then(res => res.json())
      .then(fetchedData => {
        setData(fetchedData);
        if(fetchedData.programs && fetchedData.programs.length > 0 && !formData.program_id) {
          setFormData(prev => ({...prev, program_id: `${fetchedData.programs[0].program_name}|${fetchedData.programs[0].major}|${fetchedData.programs[0].college}`}));
        }
        if(fetchedData.settings) setCampusForm(fetchedData.settings);
        setLoading(false);
      }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchInitData(); }, []);

  useEffect(() => {
    if (!formData.program_id) return;
    const [progName] = formData.program_id.split('|');
    fetch(`${import.meta.env.VITE_API_URL}/api/assessment/evaluate-fees`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ program_name: progName, year_level: formData.level, student_id: formData.student_id })
    }).then(res => res.json()).then(evaluatedFees => setFeeState(evaluatedFees)).catch(console.error);
  }, [formData.program_id, formData.level, formData.student_id, data.fees]); // Added data.fees dependency so it re-evaluates when a fee is added

  const handleAutoFill = (nameInput: string) => {
    setSearchName(nameInput);
    setFormData(prev => ({...prev, student_name: nameInput.toUpperCase()}));
    const student = data.students.find((s: any) => s.student_name.toUpperCase() === nameInput.toUpperCase());
    if (student) {
      setFormData(prev => ({ ...prev, student_id: student.student_id, level: student.year_level.toString() }));
      showNotify(`Matched record for ${student.student_name}`, "success");
      let rawCourse = student.course.toUpperCase();
      let courseKeyword = rawCourse.includes("BSCS") ? "COMPUTER SCIENCE" : rawCourse.includes("ACT") ? "ASSOCIATE IN COMPUTER" : rawCourse.includes("BSED") ? "SECONDARY EDUCATION" : rawCourse.includes("BEED") ? "ELEMENTARY EDUCATION" : rawCourse;
      const matchedProg = data.programs.find((p: any) => p.program_name.toUpperCase().includes(courseKeyword));
      if (matchedProg) setFormData(prev => ({...prev, program_id: `${matchedProg.program_name}|${matchedProg.major}|${matchedProg.college}`}));
    }
  };

  const handleMasterToggle = (checked: boolean) => setFeeState(prev => { const newState = { ...prev }; Object.keys(newState).forEach(k => newState[k].checked = checked); return newState; });
  const handleFeeChange = (id: string, field: string, value: any) => setFeeState(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  const calculateTotal = () => Object.values(feeState).filter((f: any) => f.checked).reduce((sum: number, f: any) => sum + (f.units * f.amount), 0);
  const allChecked = Object.values(feeState).length > 0 && Object.values(feeState).every((f: any) => f.checked);

  const handlePrintAndSave = async () => {
    if (!formData.student_name || !formData.student_id) return showNotify("Student Name and ID are required.", "error");
    setIsPrinting(true);
    const [progName, major] = formData.program_id.split('|');
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/assessment/record`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          student_id: formData.student_id, student_name: formData.student_name, course_major: `${progName} (${major})`, 
          year_level: formData.level, semester: formData.semester, school_year: formData.sy, total_amount: calculateTotal(), issuer_name: "Portal System" 
        })
      });
    } catch (e) {}
    setTimeout(() => { window.print(); setIsPrinting(false); }, 500);
  };

  // --- SETTINGS CRUD OPERATIONS ---
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    showNotify("Parsing Master List. Please wait...", "success");

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileData = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(fileData, { type: 'array' });
        let allData: any[] = [];
        workbook.SheetNames.forEach((sheetName) => allData = allData.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })));

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assessment/import-students`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentsData: allData })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        showNotify(result.message, "success");
        fetchInitData();
      } catch (error: any) { showNotify(error.message, "error"); } 
      finally { setIsUploading(false); if (e.target) e.target.value = ''; }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpdateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/assessment/settings/campus`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(campusForm) });
      showNotify("Campus info updated!", "success"); fetchInitData();
    } catch(err) { showNotify("Error saving campus info", "error"); }
  };

  const handleApiRequest = async (url: string, method: string, bodyObj?: any) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method, headers: { 'Content-Type': 'application/json' }, body: bodyObj ? JSON.stringify(bodyObj) : undefined
      });
      if(res.ok) { fetchInitData(); showNotify("Success!", "success"); return true; }
      throw new Error("Action failed");
    } catch(err: any) { showNotify(err.message, "error"); return false; }
  };

  if (loading) return <><div className="p-8 text-center text-gray-500 text-sm">Loading matrices...</div></>;

  if (isPrinting) {
    const [progName, major, college] = formData.program_id.split('|');
    return (
      <div className="bg-white p-10 max-w-4xl mx-auto font-serif text-black">
        <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-4">
          <div className="w-24 shrink-0 flex justify-center"><img src="/WMSU LOGO.png" alt="WMSU Logo" className="h-20 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} /></div>
          <div className="text-center flex-1 px-4">
            <h1 className="text-2xl font-bold uppercase leading-tight">{data.settings.campus_name || "Western Mindanao State University"}</h1>
            <h2 className="text-xl leading-snug">Ipil External Campus</h2>
            <p className="text-sm mt-1">{data.settings.campus_address}</p>
          </div>
          <div className="w-24 shrink-0 flex justify-center"><img src="/WMSU ESU.png" alt="ESU Logo" className="h-20 w-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} /></div>
        </div>
        <h3 className="text-center font-bold text-lg mb-6">ASSESSMENT OF FEES</h3>
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div><strong>STUDENT NAME:</strong> {formData.student_name}</div>
          <div><strong>STUDENT ID:</strong> {formData.student_id}</div>
          <div><strong>COURSE:</strong> {progName}</div>
          <div><strong>MAJOR:</strong> {major.toUpperCase()}</div>
          <div className="col-span-2 flex justify-between mt-4">
            <span><strong>COLLEGE:</strong> {college}</span><span><strong>SY:</strong> {formData.sy}</span>
            <span><strong>SEM:</strong> {formData.semester}</span><span><strong>LEVEL:</strong> {formData.level}</span>
            <span><strong>STATUS:</strong> {formData.status}</span>
          </div>
        </div>
        <table className="w-full text-left text-sm mb-8 border-t border-b border-black">
          <thead><tr className="border-b border-gray-400"><th className="py-2">CHARGE DESCRIPTION</th><th className="text-center">UNITS</th><th className="text-right">AMOUNT</th><th className="text-right">TOTAL</th></tr></thead>
          <tbody>
            {Object.values(feeState).filter((f: any) => f.checked).map((f: any, i) => (
              <tr key={i}><td className="py-1">{f.desc.toUpperCase()}</td><td className="text-center">{f.units}</td><td className="text-right">₱{parseFloat(f.amount).toFixed(2)}</td><td className="text-right">₱{(f.units * f.amount).toFixed(2)}</td></tr>
            ))}
            <tr className="font-bold border-t border-black"><td colSpan={3} className="py-4">TOTAL CHARGES:</td><td className="text-right py-4">₱{calculateTotal().toFixed(2)}</td></tr>
          </tbody>
        </table>
        <div className="mt-16 pt-8 text-sm flex justify-between items-end">
            <p>Given this {new Date().toLocaleDateString()} at Ipil, Zamboanga Sibugay.</p>
            <div className="text-center"><div className="font-bold uppercase border-b border-black px-8 mb-1">{data.settings.coordinator_name}</div><div>{data.settings.coordinator_title}</div></div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] shadow-sm";

  return (
    <>
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm font-medium transition-all duration-300 ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-700'}`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-80 hover:opacity-100"><X className="w-4 h-4"/></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Calculator className="w-5 h-5 text-[#9B1C1C]" /> Document Generator</h2>
          <p className="text-sm text-gray-500">Auto-fills based on student master list and programmatic requirements.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handlePrintAndSave} className="flex-1 sm:flex-none h-[42px] bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 text-sm font-medium rounded-md flex items-center justify-center shadow-sm"><Printer className="w-4 h-4 mr-2" /> Print Official AOF</button>
          
          {['Superuser', 'Admin', 'Staff'].includes(loggedInUser.role) && (
            <button onClick={() => setIsSettingsOpen(true)} className="px-3 h-[42px] bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 rounded-md shadow-sm flex items-center justify-center" title="Assessment Settings">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* --- SETTINGS DASHBOARD MODAL --- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full border border-gray-200 rounded-lg shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Settings className="w-5 h-5 mr-2 text-gray-500"/> System Configurations</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto shrink-0 px-2">
              <button onClick={() => setActiveTab('sync')} className={`px-4 py-3 text-sm font-semibold flex items-center whitespace-nowrap border-b-2 transition-colors ${activeTab === 'sync' ? 'border-[#9B1C1C] text-[#9B1C1C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Upload className="w-4 h-4 mr-2"/> Master List</button>
              <button onClick={() => setActiveTab('campus')} className={`px-4 py-3 text-sm font-semibold flex items-center whitespace-nowrap border-b-2 transition-colors ${activeTab === 'campus' ? 'border-[#9B1C1C] text-[#9B1C1C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Building2 className="w-4 h-4 mr-2"/> Signatories</button>
              <button onClick={() => setActiveTab('programs')} className={`px-4 py-3 text-sm font-semibold flex items-center whitespace-nowrap border-b-2 transition-colors ${activeTab === 'programs' ? 'border-[#9B1C1C] text-[#9B1C1C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><GraduationCap className="w-4 h-4 mr-2"/> Programs</button>
              <button onClick={() => setActiveTab('fees')} className={`px-4 py-3 text-sm font-semibold flex items-center whitespace-nowrap border-b-2 transition-colors ${activeTab === 'fees' ? 'border-[#9B1C1C] text-[#9B1C1C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><CreditCard className="w-4 h-4 mr-2"/> Fees</button>
              <button onClick={() => setActiveTab('statuses')} className={`px-4 py-3 text-sm font-semibold flex items-center whitespace-nowrap border-b-2 transition-colors ${activeTab === 'statuses' ? 'border-[#9B1C1C] text-[#9B1C1C]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}><Tag className="w-4 h-4 mr-2"/> Statuses</button>
            </div>

            <div className="p-6 overflow-y-auto bg-white flex-1">
              
              {/* TAB 1: SYNC MASTER LIST */}
              {activeTab === 'sync' && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Sync Student Master List</h4>
                  <p className="text-sm text-gray-500 mb-6">Upload the official Registrar's `.xlsx` file to automatically update the student database, courses, and total units.</p>
                  <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-8 text-center relative hover:bg-gray-100 transition-colors cursor-pointer group">
                    <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                    <div className="flex flex-col items-center pointer-events-none">
                      {isUploading ? (
                        <><Loader2 className="w-8 h-8 text-[#9B1C1C] mb-2 animate-spin" /><span className="text-sm font-semibold text-[#9B1C1C]">Processing Data...</span></>
                      ) : (
                        <><Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#9B1C1C]" /><span className="text-sm font-medium text-gray-700">Click or Drag .xlsx file here</span></>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CAMPUS INFO */}
              {activeTab === 'campus' && (
                <form onSubmit={handleUpdateCampus} className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Printable Document Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Campus Name</label><input type="text" required value={campusForm.campus_name} onChange={(e) => setCampusForm({...campusForm, campus_name: e.target.value})} className={inputClass}/></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Campus Address</label><input type="text" required value={campusForm.campus_address} onChange={(e) => setCampusForm({...campusForm, campus_address: e.target.value})} className={inputClass}/></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Coordinator Name</label><input type="text" required value={campusForm.coordinator_name} onChange={(e) => setCampusForm({...campusForm, coordinator_name: e.target.value})} className={inputClass}/></div>
                    <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Coordinator Title</label><input type="text" required value={campusForm.coordinator_title} onChange={(e) => setCampusForm({...campusForm, coordinator_title: e.target.value})} className={inputClass}/></div>
                  </div>
                  <button type="submit" className="mt-4 px-4 py-2 bg-[#9B1C1C] text-white text-sm font-medium rounded-md hover:bg-[#7a1515] transition-colors"><Save className="w-4 h-4 inline mr-2"/>Save Changes</button>
                </form>
              )}

              {/* TAB 3: PROGRAMS */}
              {activeTab === 'programs' && (
                <div>
                  <table className="w-full text-left text-sm mb-4 border border-gray-200 rounded-md overflow-hidden">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr className="border-b"><th className="px-4 py-3">Program Name</th><th className="px-4 py-3">Major</th><th className="px-4 py-3">College</th><th className="px-4 py-3 w-16">Action</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.programs.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-gray-800">{p.program_name}</td><td className="px-4 py-3">{p.major}</td><td className="px-4 py-3">{p.college}</td><td className="px-4 py-3"><button onClick={() => window.confirm('Delete this program?') && handleApiRequest(`/api/assessment/settings/program/${p.id}`, 'DELETE')} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase mb-3">Add New Program</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input type="text" placeholder="Name (e.g. BSCS)" value={newProgram.program_name} onChange={(e) => setNewProgram({...newProgram, program_name: e.target.value})} className={`${inputClass} sm:col-span-1`} />
                      <input type="text" placeholder="Major (e.g. Programming)" value={newProgram.major} onChange={(e) => setNewProgram({...newProgram, major: e.target.value})} className={`${inputClass} sm:col-span-1`} />
                      <input type="text" placeholder="College Name" value={newProgram.college} onChange={(e) => setNewProgram({...newProgram, college: e.target.value})} className={`${inputClass} sm:col-span-1`} />
                      <button onClick={async () => { if(!newProgram.program_name) return; if(await handleApiRequest('/api/assessment/settings/program', 'POST', newProgram)) setNewProgram({program_name:'', major:'', college:''}); }} className="bg-[#9B1C1C] text-white text-sm font-medium rounded-md sm:col-span-1 flex items-center justify-center"><Plus className="w-4 h-4 mr-1"/> Add</button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FEES */}
              {activeTab === 'fees' && (
                <div>
                  <table className="w-full text-left text-sm mb-4 border border-gray-200 rounded-md overflow-hidden">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr className="border-b"><th className="px-4 py-3">Fee Description</th><th className="px-4 py-3 w-32">Amount (₱)</th><th className="px-4 py-3 w-16">Action</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.fees.map((f: any) => (
                        <tr key={f.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-gray-800">{f.description}</td><td className="px-4 py-3">₱ {parseFloat(f.amount_per_unit).toFixed(2)}</td><td className="px-4 py-3"><button onClick={() => window.confirm('Delete this fee?') && handleApiRequest(`/api/assessment/settings/fee/${f.id}`, 'DELETE')} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase mb-3">Add New Fee</h5>
                    <div className="flex gap-3">
                      <input type="text" placeholder="Fee Name" value={newFee.description} onChange={(e) => setNewFee({...newFee, description: e.target.value})} className={`${inputClass} flex-1`} />
                      <input type="number" placeholder="Amount" value={newFee.amount} onChange={(e) => setNewFee({...newFee, amount: e.target.value})} className={`${inputClass} w-32`} />
                      <button onClick={async () => { if(!newFee.description) return; if(await handleApiRequest('/api/assessment/settings/fee', 'POST', newFee)) setNewFee({description:'', amount:''}); }} className="bg-[#9B1C1C] text-white text-sm font-medium rounded-md px-4 flex items-center justify-center"><Plus className="w-4 h-4"/></button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: STATUSES */}
              {activeTab === 'statuses' && (
                <div>
                  <table className="w-full text-left text-sm mb-4 border border-gray-200 rounded-md overflow-hidden">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr className="border-b"><th className="px-4 py-3">Status Category</th><th className="px-4 py-3 w-16">Action</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.statuses.map((s: any) => (
                        <tr key={s.id} className="hover:bg-gray-50"><td className="px-4 py-3 font-semibold text-gray-800">{s.status_name}</td><td className="px-4 py-3"><button onClick={() => window.confirm('Delete this status?') && handleApiRequest(`/api/assessment/settings/status/${s.id}`, 'DELETE')} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h5 className="text-xs font-semibold text-gray-700 uppercase mb-3">Add New Status</h5>
                    <div className="flex gap-3">
                      <input type="text" placeholder="e.g. REGULAR" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={`${inputClass} flex-1`} />
                      <button onClick={async () => { if(!newStatus) return; if(await handleApiRequest('/api/assessment/settings/status', 'POST', {status_name: newStatus})) setNewStatus(''); }} className="bg-[#9B1C1C] text-white text-sm font-medium rounded-md px-4 flex items-center justify-center"><Plus className="w-4 h-4 mr-1"/> Add</button>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      )}

      {/* --- GENERATOR MAIN FORM --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white p-5 rounded-lg shadow-sm border border-gray-200 h-fit">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center"><Search className="w-4 h-4 mr-2"/> Profile Search</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Student Name (Auto-search)</label>
              <input type="text" list="students" value={searchName} onChange={(e) => handleAutoFill(e.target.value)} className={inputClass} placeholder="Start typing name..." />
              <datalist id="students">{data.students?.map((s: any) => <option key={s.id} value={s.student_name} />)}</datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Student ID Number</label>
              <input type="text" value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} className={inputClass} placeholder="ESU-IPIL-..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Academic Program</label>
              <CustomSelect value={formData.program_id} onChange={(val) => setFormData({...formData, program_id: val})} options={data.programs?.map((p: any) => ({value: `${p.program_name}|${p.major}|${p.college}`, label: `${p.program_name} (${p.major})`})) || []} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Year Level</label><CustomSelect value={formData.level.toString()} onChange={(val) => setFormData({...formData, level: val})} options={[1, 2, 3, 4].map(l => ({ value: l.toString(), label: `Level ${l}` }))} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Semester</label><CustomSelect value={formData.semester} onChange={(val) => setFormData({...formData, semester: val})} options={[{ value: '1st', label: '1st' }, { value: '2nd', label: '2nd' }, { value: 'Summer', label: 'Summer' }]} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">School Year</label><input type="text" value={formData.sy} onChange={(e) => setFormData({...formData, sy: e.target.value})} className={inputClass} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label><CustomSelect value={formData.status} onChange={(val) => setFormData({...formData, status: val})} options={data.statuses?.map((s: any) => ({ value: s.status_name, label: s.status_name })) || []} /></div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
             <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center"><FileText className="w-4 h-4 mr-2"/> Fee Matrix</h3>
             <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full tracking-wide">TOTAL: ₱ {calculateTotal().toFixed(2)}</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3 w-12 text-center"><input type="checkbox" checked={allChecked} onChange={(e) => handleMasterToggle(e.target.checked)} className="w-4 h-4 accent-[#9B1C1C] rounded border-gray-300" /></th>
                  <th className="px-4 py-3">Charge Description</th>
                  <th className="px-4 py-3 w-28 text-center">Units</th>
                  <th className="px-4 py-3 w-32 text-right">Amount (₱)</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
                {Object.values(feeState).map((f: any) => (
                    <tr key={f.desc} className={`transition-colors group ${f.checked ? 'bg-white hover:bg-gray-50/80' : 'bg-gray-50/50 text-gray-400'}`}>
                      <td className="px-4 py-3 text-center align-middle"><input type="checkbox" checked={f.checked} onChange={(e) => handleFeeChange(Object.keys(feeState).find(k => feeState[k].desc === f.desc) as string, 'checked', e.target.checked)} className="w-4 h-4 accent-[#9B1C1C] rounded border-gray-300 cursor-pointer" /></td>
                      <td className={`px-4 py-3 font-medium align-middle ${f.checked ? 'text-gray-900' : 'text-gray-400'}`}>{f.desc.toUpperCase()}</td>
                      <td className="px-4 py-2 align-middle"><input type="number" disabled={!f.checked} value={f.units} onChange={(e) => handleFeeChange(Object.keys(feeState).find(k => feeState[k].desc === f.desc) as string, 'units', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-center text-sm focus:outline-none focus:border-[#9B1C1C] disabled:bg-gray-100 disabled:text-gray-400" /></td>
                      <td className="px-4 py-2 align-middle"><input type="number" disabled={!f.checked} value={f.amount} onChange={(e) => handleFeeChange(Object.keys(feeState).find(k => feeState[k].desc === f.desc) as string, 'amount', e.target.value)} className="w-full p-1.5 border border-gray-200 rounded text-right text-sm focus:outline-none focus:border-[#9B1C1C] disabled:bg-gray-100 disabled:text-gray-400" /></td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};