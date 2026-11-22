import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  PlusCircle,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  Tag,
  ArrowUpDown,
  Download,
  Printer,
  ExternalLink,
  PieChart,
  Receipt,
  RotateCcw,
  FileSpreadsheet,
  Check,
  ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { COMPANY_INFO } from '../../data/initialData';
import { formatBDT, formatDate } from '../../utils/formatters';
import { DateInput } from '../common/DateInput';

export const ProjectsView = () => {
  const {
    language,
    data,
    addProject,
    updateProject,
    deleteProject,
    setActiveTab,
    setSelectedVoucherForPrint
  } = useApp();

  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showPrintStatementModal, setShowPrintStatementModal] = useState(false);

  // Top-Level Projects Search & Filter
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('all'); // 'all' | 'In Progress' | 'Completed' | 'On Hold'
  const [projectSortBy, setProjectSortBy] = useState('default'); // 'default' | 'contract-desc' | 'received-desc' | 'spent-desc' | 'profit-desc' | 'name-asc'

  // Selected Project Drawer Filters
  const [txnTypeFilter, setTxnTypeFilter] = useState('all'); // 'all' | 'income' | 'expense'
  const [txnCategoryFilter, setTxnCategoryFilter] = useState('all');
  const [txnSearchQuery, setTxnSearchQuery] = useState('');
  const [txnStartDate, setTxnStartDate] = useState('');
  const [txnEndDate, setTxnEndDate] = useState('');

  // New Project Form Data
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    clientPhone: '',
    site: '',
    contractValue: '',
    budget: '',
    startDate: new Date().toISOString().slice(0, 10),
    expectedCompletion: '',
    category: 'Industrial Shed',
    status: 'In Progress'
  });

  // Edit Project Form Data
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    client: '',
    clientPhone: '',
    site: '',
    contractValue: '',
    budget: '',
    receivedAmount: '',
    spentAmount: '',
    startDate: '',
    expectedCompletion: '',
    category: 'Industrial Shed',
    status: 'In Progress'
  });

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.client.trim()) {
      alert(language === 'bn' ? 'প্রজেক্টের নাম ও ক্লায়েন্টের নাম লিখুন!' : 'Please enter project and client names!');
      return;
    }
    addProject(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      client: '',
      clientPhone: '',
      site: '',
      contractValue: '',
      budget: '',
      startDate: new Date().toISOString().slice(0, 10),
      expectedCompletion: '',
      category: 'Industrial Shed',
      status: 'In Progress'
    });
  };

  const handleOpenEdit = (project, e) => {
    if (e) e.stopPropagation();
    setEditingProject(project);
    setEditFormData({
      id: project.id,
      name: project.name || '',
      client: project.client || '',
      clientPhone: project.clientPhone || '',
      site: project.site || '',
      contractValue: project.contractValue || '',
      budget: project.budget || '',
      receivedAmount: project.receivedAmount || 0,
      spentAmount: project.spentAmount || 0,
      startDate: project.startDate || '',
      expectedCompletion: project.expectedCompletion || '',
      category: project.category || 'Industrial Shed',
      status: project.status || 'In Progress'
    });
  };

  const handleUpdateProjectSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.client.trim()) {
      alert(language === 'bn' ? 'প্রজেক্ট ও ক্লায়েন্টের নাম আবশ্যক!' : 'Project and client names are required!');
      return;
    }
    updateProject(editFormData.id, editFormData);
    if (selectedProject && selectedProject.id === editFormData.id) {
      setSelectedProject(prev => ({ ...prev, ...editFormData }));
    }
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId, projectName, e) => {
    if (e) e.stopPropagation();
    const confirmMsg = language === 'bn'
      ? `আপনি কি নিশ্চিত "${projectName}" (${projectId}) প্রজেক্টটি মুছে ফেলতে চান?`
      : `Are you sure you want to delete project "${projectName}" (${projectId})?`;
    if (window.confirm(confirmMsg)) {
      deleteProject(projectId);
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    }
  };

  // Reset Drawer Filters
  const handleResetDrawerFilters = () => {
    setTxnTypeFilter('all');
    setTxnCategoryFilter('all');
    setTxnSearchQuery('');
    setTxnStartDate('');
    setTxnEndDate('');
  };

  // Filter & Sort Projects List
  const filteredProjects = data.projects.filter(p => {
    if (projectStatusFilter !== 'all' && p.status !== projectStatusFilter) return false;
    if (projectSearchQuery.trim()) {
      const q = projectSearchQuery.toLowerCase().trim();
      const mId = p.id?.toLowerCase().includes(q);
      const mName = p.name?.toLowerCase().includes(q);
      const mClient = p.client?.toLowerCase().includes(q);
      const mPhone = p.clientPhone?.toLowerCase().includes(q);
      const mSite = p.site?.toLowerCase().includes(q);
      if (!mId && !mName && !mClient && !mPhone && !mSite) return false;
    }
    return true;
  }).sort((a, b) => {
    if (projectSortBy === 'contract-desc') return (Number(b.contractValue) || 0) - (Number(a.contractValue) || 0);
    if (projectSortBy === 'received-desc') return (Number(b.receivedAmount) || 0) - (Number(a.receivedAmount) || 0);
    if (projectSortBy === 'spent-desc') return (Number(b.spentAmount) || 0) - (Number(a.spentAmount) || 0);
    if (projectSortBy === 'profit-desc') {
      const profitA = (Number(a.receivedAmount) || 0) - (Number(a.spentAmount) || 0);
      const profitB = (Number(b.receivedAmount) || 0) - (Number(b.spentAmount) || 0);
      return profitB - profitA;
    }
    if (projectSortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  // Global Project Stats for filtered list
  const totalFilteredContract = filteredProjects.reduce((sum, p) => sum + (Number(p.contractValue) || 0), 0);
  const totalFilteredReceived = filteredProjects.reduce((sum, p) => sum + (Number(p.receivedAmount) || 0), 0);
  const totalFilteredSpent = filteredProjects.reduce((sum, p) => sum + (Number(p.spentAmount) || 0), 0);
  const totalFilteredProfit = totalFilteredReceived - totalFilteredSpent;

  // Selected Project Calculations
  const allProjectTxns = selectedProject
    ? data.transactions.filter(t => t.projectId === selectedProject.id)
    : [];

  // Group expenses by category for selected project
  const categoryBreakdown = {};
  allProjectTxns.forEach(t => {
    const cat = t.category || 'অন্যান্য / Miscellaneous';
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = {
        name: cat,
        type: t.type,
        total: 0,
        count: 0
      };
    }
    categoryBreakdown[cat].total += (Number(t.amount) || 0);
    categoryBreakdown[cat].count += 1;
  });

  const expenseHeadsList = Object.values(categoryBreakdown).filter(c => c.type === 'expense');
  const incomeHeadsList = Object.values(categoryBreakdown).filter(c => c.type === 'income');
  const totalProjectExpenses = expenseHeadsList.reduce((sum, h) => sum + h.total, 0);
  const totalProjectIncome = incomeHeadsList.reduce((sum, h) => sum + h.total, 0);

  // Filtered transactions inside drawer
  const filteredProjectTxns = allProjectTxns.filter(t => {
    if (txnTypeFilter !== 'all' && t.type !== txnTypeFilter) return false;
    if (txnCategoryFilter !== 'all' && t.category !== txnCategoryFilter) return false;
    if (txnStartDate && t.date < txnStartDate) return false;
    if (txnEndDate && t.date > txnEndDate) return false;
    if (txnSearchQuery.trim()) {
      const q = txnSearchQuery.toLowerCase().trim();
      const mV = t.voucherNo?.toLowerCase().includes(q);
      const mP = t.party?.toLowerCase().includes(q);
      const mD = t.description?.toLowerCase().includes(q);
      const mC = t.category?.toLowerCase().includes(q);
      const mN = t.note?.toLowerCase().includes(q);
      if (!mV && !mP && !mD && !mC && !mN) return false;
    }
    return true;
  });

  const filteredIncomeTotal = filteredProjectTxns
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const filteredExpenseTotal = filteredProjectTxns
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const filteredNetBalance = filteredIncomeTotal - filteredExpenseTotal;

  // Export Filtered Project Statement to Excel
  const handleExportExcel = () => {
    if (!selectedProject || filteredProjectTxns.length === 0) {
      alert(language === 'bn' ? 'এক্সপোর্ট করার মতো কোনো লেনদেন পাওয়া যায়নি!' : 'No transactions to export!');
      return;
    }

    const rows = filteredProjectTxns.map((t, idx) => ({
      'SL': idx + 1,
      'Voucher No': t.voucherNo,
      'Date': t.date,
      'Type': t.type === 'income' ? 'Income / Receipt (জমা)' : 'Expense / Payment (খরচ)',
      'Party / Vendor': t.party,
      'Head / Category': t.category,
      'Description': t.description,
      'Note / Ref': t.note || '',
      'Amount (BDT)': t.amount,
      'Account / Method': data.accounts.find(a => a.id === t.accountId)?.name || t.accountId
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Project Ledger');
    const cleanName = (selectedProject.name || selectedProject.id).replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
    XLSX.writeFile(wb, `${selectedProject.id}_${cleanName}_Statement.xlsx`);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'প্রজেক্ট ম্যানেজমেন্ট ও ব্যয় নিয়ন্ত্রণ' : 'Project Management & Costing'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'স্টিল স্ট্রাকচার প্রজেক্টের চুক্তি, ব্যয় ব্রেকডাউন, বিল প্রাপ্তি ও হেডভিত্তিক ফিল্টারিং'
              : 'Track contracts, head-wise expense breakdowns, billing receipts and project filtering'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow transition self-start cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন প্রজেক্ট' : '+ New Project'}</span>
        </button>
      </div>

      {/* Top Filter & Search Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center overflow-x-auto bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shrink-0">
            {[
              { id: 'all', label: language === 'bn' ? 'সকল প্রজেক্ট' : 'All', count: data.projects.length },
              { id: 'In Progress', label: language === 'bn' ? 'চলমান' : 'In Progress', count: data.projects.filter(p => p.status === 'In Progress').length },
              { id: 'Completed', label: language === 'bn' ? 'সম্পন্ন' : 'Completed', count: data.projects.filter(p => p.status === 'Completed').length },
              { id: 'On Hold', label: language === 'bn' ? 'স্থগিত' : 'On Hold', count: data.projects.filter(p => p.status === 'On Hold').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setProjectStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  projectStatusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  projectStatusFilter === tab.id ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box & Sort Selector */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-end">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                placeholder={language === 'bn' ? 'প্রজেক্ট, ক্লায়েন্ট (যেমন: আরএস কর্পোরেশন, Leaders), সাইট খুঁজুন...' : 'Search project, client, site...'}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
              {projectSearchQuery && (
                <button
                  onClick={() => setProjectSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={projectSortBy}
                onChange={(e) => setProjectSortBy(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-hidden cursor-pointer"
              >
                <option value="default">{language === 'bn' ? 'ডিফল্ট ক্রম' : 'Default Order'}</option>
                <option value="contract-desc">{language === 'bn' ? 'চুক্তি মূল্য (সর্বোচ্চ)' : 'Contract Value (High)'}</option>
                <option value="received-desc">{language === 'bn' ? 'বিল প্রাপ্তি (সর্বোচ্চ)' : 'Received (High)'}</option>
                <option value="spent-desc">{language === 'bn' ? 'ব্যয় (সর্বোচ্চ)' : 'Spent (High)'}</option>
                <option value="profit-desc">{language === 'bn' ? 'বর্তমান লাভ (সর্বোচ্চ)' : 'Net Profit (High)'}</option>
                <option value="name-asc">{language === 'bn' ? 'নামানুসারে (A-Z)' : 'Name (A-Z)'}</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(projectSearchQuery || projectStatusFilter !== 'all' || projectSortBy !== 'default') && (
              <button
                onClick={() => {
                  setProjectSearchQuery('');
                  setProjectStatusFilter('all');
                  setProjectSortBy('default');
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
                title="ফিল্টার রিসেট করুন"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Financial Metrics Pills for Filtered Projects */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'প্রদর্শিত প্রজেক্ট চুক্তি মূল্য:' : 'Contract Total:'}</span>
            <span className="font-bold text-white text-sm">{formatBDT(totalFilteredContract)}</span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'মোট বিল প্রাপ্তি (জমা):' : 'Total Received:'}</span>
            <span className="font-bold text-emerald-400 text-sm">{formatBDT(totalFilteredReceived)}</span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'মোট প্রজেক্ট খরচ:' : 'Total Spent:'}</span>
            <span className="font-bold text-rose-400 text-sm">{formatBDT(totalFilteredSpent)}</span>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'বর্তমান মোট নিট লাভ:' : 'Net Profit:'}</span>
            <span className={`font-bold text-sm ${totalFilteredProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatBDT(totalFilteredProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Projects Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-white font-bold text-sm">
            {language === 'bn' ? 'কোনো প্রজেক্ট পাওয়া যায়নি!' : 'No projects found!'}
          </div>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'আপনার সার্চ বা ফিল্টার পরিবর্তন করুন অথবা রিসেট বাটনে চাপ দিন।'
              : 'Try adjusting your search query or reset the filters.'}
          </p>
          <button
            onClick={() => {
              setProjectSearchQuery('');
              setProjectStatusFilter('all');
              setProjectSortBy('default');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {language === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Reset All Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const contractVal = Number(project.contractValue) || 0;
            const received = Number(project.receivedAmount) || 0;
            const spent = Number(project.spentAmount) || 0;
            const currentProfit = received - spent;
            const isSelected = selectedProject?.id === project.id;
            const budgetPercent = project.budget > 0 ? Math.min(100, Math.round((spent / project.budget) * 100)) : 0;

            return (
              <div
                key={project.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedProject(null);
                  } else {
                    setSelectedProject(project);
                    handleResetDrawerFilters();
                  }
                }}
                className={`relative cursor-pointer rounded-2xl p-5 border transition-all ${
                  isSelected 
                    ? 'bg-slate-800/95 border-amber-500 ring-2 ring-amber-500/30 shadow-2xl scale-[1.01]' 
                    : 'bg-slate-800/75 border-slate-700/80 hover:border-slate-500 hover:bg-slate-800/90'
                }`}
              >
                {/* Header row with Project ID and Action Buttons */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                      {project.id}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      project.status === 'Completed' 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : project.status === 'On Hold'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleOpenEdit(project, e)}
                      className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs cursor-pointer"
                      title={language === 'bn' ? 'প্রজেক্ট এডিট করুন' : 'Edit Project'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                      className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition shadow-xs cursor-pointer"
                      title={language === 'bn' ? 'প্রজেক্ট মুছুন (Delete)' : 'Delete Project'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-white text-base leading-snug line-clamp-1 mb-1" title={project.name}>
                  {project.name}
                </h3>

                <div className="text-xs text-amber-400 font-medium mb-1 truncate">
                  {project.client} {project.clientPhone && <span className="text-slate-400 font-normal">({project.clientPhone})</span>}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{project.site}</span>
                </div>

                {/* Financial Breakdown Table in card */}
                <div className="bg-slate-900/85 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'চুক্তি মূল্য:' : 'Contract:'}</span>
                    <span className="font-bold text-white">{formatBDT(contractVal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'বিল প্রাপ্তি (জমা):' : 'Received:'}</span>
                    <span className="font-bold text-emerald-400">{formatBDT(received)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'প্রজেক্ট খরচ (মালামাল+শ্রম):' : 'Spent:'}</span>
                    <span className="font-bold text-rose-400">{formatBDT(spent)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-300 font-medium">{language === 'bn' ? 'বর্তমান নিট মার্জিন:' : 'Net Margin:'}</span>
                    <span className={`font-bold ${currentProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatBDT(currentProfit)}
                    </span>
                  </div>
                </div>

                {/* Budget Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>{language === 'bn' ? 'বাজেট ব্যবহার' : 'Budget Spent'}</span>
                    <span className="font-mono font-bold text-slate-300">{budgetPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${budgetPercent > 90 ? 'bg-rose-500' : 'bg-amber-400'}`}
                      style={{ width: `${budgetPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                  <button
                    onClick={(e) => handleOpenEdit(project, e)}
                    className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{language === 'bn' ? 'এডিট করুন' : 'Edit'}</span>
                  </button>
                  <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'}`}>
                    {isSelected 
                      ? (language === 'bn' ? 'লেজার বন্ধ করুন ▲' : 'Close Ledger ▲') 
                      : (language === 'bn' ? 'লেজার ও ভাউচার দেখুন ▼' : 'View Ledger & Vouchers ▼')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Project Detailed Transactions & Filter Drawer */}
      {selectedProject && (
        <div className="bg-slate-900 border-2 border-amber-500/70 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 animate-fade-in scroll-mt-6">
          {/* Drawer Top Header Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {selectedProject.id}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  selectedProject.status === 'Completed' 
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}>
                  {selectedProject.status}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {selectedProject.category || 'Industrial Shed'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                {selectedProject.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                <div>
                  <span className="text-slate-500">ক্লায়েন্ট:</span>{' '}
                  <span className="text-amber-400 font-semibold">{selectedProject.client}</span>
                  {selectedProject.clientPhone && <span className="text-slate-300"> ({selectedProject.clientPhone})</span>}
                </div>
                <div>
                  <span className="text-slate-500">সাইট:</span>{' '}
                  <span className="text-slate-200">{selectedProject.site}</span>
                </div>
              </div>
            </div>

            {/* Header Right Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowPrintStatementModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 transition cursor-pointer"
                title="সম্পূর্ণ প্রজেক্ট স্টেটমেন্ট প্রিন্ট করুন"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'স্টেটমেন্ট প্রিন্ট' : 'Print Statement'}</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold text-xs border border-emerald-500/30 transition cursor-pointer"
                title="এক্সেল শীটে ডাউনলোড করুন"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{language === 'bn' ? 'এক্সেল' : 'Excel'}</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('accounting');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold text-xs border border-blue-500/30 transition cursor-pointer"
                title="জমা-খরচ মেইন খাতায় দেখুন"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{language === 'bn' ? 'হিসাব খাতা' : 'Accounting'}</span>
              </button>

              <button
                onClick={(e) => handleOpenEdit(selectedProject, e)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-semibold text-xs border border-amber-500/30 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
              </button>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                title="লেজার বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Project Financial Health Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">চুক্তি মূল্য</span>
              <span className="font-bold text-white text-sm sm:text-base">{formatBDT(selectedProject.contractValue || 0)}</span>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">মোট বিল প্রাপ্তি (জমা)</span>
              <span className="font-bold text-emerald-400 text-sm sm:text-base">+{formatBDT(selectedProject.receivedAmount || 0)}</span>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-400 block tracking-wider">মোট প্রজেক্ট খরচ</span>
              <span className="font-bold text-rose-400 text-sm sm:text-base">-{formatBDT(selectedProject.spentAmount || 0)}</span>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">বর্তমান নিট লাভ</span>
              <span className={`font-bold text-sm sm:text-base ${
                ((selectedProject.receivedAmount || 0) - (selectedProject.spentAmount || 0)) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatBDT((selectedProject.receivedAmount || 0) - (selectedProject.spentAmount || 0))}
              </span>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">ক্লায়েন্টের কাছে বকেয়া</span>
              <span className="font-bold text-cyan-400 text-sm sm:text-base">
                {formatBDT(Math.max(0, (selectedProject.contractValue || 0) - (selectedProject.receivedAmount || 0)))}
              </span>
            </div>
          </div>

          {/* Interactive Head-wise Cost Breakdown (খরচের খাতভিত্তিক সামারি ও কুইক ফিল্টার) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'bn' ? 'প্রজেক্টের খরচের খাতসমূহ (Head-wise Expenses Breakdown)' : 'Head-wise Cost Breakdown'}
                </h4>
              </div>
              <div className="text-[11px] text-slate-400">
                {language === 'bn' ? 'যেকোনো খাতে ক্লিক করে সাথে সাথে ফিল্টার করুন' : 'Click any head to filter transactions instantly'}
              </div>
            </div>

            {expenseHeadsList.length === 0 ? (
              <div className="text-xs text-slate-500 py-2">
                {language === 'bn' ? 'এই প্রজেক্টে এখনও কোনো খরচের খাত রেকর্ড করা হয়নি।' : 'No expense heads recorded for this project yet.'}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {/* All Heads Reset Button */}
                <button
                  onClick={() => {
                    setTxnCategoryFilter('all');
                    setTxnTypeFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                    txnCategoryFilter === 'all'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span>{language === 'bn' ? 'সকল খাত' : 'All Heads'}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    txnCategoryFilter === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {allProjectTxns.length}
                  </span>
                </button>

                {/* Individual Expense Heads */}
                {expenseHeadsList.map((head) => {
                  const isCatSelected = txnCategoryFilter === head.name;
                  const percentOfTotal = totalProjectExpenses > 0 ? Math.round((head.total / totalProjectExpenses) * 100) : 0;

                  return (
                    <button
                      key={head.name}
                      onClick={() => {
                        if (isCatSelected) {
                          setTxnCategoryFilter('all');
                        } else {
                          setTxnCategoryFilter(head.name);
                          setTxnTypeFilter('expense');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-2 ${
                        isCatSelected
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:border-rose-500/40 hover:bg-slate-800'
                      }`}
                    >
                      {isCatSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                      <span className="font-medium text-white">{head.name}</span>
                      <span className="font-bold text-rose-400">{formatBDT(head.total)}</span>
                      <span className="text-[10px] px-1 rounded bg-slate-900/60 text-slate-400">{percentOfTotal}%</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Transactions Filter Toolbar */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-md">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Type Filter Tabs: All / Income / Expense */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start">
                <button
                  onClick={() => setTxnTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    txnTypeFilter === 'all' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{language === 'bn' ? 'সকল লেনদেন' : 'All'}</span>
                  <span className="text-[10px] opacity-80">({allProjectTxns.length})</span>
                </button>

                <button
                  onClick={() => {
                    setTxnTypeFilter('income');
                    if (expenseHeadsList.some(h => h.name === txnCategoryFilter)) {
                      setTxnCategoryFilter('all');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    txnTypeFilter === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                >
                  <span>{language === 'bn' ? 'শুধু জমা / বিল প্রাপ্তি' : 'Income / Received'}</span>
                  <span className="text-[10px] opacity-80">({allProjectTxns.filter(t => t.type === 'income').length})</span>
                </button>

                <button
                  onClick={() => setTxnTypeFilter('expense')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    txnTypeFilter === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <span>{language === 'bn' ? 'শুধু প্রজেক্ট খরচ' : 'Expenses'}</span>
                  <span className="text-[10px] opacity-80">({allProjectTxns.filter(t => t.type === 'expense').length})</span>
                </button>
              </div>

              {/* Category Dropdown & Search & Date Filter */}
              <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
                {/* Category Dropdown */}
                <select
                  value={txnCategoryFilter}
                  onChange={(e) => setTxnCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400 max-w-[200px] cursor-pointer"
                >
                  <option value="all">{language === 'bn' ? 'সকল হেড / ক্যাটাগরি' : 'All Heads / Categories'}</option>
                  {Array.from(new Set(allProjectTxns.map(t => t.category).filter(Boolean))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Search Box */}
                <div className="relative min-w-[170px] flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txnSearchQuery}
                    onChange={(e) => setTxnSearchQuery(e.target.value)}
                    placeholder={language === 'bn' ? 'ভাউচার নং, বিবরণ, পক্ষ...' : 'Search voucher, party...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                  {txnSearchQuery && (
                    <button
                      onClick={() => setTxnSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Reset Drawer Filters Button */}
                {(txnTypeFilter !== 'all' || txnCategoryFilter !== 'all' || txnSearchQuery || txnStartDate || txnEndDate) && (
                  <button
                    onClick={handleResetDrawerFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-semibold transition cursor-pointer"
                    title="ফিল্টার রিসেট করুন"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{language === 'bn' ? 'ফিল্টার মুছুন' : 'Reset'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filtered Results Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/80 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <span>
                  {language === 'bn' ? 'ফিল্টারকৃত ভাউচার:' : 'Matching Vouchers:'}{' '}
                  <strong className="text-white font-mono">{filteredProjectTxns.length}</strong> টি
                </span>
                {txnCategoryFilter !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold">
                    হেড: {txnCategoryFilter}
                  </span>
                )}
                {txnTypeFilter !== 'all' && (
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    txnTypeFilter === 'income' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {txnTypeFilter === 'income' ? 'শুধু জমা' : 'শুধু খরচ'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">ফিল্টার জমা</span>
                  <span className="text-emerald-400 font-bold">+{formatBDT(filteredIncomeTotal)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">ফিল্টার খরচ</span>
                  <span className="text-rose-400 font-bold">-{formatBDT(filteredExpenseTotal)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">নিট ব্যালেন্স</span>
                  <span className={`font-bold ${filteredNetBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatBDT(filteredNetBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow">
            {filteredProjectTxns.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Receipt className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-slate-300 font-bold text-sm">
                  {language === 'bn' ? 'নির্বাচিত ফিল্টারে কোনো ভাউচার পাওয়া যায়নি।' : 'No vouchers match the selected filter.'}
                </div>
                <p className="text-slate-500 text-[11px]">
                  {language === 'bn' ? 'ক্যাটাগরি বা সার্চ পরিবর্তন করুন অথবা রিসেট বাটনে ক্লিক করুন।' : 'Change category, type or search terms.'}
                </p>
                <button
                  onClick={handleResetDrawerFilters}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Voucher No</th>
                      <th className="py-3 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                      <th className="py-3 px-3">{language === 'bn' ? 'বিবরণ ও পক্ষ' : 'Description & Party'}</th>
                      <th className="py-3 px-3">{language === 'bn' ? 'খরচের হেড / ক্যাটাগরি' : 'Category / Head'}</th>
                      <th className="py-3 px-3">{language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}</th>
                      <th className="py-3 px-3 text-right">{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount'}</th>
                      <th className="py-3 px-3 text-center">{language === 'bn' ? 'প্রিন্ট' : 'Print'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredProjectTxns.map((txn) => {
                      const acc = data.accounts.find(a => a.id === txn.accountId);
                      const isIncome = txn.type === 'income';

                      return (
                        <tr key={txn.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-amber-400">
                            {txn.voucherNo}
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono">
                            {formatDate(txn.date)}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-white">{txn.party}</div>
                            <div className="text-[11px] text-slate-400 leading-snug">{txn.description}</div>
                            {txn.note && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5 font-mono">Ref: {txn.note}</div>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isIncome 
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}>
                              {txn.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 text-[11px]">
                            {acc ? acc.name : 'Cash'}
                          </td>
                          <td className={`py-3 px-3 text-right font-bold text-sm font-mono ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {isIncome ? '+' : '-'}{formatBDT(txn.amount)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedVoucherForPrint(txn);
                                setActiveTab('vouchers');
                              }}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-amber-400 transition cursor-pointer"
                              title={language === 'bn' ? 'অফিসিয়াল ভাউচার প্রিন্ট করুন' : 'Print Voucher'}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900/90 font-bold text-xs border-t-2 border-slate-700">
                      <td colSpan={5} className="py-3 px-3 text-right text-slate-300">
                        {language === 'bn' ? 'ফিল্টারকৃত সর্বমোট নিট ব্যালেন্স:' : 'Filtered Net Total:'}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono text-sm ${
                        filteredNetBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {formatBDT(filteredNetBalance)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add New Project */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'নতুন স্টিল স্ট্রাকচার প্রজেক্ট যুক্ত করুন' : 'Add New Steel Project'}</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্টের নাম' : 'Project Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navana Logistics Steel Warehouse"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট / প্রতিষ্ঠানের নাম' : 'Client Name'} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navana Group Ltd"
                    value={formData.client}
                    onChange={(e) => setFormData(p => ({ ...p, client: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট মোবাইল' : 'Client Phone'}</label>
                  <input
                    type="text"
                    placeholder="e.g. 018XXXXXXXX"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(p => ({ ...p, clientPhone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সাইটের ঠিকানা' : 'Site Location'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhatiary, Sitakunda, Chattogram"
                  value={formData.site}
                  onChange={(e) => setFormData(p => ({ ...p, site: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'চুক্তি মূল্য (Contract BDT)' : 'Contract Value'} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000000"
                    value={formData.contractValue}
                    onChange={(e) => setFormData(p => ({ ...p, contractValue: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'বাজেট (Budget BDT)' : 'Budget'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 4000000"
                    value={formData.budget}
                    onChange={(e) => setFormData(p => ({ ...p, budget: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্ট ধরন / ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Industrial Shed">Industrial Shed</option>
                    <option value="Pre-Engineered Building">Pre-Engineered Building (PEB)</option>
                    <option value="Lift Core Structures">Lift Core Structures</option>
                    <option value="Specialized & Defense">Specialized & Defense</option>
                    <option value="Commercial Steel Building">Commercial Steel Building</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কাজের অবস্থা (Status)' : 'Status'}</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="In Progress">In Progress (চলমান)</option>
                    <option value="Completed">Completed (সম্পন্ন)</option>
                    <option value="On Hold">On Hold (স্থগিত)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}</label>
                  <DateInput
                    value={formData.startDate}
                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সম্ভাব্য সমাপ্তি তারিখ' : 'Expected Completion'}</label>
                  <DateInput
                    value={formData.expectedCompletion}
                    onChange={(e) => setFormData(p => ({ ...p, expectedCompletion: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg cursor-pointer"
                >
                  {language === 'bn' ? 'প্রজেক্ট সংরক্ষণ করুন' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Project */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'প্রজেক্ট ও আর্থিক তথ্য এডিট' : 'Edit Project Details'}</span>
              </h3>
              <button 
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProjectSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্টের নাম' : 'Project Name'} *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট / প্রতিষ্ঠানের নাম' : 'Client Name'} *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.client}
                    onChange={(e) => setEditFormData(p => ({ ...p, client: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট মোবাইল' : 'Client Phone'}</label>
                  <input
                    type="text"
                    value={editFormData.clientPhone}
                    onChange={(e) => setEditFormData(p => ({ ...p, clientPhone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সাইটের ঠিকানা' : 'Site Location'} *</label>
                <input
                  type="text"
                  required
                  value={editFormData.site}
                  onChange={(e) => setEditFormData(p => ({ ...p, site: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'চুক্তি মূল্য (Contract BDT)' : 'Contract Value'} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editFormData.contractValue}
                    onChange={(e) => setEditFormData(p => ({ ...p, contractValue: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'বাজেট (Budget BDT)' : 'Budget'}</label>
                  <input
                    type="number"
                    value={editFormData.budget}
                    onChange={(e) => setEditFormData(p => ({ ...p, budget: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্ট ধরন / ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Industrial Shed">Industrial Shed</option>
                    <option value="Pre-Engineered Building">Pre-Engineered Building (PEB)</option>
                    <option value="Lift Core Structures">Lift Core Structures</option>
                    <option value="Specialized & Defense">Specialized & Defense</option>
                    <option value="Commercial Steel Building">Commercial Steel Building</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কাজের অবস্থা (Status)' : 'Status'}</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="In Progress">In Progress (চলমান)</option>
                    <option value="Completed">Completed (সম্পন্ন)</option>
                    <option value="On Hold">On Hold (স্থগিত)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}</label>
                  <DateInput
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সম্ভাব্য সমাপ্তি তারিখ' : 'Expected Completion'}</label>
                  <DateInput
                    value={editFormData.expectedCompletion}
                    onChange={(e) => setEditFormData(p => ({ ...p, expectedCompletion: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteProject(editFormData.id, editFormData.name)}
                  className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রজেক্ট ডিলিট' : 'Delete'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg cursor-pointer"
                  >
                    {language === 'bn' ? 'আপডেট সেভ করুন' : 'Update Project'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Project Statement Modal (A4 Official Ledger) */}
      {showPrintStatementModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                A4 Official Project Financial Statement Preview
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন (Print A4)</span>
                </button>
                <button
                  onClick={() => setShowPrintStatementModal(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Statement Area */}
            <div className="space-y-6">
              {/* Company Header */}
              <div className="text-center pb-4 border-b-2 border-slate-900">
                <h1 className="text-2xl font-black tracking-tight text-slate-950">{COMPANY_INFO.name}</h1>
                <p className="text-xs font-bold text-amber-700 tracking-wider uppercase mt-0.5">{COMPANY_INFO.tagline}</p>
                <p className="text-[11px] text-slate-600 mt-1">{COMPANY_INFO.address}</p>
                <p className="text-[11px] text-slate-600">
                  Phone: {COMPANY_INFO.phone} | Email: {COMPANY_INFO.email} | Web: {COMPANY_INFO.website}
                </p>
                <div className="mt-3 inline-block bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  প্রজেক্ট আর্থিক স্টেটমেন্ট ও ব্যয় খাতা (Project Financial Statement)
                </div>
              </div>

              {/* Project & Client Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="font-bold text-slate-900 text-sm">{selectedProject.name}</div>
                  <div className="text-slate-700 mt-1"><strong>প্রজেক্ট আইডি:</strong> {selectedProject.id}</div>
                  <div className="text-slate-700"><strong>ক্লায়েন্ট:</strong> {selectedProject.client} ({selectedProject.clientPhone || 'N/A'})</div>
                  <div className="text-slate-700"><strong>সাইটের অবস্থান:</strong> {selectedProject.site}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-700"><strong>তারিখ:</strong> {new Date().toLocaleDateString('en-GB')}</div>
                  <div className="text-slate-700"><strong>চুক্তি মূল্য:</strong> {formatBDT(selectedProject.contractValue || 0)}</div>
                  <div className="text-emerald-700 font-bold"><strong>মোট প্রাপ্তি (জমা):</strong> +{formatBDT(selectedProject.receivedAmount || 0)}</div>
                  <div className="text-rose-700 font-bold"><strong>মোট প্রজেক্ট ব্যয়:</strong> -{formatBDT(selectedProject.spentAmount || 0)}</div>
                  <div className="text-slate-900 font-black mt-1"><strong>বর্তমান নিট মার্জিন:</strong> {formatBDT((selectedProject.receivedAmount || 0) - (selectedProject.spentAmount || 0))}</div>
                </div>
              </div>

              {/* Active Filter Note if any */}
              {(txnTypeFilter !== 'all' || txnCategoryFilter !== 'all' || txnSearchQuery) && (
                <div className="text-[11px] text-slate-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <strong>ফিল্টার শর্ত:</strong>{' '}
                  {txnTypeFilter !== 'all' && (txnTypeFilter === 'income' ? '[শুধু জমা / বিল প্রাপ্তি] ' : '[শুধু প্রজেক্ট খরচ] ')}
                  {txnCategoryFilter !== 'all' && `[খাত: ${txnCategoryFilter}] `}
                  {txnSearchQuery && `[সার্চ: "${txnSearchQuery}"]`}
                </div>
              )}

              {/* Transactions Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                    <th className="py-2 px-2.5 border-r border-slate-300">SL</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Voucher No</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Date</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Description & Party</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Head / Category</th>
                    <th className="py-2 px-2.5 border-r border-slate-300 text-right">Debit (খরচ)</th>
                    <th className="py-2 px-2.5 text-right">Credit (জমা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProjectTxns.map((txn, idx) => {
                    const isIncome = txn.type === 'income';
                    return (
                      <tr key={txn.id} className="odd:bg-white even:bg-slate-50/50">
                        <td className="py-2 px-2.5 border-r border-slate-200 font-mono">{idx + 1}</td>
                        <td className="py-2 px-2.5 border-r border-slate-200 font-mono font-bold text-slate-900">{txn.voucherNo}</td>
                        <td className="py-2 px-2.5 border-r border-slate-200 font-mono">{txn.date}</td>
                        <td className="py-2 px-2.5 border-r border-slate-200">
                          <div className="font-semibold text-slate-900">{txn.party}</div>
                          <div className="text-[11px] text-slate-600">{txn.description}</div>
                        </td>
                        <td className="py-2 px-2.5 border-r border-slate-200 font-medium text-slate-700">{txn.category}</td>
                        <td className="py-2 px-2.5 border-r border-slate-200 text-right font-mono text-rose-700 font-semibold">
                          {!isIncome ? formatBDT(txn.amount) : '-'}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono text-emerald-700 font-bold">
                          {isIncome ? formatBDT(txn.amount) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                    <td colSpan={5} className="py-2.5 px-3 text-right text-slate-900">সর্বমোট (Total):</td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-rose-700 border-r border-slate-300">
                      {formatBDT(filteredExpenseTotal)}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-mono text-emerald-700">
                      {formatBDT(filteredIncomeTotal)}
                    </td>
                  </tr>
                  <tr className="bg-slate-200 font-black text-xs">
                    <td colSpan={5} className="py-2.5 px-3 text-right text-slate-950">নিট প্রজেক্ট ব্যালেন্স (Net Balance):</td>
                    <td colSpan={2} className={`py-2.5 px-3 text-right font-mono text-sm ${
                      filteredNetBalance >= 0 ? 'text-emerald-800' : 'text-rose-800'
                    }`}>
                      {formatBDT(filteredNetBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 pt-12 text-center text-xs text-slate-700">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold">Prepared By</div>
                  <div className="text-[10px] text-slate-500">Accounts Executive</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold">Verified By</div>
                  <div className="text-[10px] text-slate-500">Project Engineer</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold">Authorized Signatory</div>
                  <div className="text-[10px] text-slate-500">Managing Director & CEO</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
