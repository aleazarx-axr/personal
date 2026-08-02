// src/pages/ActivityLogs.tsx
import React, { useState, useEffect } from 'react';
import { Search, Activity, AlertCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface Log { 
  id: number; 
  action: string; 
  details: string; 
  created_at: string; 
  user_name: string; 
  role: string; 
}

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/logs`);
        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.message || `Database Query Failed (Status ${response.status}).`);
        }
        setLogs(await response.json());
      } catch (err: any) {
        showNotify(err.message === 'Failed to fetch' ? 'Server offline. Please restart node server.js' : err.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Color coding for different system actions
  const getActionStyle = (action: string) => {
    const upperAction = action.toUpperCase();
    if (upperAction.includes('CREATE') || upperAction.includes('ADD') || upperAction.includes('UPLOAD') || upperAction.includes('LOG')) {
      return 'bg-green-50 text-green-700 border-green-200';
    }
    if (upperAction.includes('DELETE') || upperAction.includes('ARCHIVE') || upperAction.includes('REMOVE')) {
      return 'bg-red-50 text-red-700 border-red-200';
    }
    if (upperAction.includes('UPDATE') || upperAction.includes('EDIT') || upperAction.includes('ROUTE')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (upperAction.includes('LOGIN') || upperAction.includes('SYSTEM')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const filteredLogs = logs.filter(log => {
    const searchString = `${log.action} ${log.details} ${log.user_name} ${log.role}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <>
      
      {/* Formal Top Right Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-700'}`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-80 hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
        </div>
      )}

      {/* HEADER SECTION WITH FILTER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute inset-y-0 left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search audit trail by user, action, or details..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors shadow-sm" 
          />
        </div>
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm w-full sm:w-auto justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-gray-400 mr-2" />
          Immutable System Records
        </div>
      </div>

      <div className="flex-1 bg-transparent md:bg-white md:border border-gray-200 md:shadow-sm md:rounded-lg overflow-hidden">
        
        {/* --- MOBILE COMPACT VIEW (DOCKET CARDS) --- */}
        <div className="md:hidden flex flex-col gap-3 pb-6">
          {loading ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">Loading audit trail...</div>
          ) : filteredLogs.length === 0 ? (
             <div className="p-6 text-center text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md">No activity records match your search.</div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="bg-white border border-gray-200 rounded-md shadow-sm flex flex-col overflow-hidden">
                {/* Card Header: Timestamp & Action */}
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                  <span className="font-mono text-[10px] font-semibold text-gray-500">
                    {formatDate(log.created_at)}
                  </span>
                  <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border rounded ${getActionStyle(log.action)}`}>
                    {log.action}
                  </span>
                </div>

                {/* Card Body: User & Details */}
                <div className="p-4">
                  <div className="font-semibold text-gray-900 text-sm leading-snug">{log.user_name}</div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5 mb-3">{log.role}</div>
                  
                  <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                    {log.details}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- DESKTOP VIEW (FORMAL TABLE) --- */}
        <table className="w-full text-left border-collapse hidden md:table">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[11px] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-3 font-semibold w-48">Timestamp</th>
              <th className="px-6 py-3 font-semibold w-64">Initiator / User Account</th>
              <th className="px-6 py-3 font-semibold w-48 text-center">System Action</th>
              <th className="px-6 py-3 font-semibold">Event Details</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800 divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium text-sm flex items-center justify-center"><Activity className="w-4 h-4 animate-spin mr-2"/> Loading audit trail...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium text-sm">No activity records match your search.</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  
                  {/* Timestamp */}
                  <td className="px-6 py-4 align-top pt-4">
                    <div className="font-mono text-xs font-medium text-gray-500">{formatDate(log.created_at)}</div>
                  </td>

                  {/* User */}
                  <td className="px-6 py-4 align-top pt-4">
                    <div className="font-medium text-gray-900 leading-tight">{log.user_name}</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">{log.role}</div>
                  </td>

                  {/* Action Pill */}
                  <td className="px-6 py-4 align-top pt-3.5 text-center">
                    <span className={`inline-flex px-2.5 py-1 border text-[10px] font-bold uppercase tracking-widest rounded ${getActionStyle(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  {/* Details */}
                  <td className="px-6 py-4 align-top text-sm text-gray-600 leading-relaxed pt-4">
                    {log.details}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </>
  );
};