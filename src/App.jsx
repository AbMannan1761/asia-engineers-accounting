import React, { useState } from 'react';
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
  const { activeTab } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 max-w-7xl mx-auto w-full min-h-0">
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
