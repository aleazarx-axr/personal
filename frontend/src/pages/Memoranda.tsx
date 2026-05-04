// src/pages/Memoranda.tsx
import React, { useState, useEffect, useRef } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { Search, FileText, Eye, Plus, Printer, Trash2, Download, ChevronDown, Edit, TableProperties } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface Signatory { name: string; designation: string; status?: string; }
interface Memo {
  id: number; memoNumber: string; date: string; subject: string; issuer: string; content: string;
  for_name: string; for_designation: string; thru_name: string; thru_designation: string;
  from_name: string; from_designation: string; table_data: string | null;
  signatories: Signatory[];
}

const TEMPLATE_TEXT = `This Memorandum Order is issued to [state the reason or objective briefly]. It aims to [explain the intended outcome or goal].

This Order shall apply to [specific offices, departments, or personnel involved].

In line with this, the following instructions are hereby issued:
1 [First instruction – clear and specific]
2 [Second instruction]
3 [Third instruction]

All concerned are directed to comply with the above instructions effective [date].`;

const PAPER_DIMENSIONS: Record<string, { width: string, minHeight: string, widthPx: number }> = {
  'a4': { width: '794px', minHeight: '1123px', widthPx: 794 },
  'letter': { width: '816px', minHeight: '1056px', widthPx: 816 },
  'legal': { width: '816px', minHeight: '1344px', widthPx: 816 }
};

