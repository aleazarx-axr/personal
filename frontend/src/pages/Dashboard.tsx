// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Clock, CheckCircle, Activity, ArrowRight, ShieldAlert, Plus, FileSignature, ChevronDown, Wifi, Copy } from 'lucide-react';

interface MetricState {
  activeUsers: number;
  pendingDocs: number;
  completedDocs: number;
  totalDrafts: number;
}

// --- CUSTOM STATUS BADGE DROPDOWN ---
// Identical to the Registry module: strictly sized to w-[105px] and overlays downwards
const StatusSelect = ({ value, onChange, disabled }: { value: string, onChange: (val: string) => void, disabled: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getStyle = (val: string) => {
    if (val === 'Completed') return 'bg-green-50 text-green-700 border-green-200';
    if (val === 'Returned') return 'bg-red-50 text-red-700 border-red-200';
    if (val === 'Routed') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  return (
    <div className="relative w-[105px] shrink-0">
      <div 
        onClick={(e) => { e.preventDefault(); if (!disabled) setIsOpen(!isOpen); }}
        className={`w-full px-2 py-1.5 border rounded text-[10px] font-semibold uppercase tracking-wider flex justify-between items-center transition-all ${getStyle(value)} ${disabled ? 'opacity-90 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
      >
        <span>{value}</span>
        {!disabled && <ChevronDown className={`w-3 h-3 ml-1 opacity-70 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </div>
      
      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); setIsOpen(false); }}></div>
          <div className="absolute z-[100] w-[115px] top-full mt-1 right-0 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden">
            {['Pending', 'Routed', 'Returned', 'Completed'].map(opt => (
              <div 
                key={opt}
                onClick={(e) => { e.preventDefault(); onChange(opt); setIsOpen(false); }}
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

export const Dashboard: React.FC = () => {
  const userString = localStorage.getItem('portalUser');
  const loggedInUser = userString ? JSON.parse(userString) : { firstName: 'User', role: 'Student' };
  
  const [metrics, setMetrics] = useState<MetricState>({ activeUsers: 0, pendingDocs: 0, completedDocs: 0, totalDrafts: 0 });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkInfo, setNetworkInfo] = useState({ ip: '', port: '' });

  const fetchDashboardData = async () => {
    try {
      const [usersRes, docsRes, memosRes, networkRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/users`),
        fetch(`${import.meta.env.VITE_API_URL}/api/document-tracking`),
        fetch(`${import.meta.env.VITE_API_URL}/api/memoranda`),
        loggedInUser.role === 'Superuser' ? fetch(`${import.meta.env.VITE_API_URL}/api/system/network-info`) : Promise.resolve(null)
      ]);

      if (networkRes && networkRes.ok) {
        setNetworkInfo(await networkRes.json());
      }

      if (usersRes.ok && docsRes.ok && memosRes.ok) {
        const users = await usersRes.json();
        const docs = await docsRes.json();
        const memos = await memosRes.json();

        setMetrics({
          activeUsers: users.filter((u: any) => u.status === 'Active').length,
          pendingDocs: docs.filter((d: any) => d.status === 'Pending').length,
          completedDocs: docs.filter((d: any) => d.status === 'Completed').length,
          totalDrafts: memos.length
        });

        const activeDocs = docs.filter((d: any) => d.status !== 'Completed').slice(0, 4);
        setRecentDocs(activeDocs);
      }
    } catch (error) { 
      console.error("Dashboard fetch error:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick Action directly from Dashboard
  const handleQuickStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/document-tracking/${id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Error updating status');
      // Refresh dashboard data instantly to update metrics and the list
      fetchDashboardData();
    } catch (error: any) { 
      console.error(error.message); 
    }
  };

  if (loggedInUser.role === 'Student') {
    return (
      <>
        <div className="bg-[#9B1C1C] text-white p-6 md:p-8 rounded-lg shadow-sm border border-[#7a1515]">
          <h2 className="text-xl font-bold mb-1">Welcome to MyWMSU, {loggedInUser.firstName}!</h2>
          <p className="text-red-100 text-sm">Your student portal access is limited. Please contact administration.</p>
        </div>
      </>
    );
  }

  return (
    <>
      
      {/* Welcome Banner */}
      <div className="bg-[#9B1C1C] text-white p-6 md:p-8 mb-6 rounded-lg shadow-sm border border-[#7a1515] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">
            Welcome back, {loggedInUser.firstName} {loggedInUser.lastName}
          </h2>
          <p className="text-red-100 text-sm font-medium flex items-center mb-3">
            <ShieldAlert className="w-4 h-4 mr-2 opacity-80" />
            Authenticated as {loggedInUser.role}. System is operating normally.
          </p>

          {loggedInUser.role === 'Superuser' && networkInfo.ip && (
            <div className="inline-flex items-center bg-black/20 rounded-md px-3 py-1.5 text-xs font-mono text-red-50 border border-black/10">
              <Wifi className="w-3.5 h-3.5 mr-2 opacity-80" />
              <span>Local Network URL: </span>
              <span className="font-bold ml-1 tracking-wide">https://{networkInfo.ip}:{networkInfo.port}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(`https://${networkInfo.ip}:${networkInfo.port}`)}
                className="ml-3 p-1 hover:bg-white/10 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link to="/document-tracking" className="flex-1 md:flex-none h-[42px] px-4 bg-white text-[#9B1C1C] hover:bg-gray-100 text-sm font-medium flex items-center justify-center transition-colors rounded-md shadow-sm border border-transparent">
            Documents
          </Link>
          <Link to="/memoranda" className="flex-1 md:flex-none h-[42px] px-4 bg-transparent border border-white text-white hover:bg-white/10 text-sm font-medium flex items-center justify-center transition-colors rounded-md">
            Draft New
          </Link>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Action</p>
              <h3 className="text-3xl font-bold text-gray-900">{loading ? '-' : metrics.pendingDocs}</h3>
            </div>
            <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-md border border-yellow-100"><Clock className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Drafted Documents</p>
              <h3 className="text-3xl font-bold text-gray-900">{loading ? '-' : metrics.totalDrafts}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100"><FileSignature className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Completed Files</p>
              <h3 className="text-3xl font-bold text-gray-900">{loading ? '-' : metrics.completedDocs}</h3>
            </div>
            <div className="p-2.5 bg-green-50 text-green-600 rounded-md border border-green-100"><CheckCircle className="w-5 h-5" /></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Active Users</p>
              <h3 className="text-3xl font-bold text-gray-900">{loading ? '-' : metrics.activeUsers}</h3>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-md border border-purple-100"><Users className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT ACTIVITY SECTION */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-4 h-4 text-[#9B1C1C] mr-2" />
              <h3 className="font-semibold text-gray-800 text-sm">Action Required: Active Documents</h3>
            </div>
            <Link to="/document-tracking" className="text-xs font-medium text-gray-500 hover:text-[#9B1C1C] transition-colors flex items-center">
              View Logbook <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          <div className="flex-1 bg-gray-50 md:bg-white">
            
            {/* MOBILE DOCKET CARDS */}
            <div className="md:hidden p-4 flex flex-col gap-4">
              {loading ? (
                 <div className="p-6 text-center text-sm font-medium text-gray-500">Loading data...</div>
              ) : recentDocs.length === 0 ? (
                 <div className="p-6 text-center text-sm font-medium text-gray-500">No pending documents. You're all caught up!</div>
              ) : (
                recentDocs.map((doc: any) => (
                  <Link to={`/document-tracking`} key={doc.id} className="block bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow overflow-visible">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-mono text-xs font-semibold text-[#9B1C1C] tracking-wider truncate">{doc.tracking_number}</span>
                      </div>
                      
                      {/* INTERACTIVE CUSTOM STATUS OVERLAY IN DASHBOARD */}
                      <StatusSelect 
                        value={doc.status || 'Pending'}
                        onChange={(val) => handleQuickStatusChange(doc.id, val)}
                        disabled={doc.status === 'Completed'}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm leading-snug mb-3">{doc.subject}</h4>
                      <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-100">
                        <div className="flex items-start text-xs text-gray-600"><span className="w-12 text-gray-400 font-medium shrink-0">From</span><span className="font-medium truncate">{doc.sender}</span></div>
                        {doc.document_type && <div className="flex items-start text-xs text-gray-600"><span className="w-12 text-gray-400 font-medium shrink-0">Type</span><span className="truncate">{doc.document_type}</span></div>}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* DESKTOP TABLE */}
            <table className="w-full text-left border-collapse hidden md:table">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3 w-40">Tracking No.</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3 w-48">From</th>
                  <th className="px-6 py-3 w-36 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500 font-medium text-sm">Loading data...</td></tr>
                ) : recentDocs.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500 font-medium text-sm">No pending documents. You're all caught up!</td></tr>
                ) : (
                  recentDocs.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-medium text-[#9B1C1C] align-top pt-4">{doc.tracking_number}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px] align-top pt-3.5">{doc.subject}</td>
                      <td className="px-6 py-4 text-xs text-gray-600 truncate max-w-[150px] align-top pt-4">{doc.sender}</td>
                      <td className="px-6 py-4 align-top pt-3.5">
                        <div className="flex justify-center">
                          {/* INTERACTIVE CUSTOM STATUS OVERLAY IN DASHBOARD */}
                          <StatusSelect 
                            value={doc.status || 'Pending'}
                            onChange={(val) => handleQuickStatusChange(doc.id, val)}
                            disabled={doc.status === 'Completed'}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK ACTIONS & SYSTEM HEALTH */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center">
                <Activity className="w-4 h-4 text-gray-500 mr-2" /> Quick Actions
              </h3>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <Link to="/memoranda" className="w-full flex items-center px-4 py-3 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <Plus className="w-4 h-4 mr-2 text-[#9B1C1C]" /> Draft New Document
              </Link>
              <Link to="/document-tracking" className="w-full flex items-center px-4 py-3 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <FileText className="w-4 h-4 mr-2 text-[#9B1C1C]" /> Log Incoming Record
              </Link>
              {loggedInUser.role === 'Superuser' && (
                <Link to="/admin" className="w-full flex items-center px-4 py-3 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <Users className="w-4 h-4 mr-2 text-[#9B1C1C]" /> Register New User
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">System Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <span>Database Storage</span>
                  <span className="text-green-600">Healthy</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 rounded-full h-1.5 w-1/4"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  <span>Drive API Bridge</span>
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-green-500 rounded-full h-1.5 w-full"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};