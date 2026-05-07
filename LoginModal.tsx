import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, User, Shield, Loader2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, signup, joinAsAnonymous } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'anonymous'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      setUsername('');
      setPassword('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (mode !== 'anonymous' && !password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'anonymous') {
        joinAsAnonymous(username.trim());
        onClose();
      } else if (mode === 'login') {
        const result = await login(username.trim(), password);
        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        const result = await signup(username.trim(), password);
        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Signup failed');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Join AmongusChat</h2>
              <p className="text-slate-400 text-sm">Connect with players worldwide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700/50">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === 'login' 
                ? 'text-white border-b-2 border-red-500' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === 'signup' 
                ? 'text-white border-b-2 border-red-500' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setMode('anonymous'); setError(''); }}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mode === 'anonymous' 
                ? 'text-white border-b-2 border-red-500' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Quick Join
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          {mode !== 'anonymous' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
          )}

          {/* Anonymous Notice */}
          {mode === 'anonymous' && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400 text-xs">
                ⚠️ Quick join lets you chat immediately. Your messages won't be linked to an account.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{mode === 'anonymous' ? 'Joining...' : 'Please wait...'}</span>
              </>
            ) : (
              <span>
                {mode === 'login' && 'Login'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'anonymous' && 'Start Chatting'}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}