import React from 'react';
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
  LogOut
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

export const Header = ({ onToggleSidebar }) => {
  const { 
    COMPANY_INFO, 
    GSHEET_CONFIG,
    gsheetSyncStatus,
    language, 
    toggleLanguage, 
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

  return (
    <header className="sticky top-0 z-40 shrink-0 bg-slate-900 border-b border-slate-800 px-4 lg:px-6 py-2.5 shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Company Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar} 
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
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
          {/* Google Sheet Live Real-time Sync Indicator */}
          <a
            href={GSHEET_CONFIG?.sheetUrl || "https://docs.google.com/spreadsheets/d/1RSGKMQvtyIXb-1iObSpTq9G-ynEFWKA0U2BBunINaWE/edit?usp=sharing"}
            target="_blank"
            rel="noopener noreferrer"
            title={`${GSHEET_CONFIG?.title || 'Asia engineers, Accounts'} - গুগল শীট লাইভ সিংক (ক্লিক করে শীট দেখুন)`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              gsheetSyncStatus === 'syncing'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${gsheetSyncStatus === 'syncing' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${gsheetSyncStatus === 'syncing' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline font-bold">
              {language === 'bn' ? (gsheetSyncStatus === 'syncing' ? 'শীট সিংক হচ্ছে...' : 'শীট লাইভ সিংক') : 'Sheet Live Synced'}
            </span>
          </a>

          {/* Google Drive Status Indicator */}
          <a 
            href="https://drive.google.com/drive/folders/1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS"
            target="_blank"
            rel="noopener noreferrer"
            title="Google Drive Cloud Backup Active (Click to open folder)"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20 transition"
          >
            <CloudCheck className="w-3.5 h-3.5" />
            <span>Drive</span>
          </a>

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
              H
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-amber-400 font-medium">
                {language === 'bn' ? 'ডিরেক্টর / অ্যাডমিন' : 'Administrator'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
