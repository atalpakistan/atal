import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { loginAsAdminOrStaff, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot password view state
  const [isForgotView, setIsForgotView] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleAdminStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAsAdminOrStaff(email, password);
      onSuccess();
    } catch (err: any) {
      console.warn('Staff/admin login notice:', err);
      if (err?.message?.includes('Access Denied')) {
        setError(err.message);
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        setError('Incorrect administrator or staff password. If you forgot your password, please use the "Forgot Password" option below.');
      } else {
        setError('Invalid staff credentials. Please verify your email and password or reset your password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetLoading(true);

    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      console.warn('Password reset notice:', err);
      setResetSent(true);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-stone-50/50">
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xl p-8 sm:p-10 max-w-md w-full space-y-6">
        
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={isForgotView ? () => setIsForgotView(false) : onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition cursor-pointer"
            title="Return to Storefront"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isForgotView ? 'Back to Sign In' : 'Back to Store'}</span>
          </button>
          
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Internal Access
          </span>
        </div>

        {/* Header Badge */}
        <div className="text-center space-y-2">
          <img
            src="/atal-logo.jpg"
            alt="ATAL Logo"
            className="w-16 h-16 object-contain rounded-2xl mx-auto shadow-md border border-stone-200 bg-white p-0.5"
          />
          <h2 className="text-2xl font-bold font-serif-display text-stone-950">
            {isForgotView ? 'Password Recovery' : 'Admin & Staff Portal'}
          </h2>
          <p className="text-xs text-stone-500">
            {isForgotView
              ? 'Enter your registered work email to receive a password reset link.'
              : 'Password-protected private portal exclusively for authorized store personnel.'}
          </p>
        </div>

        {/* FORGOT PASSWORD FORM */}
        {isForgotView ? (
          <div className="space-y-4">
            {resetSent ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 text-center animate-in fade-in">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-bold">Password Reset Instructions Sent</p>
                <p className="text-emerald-800 leading-relaxed">
                  If an authorized staff account exists for <strong>{resetEmail}</strong>, password reset instructions have been dispatched. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotView(false);
                    setResetSent(false);
                  }}
                  className="mt-3 px-4 py-2 bg-stone-950 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                    Authorized Work Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your authorized email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3.5 rounded-xl bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{resetLoading ? 'Sending Email...' : 'Send Reset Link'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotView(false)}
                    className="text-xs text-stone-600 hover:text-stone-950 font-semibold"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* REGULAR LOGIN FORM */
          <>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Admin / Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsForgotView(true);
                    }}
                    className="text-xs text-amber-700 hover:text-amber-900 font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter secure password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-stone-950 text-white font-bold text-xs uppercase tracking-wider hover:bg-stone-800 disabled:opacity-50 transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{loading ? 'Authenticating...' : 'Sign In as Staff / Admin'}</span>
              </button>
            </form>

            <div className="text-center pt-3 border-t border-stone-100">
              <button
                onClick={onCancel}
                className="text-xs text-stone-500 hover:text-stone-900 underline cursor-pointer"
              >
                Return to Storefront
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
