// src/pages/DocumentLogging.tsx
import React, { useState, useEffect, useRef } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { Search, Plus, Edit, Trash2, BookOpen, AlertCircle, CheckCircle, RefreshCw, ArrowDownRight, ArrowUpRight, Copy, Paperclip, FileText } from 'lucide-react';

interface DocLog {
  id: number;
  tracking_number: string;
  category: 'Incoming' | 'Outgoing' | 'Internal';
  date_received: string;
  document_type: string;
  subject: string;
  sender: string;
  receiver: string;
  status: 'Pending' | 'Routed' | 'Completed';
  remarks: string;
  attachment: string | null;
}

export const DocumentLogging: React.FC = () => {
  const [logs, setLogs] = useState<DocLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Incoming' | 'Outgoing' | 'Internal'>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    date_received: new Date().toISOString().slice(0, 16),
    category: 'Incoming',
    document_type: 'Letter',
    subject: '', sender: '', receiver: '', status: 'Pending', remarks: ''
  });
  
  // File State & Validation
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userString = localStorage.getItem('portalUser');
  const loggedInUser = userString ? JSON.parse(userString) : { role: 'Student' };
  const canEdit = ['Superuser', 'Admin', 'Staff'].includes(loggedInUser.role);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/document-tracking');
      if (response.ok) setLogs(await response.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {
    const matchesTab = activeTab === 'All' || log.category === activeTab;
    const matchesSearch = log.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.sender.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenModal = (log?: DocLog) => {
    setErrorMsg('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (log) {
      setEditId(log.id);
      setFormData({
        date_received: new Date(log.date_received).toISOString().slice(0, 16),
        category: log.category || 'Incoming',
        document_type: log.document_type, subject: log.subject, sender: log.sender,
        receiver: log.receiver, status: log.status, remarks: log.remarks || ''
      });
    } else {
      setEditId(null);
      setFormData({
        date_received: new Date().toISOString().slice(0, 16), category: 'Incoming', document_type: 'Letter',
        subject: '', sender: '', receiver: '', status: 'Pending', remarks: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/jpeg', 'image/png'];
      
      if (!validTypes.includes(file.type)) {
        setErrorMsg('Invalid file type. Please upload a PDF, DOCX, JPG, or PNG.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setAttachment(null);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMsg('File is too large. Maximum size is 5MB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setAttachment(null);
        return;
      }

      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Form Data is required for File Uploads
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });
    
    if (attachment) {
      payload.append('attachment', attachment);
    }

    try {
      const url = editId ? `http://localhost:5000/api/document-tracking/${editId}` : 'http://localhost:5000/api/document-tracking';
      const response = await fetch(url, { method: editId ? 'PUT' : 'POST', body: payload });

      if (!response.ok) throw new Error('Failed to save document log');
      setIsModalOpen(false);
      fetchLogs();
    } catch (err: any) { setErrorMsg(err.message); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      await fetch(`http://localhost:5000/api/document-tracking/${id}`, { method: 'DELETE' });
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase rounded flex items-center inline-flex"><AlertCircle className="w-3 h-3 mr-1"/> Pending</span>;
      case 'Routed': return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded flex items-center inline-flex"><RefreshCw className="w-3 h-3 mr-1"/> Routed</span>;
      case 'Completed': return <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded flex items-center inline-flex"><CheckCircle className="w-3 h-3 mr-1"/> Completed</span>;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Incoming': return <ArrowDownRight className="w-3 h-3 mr-1 text-blue-600" />;
      case 'Outgoing': return <ArrowUpRight className="w-3 h-3 mr-1 text-green-600" />;
      case 'Internal': return <Copy className="w-3 h-3 mr-1 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <PortalLayout pageTitle="Document Logbook">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search by tracking no, subject, or sender..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 border border-gray-300 bg-white text-sm focus:outline-none focus:border-[#9B1C1C] shadow-sm" />
        </div>
        {canEdit && (
          <button onClick={() => handleOpenModal()} className="w-full sm:w-auto bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-semibold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" /> Log Document
          </button>
        )}
      </div>

      <div className="flex space-x-1 mb-4">
        {['All', 'Incoming', 'Outgoing', 'Internal'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? 'bg-[#9B1C1C] text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-300 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4 border-r border-gray-200">Tracking No.</th>
                <th className="p-4 border-r border-gray-200">Date Received</th>
                <th className="p-4 border-r border-gray-200">Document Info</th>
                <th className="p-4 border-r border-gray-200">Routing Info</th>
                <th className="p-4 border-r border-gray-200">Status & File</th>
                {canEdit && <th className="p-4 text-center w-24">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {loading ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading logs...</td></tr> : 
               filteredLogs.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-gray-500">No documents found.</td></tr> : 
               filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-r border-gray-200">
                      <div className="font-mono text-xs font-bold text-[#9B1C1C]">{log.tracking_number}</div>
                      <div className="flex items-center text-[10px] uppercase font-bold text-gray-500 mt-1">
                        {getCategoryIcon(log.category)} {log.category}
                      </div>
                    </td>
                    <td className="p-4 border-r border-gray-200 text-xs">{new Date(log.date_received).toLocaleString()}</td>
                    <td className="p-4 border-r border-gray-200">
                      <div className="font-bold">{log.subject}</div>
                      <div className="text-xs text-gray-500 uppercase mt-1">{log.document_type}</div>
                    </td>
                    <td className="p-4 border-r border-gray-200">
                      <div className="text-xs"><span className="font-bold text-gray-500">FROM:</span> {log.sender}</div>
                      <div className="text-xs mt-1"><span className="font-bold text-gray-500">TO:</span> {log.receiver}</div>
                    </td>
                    <td className="p-4 border-r border-gray-200">
                      <div className="flex flex-col items-start gap-2">
                        {getStatusBadge(log.status)}
                        {/* ATTACHMENT BADGE */}
                        {log.attachment && (
                          <a href={`http://localhost:5000${log.attachment}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold uppercase rounded flex items-center inline-flex border border-gray-300 transition-colors">
                            <FileText className="w-3 h-3 mr-1 text-blue-600"/> View File
                          </a>
                        )}
                      </div>
                      {log.remarks && <div className="text-[10px] text-gray-500 italic mt-2 truncate max-w-[150px]">{log.remarks}</div>}
                    </td>
                    {canEdit && (
                      <td className="p-4">
                        <div className="flex items-center justify-center space-x-3">
                          <button onClick={() => handleOpenModal(log)} className="text-gray-500 hover:text-blue-600" title="Edit"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(log.id)} className="text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full border border-gray-300 shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50">
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-[#9B1C1C]"/> {editId ? 'Edit Log Entry' : 'Log New Document'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-800 font-bold text-lg">X</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && <div className="p-3 bg-red-100 text-red-700 text-xs font-bold border border-red-300">{errorMsg}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Date & Time Received</label>
                  <input type="datetime-local" required value={formData.date_received} onChange={(e) => setFormData({...formData, date_received: e.target.value})} className="w-full p-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1C1C]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Category</label>
                  <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1C1C]">
                    <option value="Incoming">Incoming</option>
                    <option value="Outgoing">Outgoing</option>
                    <option value="Internal">Internal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Subject / Title</label>
                <input type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full p-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1C1C]" placeholder="Brief description of the document" />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Origin / Sender</label>
                  <input type="text" required value={formData.sender} onChange={(e) => setFormData({...formData, sender: e.target.value})} className="w-full p-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1C1C]" placeholder="E.g. College of Science" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Addressed To / Receiver</label>
                  <input type="text" required value={formData.receiver} onChange={(e) => setFormData({...formData, receiver: e.target.value})} className="w-full p-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1C1C]" placeholder="E.g. Campus Coordinator" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Document Type</label>
                  <select required value={formData.document_type} onChange={(e) => setFormData({...formData, document_type: e.target.value})} className="w-full p-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1C1C]">
                    <option value="Letter">Letter</option>
                    <option value="Endorsement">Endorsement</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Report">Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Current Status</label>
                  <select required value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full p-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1C1C]">
                    <option value="Pending">Pending</option>
                    <option value="Routed">Routed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Attach Digital Copy <span className="text-[10px] font-normal lowercase text-gray-400">(PDF, DOCX, JPG, PNG - Max 5MB)</span></label>
                <div className="flex items-center">
                  <Paperclip className="w-4 h-4 mr-2 text-gray-500" />
                  <input ref={fileInputRef} type="file" accept=".pdf, .docx, .doc, image/jpeg, image/png" onChange={handleFileChange} className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:uppercase file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Remarks / Action Taken</label>
                <textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} rows={2} className="w-full p-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1C1C]" placeholder="Add notes on routing, decisions made, etc..."></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-600 uppercase hover:bg-gray-100">Cancel</button>
                <button type="submit" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-8 py-2 text-sm font-bold uppercase">{editId ? 'Save Changes' : 'Log Document'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </PortalLayout>
  );
};