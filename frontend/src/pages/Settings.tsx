// src/pages/Settings.tsx
import React, { useState } from 'react';
import { PortalLayout } from '../components/PortalLayout';
import { Settings as SettingsIcon, Save, Database, Shield, Globe, AlertCircle, CheckCircle2, X, Download, ChevronDown, Loader2 } from 'lucide-react';

// --- CUSTOM OVERLAY DROPDOWN ---
const CustomSelect = ({ value, onChange, options, direction = "down", className = "h-[42px]" }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], direction?: "up" | "down", className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className={`relative w-full ${className}`}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm flex justify-between items-center cursor-pointer hover:border-gray-400 transition-colors`}
      >
        <span className="text-gray-700 truncate mr-2">{selected?.label || value}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className={`absolute z-[100] w-full ${direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 bg-white border border-gray-200 rounded-md shadow-xl overflow-hidden max-h-60 overflow-y-auto`}>
            {options.map(opt => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${opt.value === value ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600' : 'text-gray-700 hover:bg-gray-100 border-l-2 border-transparent'}`}
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

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'General' | 'Security' | 'Backup'>('General');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'MyWMSU Ipil Document Portal',
    contactEmail: 'admin@wmsu.edu.ph',
    academicYear: '2025-2026',
    defaultPagination: '25'
  });

  const [securitySettings, setSecuritySettings] = useState({
    maintenanceMode: false,
    enforceStrongPasswords: true,
    sessionTimeout: '60'
  });

  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showNotify("System configurations saved securely.", "success");
    }, 800);
  };

  const handleBackup = () => {
    showNotify("Compiling database backup. This will download shortly...", "success");
  };

  const inputClass = "w-full h-[42px] max-w-lg px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] transition-colors";

  return (
    <PortalLayout pageTitle="System Settings">
      
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-700'}`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-80 hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SETTINGS SIDEBAR MENU */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          <button 
            onClick={() => setActiveTab('General')}
            className={`w-full text-left px-4 py-3 flex items-center text-sm font-medium rounded-md transition-colors ${activeTab === 'General' ? 'bg-[#9B1C1C] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
          >
            <Globe className="w-4 h-4 mr-3" /> General Options
          </button>
          <button 
            onClick={() => setActiveTab('Security')}
            className={`w-full text-left px-4 py-3 flex items-center text-sm font-medium rounded-md transition-colors ${activeTab === 'Security' ? 'bg-[#9B1C1C] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
          >
            <Shield className="w-4 h-4 mr-3" /> Access & Security
          </button>
          <button 
            onClick={() => setActiveTab('Backup')}
            className={`w-full text-left px-4 py-3 flex items-center text-sm font-medium rounded-md transition-colors ${activeTab === 'Backup' ? 'bg-[#9B1C1C] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
          >
            <Database className="w-4 h-4 mr-3" /> Backup & Restore
          </button>
        </div>

        {/* SETTINGS CONTENT AREA */}
        <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-lg p-6 sm:p-8">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
            <SettingsIcon className="w-5 h-5 text-gray-500 mr-3" />
            <h2 className="text-base font-semibold text-gray-900">{activeTab} Configuration</h2>
          </div>

          <form onSubmit={handleSaveSettings}>
            
            {/* GENERAL TAB */}
            {activeTab === 'General' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Portal System Name</label>
                  <input type="text" value={generalSettings.systemName} onChange={(e) => setGeneralSettings({...generalSettings, systemName: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Admin Contact Email</label>
                  <input type="email" value={generalSettings.contactEmail} onChange={(e) => setGeneralSettings({...generalSettings, contactEmail: e.target.value})} className={inputClass} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Current Academic Year</label>
                    <input type="text" value={generalSettings.academicYear} onChange={(e) => setGeneralSettings({...generalSettings, academicYear: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Default Table Rows</label>
                    <CustomSelect 
                      value={generalSettings.defaultPagination} 
                      onChange={(val) => setGeneralSettings({...generalSettings, defaultPagination: val})} 
                      options={[
                        {value: '10', label: '10 Rows per page'},
                        {value: '25', label: '25 Rows per page'},
                        {value: '50', label: '50 Rows per page'}
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'Security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between max-w-lg p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Maintenance Mode</div>
                    <div className="text-xs text-gray-500 mt-0.5">Locks out all non-Superuser accounts</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={securitySettings.maintenanceMode} onChange={(e) => setSecuritySettings({...securitySettings, maintenanceMode: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B1C1C]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between max-w-lg p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Enforce Strong Passwords</div>
                    <div className="text-xs text-gray-500 mt-0.5">Require numbers and symbols for new users</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={securitySettings.enforceStrongPasswords} onChange={(e) => setSecuritySettings({...securitySettings, enforceStrongPasswords: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B1C1C]"></div>
                  </label>
                </div>

                <div className="max-w-lg">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Session Timeout / Inactivity Limit</label>
                  <CustomSelect 
                    value={securitySettings.sessionTimeout} 
                    onChange={(val) => setSecuritySettings({...securitySettings, sessionTimeout: val})} 
                    options={[
                      {value: '15', label: '15 Minutes'},
                      {value: '30', label: '30 Minutes'},
                      {value: '60', label: '1 Hour'},
                      {value: '120', label: '2 Hours'}
                    ]}
                  />
                </div>
              </div>
            )}

            {/* BACKUP TAB */}
            {activeTab === 'Backup' && (
              <div className="space-y-6">
                <div className="max-w-lg p-6 bg-blue-50 border border-blue-200 rounded-md text-blue-900">
                  <h3 className="font-semibold text-sm mb-2 flex items-center"><Database className="w-4 h-4 mr-2"/> Database Snapshot</h3>
                  <p className="text-xs mb-5 opacity-80 leading-relaxed">Download a complete, encrypted `.sql` dump of your current database including Users, Memoranda, Logs, and Settings.</p>
                  <button type="button" onClick={handleBackup} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-md text-sm font-medium shadow-sm flex items-center transition-colors">
                    <Download className="w-4 h-4 mr-2" /> Export System Backup
                  </button>
                </div>
              </div>
            )}

            {/* SAVE BUTTON FOR GENERAL/SECURITY */}
            {activeTab !== 'Backup' && (
              <div className="mt-8 pt-6 border-t border-gray-100 max-w-lg flex justify-end">
                <button type="submit" disabled={isSaving} className="bg-[#9B1C1C] hover:bg-[#7a1515] text-white px-6 py-2.5 h-[42px] rounded-md text-sm font-medium shadow-sm flex items-center transition-colors">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaving ? 'Applying Changes...' : 'Save Configuration'}
                </button>
              </div>
            )}

          </form>
        </div>

      </div>
    </PortalLayout>
  );
};