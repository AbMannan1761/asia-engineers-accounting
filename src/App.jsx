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
          {renderCurrentView()}
        </main>
      </div>

      <LoginModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
