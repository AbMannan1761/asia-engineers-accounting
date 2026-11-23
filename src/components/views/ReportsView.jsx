import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Calendar,
  Building,
  TrendingUp,
  TrendingDown,
  Layers,
  Printer,
  ExternalLink,
  Briefcase,
  Search,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatBDT, formatDate } from '../../utils/formatters';

export const ReportsView = () => {
  const {
    language,
    data,
    totalIncome,
    totalExpense,
    totalCashBalance,
    totalBankBalance,
    totalReceivable,
    totalPayable,
    exportAllToExcel
  } = useApp();

  const [activeReport, setActiveReport] = useState('project_report'); // default to project_report so user sees it right away!
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [projectSearch, setProjectSearch] = useState('');

  const netProfit = totalIncome - totalExpense;

  // Real-time Project-wise Debit & Credit Computations
  const projectsReportData = (data.projects || []).map(p => {
    const pTxns = (data.transactions || []).filter(t =>
      t.projectId === p.id ||
      (t.projectId && t.projectId.toLowerCase() === p.id.toLowerCase()) ||
      (p.name && t.party && t.party.toLowerCase().includes(p.name.toLowerCase())) ||
      (p.client && t.party && t.party.toLowerCase().includes(p.client.toLowerCase()))
    );

    const totalCredit = pTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalDebit = pTxns.filter(t => t.type === 'expense').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const effectiveCredit = Math.max(Number(p.receivedAmount) || 0, totalCredit);
    const effectiveDebit = Math.max(Number(p.spentAmount) || 0, totalDebit);
    const contract = Number(p.contractValue) || 0;
    const due = Math.max(0, contract - effectiveCredit);
    const netMargin = effectiveCredit - effectiveDebit;

    return {
      ...p,
      contract,
      totalCredit: effectiveCredit,
      totalDebit: effectiveDebit,
      netMargin,
      due,
      pTxns
    };
  });

  const filteredProjectsReport = projectsReportData.filter(p => {
    if (!projectSearch.trim()) return true;
    const q = projectSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.client && p.client.toLowerCase().includes(q)) ||
      (p.site && p.site.toLowerCase().includes(q))
    );
  });

  const totalProjectContract = projectsReportData.reduce((s, p) => s + p.contract, 0);
  const totalProjectCredit = projectsReportData.reduce((s, p) => s + p.totalCredit, 0);
  const totalProjectDebit = projectsReportData.reduce((s, p) => s + p.totalDebit, 0);
  const totalProjectMargin = totalProjectCredit - totalProjectDebit;
  const totalProjectDue = projectsReportData.reduce((s, p) => s + p.due, 0);

  const activeSelectedProject = selectedProjectId !== 'all'
    ? projectsReportData.find(p => p.id === selectedProjectId)
    : null;

  // Export specific Project statement to Excel
  const handleExportProjectExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      if (activeSelectedProject) {
        const rows = activeSelectedProject.pTxns.map(t => {
          const acc = (data.accounts || []).find(a => a.id === t.accountId);
          return {
            "Date": t.date,
            "Voucher No": t.voucherNo,
            "Type": t.type === 'income' ? 'Credit (জমা)' : 'Debit (খরচ)',
            "Category": t.category || '-',
            "Party Name": t.party || '-',
            "Description": t.description || '-',
            "Payment Method": acc?.name || t.accountId || 'Cash',
            "Debit / Expense (BDT)": t.type === 'expense' ? t.amount : 0,
            "Credit / Income (BDT)": t.type === 'income' ? t.amount : 0
          };
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Project Statement");
        XLSX.writeFile(wb, `${activeSelectedProject.id}_Financial_Statement.xlsx`);
      } else {
        const rows = projectsReportData.map(p => ({
          "Project ID": p.id,
          "Project Name": p.name,
          "Client Name": p.client,
          "Site / Location": p.site || p.location || '-',
          "Contract Value (BDT)": p.contract,
          "Total Credit / Received (BDT)": p.totalCredit,
          "Total Debit / Spent (BDT)": p.totalDebit,
          "Net Profit / Margin (BDT)": p.netMargin,
          "Client Due (BDT)": p.due,
          "Status": p.status
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, "Projects Summary");
        XLSX.writeFile(wb, `All_Projects_Financial_Summary_${new Date().toISOString().slice(0, 10)}.xlsx`);
      }
    } catch (err) {
      alert('Excel export error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header & Excel Export Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'আর্থিক রিপোর্ট ও এক্সেল এক্সপোর্ট' : 'Financial Reports & Analytics'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' 
              ? 'দৈনিক ক্যাশ বুক, ব্যাংক বুক, লাভ-ক্ষতি হিসাব ও স্টিল স্টক ব্যালেন্স' 
              : 'Daily cash book, bank statements, profit/loss balance, and Excel spreadsheets'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://docs.google.com/spreadsheets/d/1RSGKMQvtyIXb-1iObSpTq9G-ynEFWKA0U2BBunINaWE/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition"
            title="Open Live Google Sheet (Asia engineers, Accounts)"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{language === 'bn' ? 'গুগল শিটে লাইভ দেখুন ↗' : 'Open Google Sheet ↗'}</span>
          </a>

          <button
            onClick={exportAllToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{language === 'bn' ? 'এক্সেলে ডাউনলোড (.xlsx)' : 'Export Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start flex-wrap gap-1">
        {[
          { id: 'project_report', label: language === 'bn' ? '📊 প্রজেক্ট-ভিত্তিক রিপোর্ট (Debit/Credit)' : '📊 Project Debit & Credit' },
          { id: 'cash_book', label: language === 'bn' ? 'দৈনিক ক্যাশ বুক (Cash Book)' : 'Cash Book' },
          { id: 'bank_book', label: language === 'bn' ? 'ব্যাংক বুক (Bank Book)' : 'Bank Book' },
          { id: 'pnl', label: language === 'bn' ? 'লাভ-ক্ষতি বিবরণী (P&L Statement)' : 'Profit & Loss' },
          { id: 'stock_valuation', label: language === 'bn' ? 'স্টিল স্টক ভ্যালুয়েশন' : 'Stock Valuation' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeReport === tab.id ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project-wise Report (Total Debit / Credit) */}
      {activeReport === 'project_report' && (
        <div className="space-y-5">
          {/* Controls & Filter Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow">
            <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 sm:max-w-xs">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {language === 'bn' ? 'প্রজেক্ট নির্বাচন করুন' : 'Select Project'}
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-medium"
                >
                  <option value="all">
                    🌐 {language === 'bn' ? 'সকল প্রজেক্টের মোট হিসাব (All Projects Summary)' : 'All Projects Financial Summary'}
                  </option>
                  {projectsReportData.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.client}) - {p.id}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProjectId === 'all' && (
                <div className="flex-1 sm:max-w-xs">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {language === 'bn' ? 'প্রজেক্ট বা ক্লায়েন্ট খুঁজুন' : 'Search Project / Client'}
                  </label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder={language === 'bn' ? 'প্রজেক্টের নাম বা ক্লায়েন্ট...' : 'Search by name or client...'}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Print & Excel Actions */}
            <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl shadow transition cursor-pointer"
                title={language === 'bn' ? 'রিপোর্ট প্রিন্ট করুন' : 'Print Statement'}
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
              </button>

              <button
                onClick={handleExportProjectExcel}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition cursor-pointer"
                title={language === 'bn' ? 'এক্সেলে ডাউনলোড (.xlsx)' : 'Download Excel (.xlsx)'}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'এক্সেল ডাউনলোড' : 'Export Excel'}</span>
              </button>
            </div>
          </div>

          {/* 5 Financial Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {language === 'bn' ? 'মোট চুক্তি মূল্য' : 'Contract Value'}
                </span>
                <Briefcase className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-white font-mono">
                {formatBDT(activeSelectedProject ? activeSelectedProject.contract : totalProjectContract)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {activeSelectedProject ? activeSelectedProject.id : `${projectsReportData.length} টি প্রজেক্ট`}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {language === 'bn' ? 'মোট জমা / ক্রেডিট' : 'Total Credit (In)'}
                </span>
                <ArrowDownRight className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                +{formatBDT(activeSelectedProject ? activeSelectedProject.totalCredit : totalProjectCredit)}
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-1">
                {language === 'bn' ? 'বিল প্রাপ্তি / ক্রেডিট ভাউচার' : 'Total Inflow / Received'}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-rose-500/30 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-rose-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {language === 'bn' ? 'মোট খরচ / ডেবিট' : 'Total Debit (Out)'}
                </span>
                <ArrowUpRight className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-rose-400 font-mono">
                -{formatBDT(activeSelectedProject ? activeSelectedProject.totalDebit : totalProjectDebit)}
              </div>
              <div className="text-[10px] text-rose-500/80 mt-1">
                {language === 'bn' ? 'মালামাল ও কাজের ব্যয়' : 'Direct Project Expenses'}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-blue-500/30 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-blue-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {language === 'bn' ? 'নিট লাভ / মার্জিন' : 'Net Margin'}
                </span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className={`text-base sm:text-lg font-black font-mono ${
                (activeSelectedProject ? activeSelectedProject.netMargin : totalProjectMargin) >= 0 ? 'text-blue-400' : 'text-rose-400'
              }`}>
                {formatBDT(activeSelectedProject ? activeSelectedProject.netMargin : totalProjectMargin)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {language === 'bn' ? 'ক্রেডিট মাইনাস ডেবিট' : 'Credit minus Debit'}
              </div>
            </div>

            <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 shadow-sm col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-amber-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {language === 'bn' ? 'ক্লায়েন্ট বকেয়া পাওনা' : 'Client Due'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                {formatBDT(activeSelectedProject ? activeSelectedProject.due : totalProjectDue)}
              </div>
              <div className="text-[10px] text-amber-400/80 mt-1">
                {language === 'bn' ? 'চুক্তি অনুযায়ী অবশিষ্ট পাওনা' : 'Receivable Balance'}
              </div>
            </div>
          </div>

          {/* View Mode 1: All Projects Summary Table */}
          {selectedProjectId === 'all' && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
              <div className="p-4 border-b border-slate-700/80 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {language === 'bn' ? 'প্রজেক্ট আর্থিক সারাংশ বিবরণী' : 'Projects Financial Overview'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'bn'
                      ? 'প্রতিটি প্রজেক্টের চুক্তি মূল্য, মোট ক্রেডিট (জমা), ডেবিট (খরচ) এবং নিট লাভের তালিকা'
                      : 'Summary of contract value, credit receipts, debit expenses, and net profit per project'}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Project & Client</th>
                      <th className="py-3 px-3">{language === 'bn' ? 'সাইট / লোকেশন' : 'Site / Location'}</th>
                      <th className="py-3 px-3 text-right">{language === 'bn' ? 'চুক্তি মূল্য' : 'Contract Value'}</th>
                      <th className="py-3 px-3 text-right text-emerald-400">{language === 'bn' ? 'মোট ক্রেডিট (জমা)' : 'Total Credit'}</th>
                      <th className="py-3 px-3 text-right text-rose-400">{language === 'bn' ? 'মোট ডেবিট (খরচ)' : 'Total Debit'}</th>
                      <th className="py-3 px-3 text-right text-blue-400">{language === 'bn' ? 'নিট লাভ (মার্জিন)' : 'Net Profit'}</th>
                      <th className="py-3 px-3 text-right text-amber-400">{language === 'bn' ? 'বকেয়া পাওনা' : 'Due Balance'}</th>
                      <th className="py-3 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                      <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredProjectsReport.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-xs">{p.name}</div>
                          <div className="text-[11px] text-amber-400 font-medium">{p.client}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.id}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-300 text-xs">
                          {p.site || p.location || '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                          {formatBDT(p.contract)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                          +{formatBDT(p.totalCredit)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">
                          -{formatBDT(p.totalDebit)}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono font-bold ${
                          p.netMargin >= 0 ? 'text-blue-400' : 'text-rose-400'
                        }`}>
                          {formatBDT(p.netMargin)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-400">
                          {formatBDT(p.due)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedProjectId(p.id)}
                            className="inline-flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs transition border border-amber-500/40 cursor-pointer"
                            title={language === 'bn' ? 'বিস্তারিত ভাউচার খাতা দেখুন' : 'View Voucher Statement'}
                          >
                            <span>{language === 'bn' ? 'স্টেটমেন্ট' : 'Statement'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900/90 font-bold text-xs border-t-2 border-slate-700">
                      <td colSpan="2" className="py-3 px-3 text-amber-400 uppercase">
                        {language === 'bn' ? 'সর্বমোট (Grand Total)' : 'Grand Total'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white">
                        {formatBDT(totalProjectContract)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400">
                        +{formatBDT(totalProjectCredit)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-400">
                        -{formatBDT(totalProjectDebit)}
                      </td>
                      <td className={`py-3 px-3 text-right font-mono ${totalProjectMargin >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                        {formatBDT(totalProjectMargin)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-amber-400">
                        {formatBDT(totalProjectDue)}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* View Mode 2: Individual Project Detailed Voucher Ledger */}
          {activeSelectedProject && (
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700 gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedProjectId('all')}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
                    title={language === 'bn' ? 'সকল প্রজেক্টের তালিকায় ফিরুন' : 'Back to All Projects'}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <span>{activeSelectedProject.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                        {activeSelectedProject.id}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                      <span>ক্লায়েন্ট: <strong className="text-slate-200">{activeSelectedProject.client}</strong></span>
                      {activeSelectedProject.site && (
                        <span>সাইট: <strong className="text-slate-200">{activeSelectedProject.site}</strong></span>
                      )}
                      <span>চুক্তি মূল্য: <strong className="text-amber-400">{formatBDT(activeSelectedProject.contract)}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedProjectId('all')}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সকল প্রজেক্টে ফিরুন' : 'Back to All'}</span>
                </button>
              </div>

              {/* Transactions Table for this Project */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 border-b border-slate-700 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Voucher #</th>
                      <th className="py-2.5 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                      <th className="py-2.5 px-3">{language === 'bn' ? 'ধরন' : 'Type'}</th>
                      <th className="py-2.5 px-3">{language === 'bn' ? 'খাত / ক্যাটাগরি' : 'Category'}</th>
                      <th className="py-2.5 px-3">{language === 'bn' ? 'পার্টি ও বিবরণ' : 'Party & Description'}</th>
                      <th className="py-2.5 px-3">{language === 'bn' ? 'পেমেন্ট মেথড' : 'Payment Method'}</th>
                      <th className="py-2.5 px-3 text-right text-rose-400">{language === 'bn' ? 'ডেবিট (খরচ ৳)' : 'Debit (Out)'}</th>
                      <th className="py-2.5 px-3 text-right text-emerald-400">{language === 'bn' ? 'ক্রেডিট (জমা ৳)' : 'Credit (In)'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {activeSelectedProject.pTxns.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-slate-500 italic">
                          {language === 'bn' ? 'এই প্রজেক্টের কোন ভাউচার বা লেনদেন এখনও পাওয়া যায়নি।' : 'No transactions recorded for this project yet.'}
                        </td>
                      </tr>
                    ) : (
                      activeSelectedProject.pTxns.map((t) => {
                        const isIncome = t.type === 'income';
                        const acc = (data.accounts || []).find(a => a.id === t.accountId);
                        return (
                          <tr key={t.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{t.voucherNo}</td>
                            <td className="py-2.5 px-3 text-slate-300">{formatDate(t.date)}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                isIncome
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              }`}>
                                {isIncome ? (language === 'bn' ? 'ক্রেডিট / জমা' : 'Credit') : (language === 'bn' ? 'ডেবিট / খরচ' : 'Debit')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300 font-medium">{t.category}</td>
                            <td className="py-2.5 px-3 text-slate-200">
                              <div className="font-semibold">{t.party}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{t.description}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-300">
                              {acc?.name || t.accountId || 'Cash'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-400">
                              {!isIncome ? `-${formatBDT(t.amount)}` : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                              {isIncome ? `+${formatBDT(t.amount)}` : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900/90 font-bold text-xs border-t-2 border-slate-700">
                      <td colSpan="6" className="py-3 px-3 text-right text-amber-400 uppercase">
                        {language === 'bn' ? 'প্রজেক্ট মোট (Total):' : 'Project Total:'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-rose-400">
                        -{formatBDT(activeSelectedProject.totalDebit)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400">
                        +{formatBDT(activeSelectedProject.totalCredit)}
                      </td>
                    </tr>
                    <tr className="bg-slate-900 font-bold text-xs">
                      <td colSpan="6" className="py-2 px-3 text-right text-slate-300">
                        {language === 'bn' ? 'প্রজেক্ট নিট লাভ / মার্জিন (Credit - Debit):' : 'Project Net Margin:'}
                      </td>
                      <td colSpan="2" className={`py-2 px-3 text-right font-mono text-sm ${
                        activeSelectedProject.netMargin >= 0 ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                        {formatBDT(activeSelectedProject.netMargin)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Report Content */}
      {activeReport === 'cash_book' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <h3 className="font-bold text-white text-sm">
                {language === 'bn' ? 'মেইন অফিস ক্যাশ খাতা (Petty Cash Book)' : 'Main Office Petty Cash Book'}
              </h3>
              <div className="text-xs text-slate-400">
                {language === 'bn' ? 'ক্যাশ ইন হ্যান্ড বর্তমান ব্যালেন্স:' : 'Current Cash Balance:'} <span className="font-bold text-emerald-400">{formatBDT(totalCashBalance)}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Voucher</th>
                  <th className="py-2.5 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="py-2.5 px-3">{language === 'bn' ? 'বিবরণ' : 'Description'}</th>
                  <th className="py-2.5 px-3">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'ক্যাশ জমা (+)' : 'Cash In'}</th>
                  <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'ক্যাশ খরচ (-)' : 'Cash Out'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.transactions
                  .filter(t => t.accountId === 'acc-cash' || t.toAccountId === 'acc-cash')
                  .map((t) => {
                    const isCashIn = t.type === 'income' || t.toAccountId === 'acc-cash';
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{t.voucherNo}</td>
                        <td className="py-2.5 px-3 text-slate-300">{formatDate(t.date)}</td>
                        <td className="py-2.5 px-3 text-slate-200">{t.party} - {t.description}</td>
                        <td className="py-2.5 px-3 text-slate-400">{t.category}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {isCashIn ? `+${formatBDT(t.amount)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                          {!isCashIn ? `-${formatBDT(t.amount)}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'bank_book' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <h3 className="font-bold text-white text-sm">
                {language === 'bn' ? 'ব্যাংক লেনদেন খাতা (Bank Book Statement)' : 'Bank Transactions Statement'}
              </h3>
              <div className="text-xs text-slate-400">
                {language === 'bn' ? 'মোট ব্যাংক তহবিল:' : 'Total Bank Balance:'} <span className="font-bold text-blue-400">{formatBDT(totalBankBalance)}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Voucher</th>
                  <th className="py-2.5 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="py-2.5 px-3">{language === 'bn' ? 'ব্যাংক একাউন্ট' : 'Bank'}</th>
                  <th className="py-2.5 px-3">{language === 'bn' ? 'বিবরণ' : 'Description'}</th>
                  <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'জমা (+)' : 'Deposit'}</th>
                  <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'উত্তোলন (-)' : 'Withdrawal'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.transactions
                  .filter(t => t.accountId !== 'acc-cash')
                  .map((t) => {
                    const isDeposit = t.type === 'income' || t.toAccountId?.startsWith('acc-');
                    const acc = data.accounts.find(a => a.id === t.accountId);
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{t.voucherNo}</td>
                        <td className="py-2.5 px-3 text-slate-300">{formatDate(t.date)}</td>
                        <td className="py-2.5 px-3 text-slate-300">{acc?.name}</td>
                        <td className="py-2.5 px-3 text-slate-200">{t.party} - {t.description}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {isDeposit ? `+${formatBDT(t.amount)}` : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-rose-400">
                          {!isDeposit ? `-${formatBDT(t.amount)}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReport === 'pnl' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <h3 className="font-bold text-white text-base">
                {language === 'bn' ? 'আয় ও ব্যয়ের বিবরণী (Statement of Profit & Loss)' : 'Statement of Profit & Loss'}
              </h3>
              <div className="text-xs text-slate-400">
                Period: Current Financial Year 2026
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">{language === 'bn' ? 'নিট লাভ (Net Margin)' : 'Net Profit'}</div>
              <div className={`text-xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatBDT(netProfit)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Side */}
            <div className="space-y-3">
              <div className="font-bold text-emerald-400 text-sm flex justify-between border-b border-emerald-500/30 pb-1">
                <span>{language === 'bn' ? 'মোট আয় ও বিল প্রাপ্তি' : 'Total Revenues & Inflows'}</span>
                <span>{formatBDT(totalIncome)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {data.transactions.filter(t => t.type === 'income').map(t => (
                  <div key={t.id} className="flex justify-between py-1 border-b border-slate-800">
                    <span className="truncate max-w-[200px]">{t.party}</span>
                    <span className="font-mono text-emerald-400">{formatBDT(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Side */}
            <div className="space-y-3">
              <div className="font-bold text-rose-400 text-sm flex justify-between border-b border-rose-500/30 pb-1">
                <span>{language === 'bn' ? 'মোট ব্যয় ও মালামাল খরচ' : 'Total Expenses & Outflows'}</span>
                <span>{formatBDT(totalExpense)}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {data.transactions.filter(t => t.type === 'expense').map(t => (
                  <div key={t.id} className="flex justify-between py-1 border-b border-slate-800">
                    <span className="truncate max-w-[200px]">{t.party}</span>
                    <span className="font-mono text-rose-400">{formatBDT(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'stock_valuation' && (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <h3 className="font-bold text-white text-sm">
                {language === 'bn' ? 'স্টিল মালামাল ভ্যালুয়েশন রিপোর্ট' : 'Steel Stock Valuation Report'}
              </h3>
              <div className="text-xs text-slate-400">
                Warehouse: Central Steel Yard & Room 3028 Store
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Item Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">Stock Qty</th>
                  <th className="py-2.5 px-3 text-right">Avg Unit Rate (৳)</th>
                  <th className="py-2.5 px-3 text-right">Valuation (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.materials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{m.code}</td>
                    <td className="py-2.5 px-3 text-slate-200">{m.name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{m.currentStock} {m.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{formatBDT(m.unitPriceAvg)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400 font-mono">
                      {formatBDT(Math.round(m.currentStock * m.unitPriceAvg))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
