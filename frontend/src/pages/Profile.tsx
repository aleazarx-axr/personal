// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { User as UserIcon, Shield, Lock, AlertCircle, CheckCircle2, Save, Loader2, X, Settings as SettingsIcon } from 'lucide-react';

export const Profile: React.FC = () => {
  const [user, setUser] = useState<{ id: number, firstName: string, lastName: string, email: string, username: string, role: string } | null>(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const userString = localStorage.getItem("portalUser");
    if (userString) {
      const parsedUser = JSON.parse(userString);
      setUser(parsedUser);
      setFormData({
        first_name: parsedUser.firstName || '',
        last_name: parsedUser.lastName || '',
        email: parsedUser.email || '',
        password: ''
      });
    }
    setLoading(false);
  }, []);

  const showNotify = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update profile');

      // Update LocalStorage
      const updatedUser = { ...user, firstName: formData.first_name, lastName: formData.last_name, email: formData.email };
      localStorage.setItem("portalUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
      
      showNotify("Profile updated successfully!", "success");
    } catch (err: any) {
      showNotify(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";
  const readOnlyClass = "w-full h-[42px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-500 cursor-not-allowed";

  if (loading || !user) return <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <>
      {notification && (
        <div className={`fixed top-6 right-6 z-[200] px-5 py-3 rounded-md shadow-lg flex items-center gap-3 text-white text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-700'}`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="ml-4 opacity-80 hover:opacity-100 transition-opacity"><X className="w-4 h-4"/></button>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
          <UserIcon className="w-6 h-6 text-[#9B1C1C] mr-3" />
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: User Identification Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-red-50 text-[#9B1C1C] flex items-center justify-center font-bold text-2xl border-2 border-red-100 mb-4">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
              <div className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                {user.role}
              </div>
              <p className="text-sm text-gray-500 mt-4 px-2">
                This is your primary identity across the WMSU Ipil Document Portal.
              </p>
            </div>
          </div>

          {/* RIGHT: Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSaveProfile} className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center">
                <SettingsIcon className="w-4 h-4 text-gray-500 mr-2" />
                <h3 className="text-sm font-semibold text-gray-800">Account Details</h3>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">First Name</label>
                    <input type="text" required value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Last Name</label>
                    <input type="text" required value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center">Username <Lock className="w-3 h-3 ml-1.5 text-gray-400" title="Locked" /></label>
                    <input type="text" value={user.username} disabled className={readOnlyClass} title="Username cannot be changed." />
                  </div>
                </div>

                <hr className="border-gray-100 my-6" />

                <div className="bg-yellow-50/50 p-4 border border-yellow-100 rounded-md">
                  <h4 className="text-xs font-semibold text-gray-800 mb-4 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-yellow-600" /> Change Password
                  </h4>
                  <div className="max-w-sm">
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">New Password (Optional)</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={inputClass} placeholder="Leave blank to keep current password" minLength={6} />
                    <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                      If you enter a new password, it will immediately replace your current one. You will use it for your next login.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button type="submit" disabled={saving} className={`flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-md shadow-sm transition-colors ${saving ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed' : 'bg-[#9B1C1C] hover:bg-[#7a1515] text-white'}`}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </>
  );
};
