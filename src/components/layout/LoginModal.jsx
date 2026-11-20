import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, User, Key, X, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const LoginModal = () => {
  const { 
    language, 
    showLoginModal, 
    setShowLoginModal, 
    login, 
    isAuthenticated,
    COMPANY_INFO 
  } = useApp();

  const [username, setUsername] = useState('01830002040');
  const [password, setPassword] = useState('ae2026');
  const [error, setError] = useState('');

  if (!showLoginModal && isAuthenticated) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(username, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleQuickDemo = () => {
    login('01830002040', 'ae2026');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {language === 'bn' ? 'ডিরেক্টর / অ্যাডমিন সিকিউর লগইন' : 'Director / Admin Secure Login'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {COMPANY_INFO.name} Cloud ERP
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setShowLoginModal(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="text-center pb-2">
            <img 
              src="./images/asia_engineers_logo.png" 
              alt="Asia Engineers" 
              className="h-10 mx-auto object-contain mb-2"
            />
            <p className="text-slate-400 text-[11px]">
              {language === 'bn' 
                ? 'আর্থিক হিসাব, ব্যাংক লেনদেন ও ভাউচার অনুমোদনের জন্য লগইন করুন' 
                : 'Sign in to access financial ledgers, bank transactions, and project accounts'}
            </p>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">
              {language === 'bn' ? 'ইউজারনেম / মোবাইল নম্বর' : 'Username / Phone'} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="01830002040 বা admin"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">
              {language === 'bn' ? 'পাসওয়ার্ড / পিন' : 'Password / PIN'} *
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ae2026 বা admin"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1.5"
          >
            <span>{language === 'bn' ? 'সফটওয়্যারে প্রবেশ করুন' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Demo Credentials Help */}
          <div className="pt-3 border-t border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 mb-2">
              ডিফল্ট অ্যাডমিন ক্রেডেনশিয়াল: <span className="text-amber-400 font-mono">01830002040</span> / <span className="text-amber-400 font-mono">ae2026</span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl text-[11px] transition border border-slate-700"
            >
              {language === 'bn' ? '১-ক্লিক ডিরেক্টর অটো-লগইন' : '1-Click Quick Demo Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
