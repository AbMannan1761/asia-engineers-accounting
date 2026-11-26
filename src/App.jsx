import React, { useState } from 'react';
import { PanelLeftOpen } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { MasterPortalView } from './components/views/MasterPortalView';
import { AccountingView } from './components/views/AccountingView';
import { ProjectsView } from './components/views/ProjectsView';
import { InventoryView } from './components/views/InventoryView';
import { DailyAttendanceView } from './components/views/DailyAttendanceView';
import { EmployeesView } from './components/views/EmployeesView';
import { LedgersView } from './components/views/LedgersView';
import { VouchersView } from './components/views/VouchersView';
import { ReportsView } from './components/views/ReportsView';
import { BackupSecurityView } from './components/views/BackupSecurityView';
import { SettingsView } from './components/views/SettingsView';
import { DeveloperView } from './components/views/DeveloperView';
import { LoginModal } from './components/layout/LoginModal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem('AE_CURRENT_USER');
      localStorage.removeItem('AE_LOGIN_ID');
      localStorage.removeItem('AE_AUTH');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center font-bold text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">অ্যাপ্লিকেশন লোড হতে সমস্যা হয়েছে</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              ব্রাউজারের ক্যাশ বা পুরোনো লোকাল স্টোরেজ ডাটার কারণে এই সমস্যা হতে পারে। নিচের বাটন চেপে ক্যাশ ক্লিয়ার ও রিলোড করুন।
            </p>
            {this.state.error && (
              <div className="text-[11px] font-mono text-rose-400 bg-slate-950 p-3 rounded-xl border border-slate-800 break-all text-left max-h-28 overflow-y-auto">
                {String(this.state.error.message || this.state.error)}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                রিলোড করুন
              </button>
              <button
                onClick={this.handleClearCacheAndReload}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition cursor-pointer"
              >
                ক্যাশ ক্লিয়ার ও রিলোড
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainLayout = () => {
  const { activeTab, theme } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('AE_SIDEBAR_OPEN');
      } catch (e) {}
      // By default on desktop, sidebar is always open in front
      return window.innerWidth >= 1024;
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const renderCurrentView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'master-portal':
        return <MasterPortalView />;
      case 'accounting':
        return <AccountingView />;
      case 'projects':
        return <ProjectsView />;
      case 'inventory':
        return <InventoryView />;
      case 'daily-wages':
        return <DailyAttendanceView />;
      case 'employees':
        return <EmployeesView />;
      case 'ledgers':
        return <LedgersView />;
      case 'vouchers':
        return <VouchersView />;
      case 'reports':
        return <ReportsView />;
      case 'backup':
        return <BackupSecurityView />;
      case 'settings':
        return <SettingsView />;
      case 'developer':
        return <DeveloperView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`h-screen w-full flex flex-col font-sans overflow-hidden transition-colors duration-200 ${
      theme === 'light' ? 'theme-light bg-slate-50 text-slate-900' : 'theme-dark bg-slate-950 text-slate-100'
    }`}>
      <Header onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />

      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={closeSidebar} 
          onToggle={toggleSidebar} 
        />

        {/* Floating Quick Open Tab when Sidebar is Collapsed on Desktop */}
        {!sidebarOpen && (
          <button
            onClick={openSidebar}
            className="no-print hidden lg:flex fixed left-0 top-20 z-40 bg-slate-900 border border-slate-700 border-l-0 rounded-r-xl p-2.5 text-amber-400 hover:bg-slate-800 hover:text-amber-300 shadow-2xl transition-all items-center gap-1.5 cursor-pointer group"
            title="সাইড প্যানেল খুলুন (Open Sidebar)"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span className="text-xs font-bold pr-1">মেনু</span>
          </button>
        )}

        {/* Background Steel Structure Architectural Blueprint Graphics */}
        <div
          aria-hidden="true"
          className={`no-print pointer-events-none absolute inset-0 overflow-hidden z-0 ${
            theme === 'light' ? 'text-[#0B2240]/[0.065]' : 'text-amber-400/[0.06]'
          }`}
        >
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            viewBox="0 0 1200 800"
          >
            <defs>
              <pattern id="cad-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  strokeOpacity="0.45"
                />
              </pattern>
            </defs>
            <rect width="1200" height="800" fill="url(#cad-grid)" />

            {/* 3D Isometric Pre-Engineered Steel Building (PEB) Frame */}
            <g
              transform="translate(260, 120) scale(1.05)"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Portal Frame 1 (Front) */}
              <path d="M 120 480 L 120 230 L 320 140 L 520 230 L 520 480" strokeWidth="2.8" />
              {/* Portal Frame 2 */}
              <path d="M 220 420 L 220 185 L 420 95 L 620 185 L 620 420" strokeWidth="2.2" />
              {/* Portal Frame 3 */}
              <path d="M 320 360 L 320 140 L 520 50 L 720 140 L 720 360" strokeWidth="2" />
              {/* Portal Frame 4 (Back) */}
              <path d="M 420 300 L 420 95 L 620 5 L 820 95 L 820 300" strokeWidth="1.8" />

              {/* Eave Struts & Ridge Beam */}
              <line x1="120" y1="230" x2="420" y2="95" strokeWidth="2.2" />
              <line x1="320" y1="140" x2="620" y2="5" strokeWidth="2.4" />
              <line x1="520" y1="230" x2="820" y2="95" strokeWidth="2.2" />

              {/* Roof Purlins */}
              <line x1="186" y1="200" x2="486" y2="65" strokeWidth="1.2" strokeDasharray="6 4" />
              <line x1="253" y1="170" x2="553" y2="35" strokeWidth="1.2" strokeDasharray="6 4" />
              <line x1="386" y1="170" x2="686" y2="35" strokeWidth="1.2" strokeDasharray="6 4" />
              <line x1="453" y1="200" x2="753" y2="65" strokeWidth="1.2" strokeDasharray="6 4" />

              {/* Sidewall Girts & Base Line */}
              <line x1="120" y1="355" x2="420" y2="215" strokeWidth="1.3" />
              <line x1="120" y1="480" x2="420" y2="300" strokeWidth="2" />
              <line x1="520" y1="355" x2="820" y2="215" strokeWidth="1.3" />
              <line x1="520" y1="480" x2="820" y2="300" strokeWidth="2" />
              <line x1="120" y1="480" x2="520" y2="480" strokeWidth="1.6" />

              {/* Cable X-Bracing (Bay 1 & Bay 3) */}
              <line x1="120" y1="230" x2="220" y2="420" strokeWidth="1.2" />
              <line x1="220" y1="185" x2="120" y2="480" strokeWidth="1.2" />
              <line x1="520" y1="230" x2="620" y2="420" strokeWidth="1.2" />
              <line x1="620" y1="185" x2="520" y2="480" strokeWidth="1.2" />
              <line x1="320" y1="140" x2="420" y2="300" strokeWidth="1.1" />
              <line x1="420" y1="95" x2="320" y2="360" strokeWidth="1.1" />

              {/* Mezzanine / Crane Girder Hint */}
              <line x1="120" y1="310" x2="520" y2="310" strokeWidth="1.4" strokeDasharray="8 5" />
            </g>
          </svg>
        </div>

        <main className={`relative z-10 flex-1 overflow-y-auto p-4 lg:p-6 w-full min-h-0 transition-all duration-300 ${
          sidebarOpen ? 'max-w-7xl mx-auto' : 'w-full max-w-[1600px] mx-auto px-4 lg:px-8'
        }`}>
          <ErrorBoundary>
            {renderCurrentView()}
          </ErrorBoundary>
        </main>
      </div>

      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
