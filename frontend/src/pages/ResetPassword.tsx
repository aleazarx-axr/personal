// src/pages/SetupPassword.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [validationMsg, setValidationMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
      setIsTokenValid(false);
      return;
    }

    const checkToken = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/validate-token?token=${token}`);
        const data = await response.json();
        if (data.valid) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setValidationMsg(data.message || 'This reset link is invalid or has expired.');
        }
      } catch (err) {
        setIsTokenValid(false);
        setValidationMsg('Failed to validate token.');
      }
    };
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return setError('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/setup-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Password Set Successfully!</h2>
          <p className="text-sm text-gray-500">You will be redirected to the login page momentarily.</p>
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl rounded-xl p-8 sm:p-10 text-center">
          <AlertCircle className="w-16 h-16 text-[#9B1C1C] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link Expired or Used</h2>
          <p className="text-sm text-gray-500 mb-6">{validationMsg}</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-[#9B1C1C] text-white rounded-md text-sm font-medium hover:bg-[#7a1515] transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <Loader2 className="w-8 h-8 text-[#9B1C1C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden">
        <div className="p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               <img src="/wmsu-logo.png" alt="WMSU Logo" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-sm text-gray-500 mt-1">Set a new secure password for your account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center rounded-md">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required 
                  disabled={loading || !token}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="••••••••"
                  required 
                  disabled={loading || !token}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !token}
              className={`w-full h-[42px] mt-2 flex items-center justify-center text-sm font-medium rounded-md shadow-sm transition-colors ${
                (loading || !token)
                  ? 'bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#9B1C1C] hover:bg-[#7a1515] text-white'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : 'Set Password'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
