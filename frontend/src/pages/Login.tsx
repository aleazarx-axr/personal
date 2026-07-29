// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ensure this port (5000) matches your backend server.js port
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // This will catch "Invalid credentials" from bcrypt or "User not found"
        throw new Error(data.message || 'Login failed');
      }

      // Store user data (Name, Role, Email) in localStorage for the session
      localStorage.setItem('portalUser', JSON.stringify(data.user));

      // Redirect based on the Role returned from the MySQL Database
      if (data.user.role === 'Admin' || data.user.role === 'Superuser') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }

    } catch (err: any) {
      // If the backend is down, this will show "Failed to fetch"
      // If the password is wrong, this will show "Invalid credentials"
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
      
      {/* Main Login Card with the Signature Crimson Top Border */}
      <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl rounded-xl relative overflow-hidden">
        
        <div className="p-8 sm:p-10">
          
          {/* Branding Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               <img src="/wmsu-logo.png" alt="WMSU Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">MyWMSU Ipil</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to the Administrative Portal</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center rounded-md">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="admin@wmsu.edu.ph"
                required 
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required 
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full h-[42px] mt-2 flex items-center justify-center text-sm font-medium rounded-md shadow-sm transition-colors ${
                loading 
                  ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#9B1C1C] hover:bg-[#7a1515] text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer info */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
            Western Mindanao State University <br/> Ipil Campus
          </div>
        </div>

      </div>
    </div>
  );
};