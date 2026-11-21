import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  PlusCircle,
  Calendar,
  Users2,
  Clock,
  Printer,
  Download,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Filter,
  Briefcase,
  Layers,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

export const DailyAttendanceView = () => {
  const {
    language,
    data,
    addDailyLabor,
    updateDailyLabor,
    deleteDailyLabor,
    recordDailyAttendance,
    updateDailyAttendance,
    deleteDailyAttendance,
    disburseLaborWage,
    setActiveTab,
    setSelectedVoucherForPrint
  } = useApp();

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedLaborId, setSelectedLaborId] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // all | Due | Paid
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingAtt, setEditingAtt] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingRecord, setPayingRecord] = useState(null);

  // Single Attendance Form State
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    laborId: data.dailyLabors?.[0]?.id || '',
    projectId: data.projects?.[0]?.id || '',
    status: 'Present', // Present (1.0), Half Day (0.5), Absent (0)
    dailyRate: data.dailyLabors?.[0]?.dailyRate || 1000,
    otHours: 0,
    otRate: data.dailyLabors?.[0]?.overtimeRate || 140,
    advanceTaken: 0,
    paidAmount: 0,
    remarks: '' // মন্তব্য
  });

  // Batch Form State
  const [batchDate, setBatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [batchProject, setBatchProject] = useState(data.projects?.[0]?.id || '');
  const [batchRows, setBatchRows] = useState(() => {
    return (data.dailyLabors || []).map(l => ({
      laborId: l.id,
      name: l.name,
      trade: l.trade,
      dailyRate: l.dailyRate,
      otRate: l.overtimeRate,
      status: 'Present',
      otHours: 0,
      advanceTaken: 0,
      remarks: ''
    }));
  });

  // Payout Form State
  const [payoutData, setPayoutData] = useState({
    accountId: data.accounts?.[0]?.id || 'acc-cash',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    note: ''
  });

  // Helper when changing selected labor in form
  const handleLaborChange = (laborId) => {
    const l = (data.dailyLabors || []).find(w => w.id === laborId);
    setForm(prev => ({
      ...prev,
      laborId,
      dailyRate: l ? l.dailyRate : prev.dailyRate,
      otRate: l ? l.overtimeRate : prev.otRate
    }));
  };

  // Real-time calculation helpers for form
  const attDays = form.status === 'Present' ? 1.0 : form.status === 'Half Day' ? 0.5 : 0;
  const basicWage = Math.round(attDays * Number(form.dailyRate || 0));
  const otWage = Math.round(Number(form.otHours || 0) * Number(form.otRate || 0));
  const totalWage = basicWage + otWage; // বেতন
  const payable = Math.max(0, totalWage - Number(form.advanceTaken || 0)); // প্রদেয়
  const remaining = Math.max(0, payable - Number(form.paidAmount || 0)); // অবশিষ্ট

  const handleSaveSingleEntry = (e) => {
    e.preventDefault();
    if (!form.laborId) {
      alert(language === 'bn' ? 'কর্মী নির্বাচন করুন!' : 'Select a worker!');
      return;
    }

    recordDailyAttendance({
      date: form.date,
      laborId: form.laborId,
      projectId: form.projectId,
      status: form.status,
      dailyRate: Number(form.dailyRate),
      basicWage,
      otHours: Number(form.otHours),
      otRate: Number(form.otRate),
      otWage,
      grossWage: totalWage, // বেতন
      advanceTaken: Number(form.advanceTaken),
      netPayable: payable, // প্রদেয়
      remainingDue: remaining, // অবশিষ্ট
      paymentStatus: remaining === 0 ? 'Paid' : 'Due',
      note: form.remarks, // মন্তব্য
      remarks: form.remarks
    });

    setShowAddModal(false);
    setForm({
      date: new Date().toISOString().slice(0, 10),
      laborId: data.dailyLabors?.[0]?.id || '',
      projectId: data.projects?.[0]?.id || '',
      status: 'Present',
      dailyRate: data.dailyLabors?.[0]?.dailyRate || 1000,
      otHours: 0,
      otRate: data.dailyLabors?.[0]?.overtimeRate || 140,
      advanceTaken: 0,
      paidAmount: 0,
      remarks: ''
    });
  };

  const handleSaveBatch = (e) => {
    e.preventDefault();
    const records = batchRows.map(row => {
      const days = row.status === 'Present' ? 1.0 : row.status === 'Half Day' ? 0.5 : 0;
      const bWage = Math.round(days * Number(row.dailyRate || 0));
      const oWage = Math.round(Number(row.otHours || 0) * Number(row.otRate || 0));
      const gWage = bWage + oWage;
      const nPayable = Math.max(0, gWage - Number(row.advanceTaken || 0));
      return {
        date: batchDate,
        laborId: row.laborId,
        projectId: batchProject,
        status: row.status,
        dailyRate: Number(row.dailyRate),
        basicWage: bWage,
        otHours: Number(row.otHours),
        otRate: Number(row.otRate),
        otWage: oWage,
        grossWage: gWage, // বেতন
        advanceTaken: Number(row.advanceTaken),
        netPayable: nPayable, // প্রদেয়
        remainingDue: nPayable, // অবশিষ্ট
        paymentStatus: 'Due',
        note: row.remarks || '',
        remarks: row.remarks || ''
      };
    });

    recordDailyAttendance(records);
    setShowBatchModal(false);
  };

  const handleConfirmPayout = (e) => {
    e.preventDefault();
    if (!payingRecord) return;
    const numAmount = Number(payoutData.amount);
    if (numAmount <= 0) {
      alert(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন!' : 'Please enter valid amount!');
      return;
    }

    disburseLaborWage({
      laborId: payingRecord.laborId,
      accountId: payoutData.accountId,
      paidAmount: numAmount,
      paymentDate: payoutData.date,
      attendanceIds: [payingRecord.id],
      note: payoutData.note || `Wage payout for ${payingRecord.date} (${payingRecord.remarks || payingRecord.note || 'Site labor'})`
    });

    setShowPayModal(false);
    setPayingRecord(null);
  };

  // Filtered List
  const list = (data.laborAttendance || []).filter(item => {
    if (selectedProjectId !== 'all' && item.projectId !== selectedProjectId) return false;
    if (selectedLaborId !== 'all' && item.laborId !== selectedLaborId) return false;
    if (selectedStatusFilter !== 'all' && item.paymentStatus !== selectedStatusFilter) return false;
    if (selectedMonth && !item.date.startsWith(selectedMonth)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const labor = (data.dailyLabors || []).find(l => l.id === item.laborId);
      const prj = data.projects.find(p => p.id === item.projectId);
      const matchName = labor?.name?.toLowerCase().includes(q);
      const matchTrade = labor?.trade?.toLowerCase().includes(q);
      const matchPrj = prj?.name?.toLowerCase().includes(q);
      const matchRemark = (item.remarks || item.note || '').toLowerCase().includes(q);
      if (!matchName && !matchTrade && !matchPrj && !matchRemark) return false;
    }
    return true;
  });

  // KPI calculations
  const totalWageSum = list.reduce((sum, i) => sum + (i.grossWage || i.basicWage || 0), 0); // মোট বেতন
  const totalPayableSum = list.reduce((sum, i) => sum + (i.netPayable || 0), 0); // মোট প্রদেয়
  const totalAdvanceSum = list.reduce((sum, i) => sum + (i.advanceTaken || 0), 0); // মোট এডভান্স
  const totalRemainingSum = list.reduce((sum, i) => {
    const isPaid = i.paymentStatus === 'Paid';
    return sum + (isPaid ? 0 : (i.remainingDue ?? i.netPayable ?? 0));
  }, 0); // মোট অবশিষ্ট
  const totalDaysSum = list.reduce((sum, i) => sum + (i.attendanceDays || 0), 0);
  const totalOtHoursSum = list.reduce((sum, i) => sum + (i.otHours || 0), 0);

  // Print function
  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'ডেইলি হাজিরা শীট ও বেতন' : 'Daily Attendance Sheet & Wages'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn'
              ? 'দৈনিক লেবার হাজিরা, বেতন, প্রদেয়, অবশিষ্ট বকেয়া ও মন্তব্য হিসাব'
              : 'Daily labor muster roll with wage, payable, remaining balance and remarks'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setForm({
                date: new Date().toISOString().slice(0, 10),
                laborId: data.dailyLabors?.[0]?.id || '',
                projectId: data.projects?.[0]?.id || '',
                status: 'Present',
                dailyRate: data.dailyLabors?.[0]?.dailyRate || 1000,
                otHours: 0,
                otRate: data.dailyLabors?.[0]?.overtimeRate || 140,
                advanceTaken: 0,
                paidAmount: 0,
                remarks: ''
              });
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'bn' ? '+ নতুন হাজিরা ও বেতন' : '+ Record Entry'}</span>
          </button>

          <button
            onClick={() => {
              setBatchRows((data.dailyLabors || []).map(l => ({
                laborId: l.id,
                name: l.name,
                trade: l.trade,
                dailyRate: l.dailyRate,
                otRate: l.overtimeRate,
                status: 'Present',
                otHours: 0,
                advanceTaken: 0,
                remarks: ''
              })));
              setShowBatchModal(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'bn' ? 'সাইট ব্যাচ হাজিরা' : 'Batch Roll Call'}</span>
          </button>

          <button
            onClick={handlePrintSheet}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl shadow transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">{language === 'bn' ? 'মোট অর্জিত বেতন' : 'Total Gross Wage'}</div>
          <div className="text-xl font-black text-white mt-1">{formatBDT(totalWageSum)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totalDaysSum} {language === 'bn' ? 'দিন হাজিরা | ' : 'days | '}{totalOtHoursSum} {language === 'bn' ? 'ঘণ্টা ওটি' : 'hrs OT'}
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="text-[11px] text-rose-400 font-medium">{language === 'bn' ? 'মোট এডভান্স কর্তন' : 'Total Advance'}</div>
          <div className="text-xl font-black text-rose-400 mt-1">-{formatBDT(totalAdvanceSum)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{language === 'bn' ? 'মজুরি থেকে কর্তন' : 'Deducted'}</div>
        </div>

        <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4">
          <div className="text-[11px] text-emerald-400 font-bold">{language === 'bn' ? 'মোট প্রদেয়' : 'Total Payable'}</div>
          <div className="text-xl font-black text-emerald-300 mt-1">{formatBDT(totalPayableSum)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{language === 'bn' ? 'বেতন হতে এডভান্স বাদে' : 'Wage minus advance'}</div>
        </div>

        <div className="bg-slate-800/80 border border-amber-500/40 ring-1 ring-amber-500/20 rounded-2xl p-4">
          <div className="text-[11px] text-amber-400 font-bold">{language === 'bn' ? 'মোট অবশিষ্ট বকেয়া' : 'Total Remaining Due'}</div>
          <div className="text-xl font-black text-amber-300 mt-1">{formatBDT(totalRemainingSum)}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{language === 'bn' ? 'প্রদেয় অপরিশোধিত ব্যালেন্স' : 'Unpaid balance'}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'all', label: language === 'bn' ? 'সকল' : 'All' },
              { id: 'Due', label: language === 'bn' ? 'অবশিষ্ট বকেয়া' : 'Due' },
              { id: 'Paid', label: language === 'bn' ? 'পরিশোধিত' : 'Paid' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedStatusFilter === tab.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">{language === 'bn' ? 'সকল প্রজেক্ট' : 'All Projects'}</option>
            {data.projects.map(p => (
              <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
            ))}
          </select>

          {/* Worker Filter */}
          <select
            value={selectedLaborId}
            onChange={(e) => setSelectedLaborId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">{language === 'bn' ? 'সকল লেবার' : 'All Workers'}</option>
            {(data.dailyLabors || []).map(l => (
              <option key={l.id} value={l.id}>{l.name} ({l.trade})</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'কর্মী, পদবি বা মন্তব্য খুঁজুন...' : 'Search worker, remarks...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Main Table: ডেলি হাজিরা শীট ও বেতন (বেতন, প্রদেয়, অবশিষ্ট, মন্তব্য সহ) */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-3">{language === 'bn' ? 'কর্মী ও পদবি' : 'Worker & Trade'}</th>
                <th className="py-3 px-3">{language === 'bn' ? 'প্রজেক্ট' : 'Project'}</th>
                <th className="py-3 px-3 text-center">{language === 'bn' ? 'হাজিরা' : 'Attendance'}</th>
                <th className="py-3 px-3 text-right">{language === 'bn' ? 'ওভারটাইম' : 'Overtime'}</th>
                <th className="py-3 px-3 text-right text-amber-300 font-bold">{language === 'bn' ? 'বেতন (৳)' : 'Wage (BDT)'}</th>
                <th className="py-3 px-3 text-right text-rose-400">{language === 'bn' ? 'এডভান্স' : 'Advance'}</th>
                <th className="py-3 px-3 text-right text-emerald-400 font-bold">{language === 'bn' ? 'প্রদেয় (৳)' : 'Payable (BDT)'}</th>
                <th className="py-3 px-3 text-right text-amber-400 font-bold">{language === 'bn' ? 'অবশিষ্ট (৳)' : 'Remaining (BDT)'}</th>
                <th className="py-3 px-3">{language === 'bn' ? 'মন্তব্য' : 'Remarks'}</th>
                <th className="py-3 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    {language === 'bn' ? 'কোনো হাজিরা ও বেতন এন্ট্রি পাওয়া যায়নি।' : 'No records found.'}
                  </td>
                </tr>
              ) : (
                list.map((item) => {
                  const labor = (data.dailyLabors || []).find(l => l.id === item.laborId);
                  const prj = data.projects.find(p => p.id === item.projectId);
                  const isPaid = item.paymentStatus === 'Paid';
                  const wage = item.grossWage || item.basicWage || 0;
                  const payableAmt = item.netPayable || Math.max(0, wage - (item.advanceTaken || 0));
                  const remainingAmt = isPaid ? 0 : (item.remainingDue ?? payableAmt);
                  const remarksText = item.remarks || item.note || '-';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-2.5 px-3 text-slate-300 font-mono">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white">{labor?.name || item.laborId}</div>
                        <div className="text-[10px] text-amber-400">{labor?.trade || '-'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                        {prj ? prj.id : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Present'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : item.status === 'Half Day'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {item.status === 'Present' ? 'পূর্ণ (1.0)' : item.status === 'Half Day' ? 'অর্ধ (0.5)' : 'অনুপস্থিত'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {item.otHours > 0 ? (
                          <span className="text-amber-300 font-semibold">{item.otHours}h ({formatBDT(item.otWage || 0)})</span>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </td>
                      {/* বেতন */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                        {formatBDT(wage)}
                      </td>
                      {/* এডভান্স */}
                      <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                        {item.advanceTaken > 0 ? `-${formatBDT(item.advanceTaken)}` : '0'}
                      </td>
                      {/* প্রদেয় */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {formatBDT(payableAmt)}
                      </td>
                      {/* অবশিষ্ট */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                        {formatBDT(remainingAmt)}
                      </td>
                      {/* মন্তব্য */}
                      <td className="py-2.5 px-3 text-slate-300 text-[11px] max-w-xs truncate" title={remarksText}>
                        {remarksText}
                      </td>
                      {/* অবস্থা */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {isPaid ? (language === 'bn' ? 'পরিশোধিত' : 'Paid') : (language === 'bn' ? 'বকেয়া' : 'Due')}
                        </span>
                      </td>
                      {/* অ্যাকশন */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {!isPaid && (
                            <button
                              onClick={() => {
                                setPayingRecord(item);
                                setPayoutData({
                                  accountId: data.accounts?.[0]?.id || 'acc-cash',
                                  amount: remainingAmt,
                                  date: new Date().toISOString().slice(0, 10),
                                  note: `Wage payout for ${item.date} (${remarksText})`
                                });
                                setShowPayModal(true);
                              }}
                              className="p-1 rounded bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition"
                              title={language === 'bn' ? 'মজুরি ভাউচার পে করুন' : 'Pay Wage Voucher'}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingAtt(item)}
                            className="p-1 rounded bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition"
                            title={language === 'bn' ? 'এডিট করুন' : 'Edit'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'bn' ? 'এই এন্ট্রিটি মুছে ফেলতে চান?' : 'Delete record?')) {
                                deleteDailyAttendance(item.id);
                              }
                            }}
                            className="p-1 rounded bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-400 transition"
                            title="Delete"
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

      {/* ========================================================= */}
      {/* MODAL: NEW ATTENDANCE & WAGE ENTRY                        */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'নতুন ডেইলি হাজিরা ও বেতন এন্ট্রি' : 'New Daily Attendance & Wage Entry'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleEntry} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'তারিখ' : 'Date'} *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্ট / সাইট' : 'Project'} *</label>
                  <select
                    value={form.projectId}
                    onChange={(e) => setForm(p => ({ ...p, projectId: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- {language === 'bn' ? 'সাধারণ ওয়ার্কশপ' : 'General Workshop'} --</option>
                    {data.projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'লেবার / কর্মী' : 'Worker'} *</label>
                <select
                  required
                  value={form.laborId}
                  onChange={(e) => handleLaborChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                >
                  {(data.dailyLabors || []).map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} — {l.trade} (রেট: {formatBDT(l.dailyRate)}/দিন, OT: {formatBDT(l.overtimeRate)}/ঘণ্টা)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'হাজিরা' : 'Attendance'} *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="Present">{language === 'bn' ? 'পূর্ণ দিবস (1.0 দিন)' : 'Present (Full Day - 1.0)'}</option>
                    <option value="Half Day">{language === 'bn' ? 'অর্ধ দিবস (0.5 দিন)' : 'Half Day (0.5 Day)'}</option>
                    <option value="Absent">{language === 'bn' ? 'অনুপস্থিত (0 দিন)' : 'Absent (0 Day)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'দৈনিক রেট (৳)' : 'Daily Rate (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    value={form.dailyRate}
                    onChange={(e) => setForm(p => ({ ...p, dailyRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম ঘণ্টা' : 'OT Hours'}</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="0"
                    value={form.otHours}
                    onChange={(e) => setForm(p => ({ ...p, otHours: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম রেট (৳/ঘণ্টা)' : 'OT Rate'}</label>
                  <input
                    type="number"
                    value={form.otRate}
                    onChange={(e) => setForm(p => ({ ...p, otRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-rose-400 mb-1 font-semibold">{language === 'bn' ? 'এডভান্স কর্তন (Advance BDT)' : 'Advance Taken'}</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.advanceTaken}
                  onChange={(e) => setForm(p => ({ ...p, advanceTaken: e.target.value }))}
                  className="w-full bg-slate-800 border border-rose-500/50 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              {/* Real-time Calculation Summary Box: বেতন, প্রদেয়, অবশিষ্ট */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{language === 'bn' ? 'বেতন (মূল + ওভারটাইম):' : 'Wage (Basic + OT):'}</span>
                  <span className="font-bold text-amber-300">{formatBDT(totalWage)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>{language === 'bn' ? 'এডভান্স বাদ:' : 'Less Advance:'}</span>
                  <span className="font-bold">-{formatBDT(Number(form.advanceTaken || 0))}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800 text-slate-200">
                  <span className="font-bold">{language === 'bn' ? 'প্রদেয় (Payable):' : 'Net Payable:'}</span>
                  <span className="font-black text-emerald-400">{formatBDT(payable)}</span>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span className="font-bold">{language === 'bn' ? 'অবশিষ্ট বকেয়া:' : 'Remaining Due:'}</span>
                  <span className="font-black text-amber-400">{formatBDT(remaining)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মন্তব্য (Remarks / কাজের বিবরণ)' : 'Remarks'} *</label>
                <input
                  type="text"
                  placeholder="e.g. Column lifting work, overtime done, pending cash payout"
                  value={form.remarks}
                  onChange={(e) => setForm(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {language === 'bn' ? 'হাজিরা ও বেতন সেভ করুন' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT ATTENDANCE & WAGE RECORD                      */}
      {/* ========================================================= */}
      {editingAtt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'হাজিরা, বেতন ও মন্তব্য এডিট' : 'Edit Attendance Record'}</span>
              </h3>
              <button onClick={() => setEditingAtt(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = editingAtt.status === 'Present' ? 1.0 : editingAtt.status === 'Half Day' ? 0.5 : 0;
                const b = Math.round(d * Number(editingAtt.dailyRate || 0));
                const o = Math.round(Number(editingAtt.otHours || 0) * Number(editingAtt.otRate || 0));
                const g = b + o;
                const p = Math.max(0, g - Number(editingAtt.advanceTaken || 0));
                const r = editingAtt.paymentStatus === 'Paid' ? 0 : p;

                updateDailyAttendance(editingAtt.id, {
                  ...editingAtt,
                  attendanceDays: d,
                  basicWage: b,
                  otWage: o,
                  grossWage: g, // বেতন
                  netPayable: p, // প্রদেয়
                  remainingDue: r, // অবশিষ্ট
                  note: editingAtt.remarks || editingAtt.note,
                  remarks: editingAtt.remarks || editingAtt.note
                });
                setEditingAtt(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'তারিখ' : 'Date'}</label>
                  <input
                    type="date"
                    required
                    value={editingAtt.date}
                    onChange={(e) => setEditingAtt(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'হাজিরা' : 'Attendance'}</label>
                  <select
                    value={editingAtt.status}
                    onChange={(e) => setEditingAtt(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Present">Present (পূর্ণ দিবস)</option>
                    <option value="Half Day">Half Day (অর্ধ দিবস)</option>
                    <option value="Absent">Absent (অনুপস্থিত)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'দৈনিক রেট (৳)' : 'Daily Rate'}</label>
                  <input
                    type="number"
                    value={editingAtt.dailyRate}
                    onChange={(e) => setEditingAtt(p => ({ ...p, dailyRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম ঘণ্টা' : 'OT Hours'}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingAtt.otHours || 0}
                    onChange={(e) => setEditingAtt(p => ({ ...p, otHours: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-rose-400 mb-1 font-medium">{language === 'bn' ? 'এডভান্স কর্তন (৳)' : 'Advance'}</label>
                  <input
                    type="number"
                    value={editingAtt.advanceTaken || 0}
                    onChange={(e) => setEditingAtt(p => ({ ...p, advanceTaken: e.target.value }))}
                    className="w-full bg-slate-800 border border-rose-500/50 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'পেমেন্ট অবস্থা' : 'Status'}</label>
                  <select
                    value={editingAtt.paymentStatus}
                    onChange={(e) => setEditingAtt(p => ({ ...p, paymentStatus: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Due">Due (বকেয়া)</option>
                    <option value="Paid">Paid (পরিশোধিত)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মন্তব্য (Remarks)' : 'Remarks'}</label>
                <input
                  type="text"
                  value={editingAtt.remarks || editingAtt.note || ''}
                  onChange={(e) => setEditingAtt(p => ({ ...p, remarks: e.target.value, note: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAtt(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {language === 'bn' ? 'আপডেট সংরক্ষণ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PAY WAGE VOUCHER                                   */}
      {/* ========================================================= */}
      {showPayModal && payingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'মজুরি পরিশোধ ভাউচার তৈরি' : 'Pay Wage Voucher'}</span>
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">{language === 'bn' ? 'কর্মী:' : 'Worker:'}</div>
                <div className="font-bold text-white text-sm">
                  {(data.dailyLabors || []).find(l => l.id === payingRecord.laborId)?.name}
                </div>
                <div className="flex justify-between pt-1 text-slate-300">
                  <span>{language === 'bn' ? 'প্রদেয় মজুরি:' : 'Payable Amount:'}</span>
                  <span className="font-bold text-emerald-400">{formatBDT(payoutData.amount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কোন অ্যাকাউন্ট থেকে প্রদান' : 'Account'} *</label>
                <select
                  value={payoutData.accountId}
                  onChange={(e) => setPayoutData(p => ({ ...p, accountId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {data.accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Balance: {formatBDT(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount'} *</label>
                  <input
                    type="number"
                    required
                    value={payoutData.amount}
                    onChange={(e) => setPayoutData(p => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'তারিখ' : 'Date'} *</label>
                  <input
                    type="date"
                    required
                    value={payoutData.date}
                    onChange={(e) => setPayoutData(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মন্তব্য / নোট' : 'Remarks / Note'}</label>
                <input
                  type="text"
                  value={payoutData.note}
                  onChange={(e) => setPayoutData(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg"
                >
                  {language === 'bn' ? 'পরিশোধ ও ভাউচার নিশ্চিত করুন' : 'Confirm Payment Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BATCH ROLL CALL                                    */}
      {/* ========================================================= */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>{language === 'bn' ? 'একক্লিকে সাইট ব্যাচ হাজিরা শীট' : 'Site Batch Muster Roll'}</span>
                </h3>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'তারিখ' : 'Date'} *</label>
                  <input
                    type="date"
                    required
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্ট' : 'Project'} *</label>
                  <select
                    value={batchProject}
                    onChange={(e) => setBatchProject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {data.projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <th className="py-2.5 px-3">লেবার ও পদবি</th>
                      <th className="py-2.5 px-3">হাজিরা</th>
                      <th className="py-2.5 px-3">দৈনিক রেট</th>
                      <th className="py-2.5 px-3">ওটি ঘণ্টা</th>
                      <th className="py-2.5 px-3">এডভান্স</th>
                      <th className="py-2.5 px-3">মন্তব্য</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {batchRows.map((row, idx) => (
                      <tr key={row.laborId} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-white">
                          <div>{row.name}</div>
                          <div className="text-[10px] text-amber-400">{row.trade}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.status}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, status: val } : r));
                            }}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                          >
                            <option value="Present">পূর্ণ (1.0)</option>
                            <option value="Half Day">অর্ধ (0.5)</option>
                            <option value="Absent">অনুপস্থিত (0)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={row.dailyRate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, dailyRate: val } : r));
                            }}
                            className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="0.5"
                            value={row.otHours}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, otHours: val } : r));
                            }}
                            className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            placeholder="0"
                            value={row.advanceTaken}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, advanceTaken: val } : r));
                            }}
                            className="w-20 bg-slate-800 border border-rose-500/50 rounded-lg px-2 py-1 text-white text-xs font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="মন্তব্য লিখুন"
                            value={row.remarks}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, remarks: val } : r));
                            }}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-blue-500 hover:bg-blue-400 shadow-lg"
                >
                  {language === 'bn' ? 'সবার হাজিরা একসাথে সেভ করুন' : 'Save Batch Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
