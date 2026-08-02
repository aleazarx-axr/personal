// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier) {
      return setError('Please enter your Username or Email.');
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset link');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#9B1C1C] focus:border-[#9B1C1C] transition-colors";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl rounded-xl p-8 sm:p-10 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Link Sent!</h2>
          <p className="text-sm text-gray-500 mb-6">If an account exists for that username or email, we've sent a password reset link to its registered email address.</p>
          <Link to="/login" className="inline-flex items-center justify-center w-full h-[42px] text-sm font-medium rounded-md shadow-sm bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-colors">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden relative">
        <div className="p-8 sm:p-10">
          
          <Link to="/login" className="absolute top-6 left-6 text-gray-400 hover:text-gray-700 transition-colors flex items-center text-xs font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>

          <div className="text-center mb-8 mt-4">
            <div className="flex justify-center mb-4">
               <img src="/wmsu-logo.png" alt="WMSU Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Forgot Password</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your username or email to receive a secure reset link.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center rounded-md">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Username or Email</label>
              <input 
                type="text" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputClass}
                placeholder="e.g. juan.delacruz"
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
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : 'Send Reset Link'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
