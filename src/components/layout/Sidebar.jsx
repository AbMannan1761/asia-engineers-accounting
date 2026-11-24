import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  Briefcase,
  Boxes,
  Users2,
  ClipboardList,
  BookOpenCheck,
  FileText,
  BarChart3,
  CloudCog,
  Settings,
  Code2,
  X,
  PlusCircle,
  PanelLeftClose
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, onToggle }) => {
  const { language, activeTab, setActiveTab } = useApp();

  const menuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      labelBn: 'ড্যাশবোর্ড ও সারাংশ',
      labelEn: 'Dashboard'
    },
    {
      id: 'master-portal',
      icon: FolderKanban,
      labelBn: 'প্রজেক্ট, কর্মী ও ভেন্ডর পোর্টাল',
      labelEn: 'Project, Emp & Vendor Portal'
    },
    {
      id: 'accounting',
      icon: Receipt,
      labelBn: 'জমা-খরচ ও ব্যাংক হিসাব',
      labelEn: 'Income & Expenses'
    },
    {
      id: 'projects',
      icon: Briefcase,
      labelBn: 'প্রজেক্ট ম্যানেজমেন্ট ও ব্যয়',
      labelEn: 'Project Management'
    },
    {
      id: 'inventory',
      icon: Boxes,
      labelBn: 'স্টিল মালামাল ও স্টক',
      labelEn: 'Material Inventory'
    },
    {
      id: 'daily-wages',
      icon: ClipboardList,
      labelBn: 'ডেইলি হাজিরা শীট ও বেতন',
      labelEn: 'Daily Attendance & Wages'
    },
    {
      id: 'employees',
      icon: Users2,
      labelBn: 'কর্মচারী ও মাসিক বেতন',
      labelEn: 'Employee & Salary'
    },
    {
      id: 'ledgers',
      icon: BookOpenCheck,
      labelBn: 'ক্লায়েন্ট ও সাপ্লায়ার খাতা',
      labelEn: 'Party Ledgers'
    },
    {
      id: 'vouchers',
      icon: FileText,
      labelBn: 'ডেবিট ও ক্রেডিট ভাউচার প্রিন্ট',
      labelEn: 'Debit & Credit Vouchers'
    },
    {
      id: 'reports',
      icon: BarChart3,
      labelBn: 'আর্থিক রিপোর্ট ও এক্সেল',
      labelEn: 'Reports & Excel'
    },
    {
      id: 'backup',
      icon: CloudCog,
      labelBn: 'গুগল শীট সিংক ও ব্যাকআপ',
      labelEn: 'Google Sheets & Backup'
    },
    {
      id: 'settings',
      icon: Settings,
      labelBn: 'কোম্পানি সেটিংস ও হেল্প',
      labelEn: 'Settings & PWA'
    },
    {
      id: 'developer',
      icon: Code2,
      labelBn: 'ডেভেলপার পরিচিতি',
      labelEn: 'Developer Profile'
    }
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    // Only close drawer on mobile screens (< 1024px)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      if (onClose) onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="no-print fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Desktop Sidebar / Mobile Drawer */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:static h-full shrink-0 ${
          isOpen ? 'translate-x-0 lg:w-64' : '-translate-x-full lg:w-0 lg:overflow-hidden lg:border-none'
        }`}
      >
        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>{language === 'bn' ? 'মডিউলসমূহ' : 'Software Modules'}</span>
            
            {/* The user-requested Collapse Option (Red-boxed in screenshot) */}
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title={language === 'bn' ? 'সাইড প্যানেল লুকান / বন্ধ করুন' : 'Collapse Side Panel'}
            >
              <PanelLeftClose className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="truncate">
                  {language === 'bn' ? item.labelBn : item.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Quick Support & Office Address */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
          <div className="font-semibold text-slate-300">Room 3028, CJKS Shopping Complex</div>
          <div>Kajir Dewri, Chattogram</div>
          <div className="text-amber-400 font-medium mt-0.5">Hotline: 01830002040</div>
        </div>
      </aside>

      {/* iPhone Safari Bottom Navigation Bar (Fixed for quick touch navigation on mobile) */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 py-1.5 px-2 flex justify-around items-center lg:hidden pb-safe">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] ${
            activeTab === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{language === 'bn' ? 'ড্যাশবোর্ড' : 'Home'}</span>
        </button>

        <button
          onClick={() => setActiveTab('accounting')}
          className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] ${
            activeTab === 'accounting' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span>{language === 'bn' ? 'হিসাব' : 'Accounts'}</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] ${
            activeTab === 'projects' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span>{language === 'bn' ? 'প্রজেক্ট' : 'Projects'}</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] ${
            activeTab === 'inventory' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span>{language === 'bn' ? 'স্টক' : 'Stock'}</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] ${
            activeTab === 'vouchers' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>{language === 'bn' ? 'ভাউচার' : 'Voucher'}</span>
        </button>
      </nav>
    </>
  );
};
