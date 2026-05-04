// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
        navigate('/admin');
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
      <div className="max-w-md w-full bg-white p-6 md:p-8 border border-gray-300 shadow-sm rounded-none">
        
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <img src="/wmsu-logo.png" alt="WMSU Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[#9B1C1C] uppercase tracking-wide">MyWMSU Ipil</h1>
          <p className="text-sm text-gray-500 mt-2">Sign in to the Administrative Portal</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-[#9B1C1C] text-sm text-center font-medium rounded-none">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">
              Email Address
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 bg-gray-50 focus:outline-none focus:border-[#9B1C1C] focus:ring-1 focus:ring-[#9B1C1C] rounded-none transition-all"
              placeholder="admin@wmsu.edu.ph"
              required 
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-tight">
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 bg-gray-50 focus:outline-none focus:border-[#9B1C1C] focus:ring-1 focus:ring-[#9B1C1C] rounded-none transition-all"
              placeholder="••••••••"
              required 
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full p-3 font-bold uppercase tracking-widest transition-colors rounded-none shadow-sm ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-[#9B1C1C] hover:bg-[#7a1515] text-white'
            }`}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-[10px] text-gray-400 uppercase tracking-widest">
          Western Mindanao State University - Ipil Campus
        </div>
      </div>
    </div>
  );
};