export const Memoranda: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  
  const [printSize, setPrintSize] = useState('a4');
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editMemoId, setEditMemoId] = useState<number | null>(null);
  const [newMemo, setNewMemo] = useState({ 
    subject: '', content: TEMPLATE_TEXT, for_name: '', for_designation: '', 
    thru_name: '', thru_designation: '', from_name: '', from_designation: ''
  });
  const [signatories, setSignatories] = useState<Signatory[]>([{ name: '', designation: '' }]);
  
  const [hasTable, setHasTable] = useState(false);
  const [tableData, setTableData] = useState<string[][]>([['Column 1', 'Column 2'], ['Data A', 'Data B']]);

  const userString = localStorage.getItem('portalUser');
  const loggedInUser = userString ? JSON.parse(userString) : { role: 'Student', id: 0, firstName: 'User', lastName: '' };
  const canCreate = ['Superuser', 'Admin', 'Staff'].includes(loggedInUser.role);

  const fetchMemos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/memoranda');
      if (response.ok) setMemos(await response.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchMemos(); }, []);

  const filteredMemos = memos.filter(memo => memo.subject.toLowerCase().includes(searchTerm.toLowerCase()) || memo.memoNumber.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const addSignatory = () => setSignatories([...signatories, { name: '', designation: '' }]);
  const removeSignatory = (index: number) => setSignatories(signatories.filter((_, i) => i !== index));
  const updateSignatory = (index: number, field: keyof Signatory, value: string) => {
    const newSigs = [...signatories]; newSigs[index][field] = value; setSignatories(newSigs);
  };

  const addTableRow = () => setTableData([...tableData, new Array(tableData[0].length).fill('')]);
  const addTableCol = () => setTableData(tableData.map(row => [...row, '']));
  const removeTableRow = (index: number) => setTableData(tableData.filter((_, i) => i !== index));
  const removeTableCol = (index: number) => setTableData(tableData.map(row => row.filter((_, i) => i !== index)));
  const updateTableCell = (rIndex: number, cIndex: number, value: string) => {
    const newData = [...tableData]; newData[rIndex][cIndex] = value; setTableData(newData);
  };

  const handleOpenCreate = () => {
    setEditMemoId(null);
    setNewMemo({ subject: '', content: TEMPLATE_TEXT, for_name: '', for_designation: '', thru_name: '', thru_designation: '', from_name: `${loggedInUser.firstName} ${loggedInUser.lastName}`, from_designation: loggedInUser.role });
    setSignatories([{ name: '', designation: '' }]);
    setHasTable(false); setTableData([['Column 1', 'Column 2'], ['Data A', 'Data B']]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (memo: Memo) => {
    setEditMemoId(memo.id);
    setNewMemo({ subject: memo.subject, content: memo.content, for_name: memo.for_name, for_designation: memo.for_designation, thru_name: memo.thru_name || '', thru_designation: memo.thru_designation || '', from_name: memo.from_name, from_designation: memo.from_designation });
    setSignatories(memo.signatories?.length ? memo.signatories : [{ name: '', designation: '' }]);
    if (memo.table_data) {
      setHasTable(true); setTableData(JSON.parse(memo.table_data));
    } else {
      setHasTable(false); setTableData([['Column 1', 'Column 2'], ['Data A', 'Data B']]);
    }
    setIsCreateModalOpen(true);
  };

  const handleSubmitMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...newMemo, issuer_id: loggedInUser.id, signatories, table_data: hasTable ? JSON.stringify(tableData) : null };
      const url = editMemoId ? `http://localhost:5000/api/memoranda/${editMemoId}` : 'http://localhost:5000/api/memoranda/create';
      const response = await fetch(url, { method: editMemoId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Action failed');
      setIsCreateModalOpen(false); fetchMemos();
    } catch (err: any) { alert(err.message); }
  };

  // --- REWRITTEN PDF DOWNLOAD (Fixes TypeScript Promise error & Blank Pages) ---
  const handleDownloadPDF = () => {
    if (!documentRef.current || !selectedMemo) return;
    const element = documentRef.current;
    
    // Unconstrain height to ensure natural paging length
    const originalMinHeight = element.style.minHeight;
    element.style.minHeight = 'auto';
    
    const theadElement = document.getElementById('memo-thead');
    const tfootElement = document.getElementById('memo-tfoot');
    const headerImg = document.getElementById('memo-header-img') as HTMLImageElement;
    const footerImg = document.getElementById('memo-footer-img') as HTMLImageElement;

    const paperWidthIn = PAPER_DIMENSIONS[printSize].widthPx / 96;
    const headerHeightIn = paperWidthIn * ((headerImg?.naturalHeight || 150) / (headerImg?.naturalWidth || 800));
    const footerHeightIn = paperWidthIn * ((footerImg?.naturalHeight || 100) / (footerImg?.naturalWidth || 800));

    const opt: any = {
      margin:       [headerHeightIn, 0, footerHeightIn, 0], 
      filename:     `${selectedMemo.memoNumber}.pdf`, 
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, windowWidth: PAPER_DIMENSIONS[printSize].widthPx }, 
      jsPDF:        { unit: 'in', format: printSize, orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'], avoid: ['.print\\:break-inside-avoid', 'tr'] } 
    };

    if (theadElement) theadElement.style.display = 'none';
    if (tfootElement) tfootElement.style.display = 'none';

    const worker = html2pdf().set(opt).from(element);

    // FIX: Cast the result of .then() to 'any' to bypass strict TS checking before calling .save()
    (worker.toPdf().get('pdf').then(function (pdf: any) {
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        if (headerImg?.complete) pdf.addImage(headerImg, 'PNG', 0, 0, paperWidthIn, headerHeightIn);
        if (footerImg?.complete) pdf.addImage(footerImg, 'PNG', 0, pdf.internal.pageSize.getHeight() - footerHeightIn, paperWidthIn, footerHeightIn);
      }
    }) as any).save().then(() => {
      if (theadElement) theadElement.style.display = 'table-header-group';
      if (tfootElement) tfootElement.style.display = 'table-footer-group';
      element.style.minHeight = originalMinHeight;
    });
  };

  return (
    <PortalLayout pageTitle="Memoranda & Issuances">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search memoranda..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 p-2 border border-gray-300 bg-white text-sm focus:outline-none focus:border-[#9B1C1C] rounded-none shadow-sm" />
        </div>
        {canCreate && (
          <button onClick={handleOpenCreate} className="w-full sm:w-auto bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2 text-sm font-semibold uppercase tracking-wider transition-colors rounded-none shadow-sm flex items-center justify-center">
            <Plus className="w-4 h-4 mr-2" /> Publish Memo
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-300 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4 border-r border-gray-200 w-48">Reference No.</th>
                <th className="p-4 border-r border-gray-200">Subject</th>
                <th className="p-4 border-r border-gray-200 w-40">Date Issued</th>
                <th className="p-4 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-800">
              {loading ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading memoranda...</td></tr> : 
               filteredMemos.length === 0 ? <tr><td colSpan={4} className="p-8 text-center text-gray-500">No memoranda found.</td></tr> : 
               filteredMemos.map((memo) => (
                  <tr key={memo.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-r border-gray-200 font-mono text-xs text-gray-600">{memo.memoNumber}</td>
                    <td className="p-4 border-r border-gray-200 font-bold text-gray-800">{memo.subject}</td>
                    <td className="p-4 border-r border-gray-200 text-gray-500 text-xs">{formatDate(memo.date)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-4">
                        <button onClick={() => setSelectedMemo(memo)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider flex items-center"><Eye className="w-4 h-4 mr-1" /> View</button>
                        {canCreate && <button onClick={() => handleOpenEdit(memo)} className="text-gray-500 hover:text-[#9B1C1C] font-bold text-xs uppercase tracking-wider flex items-center"><Edit className="w-4 h-4 mr-1" /> Edit</button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-[1400px] w-full border border-gray-300 rounded-none shadow-xl h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#9B1C1C]"/> {editMemoId ? 'Update Existing Document' : 'Document Drafting Interface'}
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-200 px-3 py-1">{editMemoId ? 'Memo No: Locked' : 'Memo No: Auto-Generated'}</span>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-800 font-bold text-lg">X</button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitMemo} className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="w-full lg:w-[350px] border-r border-gray-300 p-6 overflow-y-auto bg-gray-50 space-y-6 shrink-0">
                  <div>
                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">Subject Title</label>
                    <input type="text" required value={newMemo.subject} onChange={(e) => setNewMemo({...newMemo, subject: e.target.value})} className="w-full p-2 border border-gray-300 bg-white text-sm focus:outline-none focus:border-[#9B1C1C]" />
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-300">
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Routing Details</h4>
                    <div className="flex gap-2"><div className="w-1/2"><label className="block text-[10px] font-bold text-[#9B1C1C] uppercase mb-1">FOR (Name)</label><input type="text" required value={newMemo.for_name} onChange={(e) => setNewMemo({...newMemo, for_name: e.target.value})} className="w-full p-2 border border-gray-300 bg-white text-xs" /></div><div className="w-1/2"><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Designation</label><input type="text" required value={newMemo.for_designation} onChange={(e) => setNewMemo({...newMemo, for_designation: e.target.value})} className="w-full p-2 border border-gray-300 bg-white text-xs" /></div></div>
                    <div className="flex gap-2"><div className="w-1/2"><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">THRU (Optional)</label><input type="text" value={newMemo.thru_name} onChange={(e) => setNewMemo({...newMemo, thru_name: e.target.value})} className="w-full p-2 border border-gray-300 bg-white text-xs" /></div><div className="w-1/2"><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Designation</label><input type="text" value={newMemo.thru_designation} onChange={(e) => setNewMemo({...newMemo, thru_designation: e.target.value})} className="w-full p-2 border border-gray-300 bg-white text-xs" /></div></div>
                    <div className="flex gap-2"><div className="w-1/2"><label className="block text-[10px] font-bold text-[#9B1C1C] uppercase mb-1">FROM (Name)</label><input type="text" required value={newMemo.from_name} onChange={(e) => setNewMemo({...newMemo, from_name: e.target.value})} className="w-full p-2 border border-gray-300 bg-white text-xs" /></div><div className="w-1/2"><label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Designation</label><input type="text" required value={newMemo.from_designation} onChange={(e) => setNewMemo({...newMemo, from_designation: e.target.value})} className="w-full p-2 border border-gray-300 bg-white text-xs" /></div></div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center"><h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Signatories</h4><button type="button" onClick={addSignatory} className="text-[#9B1C1C] text-[10px] font-bold hover:underline">+ Add Signer</button></div>
                    {signatories.map((sig, index) => (
                      <div key={index} className="flex items-end gap-2 bg-white p-2 border border-gray-200">
                        <div className="w-[45%]"><label className="block text-[9px] font-bold text-gray-600 uppercase mb-1">Name</label><input type="text" required value={sig.name} onChange={(e) => updateSignatory(index, 'name', e.target.value)} className="w-full p-1 border-b border-gray-300 text-[10px] focus:outline-none focus:border-[#9B1C1C]" /></div>
                        <div className="w-[45%]"><label className="block text-[9px] font-bold text-gray-600 uppercase mb-1">Title</label><input type="text" required value={sig.designation} onChange={(e) => updateSignatory(index, 'designation', e.target.value)} className="w-full p-1 border-b border-gray-300 text-[10px] focus:outline-none focus:border-[#9B1C1C]" /></div>
                        {signatories.length > 1 && <button type="button" onClick={() => removeSignatory(index)} className="text-gray-400 hover:text-red-600 mb-1 w-[10%]"><Trash2 className="w-3 h-3" /></button>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col bg-white overflow-y-auto">
                  <div className="flex-1 flex flex-col mb-6 min-h-[300px]">
                    <label className="block text-xs font-black text-gray-800 uppercase tracking-wider mb-2">Document Body</label>
                    <textarea required value={newMemo.content} onChange={(e) => setNewMemo({...newMemo, content: e.target.value})} className="flex-1 w-full p-6 border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:border-[#9B1C1C] resize-none whitespace-pre-wrap font-['Cambria',_serif] leading-loose" placeholder="Type document content here..."></textarea>
                  </div>

                  <div className="border-t border-gray-300 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <TableProperties className="w-5 h-5 mr-2 text-gray-600" />
                        <label className="text-xs font-black text-gray-800 uppercase tracking-wider mr-4">Include Data Table</label>
                        <input type="checkbox" checked={hasTable} onChange={(e) => setHasTable(e.target.checked)} className="w-4 h-4 accent-[#9B1C1C]" />
                      </div>
                      {hasTable && (
                        <div className="space-x-3">
                          <button type="button" onClick={addTableRow} className="text-xs font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 px-3 py-1 uppercase">+ Row</button>
                          <button type="button" onClick={addTableCol} className="text-xs font-bold text-gray-600 bg-gray-200 hover:bg-gray-300 px-3 py-1 uppercase">+ Column</button>
                        </div>
                      )}
                    </div>

                    {hasTable && (
                      <div className="overflow-x-auto border border-gray-300">
                        <table className="w-full text-sm">
                          <tbody>
                            {tableData.map((row, rIndex) => (
                              <tr key={rIndex}>
                                {row.map((cell, cIndex) => (
                                  <td key={cIndex} className="border border-gray-300 relative group p-0">
                                    <input 
                                      type="text" value={cell} onChange={(e) => updateTableCell(rIndex, cIndex, e.target.value)} 
                                      className={`w-full p-2 focus:outline-none focus:bg-yellow-50 ${rIndex === 0 ? 'font-bold bg-gray-100 text-center' : ''}`}
                                      placeholder={`R${rIndex+1} C${cIndex+1}`}
                                    />
                                    {rIndex === 0 && tableData[0].length > 1 && (
                                      <button type="button" onClick={() => removeTableCol(cIndex)} className="absolute top-[-25px] left-1/2 -translate-x-1/2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3"/></button>
                                    )}
                                  </td>
                                ))}
                                {tableData.length > 1 && (
                                  <td className="w-8 text-center p-0 border-l border-gray-300 bg-gray-50">
                                    <button type="button" onClick={() => removeTableRow(rIndex)} className="text-red-500 hover:text-red-700 w-full h-full p-2 flex justify-center"><Trash2 className="w-4 h-4"/></button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 flex justify-end gap-3 border-t border-gray-300 bg-gray-50 shrink-0">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-600 uppercase tracking-wider hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-8 py-2 text-sm font-bold uppercase tracking-wider transition-colors">{editMemoId ? 'Save Changes' : 'Generate Document'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW MEMO MODAL WITH AGGRESSIVE PRINT PAGINATION CSS --- */}
      {selectedMemo && (
        <div id="print-container" className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          
          <div id="print-modal-content" className="bg-white max-w-5xl w-full rounded-none shadow-2xl flex flex-col h-[95vh]">
            
            {/* Control Bar */}
            <div className="flex justify-between items-center p-4 border-b border-gray-300 bg-gray-100 shrink-0 print:hidden">
              <span className="font-bold text-gray-600 text-xs uppercase tracking-widest">Document Viewer</span>
              <div className="flex items-center space-x-4">
                
                <div className="flex items-center">
                  <label className="text-xs font-bold text-gray-600 uppercase mr-2">Paper Size:</label>
                  <select 
                    value={printSize} 
                    onChange={(e) => setPrintSize(e.target.value)} 
                    className="border border-gray-300 bg-white p-1 text-xs focus:outline-none focus:border-[#9B1C1C]"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>

                <div className="relative border-l border-gray-300 pl-4">
                  <button onClick={() => setIsActionDropdownOpen(!isActionDropdownOpen)} className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-5 py-2 text-sm font-bold uppercase tracking-wider flex items-center transition-colors shadow-sm">
                    Export / Print <ChevronDown className="w-4 h-4 ml-2"/>
                  </button>
                  {isActionDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 shadow-2xl z-50 flex flex-col overflow-hidden">
                      <button onClick={() => { handleDownloadPDF(); setIsActionDropdownOpen(false); }} className="px-5 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center border-b border-gray-200 transition-colors"><Download className="w-4 h-4 mr-3 text-[#9B1C1C]"/> PDF Document</button>
                      <button onClick={() => { window.print(); setIsActionDropdownOpen(false); }} className="px-5 py-3 text-left text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center transition-colors"><Printer className="w-4 h-4 mr-3 text-gray-600"/> Print Document</button>
                    </div>
                  )}
                </div>
                <button onClick={() => { setSelectedMemo(null); setIsActionDropdownOpen(false); }} className="text-gray-500 hover:text-[#9B1C1C] font-black text-xl transition-colors pl-4 border-l border-gray-300">&times;</button>
              </div>
            </div>
            
            {/* THE SCROLLING WRAPPER */}
            <div id="print-scroll-wrapper" className="overflow-y-auto bg-gray-200 flex-1 flex justify-center py-8">
              
              {/* THE DOCUMENT CONTAINER */}
              <div 
                id="memo-document-container"
                ref={documentRef} 
                className="bg-white text-black shadow-md transition-all duration-300 ease-in-out"
                style={{ 
                  width: PAPER_DIMENSIONS[printSize].width, 
                  minHeight: PAPER_DIMENSIONS[printSize].minHeight 
                }}
              >
                <table className="w-full font-['Cambria',_serif] text-[12pt] leading-tight print:break-inside-auto">
                  <thead className="table-header-group" id="memo-thead">
                    <tr><td className="p-0 m-0 border-0 print:h-[1.2in]">
                      <div id="html-header" className="print:fixed print:top-0 print:left-0 print:w-full print:z-50">
                        <img id="memo-header-img" src="/header.png" alt="WMSU Header" className="w-full block object-cover" crossOrigin="anonymous" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </div>
                    </td></tr>
                  </thead>

                  <tfoot className="table-footer-group" id="memo-tfoot">
                    <tr><td className="p-0 m-0 border-0 print:h-[0.8in]">
                      <div id="html-footer" className="print:fixed print:bottom-0 print:left-0 print:w-full print:z-50">
                        <img id="memo-footer-img" src="/footer.png" alt="WMSU Footer" className="w-full block object-cover" crossOrigin="anonymous" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </div>
                    </td></tr>
                  </tfoot>

                  <tbody className="table-row-group">
                    <tr>
                      <td className="px-10 md:px-[0.5in] pt-8 pb-12 align-top border-0">
                        
                        <div className="text-left mb-8">
                          <div className="uppercase font-bold">OFFICE OF THE OIC - CAMPUS COORDINATOR</div>
                          <div className="font-bold">{selectedMemo.memoNumber}</div>

                          <div className="grid grid-cols-[80px_15px_1fr] gap-y-2 mt-6">
                            <div className="uppercase font-bold">FOR</div><div className="font-bold">:</div>
                            <div className="mb-2"><span className="uppercase font-bold">{selectedMemo.for_name}</span><br/><span className="capitalize">{selectedMemo.for_designation}</span></div>

                            {selectedMemo.thru_name && (
                              <><div className="uppercase font-bold">THRU</div><div className="font-bold">:</div>
                              <div className="mb-2"><span className="uppercase font-bold">{selectedMemo.thru_name}</span><br/><span className="capitalize">{selectedMemo.thru_designation}</span></div></>
                            )}

                            <div className="uppercase font-bold">FROM</div><div className="font-bold">:</div>
                            <div className="mb-2"><span className="uppercase font-bold">{selectedMemo.from_name}</span><br/><span className="capitalize">{selectedMemo.from_designation}</span></div>

                            <div className="uppercase font-bold pt-2">SUBJECT</div><div className="font-bold pt-2">:</div>
                            <div className="uppercase font-bold pt-2 mb-2">{selectedMemo.subject}</div>

                            <div className="uppercase font-bold">DATE</div><div className="font-bold">:</div>
                            <div className="font-bold">{formatDate(selectedMemo.date)}</div>
                          </div>
                        </div>

                        <div className="text-left whitespace-pre-wrap leading-normal mb-8 print:break-inside-auto">
                          {selectedMemo.content}
                        </div>

                        {selectedMemo.table_data && JSON.parse(selectedMemo.table_data).length > 0 && (
                          <div className="mb-12 print:break-inside-avoid">
                            <table className="w-full border-collapse border border-black text-center">
                              <thead>
                                <tr>
                                  {JSON.parse(selectedMemo.table_data)[0].map((header: string, i: number) => (
                                    <th key={i} className="border border-black p-2 font-bold bg-gray-100 print:bg-gray-100" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{header}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {JSON.parse(selectedMemo.table_data).slice(1).map((row: string[], rIndex: number) => (
                                  <tr key={rIndex}>
                                    {row.map((cell: string, cIndex: number) => (
                                      <td key={cIndex} className="border border-black p-2">{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-16 mt-12 mb-8 print:break-inside-avoid">
                          {selectedMemo.signatories?.map((sig, index) => {
                            const isThirdOfThree = selectedMemo.signatories.length === 3 && index === 2;
                            return (
                              <div key={index} className={`${isThirdOfThree ? 'w-full flex justify-center mt-4' : 'w-5/12'} flex flex-col items-center`}>
                                <div className="w-full max-w-[250px] text-center">
                                  <div className="h-16"></div>
                                  <div className="uppercase font-bold">{sig.name}</div>
                                  <div className="capitalize">{sig.designation}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AGGRESSIVE PRINT PAGINATION OVERRIDES */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              @page { size: ${printSize}; margin: 0; }
              
              /* Force height unconstraint on body */
              html, body { 
                height: auto !important; 
                min-height: auto !important; 
                overflow: visible !important; 
                background: white !important; 
              }
              
              /* Hide all normal UI elements in print mode */
              body * { visibility: hidden; }
              
              /* Show ONLY the print container and its children */
              #print-container, #print-container * { visibility: visible; }
              
              /* CRITICAL FIX: Free the container from all fixed & flex constraints 
                so the browser engine can naturally paginate the height! 
              */
              #print-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                height: auto !important;
                min-height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow: visible !important;
                display: block !important;
              }

              /* Strip flexbox from all parents that wrap the document */
              #print-modal-content, #print-scroll-wrapper {
                display: block !important;
                height: auto !important;
                min-height: auto !important;
                overflow: visible !important;
                position: static !important;
                box-shadow: none !important;
                max-width: none !important;
                padding: 0 !important;
              }
              
              #memo-document-container {
                width: 100% !important;
                height: auto !important;
                min-height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                display: block !important;
              }

              .print\\:hidden { display: none !important; }
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          `}} />
        </div>
      )}
    </PortalLayout>
  );
};