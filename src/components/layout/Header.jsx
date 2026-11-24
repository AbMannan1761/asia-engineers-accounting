import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Globe2,
  ShieldCheck,
  CloudCheck,
  CloudOff,
  FileSpreadsheet,
  DownloadCloud,
  Menu,
  Phone,
  LogIn,
  LogOut,
  RefreshCw,
  CheckCircle2,
  Check,
  Sun,
  Moon,
  PanelLeftOpen
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

export const Header = ({ onToggleSidebar, isSidebarOpen = true }) => {
  const {
    COMPANY_INFO,
    GSHEET_CONFIG,
    gsheetSyncStatus,
    syncToGoogleSheet,
    setActiveTab,
    language,
    toggleLanguage,
    theme,
    toggleTheme,
    currentUser,
    isAuthenticated,
    setShowLoginModal,
    logout,
    data,
    totalCashBalance,
    totalBankBalance,
    exportAllToExcel,
    downloadBackupJSON
  } = useApp();

  // Local animated sync state: 'idle' | 'syncing' | 'completed'
  const [syncAnimState, setSyncAnimState] = useState('idle');

  const handleSyncClick = async () => {
    if (syncAnimState === 'syncing') return;
    setSyncAnimState('syncing');

    const startTime = Date.now();
    try {
      await syncToGoogleSheet('MANUAL_SYNC');
    } catch (e) {
      console.error(e);
    }

    // Keep spinning animated movement for at least 900ms for clear visual feedback
    const elapsed = Date.now() - startTime;
    if (elapsed < 900) {
      await new Promise(res => setTimeout(res, 900 - elapsed));
    }

    // Transition to completed state with animated checkmark
    setSyncAnimState('completed');

    // Keep the animated checkmark for 2.5 seconds, then return smoothly to idle
    setTimeout(() => {
      setSyncAnimState('idle');
    }, 2500);
  };

  return (
    <header className="app-main-header sticky top-0 z-40 shrink-0 bg-slate-900 border-b border-slate-800 px-4 lg:px-6 py-2.5 shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile/Desktop Sidebar Toggle + Company Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg transition focus:outline-none cursor-pointer flex items-center gap-1.5 ${
              !isSidebarOpen
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Toggle Navigation"
            title={isSidebarOpen ? (language === 'bn' ? 'সাইড প্যানেল লুকান' : 'Hide Side Panel') : (language === 'bn' ? 'সাইড প্যানেল খুলুন' : 'Open Side Panel')}
          >
            {isSidebarOpen ? <Menu className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5 text-amber-400" />}
          </button>

          <div className="flex items-center gap-3">
            <img
              src="./images/asia_engineers_logo.png"
              alt="ASIA ENGINEERS STEEL STRUCTURE"
              className="h-8 sm:h-9 max-w-[180px] sm:max-w-[210px] object-contain"
            />
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
              ERP v1.0
            </span>
          </div>
        </div>

        {/* Center: Live Financial Balances Ticker (Desktop) */}
        <div className="hidden xl:flex items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-slate-400">
              {language === 'bn' ? 'ক্যাশ ইন হ্যান্ড:' : 'Cash in Hand:'}
            </span>
            <span className="text-xs font-bold text-emerald-400">
              {formatBDT(totalCashBalance)}
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-xs text-slate-400">
              {language === 'bn' ? 'ব্যাংক ব্যালেন্স:' : 'Bank Balance:'}
            </span>
            <span className="text-xs font-bold text-blue-400">
              {formatBDT(totalBankBalance)}
            </span>
          </div>
        </div>

        {/* Right: Cloud Sync, Excel Export, Language & User Badge */}
        <div className="flex items-center gap-2">
          {/* Google Sheet Live Real-time Sync Button with Animation & Tick Mark */}
          <button
            onClick={handleSyncClick}
            type="button"
            disabled={syncAnimState === 'syncing'}
            title={language === 'bn' ? 'গুগল শীট সিংক (ক্লিক করলে এখনই সিংক হবে)' : 'Google Sheet Sync'}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 shadow-sm ${
              syncAnimState === 'syncing'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/20 scale-105'
                : syncAnimState === 'completed'
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-500/20 scale-105'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/60 hover:scale-102'
            }`}
          >
            {syncAnimState === 'syncing' ? (
              <>
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                <span className="font-bold text-amber-300 animate-pulse">
                  {language === 'bn' ? 'সিংক হচ্ছে...' : 'Syncing...'}
                </span>
              </>
            ) : syncAnimState === 'completed' ? (
              <>
                <div className="relative flex items-center justify-center">
                  <span className="w-4 h-4 rounded-full bg-emerald-400/40 animate-ping absolute" />
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                </div>
                <span className="font-bold text-emerald-300 animate-fade-in">
                  {language === 'bn' ? 'সিংক সম্পন্ন ✓' : 'Synced ✓'}
                </span>
              </>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-bold">
                  {language === 'bn' ? 'শীট সিংক' : 'Sheet Sync'}
                </span>
              </>
            )}
          </button>

          {/* Google Drive Status Indicator (Navigates to internal backup tab) */}
          <button
            onClick={() => setActiveTab('backup')}
            type="button"
            title={language === 'bn' ? 'গুগল ড্রাইভ ও ক্লাউড ব্যাকআপ সেটিংস' : 'Google Drive Cloud Backup Settings'}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 transition"
          >
            <CloudCheck className="w-3.5 h-3.5" />
            <span>Drive</span>
          </button>

          {/* Login / Logout Button */}
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              title="Logout from Accounting Session"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow"
              title="Director / Admin Login"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
            </button>
          )}

          {/* Quick Excel Export */}
          <button
            onClick={exportAllToExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"
            title="Download Complete Financial Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Theme Mode Toggle (Default: Light Mode) */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
            title={theme === 'light' ? (language === 'bn' ? 'ডার্ক মোড চালু করুন' : 'Switch to Dark Mode') : (language === 'bn' ? 'লাইট মোড চালু করুন' : 'Switch to Light Mode')}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline font-medium">{language === 'bn' ? 'ডার্ক' : 'Dark'}</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-medium">{language === 'bn' ? 'লাইট' : 'Light'}</span>
              </>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            title="বাংলা / English"
          >
            <Globe2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'ENG' : 'বাং'}</span>
          </button>

          {/* Current User Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs shadow">
              {(currentUser?.loginId || currentUser?.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-mono font-semibold text-amber-300 leading-none">
                {currentUser?.loginId || currentUser?.email || currentUser?.name || '01830002040'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                {currentUser?.name && currentUser?.name !== currentUser?.loginId ? currentUser.name : (language === 'bn' ? 'ডিরেক্টর / অ্যাডমিন' : 'Administrator')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
