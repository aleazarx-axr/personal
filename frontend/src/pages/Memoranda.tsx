// src/pages/Memoranda.tsx
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { Search, FileText, Plus, Edit, Download, ArrowLeft, ExternalLink, Loader2, Save, X, Upload, Paperclip, Files, Eye, AlertCircle, CheckCircle2, ChevronDown, Settings, Trash2, Archive, RotateCcw } from 'lucide-react';

interface ExtraFile { url: string; remark: string; }

interface DocumentDraft {
  id: number; memoNumber: string; date: string; subject: string;
  issuer: string; attachment: string | null; additional_attachments: string | null;
  status: string; remarks: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB Limit

// --- CUSTOM OVERLAY DROPDOWN ---
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

// --- CUSTOM STATUS BADGE DROPDOWN ---
const StatusSelect = ({ value, onChange, disabled }: { value: string, onChange: (val: string) => void, disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getStyle = (val: string) => {
    if (val === 'Completed') return 'bg-green-50 text-green-700 border-green-200';
    if (val === 'Returned') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="relative w-[105px] shrink-0">
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-2 py-1.5 border rounded text-[10px] font-semibold uppercase tracking-wider flex justify-between items-center transition-all ${getStyle(value)} ${disabled ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
      >
        <span>{value}</span>
        {!disabled && <ChevronDown className={`w-3 h-3 ml-1 opacity-70 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </div>
      
      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-[100] w-[115px] top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden">
            {['Pending', 'Returned', 'Completed'].map(opt => (
              <div 
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className={`px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${opt === value ? 'bg-gray-100 text-gray-900 border-l-2 border-gray-400' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const Memoranda: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  
  // VIEW MODE STATE (Dropdown Controlled)
  const [viewMode, setViewMode] = useState<'Active' | 'Archived'>('Active');

  const [searchTerm, setSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('All');

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [templates, setTemplates] = useState<string[]>([]);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('Memo');
  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null);

  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [draftType, setDraftType] = useState('Memo');
  const [newSubject, setNewSubject] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<{ 
    id: number; subject: string; remarks: string; file: File | null; 
    existingExtraFiles: ExtraFile[]; newExtraSlots: { file: File | null; remark: string }[] 
  }>({ id: 0, subject: '', remarks: '', file: null, existingExtraFiles: [], newExtraSlots: [] });

  const [fileManagerModal, setFileManagerModal] = useState<{ isOpen: boolean; memo: DocumentDraft | null }>({ isOpen: false, memo: null });
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string } | null>(null);
  
  const [viewingFile, setViewingFile] = useState<{ localUrl: string; name: string; memoId: number; targetUrl?: string } | null>(null);
  const [activeEdits, setActiveEdits] = useState<Record<string, string>>({}); 
  const [isPushing, setIsPushing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [documentToArchive, setDocumentToArchive] = useState<number | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const userString = localStorage.getItem('portalUser');
  const loggedInUser = userString ? JSON.parse(userString) : { role: 'Student', id: 0 };
  const canCreate = ['Superuser', 'Admin', 'Coordinator', 'Staff'].includes(loggedInUser.role);

  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = async (isArchivedView: boolean) => {
    setLoading(true);
    try {
      const [docRes, tplRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/memoranda${isArchivedView ? '?archived=true' : ''}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/templates`)
      ]);
      if (docRes.ok) setDocuments(await docRes.json());
      if (tplRes.ok) setTemplates(await tplRes.json());
    } catch (err) { 
      showNotify("Failed to connect to server.", "error"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchData(viewMode === 'Archived'); 
  }, [viewMode]);

  const handleUploadTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateFile) return showNotify("Please select a .docx template file.", "error");

    const formData = new FormData();
    formData.append('typeName', newTemplateName);
    formData.append('templateFile', newTemplateFile);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Failed to upload template");
      showNotify(`${newTemplateName} Template uploaded successfully!`, "success");
      setNewTemplateFile(null); fetchData(viewMode === 'Archived');
    } catch (err: any) { showNotify(err.message, "error"); }
  };

  const handleDeleteTemplate = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the designated ${name} template?`)) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/templates/${name}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete");
      showNotify("Template deleted.", "success"); fetchData(viewMode === 'Archived');
    } catch (err: any) { showNotify(err.message, "error"); }
  };

  const parseAttachments = (jsonString: string | null): ExtraFile[] => {
    if (!jsonString) return [];
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: any) => {
        if (!item) return null;
        if (typeof item === 'string') return { url: item, remark: '' };
        return { url: typeof item.url === 'string' ? item.url : '', remark: typeof item.remark === 'string' ? item.remark : '' };
      }).filter(item => item !== null && item.url !== '') as ExtraFile[]; 
    } catch (e) { return []; }
  };

  const isViewable = (url: string | null | undefined) => {
    if (!url) return false;
    const ext = url.split('.').pop()?.toLowerCase();
    return ['pdf', 'png', 'jpg', 'jpeg', 'txt', 'gif'].includes(ext || '');
  };

  const handleDraftDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim().length < 3) return showNotify("Subject must be at least 3 characters long.", "error");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memoranda/create-from-template`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject.trim(), issuer_id: loggedInUser.id, documentType: draftType })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to draft document.');
      
      showNotify(`${draftType} drafted successfully!`, "success");
      setIsDraftModalOpen(false); setNewSubject(''); fetchData(viewMode === 'Archived');
      setViewingFile({ localUrl: `${import.meta.env.VITE_API_URL}${data.attachment}`, name: data.memoNumber, memoId: data.id });
    } catch (err: any) { showNotify(err.message, "error"); }
  };

  const openEditModal = (memo: DocumentDraft) => {
    const safeAttachments = parseAttachments(memo.additional_attachments);
    setEditData({ id: memo.id, subject: memo.subject, remarks: memo.remarks || '', file: null, existingExtraFiles: safeAttachments, newExtraSlots: [] });
    setIsEditModalOpen(true);
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editData.subject.trim().length < 3) return showNotify("Subject cannot be empty.", "error");

    try {
      const formData = new FormData();
      formData.append('subject', editData.subject.trim());
      formData.append('remarks', editData.remarks.trim());
      
      if (editData.file) formData.append('attachment', editData.file);
      formData.append('existingExtraFiles', JSON.stringify(editData.existingExtraFiles));
      
      let fileError = false;
      editData.newExtraSlots.forEach(slot => {
        if (slot.file) {
          if (slot.file.size > MAX_FILE_SIZE) fileError = true;
          formData.append('extraFiles', slot.file);
          formData.append('extraRemarks', slot.remark.trim());
        }
      });

      if (fileError) return showNotify("One or more files exceed the 5MB limit.", "error");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memoranda/${editData.id}`, { method: 'PUT', body: formData });
      if (!response.ok) throw new Error('Failed to update details');
      
      showNotify("Document details updated securely!", "success");
      setIsEditModalOpen(false); fetchData(viewMode === 'Archived');
    } catch (error: any) { showNotify(error.message, "error"); }
  };

  const handleQuickStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memoranda/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Error updating status');
      showNotify("Status updated successfully.", "success");
      fetchData(viewMode === 'Archived'); 
    } catch (error: any) { showNotify(error.message, "error"); fetchData(viewMode === 'Archived'); }
  };

  const confirmArchive = async () => {
    if (!documentToArchive) return;
    setIsArchiving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memoranda/${documentToArchive}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to archive document');
      showNotify("Document archived successfully.", "success");
      fetchData(viewMode === 'Archived');
    } catch (err: any) {
      showNotify(err.message, "error");
    } finally {
      setIsArchiving(false);
      setIsArchiveModalOpen(false);
      setDocumentToArchive(null);
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm("Are you sure you want to restore this document back to active status?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memoranda/${id}/restore`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to restore document');
      showNotify("Document restored successfully.", "success");
      fetchData(viewMode === 'Archived');
    } catch (err: any) {
      showNotify(err.message, "error");
    }
  };

  const getEditKey = () => viewingFile ? `${viewingFile.memoId}_${viewingFile.targetUrl || 'main'}` : '';

  const handleEditInDocs = async () => { 
    if (!viewingFile) return; setIsPushing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memoranda/${viewingFile.memoId}/edit-request`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUrl: viewingFile.targetUrl })
      });
      if (!response.ok) throw new Error("Google Drive API error.");
      const data = await response.json(); 
      setActiveEdits(prev => ({ ...prev, [getEditKey()]: data.driveId }));
      window.open(data.link, '_blank');
    } catch (error: any) { showNotify(error.message, "error"); } finally { setIsPushing(false); }
  };

  const handleSyncChanges = async () => { 
    if (!viewingFile) return; 
    const currentDriveId = activeEdits[getEditKey()]; 
    if (!currentDriveId) return; setIsSyncing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memoranda/${viewingFile.memoId}/sync-request`, { 
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ driveId: currentDriveId, targetUrl: viewingFile.targetUrl }) 
      });
      if (!response.ok) throw new Error("Sync failed."); 
      showNotify("Changes synced successfully from Google Docs!", "success");
      setActiveEdits(prev => { const updated = { ...prev }; delete updated[getEditKey()]; return updated; });
      setViewingFile(null);
    } catch (error: any) { showNotify(error.message, "error"); } finally { setIsSyncing(false); }
  };

  const validateFileSelection = (file: File | null) => {
    if (file && file.size > MAX_FILE_SIZE) { showNotify(`"${file.name}" is too large. Maximum size is 5MB.`, "error"); return false; }
    return true;
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || doc.memoNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = docTypeFilter === 'All' || doc.memoNumber?.startsWith(docTypeFilter);
    return matchesSearch && matchesType;
  });

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <PortalLayout pageTitle="Issuances & Memos">
      
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-700'}`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-80 hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
        </div>
      )}

      {/* HEADER CONTROLS (Unified Dropdowns) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search reference no. or subject..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputClass} pl-10`} />
          </div>
          
          <div className="w-full sm:w-48">
            <CustomSelect 
              value={viewMode} 
              onChange={(val) => setViewMode(val as 'Active' | 'Archived')} 
              options={[
                {value: 'Active', label: 'Active Documents'},
                {value: 'Archived', label: 'Archived Records'}
              ]}
            />
          </div>

          <div className="w-full sm:w-56">
            <CustomSelect 
              value={docTypeFilter} 
              onChange={(val) => setDocTypeFilter(val)} 
              options={[
                {value: 'All', label: 'All Document Types'},
                {value: 'Memo', label: 'Memorandum'},
                {value: 'Letter', label: 'Letter'},
                {value: 'Endorsement', label: 'Endorsement'},
                {value: 'Proposal', label: 'Proposal'},
                {value: 'Report', label: 'Report'}
              ]}
            />
          </div>
        </div>
        
        {canCreate && viewMode === 'Active' && (
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)} 
                className="w-full h-[42px] sm:w-auto bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 py-2 text-sm font-medium shadow-sm flex items-center justify-between rounded-md transition-colors relative z-10"
              >
                <div className="flex items-center"><Plus className="w-4 h-4 mr-2" /> Create</div>
                <ChevronDown className={`w-4 h-4 ml-3 opacity-80 transition-transform ${isCreateDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCreateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCreateDropdownOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-2 w-full sm:w-56 bg-white border border-gray-200 rounded-md shadow-xl z-50 flex flex-col overflow-hidden">
                    {templates.length > 0 ? templates.map(tpl => (
                      <button key={tpl} onClick={() => { setDraftType(tpl); setIsDraftModalOpen(true); setIsCreateDropdownOpen(false); }} className="px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#9B1C1C] transition-colors border-b last:border-b-0 border-gray-100 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-400"/> Draft {tpl}
                      </button>
                    )) : (
                      <div className="p-4 text-sm text-center text-gray-500 italic">No templates available. Please assign one in settings.</div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <button 
              onClick={() => setIsTemplateManagerOpen(true)}
              className="px-3 h-[42px] bg-white hover:bg-gray-50 text-gray-600 border border-gray-300 rounded-md shadow-sm flex items-center justify-center transition-colors"
              title="Template Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden pb-32 md:pb-0">
        
        {/* --- MOBILE COMPACT VIEW --- */}
        <div className="md:hidden flex flex-col gap-3 pb-6">
          {loading ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">Loading documents...</div>
          ) : filteredDocs.length === 0 ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">No documents found.</div>
          ) : (
            filteredDocs.map((doc) => {
              const safeAttachments = parseAttachments(doc.additional_attachments);
              const totalFiles = (doc.attachment ? 1 : 0) + safeAttachments.length;
              const isCompleted = doc.status === 'Completed';

              return (
                <div key={doc.id} className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col overflow-visible">
                  
                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs font-semibold text-[#9B1C1C] mb-0.5 truncate">{doc.memoNumber}</span>
                      <span className="text-xs text-gray-500 truncate">{new Date(doc.date).toLocaleDateString()}</span>
                    </div>
                    
                    <StatusSelect 
                      value={doc.status || 'Pending'}
                      onChange={(val) => handleQuickStatusChange(doc.id, val)}
                      disabled={isCompleted || viewMode === 'Archived'}
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 text-sm leading-snug">{doc.subject}</h4>
                    {doc.remarks && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded border border-gray-100 italic">"{doc.remarks}"</p>}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-white">
                    <button 
                      onClick={() => setFileManagerModal({ isOpen: true, memo: doc })} 
                      disabled={totalFiles === 0}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${totalFiles > 0 ? 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100' : 'text-gray-400 bg-gray-50 border border-gray-100 cursor-not-allowed'}`}
                    >
                      <Paperclip className="w-3.5 h-3.5" /> 
                      {totalFiles > 0 ? `${totalFiles} File(s)` : 'No Files'}
                    </button>

                    {canCreate && (
                      <div className="flex items-center gap-2">
                        {viewMode === 'Active' ? (
                          <>
                            <button onClick={() => openEditModal(doc)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 bg-white hover:bg-gray-50 rounded transition-colors">
                              <Edit className="w-3.5 h-3.5" /> Update
                            </button>
                            <button onClick={() => {
                              setDocumentToArchive(doc.id);
                              setIsArchiveModalOpen(true);
                            }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded transition-colors">
                              <Archive className="w-3.5 h-3.5" /> Archive
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleRestore(doc.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 border border-green-300 bg-green-50 hover:bg-green-100 rounded transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" /> Restore
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- DESKTOP VIEW --- */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3 font-semibold w-40">Reference No.</th>
              <th className="px-4 py-3 font-semibold w-32">Date Issued</th>
              <th className="px-4 py-3 font-semibold">Subject & Remarks</th>
              <th className="px-4 py-3 font-semibold w-28 text-center">Attachments</th>
              <th className="px-4 py-3 font-semibold w-36 text-center">Current Status</th>
              <th className="px-4 py-3 font-semibold w-24 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-medium text-sm">Loading document registry...</td></tr> : 
             filteredDocs.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500 font-medium text-sm">No documents matching your search.</td></tr> : 
             filteredDocs.map((doc) => {
               const safeAttachments = parseAttachments(doc.additional_attachments);
               const totalFiles = (doc.attachment ? 1 : 0) + safeAttachments.length;
               const isCompleted = doc.status === 'Completed';
               
               return (
                <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-[#9B1C1C] align-top pt-4">{doc.memoNumber}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 align-top pt-4">{new Date(doc.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</td>
                  
                  <td className="px-4 py-3 align-top">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 leading-snug">{doc.subject}</div>
                      {doc.remarks && <div className="text-xs text-gray-500 mt-1.5"><span className="font-medium">Note:</span> {doc.remarks}</div>}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center align-top pt-3.5">
                    {totalFiles > 0 ? (
                      <button 
                        onClick={() => setFileManagerModal({ isOpen: true, memo: doc })} 
                        className="mx-auto flex items-center justify-center gap-1.5 text-gray-600 hover:text-blue-700 transition-colors px-2.5 py-1.5 rounded bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        title={`View ${totalFiles} file(s)`}
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="text-xs font-medium">{totalFiles}</span>
                      </button>
                    ) : ( <span className="text-gray-300 text-xs italic">None</span> )}
                  </td>

                  <td className="px-4 py-3 text-center align-top pt-3.5">
                    <div className="flex justify-center">
                      <StatusSelect 
                        value={doc.status || 'Pending'}
                        onChange={(val) => handleQuickStatusChange(doc.id, val)}
                        disabled={isCompleted || viewMode === 'Archived'}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center align-top pt-3.5">
                    {canCreate && (
                      <div className="flex items-center justify-center gap-2">
                        {viewMode === 'Active' ? (
                          <>
                            <button onClick={() => openEditModal(doc)} className="text-gray-500 hover:text-blue-600 transition-colors p-1.5 border border-gray-200 rounded hover:bg-blue-50" title="Edit Document">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => {
                              setDocumentToArchive(doc.id);
                              setIsArchiveModalOpen(true);
                            }} className="text-gray-500 hover:text-red-600 transition-colors p-1.5 border border-gray-200 rounded hover:bg-red-50" title="Archive Document">
                              <Archive className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleRestore(doc.id)} className="text-green-600 hover:text-green-800 transition-colors p-1.5 border border-green-200 bg-green-50 rounded hover:bg-green-100" title="Restore Document">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
               );
             })}
          </tbody>
        </table>
      </div>

      {/* --- DESIGNATED TEMPLATE MANAGER MODAL --- */}
      {isTemplateManagerOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[80] flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-900 text-base flex items-center"><Settings className="w-5 h-5 mr-2 text-gray-500"/> Template Settings</h3>
              <button onClick={() => setIsTemplateManagerOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto pb-48">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Active Base Templates</h4>
                {templates.length > 0 ? (
                  <div className="space-y-2">
                    {templates.map(tpl => (
                      <div key={tpl} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md">
                        <span className="text-sm font-medium text-gray-800">{tpl} Document</span>
                        <button onClick={() => handleDeleteTemplate(tpl)} className="text-gray-400 hover:text-red-600 transition-colors" title="Delete Template"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic p-4 bg-gray-50 border border-gray-200 rounded-md text-center">No templates assigned yet.</div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-800 mb-3">Assign New Template</h4>
                <form onSubmit={handleUploadTemplate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Document Category</label>
                    <CustomSelect 
                      value={newTemplateName} 
                      onChange={(val) => setNewTemplateName(val)} 
                      options={[
                        {value: 'Memo', label: 'Memo'},
                        {value: 'Letter', label: 'Letter'},
                        {value: 'Endorsement', label: 'Endorsement'},
                        {value: 'Proposal', label: 'Proposal'},
                        {value: 'Report', label: 'Report'}
                      ]}
                    />
                  </div>
                  <div className="border border-dashed border-gray-300 p-4 rounded-md bg-gray-50">
                    <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center"><Upload className="w-4 h-4 mr-1.5 text-gray-400"/> Select .docx Template File</label>
                    <input type="file" required accept=".docx" onChange={(e) => setNewTemplateFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 cursor-pointer" />
                  </div>
                  <button type="submit" className="w-full h-[42px] bg-[#9B1C1C] hover:bg-[#7a1515] text-white text-sm font-medium rounded-md transition-colors shadow-sm">Upload Template</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- UNIFIED FILE MANAGER MODAL --- */}
      {fileManagerModal.isOpen && fileManagerModal.memo && (
        <div className="fixed inset-0 bg-gray-900/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border border-gray-200 rounded-lg shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <div>
                <h3 className="font-semibold text-gray-900 text-base flex items-center"><Files className="w-5 h-5 mr-2 text-blue-700"/> Document Repository</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-mono">{fileManagerModal.memo.memoNumber}</p>
              </div>
              <button onClick={() => setFileManagerModal({ isOpen: false, memo: null })} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50/50 space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Primary Document</h4>
                {fileManagerModal.memo.attachment ? (
                  <div className="bg-white p-4 border border-gray-200 rounded-md shadow-sm flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center text-sm font-medium text-gray-900 truncate"><FileText className="w-4 h-4 mr-2 text-[#9B1C1C] shrink-0" /> <span className="truncate">{fileManagerModal.memo.memoNumber} Final Draft</span></div>
                    </div>
                    <div className="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                       <button onClick={() => {
                          setViewingFile({ localUrl: `${import.meta.env.VITE_API_URL}${fileManagerModal.memo!.attachment}`, name: fileManagerModal.memo!.memoNumber, memoId: fileManagerModal.memo!.id });
                          setFileManagerModal({ isOpen: false, memo: null });
                       }} className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded shadow-sm flex items-center justify-center transition-colors">
                         <Edit className="w-3.5 h-3.5 mr-1.5 text-gray-500"/> Edit via Docs
                       </button>
                       {isViewable(fileManagerModal.memo.attachment) && (
                         <button onClick={() => setPreviewFile({ url: fileManagerModal.memo!.attachment!, name: `${fileManagerModal.memo!.memoNumber} File` })} className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded shadow-sm flex items-center justify-center border border-gray-300 transition-colors"><Eye className="w-4 h-4 mr-1.5 text-gray-500"/> Preview</button>
                       )}
                       <a href={`${import.meta.env.VITE_API_URL}${fileManagerModal.memo.attachment}`} target="_blank" rel="noreferrer" download className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-medium rounded shadow-sm flex items-center justify-center transition-colors"><Download className="w-4 h-4 mr-1.5"/> Download</a>
                    </div>
                  </div>
                ) : ( <div className="text-sm text-gray-400 italic p-4 bg-white border border-gray-200 rounded-md text-center">No official document drafted yet.</div> )}
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Supporting Attachments</h4>
                {parseAttachments(fileManagerModal.memo.additional_attachments).length > 0 ? (
                  <div className="space-y-3">
                    {parseAttachments(fileManagerModal.memo.additional_attachments).map((file, idx) => {
                      const fileName = file?.url ? file.url.split('/').pop() : `Attachment ${idx + 1}`;
                      const isDocx = file?.url ? (file.url.toLowerCase().endsWith('.docx') || file.url.toLowerCase().endsWith('.doc')) : false;

                      return (
                        <div key={idx} className="bg-white p-4 border border-gray-200 rounded-md shadow-sm flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex items-center text-sm font-medium text-gray-900 truncate"><Paperclip className="w-4 h-4 mr-2 text-gray-400 shrink-0" /> <span className="truncate">{fileName}</span></div>
                            {file.remark && <div className="mt-1.5 text-xs text-gray-500 pl-6">{file.remark}</div>}
                          </div>
                          
                          <div className="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                            {isDocx && file?.url && (
                              <button onClick={() => {
                                setViewingFile({ localUrl: `${import.meta.env.VITE_API_URL}${file.url}`, name: fileName || 'File', memoId: fileManagerModal.memo!.id, targetUrl: file.url });
                                setFileManagerModal({ isOpen: false, memo: null });
                              }} className="flex-1 sm:flex-none px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded shadow-sm flex items-center justify-center transition-colors">
                                <Edit className="w-3.5 h-3.5 mr-1.5 text-gray-500"/> Edit
                              </button>
                            )}
                            {isViewable(file.url) && (
                              <button onClick={() => setPreviewFile({ url: file.url, name: fileName || 'File' })} className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded shadow-sm flex items-center justify-center border border-gray-300 transition-colors"><Eye className="w-4 h-4 mr-1.5 text-gray-500"/> Preview</button>
                            )}
                            {file?.url && (
                              <a href={`${import.meta.env.VITE_API_URL}${file.url}`} target="_blank" rel="noreferrer" download className="flex-1 sm:flex-none px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-medium rounded shadow-sm flex items-center justify-center transition-colors"><Download className="w-4 h-4 mr-1.5"/> Download</a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : ( <div className="text-sm text-gray-400 italic p-4 bg-white border border-gray-200 rounded-md text-center">No supporting attachments.</div> )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NATIVE HTML5 UNIVERSAL FILE PREVIEW MODAL --- */}
      {previewFile && (
        <div className="fixed inset-0 bg-gray-900/95 z-[110] flex flex-col p-4 sm:p-8">
          <div className="bg-white w-full h-full rounded-lg shadow-2xl flex flex-col overflow-hidden max-w-6xl mx-auto">
            <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-white border border-gray-200 rounded shrink-0"><Eye className="w-5 h-5 text-gray-600" /></div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">Document Preview</h3>
                  <p className="text-xs text-gray-500 truncate">{previewFile.name}</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 shrink-0">
                <a href={`${import.meta.env.VITE_API_URL}${previewFile.url}`} download className="hidden sm:flex px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded shadow-sm items-center border border-gray-300"><Download className="w-4 h-4 mr-2 text-gray-500"/> Download</a>
                <button onClick={() => setPreviewFile(null)} className="p-2 text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex-1 bg-gray-200 p-2 sm:p-6 overflow-hidden flex justify-center items-center relative">
               <iframe src={`${import.meta.env.VITE_API_URL}${previewFile.url}`} className="w-full h-full bg-white shadow-lg rounded border border-gray-300" title="Document Preview" />
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT METADATA MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-gray-200 rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-900 text-base">Update Document Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto p-6 bg-white">
              <form id="editForm" onSubmit={handleUpdateMetadata} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject</label>
                    <input type="text" required value={editData.subject} onChange={(e) => setEditData({...editData, subject: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Administrative Remarks</label>
                    <textarea value={editData.remarks} onChange={(e) => setEditData({...editData, remarks: e.target.value})} rows={2} className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] resize-none"></textarea>
                  </div>
                  <div className="border border-dashed border-gray-300 p-4 rounded-md bg-gray-50">
                    <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center"><Upload className="w-4 h-4 mr-1.5 text-gray-400"/> Replace Primary Document (Optional)</label>
                    <input type="file" onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
                        if (validateFileSelection(file)) setEditData({...editData, file});
                        else e.target.value = '';
                    }} className="w-full text-sm text-gray-600 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-white file:border file:border-gray-300 file:text-gray-700 hover:file:bg-gray-50 cursor-pointer" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-xs font-medium text-gray-800 flex items-center"><Paperclip className="w-4 h-4 mr-1.5 text-gray-400"/> Supporting Attachments</label>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{editData.existingExtraFiles.length + editData.newExtraSlots.length} / 3</span>
                  </div>

                  <div className="space-y-3">
                    {editData.existingExtraFiles.map((file, idx) => (
                      <div key={idx} className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 truncate max-w-[250px] flex items-center"><FileText className="w-3.5 h-3.5 mr-1.5 text-gray-400"/> {file?.url ? file.url.split('/').pop() : 'Unknown File'}</span>
                          <button type="button" onClick={() => setEditData({...editData, existingExtraFiles: editData.existingExtraFiles.filter((_, i) => i !== idx)})} className="text-xs font-medium text-red-600 hover:text-red-800">Remove</button>
                        </div>
                        <input type="text" readOnly value={file.remark} className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded text-gray-500" placeholder="No remark provided" />
                      </div>
                    ))}

                    {editData.newExtraSlots.map((slot, idx) => (
                      <div key={`new-${idx}`} className="flex flex-col gap-2 p-3 bg-blue-50/50 border border-blue-200 border-dashed rounded-md relative">
                        <button type="button" onClick={() => setEditData({...editData, newExtraSlots: editData.newExtraSlots.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-gray-400 hover:text-red-600"><X className="w-4 h-4"/></button>
                        <input type="file" required onChange={(e) => {
                           const file = e.target.files ? e.target.files[0] : null;
                           if (validateFileSelection(file)) {
                             const updatedSlots = [...editData.newExtraSlots];
                             updatedSlots[idx].file = file;
                             setEditData({...editData, newExtraSlots: updatedSlots});
                           } else { e.target.value = ''; }
                        }} className="w-full text-sm text-gray-700 file:mr-3 file:py-1 file:px-2 file:rounded file:border file:border-blue-200 file:text-xs file:font-medium file:bg-white file:text-blue-700" />
                        <input type="text" placeholder="Add a short description for this file..." value={slot.remark} onChange={(e) => {
                           const updatedSlots = [...editData.newExtraSlots];
                           updatedSlots[idx].remark = e.target.value;
                           setEditData({...editData, newExtraSlots: updatedSlots});
                        }} className="w-full p-2 border border-blue-200 rounded text-sm focus:outline-none focus:border-blue-400" />
                      </div>
                    ))}
                  </div>

                  {editData.existingExtraFiles.length + editData.newExtraSlots.length < 3 && (
                    <button type="button" onClick={() => setEditData({...editData, newExtraSlots: [...editData.newExtraSlots, { file: null, remark: '' }]})} className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800 text-sm font-medium flex justify-center items-center transition-colors">
                      <Plus className="w-4 h-4 mr-1.5"/> Add Attachment Slot
                    </button>
                  )}
                </div>

              </form>
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" form="editForm" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md flex items-center shadow-sm transition-colors"><Save className="w-4 h-4 mr-2"/> Apply Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DRAFT MODAL --- */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[70] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-gray-200 rounded-lg shadow-xl flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-base">Initialize New {draftType}</h3>
              <button onClick={() => setIsDraftModalOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleDraftDocument} className="p-6 bg-white">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Subject or Title</label>
              <input type="text" required value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className={inputClass} placeholder="e.g. Schedule of Intramurals" />
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsDraftModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm transition-colors">Generate Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ARCHIVE CONFIRMATION MODAL --- */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white max-w-md w-full rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-red-50 shrink-0">
              <h3 className="font-semibold text-red-900 text-base flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-600" /> Confirm Archive
              </h3>
              <button onClick={() => setIsArchiveModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-200 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700">Are you sure you want to archive this document? This action will remove it from the active registry. It can be restored later.</p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button onClick={() => setIsArchiveModalOpen(false)} disabled={isArchiving} className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm transition-colors">
                Cancel
              </button>
              <button onClick={confirmArchive} disabled={isArchiving} className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-colors flex items-center">
                {isArchiving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4 mr-2" />}
                Yes, Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- GOOGLE DOCS VIEWER (For Editor Bridge) --- */}
      {viewingFile && (
        <div className="fixed inset-0 bg-gray-900/95 z-[100] flex flex-col">
          <div className="flex justify-between items-center px-6 py-4 text-white border-b border-gray-700 bg-black/40">
            <div className="flex items-center gap-4">
              <button onClick={() => setViewingFile(null)} className="p-2 hover:bg-white/10 rounded transition-colors group"><ArrowLeft className="w-5 h-5 text-gray-300 group-hover:text-white" /></button>
              <div className="flex items-center gap-3"><div className="p-1.5 bg-white/10 rounded"><FileText className="w-5 h-5 text-white" /></div><div className="font-semibold text-sm tracking-wide text-white">{viewingFile.name}</div></div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex justify-center items-center p-4 sm:p-8">
            <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-2xl p-8 sm:p-12 text-center flex flex-col items-center">
              <div className="bg-gray-50 p-4 rounded-full border border-gray-100 mb-6"><FileText className="w-10 h-10 text-[#9B1C1C]" /></div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Live Document Bridge</h3>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed max-w-md border-b border-gray-100 pb-8">You can download the raw document file directly to your computer, or open it seamlessly in Google Docs for live editing.</p>
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <a href={viewingFile.localUrl} download target="_blank" rel="noreferrer" className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md px-4 py-3 text-sm font-medium flex items-center justify-center transition-colors"><Download className="w-4 h-4 mr-2 text-gray-500" /> Download File</a>
                {activeEdits[getEditKey()] ? (
                  <button onClick={handleSyncChanges} disabled={isSyncing} className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-md px-4 py-3 text-sm font-medium flex items-center justify-center transition-colors shadow-sm">{isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Pull Changes</button>
                ) : (
                  <button onClick={handleEditInDocs} disabled={isPushing} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-3 text-sm font-medium flex items-center justify-center transition-colors shadow-sm">{isPushing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />} Open in Docs</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};