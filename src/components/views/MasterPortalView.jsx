import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import {
  FolderKanban,
  Briefcase,
  Users2,
  Building2,
  PlusCircle,
  Search,
  Filter,
  Download,
  Printer,
  Edit2,
  Trash2,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  Layers,
  ArrowUpRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { DateInput } from '../common/DateInput';

export const MasterPortalView = () => {
  const {
    language,
    data,
    addProject,
    updateProject,
    deleteProject,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addLedger,
    updateLedger,
    deleteLedger,
    setActiveTab
  } = useApp();

  // Active top tab: 'projects' | 'employees' | 'vendors'
  const [activePortalTab, setActivePortalTab] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states for New Entries
  const [projectForm, setProjectForm] = useState({
    name: '',
    client: '',
    clientPhone: '',
    site: '',
    budget: '',
    type: 'Industrial Shed',
    startDate: new Date().toISOString().slice(0, 10),
    expectedCompletion: '',
    status: 'In Progress'
  });

  const [empForm, setEmpForm] = useState({
    name: '',
    designation: 'Site Engineer',
    mobile: '',
    monthlySalary: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    status: 'Active'
  });

  const [vendorForm, setVendorForm] = useState({
    name: '',
    type: 'supplier',
    phone: '',
    address: '',
    totalPurchased: 0,
    totalPaid: 0,
    dueBalance: 0
  });

  // Calculate high-level KPIs
  const totalProjects = data.projects.length;
  const runningProjects = data.projects.filter(p => p.status === 'In Progress').length;
  const totalProjectValue = data.projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  const totalEmployees = data.employees.length;
  const totalLabors = (data.dailyLabors || []).length;
  const totalMonthlyPayroll = data.employees.reduce((acc, e) => acc + (e.monthlySalary || 0), 0);

  const vendorsList = data.ledgers.filter(l => l.type === 'supplier');
  const totalVendors = vendorsList.length;
  const totalVendorPurchases = vendorsList.reduce((acc, v) => acc + (v.totalPurchased || 0), 0);
  const totalVendorPayable = vendorsList.reduce((acc, v) => acc + (v.dueBalance || 0), 0);

  // Filtered lists based on search and status
  const filteredProjects = data.projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.site && p.site.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEmployees = data.employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.mobile && e.mobile.includes(searchQuery));
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredVendors = vendorsList.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.phone && v.phone.includes(searchQuery)) ||
      (v.address && v.address.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Export current list to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      if (activePortalTab === 'projects') {
        const rows = filteredProjects.map(p => ({
          'Project ID': p.id,
          'Project Name': p.name,
          'Client': p.client,
          'Phone': p.clientPhone || '',
          'Site Location': p.site,
          'Type': p.type,
          'Budget (BDT)': p.budget,
          'Spent (BDT)': p.spent || 0,
          'Start Date': p.startDate,
          'Status': p.status
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
        XLSX.writeFile(wb, `ASIA_ENGINEERS_Projects_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } else if (activePortalTab === 'employees') {
        const rows = filteredEmployees.map(e => ({
          'Employee ID': e.id,
          'Name': e.name,
          'Designation': e.designation,
          'Mobile': e.mobile,
          'Monthly Salary (BDT)': e.monthlySalary,
          'Joining Date': e.joiningDate,
          'Status': e.status
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Employees');
        XLSX.writeFile(wb, `ASIA_ENGINEERS_Employees_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } else {
        const rows = filteredVendors.map(v => ({
          'Vendor ID': v.id,
          'Vendor / Company': v.name,
          'Phone': v.phone,
          'Address': v.address,
          'Total Purchased (BDT)': v.totalPurchased || 0,
          'Total Paid (BDT)': v.totalPaid || 0,
          'Payable Due (BDT)': v.dueBalance || 0
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
        XLSX.writeFile(wb, `ASIA_ENGINEERS_Vendors_${new Date().toISOString().slice(0, 10)}.xlsx`);
      }
    } catch (err) {
      console.error(err);
      alert('Export failed: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Submission handlers
  const handleSaveProject = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateProject(editingItem.id, editingItem);
      setEditingItem(null);
    } else {
      addProject(projectForm);
      setProjectForm({
        name: '',
        client: '',
        clientPhone: '',
        site: '',
        budget: '',
        type: 'Industrial Shed',
        startDate: new Date().toISOString().slice(0, 10),
        expectedCompletion: '',
        status: 'In Progress'
      });
      setShowAddModal(false);
    }
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateEmployee(editingItem.id, editingItem);
      setEditingItem(null);
    } else {
      addEmployee(empForm);
      setEmpForm({
        name: '',
        designation: 'Site Engineer',
        mobile: '',
        monthlySalary: '',
        joiningDate: new Date().toISOString().slice(0, 10),
        status: 'Active'
      });
      setShowAddModal(false);
    }
  };

  const handleSaveVendor = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateLedger(editingItem.id, editingItem);
      setEditingItem(null);
    } else {
      addLedger({ ...vendorForm, type: 'supplier' });
      setVendorForm({
        name: '',
        type: 'supplier',
        phone: '',
        address: '',
        totalPurchased: 0,
        totalPaid: 0,
        dueBalance: 0
      });
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-700/80 rounded-2xl p-4 lg:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1">
              <FolderKanban className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মাস্টার ডিরেক্টরি পোর্টাল' : 'Master Directory Portal'}</span>
            </span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
            {language === 'bn' ? 'প্রজেক্ট, কর্মী ও ভেন্ডর পোর্টাল' : 'Projects, Employees & Vendors Portal'}
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {language === 'bn' 
              ? 'স্টিল স্ট্রাকচার প্রজেক্ট, কর্মকর্তা-কর্মচারী এবং মেটেরিয়াল ভেন্ডরদের কেন্দ্রীয় তথ্য ভাণ্ডার' 
              : 'Centralized master repository for steel projects, staff, technicians, and suppliers'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setEditingItem(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {activePortalTab === 'projects' 
                ? (language === 'bn' ? '+ নতুন প্রজেক্ট' : '+ New Project')
                : activePortalTab === 'employees'
                ? (language === 'bn' ? '+ নতুন কর্মী' : '+ New Employee')
                : (language === 'bn' ? '+ নতুন ভেন্ডর' : '+ New Vendor')}
            </span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow transition"
            title="Download list in Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl shadow transition"
            title="Print master directory list"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project KPI Card */}
        <div 
          onClick={() => { setActivePortalTab('projects'); setStatusFilter('all'); }}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            activePortalTab === 'projects'
              ? 'bg-slate-800/90 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg'
              : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'প্রজেক্ট তালিকা' : 'Projects List'}</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
              {runningProjects} {language === 'bn' ? 'চলমান' : 'Active'}
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {totalProjects} <span className="text-xs font-normal text-slate-400">{language === 'bn' ? 'টি প্রজেক্ট' : 'Projects'}</span>
          </div>
          <div className="mt-1 text-xs text-slate-300 flex justify-between">
            <span>{language === 'bn' ? 'মোট চুক্তি মূল্য:' : 'Contract Val:'}</span>
            <span className="font-bold text-amber-300">{formatBDT(totalProjectValue)}</span>
          </div>
        </div>

        {/* Employee KPI Card */}
        <div 
          onClick={() => { setActivePortalTab('employees'); setStatusFilter('all'); }}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            activePortalTab === 'employees'
              ? 'bg-slate-800/90 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg'
              : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Users2 className="w-4 h-4 text-blue-400" />
              <span>{language === 'bn' ? 'কর্মী ও স্টাফ তালিকা' : 'Employees & Staff'}</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
              {totalEmployees} {language === 'bn' ? 'স্থায়ী' : 'Permanent'}
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {totalEmployees + totalLabors} <span className="text-xs font-normal text-slate-400">{language === 'bn' ? 'জন মোট কর্মী' : 'Workers'}</span>
          </div>
          <div className="mt-1 text-xs text-slate-300 flex justify-between">
            <span>{language === 'bn' ? 'মাসিক বেতন বাজেট:' : 'Monthly Payroll:'}</span>
            <span className="font-bold text-blue-300">{formatBDT(totalMonthlyPayroll)}</span>
          </div>
        </div>

        {/* Vendor KPI Card */}
        <div 
          onClick={() => { setActivePortalTab('vendors'); setStatusFilter('all'); }}
          className={`cursor-pointer rounded-2xl p-4 border transition-all ${
            activePortalTab === 'vendors'
              ? 'bg-slate-800/90 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg'
              : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-rose-400" />
              <span>{language === 'bn' ? 'ভেন্ডর ও সাপ্লায়ার তালিকা' : 'Vendors & Suppliers'}</span>
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">
              {totalVendors} {language === 'bn' ? 'প্রতিষ্ঠান' : 'Parties'}
            </span>
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {totalVendors} <span className="text-xs font-normal text-slate-400">{language === 'bn' ? 'টি ভেন্ডর' : 'Vendors'}</span>
          </div>
          <div className="mt-1 text-xs text-slate-300 flex justify-between">
            <span>{language === 'bn' ? 'প্রদেয় দেনা বকেয়া:' : 'Payable Due:'}</span>
            <span className="font-bold text-rose-400">{formatBDT(totalVendorPayable)}</span>
          </div>
        </div>
      </div>

      {/* Main Portal View Toolbar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1 overflow-x-auto self-start">
          <button
            onClick={() => { setActivePortalTab('projects'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activePortalTab === 'projects'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'প্রজেক্ট লিস্ট (Projects)' : 'Project List'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-white font-mono font-bold">
              {data.projects.length}
            </span>
          </button>

          <button
            onClick={() => { setActivePortalTab('employees'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activePortalTab === 'employees'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এমপ্লয়ি লিস্ট (Employees)' : 'Employee List'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-white font-mono font-bold">
              {data.employees.length}
            </span>
          </button>

          <button
            onClick={() => { setActivePortalTab('vendors'); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activePortalTab === 'vendors'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ভেন্ডর লিস্ট (Vendors)' : 'Vendor List'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-white font-mono font-bold">
              {vendorsList.length}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[220px] lg:min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={
              activePortalTab === 'projects'
                ? (language === 'bn' ? 'প্রজেক্ট, ক্লায়েন্ট বা সাইট খুঁজুন...' : 'Search projects...')
                : activePortalTab === 'employees'
                ? (language === 'bn' ? 'কর্মী, পদবি বা মোবাইল নম্বর খুঁজুন...' : 'Search employees...')
                : (language === 'bn' ? 'ভেন্ডর, ফোন বা ঠিকানা খুঁজুন...' : 'Search vendors...')
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: PROJECT LIST TABLE                                  */}
      {/* ============================================================== */}
      {activePortalTab === 'projects' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Project Code</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'প্রজেক্টের নাম ও সাইট' : 'Project Name & Location'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'ক্লায়েন্ট' : 'Client'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'ক্যাটাগরি' : 'Type'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'বাজেট (চুক্তি মূল্য)' : 'Contract Value'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট ব্যয় (Spent)' : 'Total Spent'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'শুরু ও সমাপ্তি' : 'Timeline'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                      {language === 'bn' ? 'কোনো প্রজেক্ট পাওয়া যায়নি' : 'No projects found'}
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((p) => {
                    const spent = (data.transactions || [])
                      .filter(t => t.projectId === p.id && t.type === 'expense')
                      .reduce((sum, t) => sum + (t.amount || 0), 0);
                    const isCompleted = p.status === 'Completed';

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">
                          {p.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-xs leading-snug">{p.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{p.site}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{p.client}</div>
                          {p.clientPhone && (
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{p.clientPhone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700 text-slate-300 font-medium">
                            {p.type || 'Steel Structure'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          {formatBDT(p.budget)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                          {formatBDT(spent)}
                        </td>
                        <td className="py-3 px-3 text-center text-[11px] font-mono text-slate-300">
                          <div>{p.startDate ? formatDate(p.startDate) : '-'}</div>
                          {p.expectedCompletion && (
                            <div className="text-[10px] text-slate-500">to {formatDate(p.expectedCompletion)}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Completed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'On Hold'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingItem({ ...p })}
                              className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs"
                              title={language === 'bn' ? 'প্রজেক্ট এডিট করুন' : 'Edit Project'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত ${p.name} মুছে ফেলতে চান?` : `Delete project ${p.name}?`)) {
                                  deleteProject(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition shadow-xs"
                              title={language === 'bn' ? 'প্রজেক্ট মুছুন (Delete)' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: EMPLOYEE LIST TABLE                                 */}
      {/* ============================================================== */}
      {activePortalTab === 'employees' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">EMP ID</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'কর্মীর নাম' : 'Employee Name'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'পদবি ও দায়িত্ব' : 'Designation & Role'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Phone'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'মাসিক বেতন (Basic)' : 'Monthly Salary'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      {language === 'bn' ? 'কোনো কর্মী পাওয়া যায়নি' : 'No employees found'}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {e.id}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-xs">{e.name}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span className="font-medium text-amber-300">{e.designation}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-slate-300">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{e.mobile}</span>
                          <a
                            href={`tel:${e.mobile}`}
                            className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-amber-400 hover:text-white border border-slate-700"
                            title="Call"
                          >
                            Call
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-white text-xs">
                        {formatBDT(e.monthlySalary)}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-300">
                        {e.joiningDate ? formatDate(e.joiningDate) : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          e.status === 'Active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingItem({ ...e })}
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs"
                            title={language === 'bn' ? 'কর্মী তথ্য এডিট করুন' : 'Edit Employee'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত ${e.name} মুছে ফেলতে চান?` : `Delete employee ${e.name}?`)) {
                                deleteEmployee(e.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition shadow-xs"
                            title={language === 'bn' ? 'মুছে ফেলুন (Delete)' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 3: VENDOR & SUPPLIER LIST TABLE                        */}
      {/* ============================================================== */}
      {activePortalTab === 'vendors' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Vendor Code</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'ভেন্ডর / প্রতিষ্ঠানের নাম' : 'Vendor & Company Name'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'মোবাইল ও যোগাযোগ' : 'Contact & Phone'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'ঠিকানা / গুদাম' : 'Address / Location'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট ক্রয় (Purchased)' : 'Total Purchased'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট পরিশোধ (Paid)' : 'Total Paid'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'প্রদেয় দেনা (Payable)' : 'Payable Due'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'যোগাযোগ' : 'Notice'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                      {language === 'bn' ? 'কোনো ভেন্ডর পাওয়া যায়নি' : 'No vendors found'}
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((v) => {
                    const hasDue = (v.dueBalance || 0) > 0;
                    const cleanPhone = (v.phone || '').replace(/[^0-9]/g, '');
                    const waLink = `https://wa.me/88${cleanPhone}?text=${encodeURIComponent(
                      `আসসালামু আলাইকুম ${v.name}, এশিয়া ইঞ্জিনিয়ার্স থেকে আপনার বর্তমান বিল সমন্বয় সংক্রান্ত নোটিশ। ধন্যবাদ।`
                    )}`;

                    return (
                      <tr key={v.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">
                          {v.id}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-xs">{v.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Steel & Material Supplier</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-mono text-slate-300">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{v.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-xs">
                          {v.address}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">
                          {formatBDT(v.totalPurchased || 0)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400">
                          {formatBDT(v.totalPaid || 0)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-400 font-mono text-xs">
                          {formatBDT(v.dueBalance || 0)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {hasDue ? (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition"
                              title="Send WhatsApp notice"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">Cleared</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditingItem({ ...v })}
                              className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs"
                              title={language === 'bn' ? 'ভেন্ডর তথ্য এডিট করুন' : 'Edit Vendor'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত "${v.name}" মুছে ফেলতে চান?` : `Delete vendor "${v.name}"?`)) {
                                  deleteLedger(v.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition shadow-xs"
                              title={language === 'bn' ? 'মুছে ফেলুন (Delete)' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT PROJECT                                      */}
      {/* ============================================================== */}
      {(showAddModal || editingItem) && activePortalTab === 'projects' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>
                  {editingItem 
                    ? (language === 'bn' ? `প্রজেক্ট এডিট: ${editingItem.name}` : `Edit Project: ${editingItem.name}`) 
                    : (language === 'bn' ? 'নতুন প্রজেক্ট যুক্ত করুন' : 'Add New Project')}
                </span>
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্টের নাম' : 'Project Name'} *</label>
                <input
                  type="text"
                  required
                  value={editingItem ? editingItem.name : projectForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingItem) setEditingItem(p => ({ ...p, name: val }));
                    else setProjectForm(p => ({ ...p, name: val }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট' : 'Client'} *</label>
                  <input
                    type="text"
                    required
                    value={editingItem ? editingItem.client : projectForm.client}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, client: val }));
                      else setProjectForm(p => ({ ...p, client: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট মোবাইল' : 'Client Phone'}</label>
                  <input
                    type="text"
                    value={editingItem ? editingItem.clientPhone || '' : projectForm.clientPhone}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, clientPhone: val }));
                      else setProjectForm(p => ({ ...p, clientPhone: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সাইটের ঠিকানা' : 'Site Location'} *</label>
                  <input
                    type="text"
                    required
                    value={editingItem ? editingItem.site : projectForm.site}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, site: val }));
                      else setProjectForm(p => ({ ...p, site: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'চুক্তি মূল্য (বাজেট ৳)' : 'Budget'} *</label>
                  <input
                    type="number"
                    required
                    value={editingItem ? editingItem.budget : projectForm.budget}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, budget: Number(val) }));
                      else setProjectForm(p => ({ ...p, budget: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}</label>
                  <DateInput
                    value={editingItem ? editingItem.startDate : projectForm.startDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, startDate: val }));
                      else setProjectForm(p => ({ ...p, startDate: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'অবস্থা' : 'Status'}</label>
                  <select
                    value={editingItem ? editingItem.status : projectForm.status}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, status: val }));
                      else setProjectForm(p => ({ ...p, status: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="In Progress">In Progress (চলমান)</option>
                    <option value="Completed">Completed (সম্পন্ন)</option>
                    <option value="On Hold">On Hold (স্থগিত)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {editingItem 
                    ? (language === 'bn' ? 'আপডেট সেভ করুন' : 'Update Project') 
                    : (language === 'bn' ? 'প্রজেক্ট সেভ করুন' : 'Save Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT EMPLOYEE                                     */}
      {/* ============================================================== */}
      {(showAddModal || editingItem) && activePortalTab === 'employees' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Users2 className="w-4 h-4 text-blue-400" />
                <span>
                  {editingItem 
                    ? (language === 'bn' ? `কর্মী তথ্য এডিট: ${editingItem.name}` : `Edit Employee: ${editingItem.name}`) 
                    : (language === 'bn' ? 'নতুন কর্মচারী যুক্ত করুন' : 'Add New Employee')}
                </span>
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কর্মীর পূর্ণ নাম' : 'Employee Name'} *</label>
                <input
                  type="text"
                  required
                  value={editingItem ? editingItem.name : empForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingItem) setEditingItem(p => ({ ...p, name: val }));
                    else setEmpForm(p => ({ ...p, name: val }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'পদবি ও দায়িত্ব' : 'Designation'} *</label>
                  <input
                    type="text"
                    required
                    value={editingItem ? editingItem.designation : empForm.designation}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, designation: val }));
                      else setEmpForm(p => ({ ...p, designation: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Phone'} *</label>
                  <input
                    type="text"
                    required
                    value={editingItem ? editingItem.mobile : empForm.mobile}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, mobile: val }));
                      else setEmpForm(p => ({ ...p, mobile: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মাসিক বেতন (৳)' : 'Monthly Salary'} *</label>
                  <input
                    type="number"
                    required
                    value={editingItem ? editingItem.monthlySalary : empForm.monthlySalary}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, monthlySalary: Number(val) }));
                      else setEmpForm(p => ({ ...p, monthlySalary: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'অবস্থা' : 'Status'}</label>
                  <select
                    value={editingItem ? editingItem.status : empForm.status}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (editingItem) setEditingItem(p => ({ ...p, status: val }));
                      else setEmpForm(p => ({ ...p, status: val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Active">Active (কর্মরত)</option>
                    <option value="On Leave">On Leave (ছুটিতে)</option>
                    <option value="Resigned">Resigned (অব্যাহতি)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}</label>
                <DateInput
                  value={editingItem ? editingItem.joiningDate : empForm.joiningDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingItem) setEditingItem(p => ({ ...p, joiningDate: val }));
                    else setEmpForm(p => ({ ...p, joiningDate: val }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {editingItem 
                    ? (language === 'bn' ? 'আপডেট সংরক্ষণ' : 'Save Updates') 
                    : (language === 'bn' ? 'কর্মী সেভ করুন' : 'Save Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT VENDOR                                       */}
      {/* ============================================================== */}
      {(showAddModal || editingItem) && activePortalTab === 'vendors' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rose-400" />
                <span>
                  {editingItem 
                    ? (language === 'bn' ? `ভেন্ডর এডিট: ${editingItem.name}` : `Edit Vendor: ${editingItem.name}`) 
                    : (language === 'bn' ? 'নতুন ভেন্ডর / সাপ্লায়ার যুক্ত করুন' : 'Add New Vendor / Supplier')}
                </span>
              </h3>
              <button 
                onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ভেন্ডর / প্রতিষ্ঠানের নাম' : 'Vendor Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BSRM Steels Ltd"
                  value={editingItem ? editingItem.name : vendorForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingItem) setEditingItem(p => ({ ...p, name: val }));
                    else setVendorForm(p => ({ ...p, name: val }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোবাইল / ফোন নম্বর' : 'Phone Number'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01713000000"
                  value={editingItem ? editingItem.phone : vendorForm.phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingItem) setEditingItem(p => ({ ...p, phone: val }));
                    else setVendorForm(p => ({ ...p, phone: val }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ঠিকানা / ফ্যাক্টরি বা গোডাউন' : 'Address'}</label>
                <input
                  type="text"
                  placeholder="e.g. Nasirabad I/A, Baizid Bostami, Chattogram"
                  value={editingItem ? editingItem.address : vendorForm.address}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (editingItem) setEditingItem(p => ({ ...p, address: val }));
                    else setVendorForm(p => ({ ...p, address: val }));
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোট ক্রয় (৳)' : 'Total Purchased'}</label>
                  <input
                    type="number"
                    value={editingItem ? editingItem.totalPurchased : vendorForm.totalPurchased}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (editingItem) setEditingItem(p => ({ ...p, totalPurchased: val, dueBalance: val - (p.totalPaid || 0) }));
                      else setVendorForm(p => ({ ...p, totalPurchased: val, dueBalance: val - (p.totalPaid || 0) }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোট পরিশোধ (৳)' : 'Total Paid'}</label>
                  <input
                    type="number"
                    value={editingItem ? editingItem.totalPaid : vendorForm.totalPaid}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (editingItem) setEditingItem(p => ({ ...p, totalPaid: val, dueBalance: (p.totalPurchased || 0) - val }));
                      else setVendorForm(p => ({ ...p, totalPaid: val, dueBalance: (p.totalPurchased || 0) - val }));
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {editingItem 
                    ? (language === 'bn' ? 'আপডেট সংরক্ষণ' : 'Save Updates') 
                    : (language === 'bn' ? 'ভেন্ডর সেভ করুন' : 'Save Vendor')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
