import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { Button } from '../components/ui/Buttons';
import { Shield, Train, Lock, Mail, CheckCircle2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onCancel }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [email, setEmail] = useState('admin@railblock.gov.in');
  const [password, setPassword] = useState('••••••••');
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'ADMIN') {
      setEmail('admin@railblock.gov.in');
      setPassword('admin2026');
    } else {
      setEmail('viewer@railblock.gov.in');
      setPassword('viewer2026');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid email or ID');
      return;
    }
    login(selectedRole, email);
    onLoginSuccess();
  };

  const handleQuickLogin = (role: UserRole) => {
    login(role, role === 'ADMIN' ? 'admin@railblock.gov.in' : 'passenger@railblock.gov.in');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex items-center justify-center p-4 relative antialiased select-none font-sans">
      {/* Background radial gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent pointer-events-none" />

      <div className="w-full max-w-[480px] bg-[var(--surface)] border border-[var(--border-strong)] rounded-[16px] shadow-2xl p-6 sm:p-8 space-y-6 relative z-10 text-left">
        {/* Header Wordmark */}
        <div className="text-center space-y-2 pb-2 border-b border-[var(--border)]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-[var(--fg)] text-[var(--bg)] font-bold text-lg mb-1 shadow-md">
            RB
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
            RailBlock AI Portal
          </h1>
          <p className="text-xs text-[var(--fg-muted)]">
            Ministry of Railways · Indian Railways Automatic Block Planning
          </p>
        </div>

        {/* Role Selector Tabs (Admin vs User Viewer) */}
        <div>
          <label className="block text-xs font-semibold text-[var(--fg-subtle)] uppercase tracking-wider mb-2">
            Select Portal Access Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('ADMIN')}
              className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all flex flex-col justify-between ${
                selectedRole === 'ADMIN'
                  ? 'bg-[#0070F3]/10 border-[#0070F3] shadow-xs'
                  : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Shield size={16} className={selectedRole === 'ADMIN' ? 'text-[#0070F3]' : 'text-[var(--fg-subtle)]'} />
                {selectedRole === 'ADMIN' && <CheckCircle2 size={14} className="text-[#0070F3]" />}
              </div>
              <span className="text-xs font-semibold text-[var(--fg)]">Divisional Admin</span>
              <span className="text-[10px] text-[var(--fg-subtle)] mt-0.5 line-clamp-1">
                Optimizer, solver & sector tasks
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('USER')}
              className={`p-3 rounded-[10px] border text-left cursor-pointer transition-all flex flex-col justify-between ${
                selectedRole === 'USER'
                  ? 'bg-[#30A46C]/10 border-[#30A46C] shadow-xs'
                  : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Train size={16} className={selectedRole === 'USER' ? 'text-[#30A46C]' : 'text-[var(--fg-subtle)]'} />
                {selectedRole === 'USER' && <CheckCircle2 size={14} className="text-[#30A46C]" />}
              </div>
              <span className="text-xs font-semibold text-[var(--fg)]">Public / User</span>
              <span className="text-[10px] text-[var(--fg-subtle)] mt-0.5 line-clamp-1">
                Live works & held-back trains
              </span>
            </button>
          </div>
        </div>

        {/* Role Access Information Box */}
        <div className="p-3 rounded-[8px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg-muted)] space-y-1">
          {selectedRole === 'ADMIN' ? (
            <div>
              <span className="font-semibold text-[#0070F3] block">🛡️ Admin Privileges:</span>
              <span>Full optimization suite, OR-Tools solver execution, sector task assignments (Engg, TRD, S&T), and clash resolution.</span>
            </div>
          ) : (
            <div>
              <span className="font-semibold text-[#30A46C] block">🚆 Public / Passenger Privileges:</span>
              <span>Read-only real-time feed: Where work is going on (active track possessions) and trains held back or regulated due to issues. No solver clutter.</span>
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          {error && (
            <div className="p-2.5 rounded-[6px] bg-[#E5484D]/10 border border-[#E5484D]/30 text-xs text-[#E5484D] flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">
              Email / Railway ID
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-2.5 text-[var(--fg-subtle)]" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--fg-subtle)] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-2.5 text-[var(--fg-subtle)]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[7px] bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--fg)] outline-none focus:border-[#0070F3] font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-10 rounded-[8px] font-semibold text-xs text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            style={{
              backgroundColor: selectedRole === 'ADMIN' ? '#0070F3' : '#30A46C'
            }}
          >
            <span>Log In as {selectedRole === 'ADMIN' ? 'Divisional Admin' : 'Public Viewer'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Demo Login Section */}
        <div className="pt-2 border-t border-[var(--border)] space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--fg-subtle)] block text-center">
            Instant 1-Click Demo Login
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              className="h-8 px-2 rounded-[6px] text-[11px] font-medium bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[#0070F3] text-[var(--fg)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Shield size={12} className="text-[#0070F3]" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('USER')}
              className="h-8 px-2 rounded-[6px] text-[11px] font-medium bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[#30A46C] text-[var(--fg)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Train size={12} className="text-[#30A46C]" />
              <span>User Demo</span>
            </button>
          </div>
        </div>

        {onCancel && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
