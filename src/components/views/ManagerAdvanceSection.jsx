import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  PlusCircle,
  Archive,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Plus,
  Building,
  Wallet,
  FileCheck2
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { DateInput } from '../common/DateInput';

export const ManagerAdvanceSection = ({ externalShowAdd, setExternalShowAdd }) => {
  const {
    language,
    data,
    expenseCategories,
    addManagerAdvance,
    settleAndArchiveAdvance,
    deleteManagerAdvance
  } = useApp();

  const [subTab, setSubTab] = useState('active'); // 'active' | 'archived'
  const [localShowAdd, setLocalShowAdd] = useState(false);
  const showAddModal = externalShowAdd !== undefined ? externalShowAdd : localShowAdd;
  const setShowAddModal = setExternalShowAdd || setLocalShowAdd;

  // Add Advance Form State
  const [advForm, setAdvForm] = useState({
    managerName: data.employees?.[1]?.name || data.employees?.[0]?.name || '',
    projectId: data.projects?.[0]?.id || '',
    accountId: data.accounts?.[0]?.id || 'acc-cash',
    amountGiven: '',
    dateGiven: new Date().toISOString().slice(0, 10),
    note: ''
  });

  // Settle & Archive Modal State
  const [settlingAdv, setSettlingAdv] = useState(null);
  const [settledDate, setSettledDate] = useState(new Date().toISOString().slice(0, 10));
  const [returnAccountId, setReturnAccountId] = useState('acc-cash');
  const [settlementNote, setSettlementNote] = useState('');
  const [expenseRows, setExpenseRows] = useState([
    { category: expenseCategories?.[0] || 'Site Expense', projectId: '', description: '', amount: '' }
  ]);

  const advances = data.managerAdvances || [];
  const activeAdvances = advances.filter(a => a.status === 'active');
  const archivedAdvances = advances.filter(a => a.status === 'archived');

  const totalActiveAmount = activeAdvances.reduce((s, a) => s + Number(a.amountGiven || 0), 0);
  const totalArchivedSpent = archivedAdvances.reduce((s, a) => s + Number(a.totalSpent || 0), 0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!advForm.managerName.trim() || !advForm.amountGiven || Number(advForm.amountGiven) <= 0) {
      alert(language === 'bn' ? 'ম্যানেজারের নাম এবং সঠিক টাকার পরিমাণ লিখুন!' : 'Please enter manager name and valid amount!');
      return;
    }
    addManagerAdvance(advForm);
    setShowAddModal(false);
    setAdvForm({
      managerName: data.employees?.[1]?.name || '',
      projectId: data.projects?.[0]?.id || '',
      accountId: data.accounts?.[0]?.id || 'acc-cash',
      amountGiven: '',
      dateGiven: new Date().toISOString().slice(0, 10),
      note: ''
    });
  };

  const openSettleModal = (adv) => {
    setSettlingAdv(adv);
    setSettledDate(new Date().toISOString().slice(0, 10));
    setReturnAccountId(adv.accountId || 'acc-cash');
    setSettlementNote('');
    setExpenseRows([
      {
        category: expenseCategories?.[0] || 'Site Expense',
        projectId: adv.projectId || '',
        description: adv.note || '',
        amount: ''
      }
    ]);
  };

  const handleRowChange = (idx, field, val) => {
    setExpenseRows(prev => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  };

  const addExpenseRow = () => {
    setExpenseRows(prev => [
      ...prev,
      {
        category: expenseCategories?.[0] || 'Site Expense',
        projectId: settlingAdv?.projectId || '',
        description: '',
        amount: ''
      }
    ]);
  };

  const removeExpenseRow = (idx) => {
    if (expenseRows.length <= 1) return;
    setExpenseRows(prev => prev.filter((_, i) => i !== idx));
  };

  const totalBilledInModal = expenseRows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const diffReturned = settlingAdv && settlingAdv.amountGiven > totalBilledInModal ? settlingAdv.amountGiven - totalBilledInModal : 0;
  const diffExtra = settlingAdv && totalBilledInModal > settlingAdv.amountGiven ? totalBilledInModal - settlingAdv.amountGiven : 0;

  const handleSettleSubmit = (e) => {
    e.preventDefault();
    if (!settlingAdv) return;
    if (totalBilledInModal <= 0 && !window.confirm(language === 'bn' ? 'কোনো খরচ উল্লেখ করা হয়নি—সম্পূর্ণ টাকা ফেরত হিসেবে আর্কাইভ করবেন?' : 'No expense entered — archive as 100% returned?')) {
      return;
    }
    settleAndArchiveAdvance(settlingAdv.id, {
      settledDate,
      items: expenseRows,
      returnAccountId,
      settlementNote
    });
    setSettlingAdv(null);
    setSubTab('archived');
  };

  return (
    <div className="space-y-5">
      {/* Top Info & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'প্রজেক্ট ম্যানেজার অগ্রিম ও সমন্বয় (Imprest / Advance)' : 'Project Manager Advances & Settlement'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'bn'
              ? 'খরচের আগে ম্যানেজারকে দেওয়া টাকার এন্ট্রি রাখুন; পরে বিল জমা দিলে মেইন হিসাবে সমন্বয় করে আর্কাইভ করুন।'
              : 'Record cash advances given to site managers, then settle itemized bills into main accounts and archive.'}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow transition shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? '+ ম্যানেজারকে অগ্রিম দিন' : '+ Issue Manager Advance'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'ম্যানেজারদের হাতে চলমান অগ্রিম (অপেক্ষমাণ)' : 'Active Advances Pending Settlement'}
            </div>
            <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{formatBDT(totalActiveAmount)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {activeAdvances.length} {language === 'bn' ? 'টি চলমান এন্ট্রি' : 'active entries'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'সমন্বয়কৃত ও আর্কাইভড খরচ' : 'Settled & Archived Expenses'}
            </div>
            <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{formatBDT(totalArchivedSpent)}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {archivedAdvances.length} {language === 'bn' ? 'টি আর্কাইভড হিসাব' : 'archived settlements'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Archive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active vs Archive Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('active')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            subTab === 'active'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800/70 text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? `চলমান অগ্রিম (${activeAdvances.length})` : `Active (${activeAdvances.length})`}</span>
        </button>
        <button
          onClick={() => setSubTab('archived')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            subTab === 'archived'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800/70 text-slate-400 hover:text-white'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? `আর্কাইভ তালিকা (${archivedAdvances.length})` : `Archived (${archivedAdvances.length})`}</span>
        </button>
      </div>

      {/* Active Advances List */}
      {subTab === 'active' && (
        <div className="space-y-3">
          {activeAdvances.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-8 text-center text-xs text-slate-400">
              {language === 'bn'
                ? 'বর্তমানে কোনো প্রজেক্ট ম্যানেজারের কাছে বকেয়া অগ্রিম নেই। নতুন অগ্রিম দিতে "+ ম্যানেজারকে অগ্রিম দিন" বাটনে ক্লিক করুন।'
                : 'No active manager advances pending. Click "+ Issue Manager Advance" to record one.'}
            </div>
          ) : (
            activeAdvances.map(adv => {
              const prj = data.projects.find(p => p.id === adv.projectId);
              const acc = data.accounts.find(a => a.id === adv.accountId);
              return (
                <div
                  key={adv.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700">
                        {adv.voucherRef}
                      </span>
                      <span className="text-sm font-bold text-white">{adv.managerName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">
                        {language === 'bn' ? 'হিসাব অপেক্ষমাণ' : 'Pending Settlement'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span>📅 {formatDate(adv.dateGiven)}</span>
                      <span>🏦 {acc?.name || adv.accountId}</span>
                      {prj && <span>🏗️ {prj.id} - {prj.name}</span>}
                    </div>
                    {adv.note && (
                      <div className="text-xs text-slate-300 italic mt-1">"{adv.note}"</div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="text-right mr-2">
                      <div className="text-[10px] text-slate-400">{language === 'bn' ? 'প্রদত্ত অগ্রিম' : 'Advance Given'}</div>
                      <div className="text-lg font-bold font-mono text-amber-400">{formatBDT(adv.amountGiven)}</div>
                    </div>

                    <button
                      onClick={() => openSettleModal(adv)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>{language === 'bn' ? 'হিসাব সমন্বয় ও আর্কাইভ' : 'Settle & Archive'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(language === 'bn' ? `এই অগ্রিম (${formatBDT(adv.amountGiven)}) বাতিল করে অ্যাকাউন্টে ফেরত আনবেন?` : 'Cancel this advance and refund to account?')) {
                          deleteManagerAdvance(adv.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition"
                      title={language === 'bn' ? 'বাতিল / ফেরত' : 'Delete & Refund'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Archived Advances List */}
      {subTab === 'archived' && (
        <div className="space-y-3">
          {archivedAdvances.length === 0 ? (
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-2xl p-8 text-center text-xs text-slate-400">
              {language === 'bn'
                ? 'এখনো কোনো অগ্রিম সমন্বয় করে আর্কাইভ করা হয়নি।'
                : 'No archived manager settlements yet.'}
            </div>
          ) : (
            archivedAdvances.map(adv => {
              const prj = data.projects.find(p => p.id === adv.projectId);
              return (
                <div
                  key={adv.id}
                  className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-2.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                          {adv.voucherRef}
                        </span>
                        <span className="text-sm font-bold text-white">{adv.managerName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{language === 'bn' ? 'সমন্বয় ও আর্কাইভড' : 'Settled & Archived'}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {language === 'bn' ? 'অগ্রিম তারিখ:' : 'Issued:'} {formatDate(adv.dateGiven)} | {language === 'bn' ? 'সমন্বয়ের তারিখ:' : 'Settled:'} {formatDate(adv.settledDate)}
                        {prj && ` | 🏗️ ${prj.name}`}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs font-mono">
                      <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-slate-400">{language === 'bn' ? 'অগ্রিম:' : 'Given:'} </span>
                        <span className="font-bold text-amber-400">{formatBDT(adv.amountGiven)}</span>
                      </div>
                      <div className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                        <span className="text-slate-400">{language === 'bn' ? 'প্রকৃত খরচ:' : 'Spent:'} </span>
                        <span className="font-bold text-emerald-400">{formatBDT(adv.totalSpent)}</span>
                      </div>
                      {adv.returnedAmount > 0 && (
                        <div className="bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                          <span className="text-emerald-300">{language === 'bn' ? 'ফেরত:' : 'Returned:'} {formatBDT(adv.returnedAmount)}</span>
                        </div>
                      )}
                      {adv.extraPaidAmount > 0 && (
                        <div className="bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30">
                          <span className="text-rose-300">{language === 'bn' ? 'অতিরিক্ত প্রদান:' : 'Extra Paid:'} {formatBDT(adv.extraPaidAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Settled Items Breakdown */}
                  {adv.settledItems && adv.settledItems.length > 0 && (
                    <div className="text-xs space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400">
                        {language === 'bn' ? 'মেইন হিসাবে সমন্বয়কৃত খরচের তালিকা:' : 'Expenses Posted to Main Ledger:'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {adv.settledItems.map((it, i) => (
                          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2">
                            <div className="truncate">
                              <span className="text-amber-400 font-mono text-[10px] mr-1.5">{it.voucherNo}</span>
                              <span className="text-slate-200 font-medium">{it.category}</span>
                              {it.description && <span className="text-slate-400"> — {it.description}</span>}
                            </div>
                            <span className="font-mono font-bold text-rose-400 shrink-0">{formatBDT(it.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal 1: Issue New Manager Advance */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'প্রজেক্ট ম্যানেজারকে অগ্রিম প্রদান' : 'Issue Manager Cash Advance'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {language === 'bn' ? 'প্রজেক্ট ম্যানেজার / দায়িত্বপ্রাপ্ত ব্যক্তি *' : 'Project Manager / Recipient *'}
                </label>
                <input
                  type="text"
                  list="manager-suggestions"
                  required
                  placeholder="e.g. Engr. Masum Billah"
                  value={advForm.managerName}
                  onChange={(e) => setAdvForm(p => ({ ...p, managerName: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
                <datalist id="manager-suggestions">
                  {data.employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.designation}</option>
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {language === 'bn' ? 'টাকার পরিমাণ (৳) *' : 'Amount (BDT) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="50000"
                    value={advForm.amountGiven}
                    onChange={(e) => setAdvForm(p => ({ ...p, amountGiven: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {language === 'bn' ? 'তারিখ *' : 'Date *'}
                  </label>
                  <DateInput
                    required
                    value={advForm.dateGiven}
                    onChange={(val) => setAdvForm(p => ({ ...p, dateGiven: val }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {language === 'bn' ? 'কোন অ্যাকাউন্ট থেকে দেওয়া হচ্ছে *' : 'Paid From Account *'}
                </label>
                <select
                  value={advForm.accountId}
                  onChange={(e) => setAdvForm(p => ({ ...p, accountId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {data.accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatBDT(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {language === 'bn' ? 'প্রজেক্ট / সাইট (ঐচ্ছিক)' : 'Project / Site (Optional)'}
                </label>
                <select
                  value={advForm.projectId}
                  onChange={(e) => setAdvForm(p => ({ ...p, projectId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">{language === 'bn' ? 'সাধারণ / একাধিক সাইট' : 'General / Multi-Site'}</option>
                  {data.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {language === 'bn' ? 'উদ্দেশ্য / নোট' : 'Purpose / Note'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'যেমন: সাইট জরুরি খরচ ও লেবার নাস্তা বাবদ অগ্রিম' : 'e.g. Site petty expenses advance'}
                  value={advForm.note}
                  onChange={(e) => setAdvForm(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg"
                >
                  {language === 'bn' ? 'অগ্রিম সেভ করুন' : 'Save Advance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Settle Bills & Archive Advance */}
      {settlingAdv && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'ম্যানেজারের হিসাব সমন্বয় ও আর্কাইভ' : 'Settle Manager Bills & Archive'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {settlingAdv.voucherRef} — {settlingAdv.managerName} ({language === 'bn' ? 'প্রদত্ত অগ্রিম:' : 'Advance:'} <strong className="text-amber-400">{formatBDT(settlingAdv.amountGiven)}</strong>)
                </p>
              </div>
              <button onClick={() => setSettlingAdv(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {language === 'bn' ? 'সমন্বয়ের তারিখ *' : 'Settlement Date *'}
                  </label>
                  <DateInput value={settledDate} onChange={setSettledDate} required />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">
                    {language === 'bn' ? 'বাকি টাকা ফেরত / অতিরিক্ত সমন্বয় অ্যাকাউন্ট' : 'Return / Adjustment Account'}
                  </label>
                  <select
                    value={returnAccountId}
                    onChange={(e) => setReturnAccountId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  >
                    {data.accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Itemized Expenses */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">
                    {language === 'bn' ? 'ম্যানেজারের জমা দেওয়া খরচের বিবরণ (মেইন হিসাবে যোগ হবে):' : 'Itemized Expenses (Posted to Main Ledger):'}
                  </span>
                  <button
                    type="button"
                    onClick={addExpenseRow}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'আরেকটি খরচ যোগ' : 'Add Expense Row'}</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {expenseRows.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-800/70 p-2.5 rounded-xl border border-slate-700/70 items-center">
                      <div className="col-span-12 sm:col-span-4">
                        <select
                          value={row.category}
                          onChange={(e) => handleRowChange(idx, 'category', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[11px]"
                        >
                          {expenseCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-7 sm:col-span-4">
                        <input
                          type="text"
                          placeholder={language === 'bn' ? 'খরচের বিবরণ' : 'Description'}
                          value={row.description}
                          onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-[11px]"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-3">
                        <input
                          type="number"
                          min="0"
                          placeholder="৳ Amount"
                          value={row.amount}
                          onChange={(e) => handleRowChange(idx, 'amount', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono font-bold text-[11px]"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeExpenseRow(idx)}
                          disabled={expenseRows.length <= 1}
                          className="p-1 text-rose-400 hover:text-rose-300 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Calculation Summary */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-slate-400">{language === 'bn' ? 'প্রদত্ত অগ্রিম' : 'Advance Given'}</div>
                  <div className="text-sm font-bold font-mono text-amber-400">{formatBDT(settlingAdv.amountGiven)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">{language === 'bn' ? 'মোট বিল খরচ' : 'Total Billed'}</div>
                  <div className="text-sm font-bold font-mono text-white">{formatBDT(totalBilledInModal)}</div>
                </div>
                <div>
                  {diffReturned > 0 ? (
                    <>
                      <div className="text-[10px] text-emerald-400">{language === 'bn' ? 'ফেরত ক্যাশ (যোগ হবে)' : 'Cash Returned (+)'}</div>
                      <div className="text-sm font-bold font-mono text-emerald-400">{formatBDT(diffReturned)}</div>
                    </>
                  ) : diffExtra > 0 ? (
                    <>
                      <div className="text-[10px] text-rose-400">{language === 'bn' ? 'অতিরিক্ত খরচ (প্রদেয়)' : 'Extra Paid (-)'}</div>
                      <div className="text-sm font-bold font-mono text-rose-400">{formatBDT(diffExtra)}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] text-emerald-400">{language === 'bn' ? 'ব্যালেন্স' : 'Balance'}</div>
                      <div className="text-sm font-bold font-mono text-emerald-400">৳0 (Exact)</div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'সমন্বয় নোট (ঐচ্ছিক)' : 'Settlement Note (Optional)'}
                  value={settlementNote}
                  onChange={(e) => setSettlementNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSettlingAdv(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg cursor-pointer"
                >
                  {language === 'bn' ? 'মেইন হিসাবে যোগ ও আর্কাইভ করুন' : 'Post to Main & Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
