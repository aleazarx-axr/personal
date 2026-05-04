// src/pages/ActivityLogs.tsx
import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../components/PortalLayout';

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
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/logs');
        if (!response.ok) throw new Error('Failed to fetch logs');
        setLogs(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <PortalLayout pageTitle="System Activity Logs">
      {error && <div className="mb-4 p-3 bg-red-50 text-[#9B1C1C] border border-red-200 text-sm">{error}</div>}

      <div className="border border-gray-300 rounded-none bg-white overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="p-4 border-r border-gray-200 w-48">Timestamp</th>
              <th className="p-4 border-r border-gray-200">User / Initiator</th>
              <th className="p-4 border-r border-gray-200 w-48">Action</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-800">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium">Loading activity logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500 font-medium">No activity recorded yet.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-4 border-r border-gray-200 text-gray-500 font-mono text-xs">{formatDate(log.created_at)}</td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="font-bold">{log.user_name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{log.role}</div>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider rounded-none">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
};