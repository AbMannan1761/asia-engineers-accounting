import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users2,
  PlusCircle,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  X,
  CreditCard,
  Edit2,
  Trash2,
  Briefcase,
  Layers,
  Search,
  Filter,
  DollarSign,
  UserCheck,
  UserX,
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { DateInput } from '../common/DateInput';

export const EmployeesView = () => {
  const {
    language,
    data,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    payEmployeeSalary,
    updateSalarySheet,
    deleteSalarySheet,
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

  // Active top tab: 'daily' | 'monthly' | 'directory'
  const [activeTabLocal, setActiveTabLocal] = useState('daily');

  // Daily Labor Filters
  const [selectedLaborFilter, setSelectedLaborFilter] = useState('all');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('all');
  const [searchLaborQuery, setSearchLaborQuery] = useState('');

  // Modals state
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [showPaySalaryModal, setShowPaySalaryModal] = useState(false);
  const [selectedSalaryRecord, setSelectedSalaryRecord] = useState(null);
  const [editingSalarySheet, setEditingSalarySheet] = useState(null);

  // Daily Labor Modals
  const [showAddDailyLaborModal, setShowAddDailyLaborModal] = useState(false);
  const [editingDailyLabor, setEditingDailyLabor] = useState(null);
  const [showRecordAttendanceModal, setShowRecordAttendanceModal] = useState(false);
  const [showBatchAttendanceModal, setShowBatchAttendanceModal] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [showPayWageModal, setShowPayWageModal] = useState(false);
  const [selectedLaborForPayout, setSelectedLaborForPayout] = useState(null);

  // 1. Single Attendance Form State
  const [attForm, setAttForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    laborId: data.dailyLabors?.[0]?.id || '',
    projectId: data.projects?.[0]?.id || '',
    status: 'Present', // Present (1.0), Half Day (0.5), Absent (0)
    dailyRate: data.dailyLabors?.[0]?.dailyRate || 1000,
    otHours: 0,
    otRate: data.dailyLabors?.[0]?.overtimeRate || 140,
    advanceTaken: 0,
    note: ''
  });

  // 2. Batch Attendance Form State
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
      note: ''
    }));
  });

  // 3. New Monthly Employee Form
  const [newEmpData, setNewEmpData] = useState({
    name: '',
    designation: '',
    mobile: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    salaryType: 'Monthly',
    monthlySalary: '',
    nid: ''
  });

  // 4. Pay Monthly Salary Form
  const [payData, setPayData] = useState({
    accountId: data.accounts[0]?.id || 'acc-cash',
    paidAmount: '',
    paymentDate: new Date().toISOString().slice(0, 10)
  });

  // 5. New Daily Labor Profile Form
  const [newLaborData, setNewLaborData] = useState({
    name: '',
    trade: 'Master Fitter & Fabricator',
    dailyRate: '1000',
    overtimeRate: '140',
    phone: '',
    assignedProjectId: data.projects[0]?.id || '',
    nid: ''
  });

  // 6. Wage Payout Form State
  const [wagePayoutData, setWagePayoutData] = useState({
    accountId: data.accounts[0]?.id || 'acc-cash',
    paidAmount: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    note: ''
  });

  // Helper when labor changes in Single Attendance form
  const handleLaborSelectionChange = (laborId) => {
    const l = (data.dailyLabors || []).find(w => w.id === laborId);
    setAttForm(prev => ({
      ...prev,
      laborId,
      dailyRate: l ? l.dailyRate : prev.dailyRate,
      otRate: l ? l.overtimeRate : prev.otRate
    }));
  };

  // Calculated values for Single Attendance Form
  const singleAttDays = attForm.status === 'Present' ? 1.0 : attForm.status === 'Half Day' ? 0.5 : 0;
  const singleBasicWage = Math.round(singleAttDays * Number(attForm.dailyRate || 0));
  const singleOtWage = Math.round(Number(attForm.otHours || 0) * Number(attForm.otRate || 0));
  const singleGrossWage = singleBasicWage + singleOtWage;
  const singleNetPayable = Math.max(0, singleGrossWage - Number(attForm.advanceTaken || 0));

  // Submit Single Attendance
  const handleSaveSingleAttendance = (e) => {
    e.preventDefault();
    if (!attForm.laborId) {
      alert(language === 'bn' ? 'কর্মী নির্বাচন করুন!' : 'Select a worker!');
      return;
    }

    recordDailyAttendance({
      date: attForm.date,
      laborId: attForm.laborId,
      projectId: attForm.projectId,
      status: attForm.status,
      dailyRate: Number(attForm.dailyRate),
      otHours: Number(attForm.otHours),
      otRate: Number(attForm.otRate),
      advanceTaken: Number(attForm.advanceTaken),
      note: attForm.note
    });

    setShowRecordAttendanceModal(false);
    setAttForm({
      date: new Date().toISOString().slice(0, 10),
      laborId: data.dailyLabors?.[0]?.id || '',
      projectId: data.projects?.[0]?.id || '',
      status: 'Present',
      dailyRate: data.dailyLabors?.[0]?.dailyRate || 1000,
      otHours: 0,
      otRate: data.dailyLabors?.[0]?.overtimeRate || 140,
      advanceTaken: 0,
      note: ''
    });
  };

  // Submit Batch Attendance
  const handleSaveBatchAttendance = (e) => {
    e.preventDefault();
    const records = batchRows.map(row => ({
      date: batchDate,
      laborId: row.laborId,
      projectId: batchProject,
      status: row.status,
      dailyRate: Number(row.dailyRate),
      otHours: Number(row.otHours),
      otRate: Number(row.otRate),
      advanceTaken: Number(row.advanceTaken),
      note: row.note
    }));

    recordDailyAttendance(records);
    setShowBatchAttendanceModal(false);
  };

  // Submit Wage Payout
  const handleConfirmWagePayout = (e) => {
    e.preventDefault();
    if (!selectedLaborForPayout) return;
    const numAmount = Number(wagePayoutData.paidAmount);
    if (numAmount <= 0) {
      alert(language === 'bn' ? 'সঠিক টাকার পরিমাণ দিন!' : 'Please enter valid amount!');
      return;
    }

    const dueAttIds = (data.laborAttendance || [])
      .filter(a => a.laborId === selectedLaborForPayout.labor.id && a.paymentStatus === 'Due')
      .map(a => a.id);

    const voucherNo = disburseLaborWage({
      laborId: selectedLaborForPayout.labor.id,
      accountId: wagePayoutData.accountId,
      paidAmount: numAmount,
      paymentDate: wagePayoutData.paymentDate,
      attendanceIds: dueAttIds,
      note: wagePayoutData.note
    });

    setShowPayWageModal(false);
    setSelectedLaborForPayout(null);
  };

  // Filtered Labor Attendance Logs
  const filteredAttendance = (data.laborAttendance || []).filter(att => {
    if (selectedLaborFilter !== 'all' && att.laborId !== selectedLaborFilter) return false;
    if (selectedProjectFilter !== 'all' && att.projectId !== selectedProjectFilter) return false;
    if (searchLaborQuery) {
      const q = searchLaborQuery.toLowerCase();
      const labor = (data.dailyLabors || []).find(l => l.id === att.laborId);
      const prj = data.projects.find(p => p.id === att.projectId);
      const matchName = labor?.name?.toLowerCase().includes(q);
      const matchTrade = labor?.trade?.toLowerCase().includes(q);
      const matchPrj = prj?.name?.toLowerCase().includes(q);
      if (!matchName && !matchTrade && !matchPrj) return false;
    }
    return true;
  });

  // Calculate Worker-Wise Summaries
  const workerSummaries = (data.dailyLabors || []).map(labor => {
    const records = (data.laborAttendance || []).filter(a => a.laborId === labor.id);
    const totalDays = records.reduce((sum, a) => sum + (a.attendanceDays || 0), 0);
    const totalOtHours = records.reduce((sum, a) => sum + (a.otHours || 0), 0);
    const totalGross = records.reduce((sum, a) => sum + (a.grossWage || 0), 0);
    const totalAdvance = records.reduce((sum, a) => sum + (a.advanceTaken || 0), 0);
    const totalPaidWage = records.filter(a => a.paymentStatus === 'Paid').reduce((sum, a) => sum + (a.netPayable || 0), 0);
    const netDueWage = Math.max(0, totalGross - totalAdvance - totalPaidWage);

    return {
      labor,
      totalDays,
      totalOtHours,
      totalGross,
      totalAdvance,
      totalPaidWage,
      netDueWage,
      dueRecordsCount: records.filter(a => a.paymentStatus === 'Due').length
    };
  });

  // Overall Daily Labor Metrics
  const totalDaysAll = (data.laborAttendance || []).reduce((sum, a) => sum + (a.attendanceDays || 0), 0);
  const totalOtHoursAll = (data.laborAttendance || []).reduce((sum, a) => sum + (a.otHours || 0), 0);
  const totalGrossAll = (data.laborAttendance || []).reduce((sum, a) => sum + (a.grossWage || 0), 0);
  const totalAdvanceAll = (data.laborAttendance || []).reduce((sum, a) => sum + (a.advanceTaken || 0), 0);
  const totalDueAll = workerSummaries.reduce((sum, w) => sum + w.netDueWage, 0);

  // Monthly Payroll Metrics
  const totalPayroll = data.salarySheet.reduce((sum, s) => sum + s.netPayable, 0);
  const totalPaid = data.salarySheet.filter(s => s.status === 'Paid').reduce((sum, s) => sum + s.netPayable, 0);
  const totalPending = totalPayroll - totalPaid;

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'কর্মী, দৈনিক লেবার হাজিরা ও বেতন শিট' : 'Labor Attendance, Wages & Payroll'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' 
              ? 'দৈনিক লেবারের উপস্থিতি, কাজের দিন, দৈনিক রেট, ওভারটাইম, অগ্রিম কর্তন ও স্বয়ংক্রিয় মজুরি হিসাব' 
              : 'Daily labor attendance muster roll, overtime, daily rate, advance deduction and auto wages'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTabLocal === 'daily' ? (
            <>
              <button
                onClick={() => {
                  setAttForm({
                    date: new Date().toISOString().slice(0, 10),
                    laborId: data.dailyLabors?.[0]?.id || '',
                    projectId: data.projects?.[0]?.id || '',
                    status: 'Present',
                    dailyRate: data.dailyLabors?.[0]?.dailyRate || 1000,
                    otHours: 0,
                    otRate: data.dailyLabors?.[0]?.overtimeRate || 140,
                    advanceTaken: 0,
                    note: ''
                  });
                  setShowRecordAttendanceModal(true);
                }}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'bn' ? '+ দৈনিক হাজিরা ইনপুট' : '+ Record Attendance'}</span>
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
                    note: ''
                  })));
                  setShowBatchAttendanceModal(true);
                }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
              >
                <Layers className="w-4 h-4" />
                <span>{language === 'bn' ? 'সাইট ব্যাচ হাজিরা' : 'Batch Muster Roll'}</span>
              </button>

              <button
                onClick={() => setShowAddDailyLaborModal(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl shadow transition"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? '+ নতুন লেবার' : '+ New Labor'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'bn' ? '+ নতুন স্টাফ' : '+ New Staff'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 self-start">
        <button
          onClick={() => setActiveTabLocal('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTabLocal === 'daily'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'bn' ? 'দৈনিক লেবার হাজিরা ও মজুরি চার্ট' : 'Daily Labor Attendance & Wages'}</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTabLocal === 'monthly'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{language === 'bn' ? 'মাসিক স্টাফ বেতন শিট' : 'Monthly Staff Payroll'}</span>
        </button>

        <button
          onClick={() => setActiveTabLocal('directory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTabLocal === 'directory'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>{language === 'bn' ? 'কর্মী ও লেবার প্রোফাইল' : 'Staff & Labor Directory'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: DAILY LABOR ATTENDANCE & WAGE CHART (REQUESTED IN AUDIO) */}
      {/* ============================================================== */}
      {activeTabLocal === 'daily' && (
        <div className="space-y-6">
          {/* Daily Labor Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-400">{language === 'bn' ? 'মোট হাজিরা দিন' : 'Total Days'}</div>
              <div className="text-xl font-black text-white mt-1">{totalDaysAll} <span className="text-xs font-normal text-slate-400">{language === 'bn' ? 'দিন' : 'Days'}</span></div>
              <div className="text-[10px] text-amber-400 mt-0.5">{data.dailyLabors?.length || 0} {language === 'bn' ? 'জন কর্মী' : 'Workers'}</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-400">{language === 'bn' ? 'মোট ওভারটাইম' : 'Total OT Hours'}</div>
              <div className="text-xl font-black text-amber-400 mt-1">{totalOtHoursAll} <span className="text-xs font-normal text-slate-400">{language === 'bn' ? 'ঘণ্টা' : 'Hrs'}</span></div>
              <div className="text-[10px] text-slate-400 mt-0.5">{language === 'bn' ? 'সাইটে অতিরিক্ত শ্রম' : 'Site Overtime'}</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-400">{language === 'bn' ? 'মোট অর্জিত মজুরি' : 'Gross Wage'}</div>
              <div className="text-xl font-black text-emerald-400 mt-1">{formatBDT(totalGrossAll)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{language === 'bn' ? 'মূল + ওভারটাইম' : 'Basic + OT'}</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5">
              <div className="text-[11px] text-slate-400">{language === 'bn' ? 'মোট এডভান্স গ্রহণ' : 'Advance Taken'}</div>
              <div className="text-xl font-black text-rose-400 mt-1">-{formatBDT(totalAdvanceAll)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{language === 'bn' ? 'মজুরি থেকে কর্তন' : 'Deducted from wage'}</div>
            </div>

            <div className="bg-slate-800/80 border border-amber-500/40 ring-1 ring-amber-500/20 rounded-2xl p-3.5">
              <div className="text-[11px] text-amber-400 font-bold">{language === 'bn' ? 'অবশিষ্ট বকেয়া মজুরি' : 'Net Due Payable'}</div>
              <div className="text-xl font-black text-amber-300 mt-1">{formatBDT(totalDueAll)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{language === 'bn' ? 'প্রদেয় নিট ব্যালেন্স' : 'Pending wage payout'}</div>
            </div>
          </div>

          {/* Section: Worker-Wise Wage Chart & Payout Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'কর্মীভিত্তিক মজুরি হিসাব চার্ট (Worker Wage Balances & Payout)' : 'Worker Wage Balance & Settlement'}</span>
              </h3>
              <span className="text-xs text-slate-400">
                {language === 'bn' ? 'এডভান্স কর্তন ও নিট বকেয়া মজুরি পরিশোধ' : 'Advance deducted & net wage payout'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workerSummaries.map(({ labor, totalDays, totalOtHours, totalGross, totalAdvance, netDueWage, dueRecordsCount }) => {
                const assignedPrj = data.projects.find(p => p.id === labor.assignedProjectId);
                return (
                  <div
                    key={labor.id}
                    className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-white text-sm">{labor.name}</div>
                          <div className="text-xs text-amber-400 font-medium">{labor.trade}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingDailyLabor(labor)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-700 text-slate-300"
                            title="Edit Worker Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                        <span>{language === 'bn' ? 'দৈনিক রেট:' : 'Daily Rate:'} <strong className="text-slate-200">{formatBDT(labor.dailyRate)}/দিন</strong></span>
                        <span>{language === 'bn' ? 'ওটি রেট:' : 'OT Rate:'} <strong className="text-slate-200">{formatBDT(labor.overtimeRate)}/ঘণ্টা</strong></span>
                      </div>

                      <div className="bg-slate-900/90 rounded-xl p-2.5 mt-3 border border-slate-800 text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-slate-400">{language === 'bn' ? 'হাজিরা ও ওভারটাইম:' : 'Days & OT:'}</span>
                          <span className="font-bold text-slate-200">{totalDays} দিন | {totalOtHours} ঘণ্টা OT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">{language === 'bn' ? 'মোট অর্জিত মজুরি:' : 'Gross Earned:'}</span>
                          <span className="font-bold text-white">{formatBDT(totalGross)}</span>
                        </div>
                        <div className="flex justify-between text-rose-400">
                          <span>{language === 'bn' ? 'নেওয়া এডভান্স কর্তন:' : 'Advance Taken:'}</span>
                          <span className="font-bold">-{formatBDT(totalAdvance)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-800">
                          <span className="text-slate-300 font-bold">{language === 'bn' ? 'বকেয়া নিট মজুরি:' : 'Net Due Payable:'}</span>
                          <span className="text-sm font-black text-amber-400">{formatBDT(netDueWage)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {assignedPrj ? assignedPrj.id : 'Site'} ({labor.phone || '-'})
                      </span>

                      {netDueWage > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedLaborForPayout({ labor, netDueWage });
                            setWagePayoutData({
                              accountId: data.accounts[0]?.id || 'acc-cash',
                              paidAmount: netDueWage,
                              paymentDate: new Date().toISOString().slice(0, 10),
                              note: `Daily labor wage settlement for ${labor.name} (${totalDays} days, ${totalOtHours} hrs OT)`
                            });
                            setShowPayWageModal(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1 transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'মজুরি পরিশোধ' : 'Pay Wage'}</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'পরিশোধিত' : 'Cleared'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Attendance Sheet & Wages Log Table */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
            {/* Filters Bar */}
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'bn' ? 'দৈনিক লেবার হাজিরা ও বিস্তারিত মজুরি লগ' : 'Daily Attendance & Wage Logs'}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Project Filter */}
                <select
                  value={selectedProjectFilter}
                  onChange={(e) => setSelectedProjectFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{language === 'bn' ? 'সকল প্রজেক্ট' : 'All Projects'}</option>
                  {data.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>

                {/* Worker Filter */}
                <select
                  value={selectedLaborFilter}
                  onChange={(e) => setSelectedLaborFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">{language === 'bn' ? 'সকল লেবার' : 'All Workers'}</option>
                  {(data.dailyLabors || []).map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.trade})</option>
                  ))}
                </select>

                {/* Search query */}
                <div className="relative min-w-[180px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchLaborQuery}
                    onChange={(e) => setSearchLaborQuery(e.target.value)}
                    placeholder={language === 'bn' ? 'নাম বা পদবি খুঁজুন...' : 'Search worker...'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                    <th className="py-3 px-3">{language === 'bn' ? 'কর্মী ও পদবি' : 'Worker & Trade'}</th>
                    <th className="py-3 px-3">{language === 'bn' ? 'প্রজেক্ট' : 'Project'}</th>
                    <th className="py-3 px-3 text-center">{language === 'bn' ? 'হাজিরা' : 'Attendance'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'দৈনিক রেট' : 'Daily Rate'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'মূল মজুরি' : 'Basic'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'ওভারটাইম' : 'Overtime'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'গ্রস মজুরি' : 'Gross'}</th>
                    <th className="py-3 px-3 text-right text-rose-400">{language === 'bn' ? 'এডভান্স কর্তন' : 'Advance'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'নিট প্রদেয়' : 'Net Due'}</th>
                    <th className="py-3 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                    <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-8 text-center text-slate-400">
                        {language === 'bn' ? 'কোনো হাজিরা রেকর্ড পাওয়া যায়নি।' : 'No attendance records found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map(att => {
                      const labor = (data.dailyLabors || []).find(l => l.id === att.laborId);
                      const prj = data.projects.find(p => p.id === att.projectId);
                      const isPaid = att.paymentStatus === 'Paid';

                      return (
                        <tr key={att.id} className="hover:bg-slate-800/50 transition">
                          <td className="py-2.5 px-3 text-slate-300 font-mono">
                            {formatDate(att.date)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-white">{labor?.name || att.laborId}</div>
                            <div className="text-[10px] text-amber-400">{labor?.trade || '-'}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">
                            {prj ? prj.id : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              att.status === 'Present'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : att.status === 'Half Day'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-rose-500/15 text-rose-400'
                            }`}>
                              {att.status === 'Present' ? 'পূর্ণ (1.0)' : att.status === 'Half Day' ? 'অর্ধ (0.5)' : 'অনুপস্থিত'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                            {formatBDT(att.dailyRate)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                            {formatBDT(att.basicWage)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                            {att.otHours > 0 ? (
                              <span>{att.otHours}h (+{formatBDT(att.otWage)})</span>
                            ) : (
                              <span className="text-slate-500">0</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                            {formatBDT(att.grossWage)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-rose-400">
                            {att.advanceTaken > 0 ? `-${formatBDT(att.advanceTaken)}` : '0'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatBDT(att.netPayable)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                            }`}>
                              {att.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setEditingAttendance(att)}
                                className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs"
                                title={language === 'bn' ? 'হাজিরা এডিট করুন' : 'Edit Attendance'}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(language === 'bn' ? 'এই হাজিরার এন্ট্রিটি মুছে ফেলবেন?' : 'Delete this attendance record?')) {
                                    deleteDailyAttendance(att.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition shadow-xs"
                                title={language === 'bn' ? 'মুছে ফেলুন (Delete)' : 'Delete Attendance'}
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
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MONTHLY STAFF SALARY SHEET                             */}
      {/* ============================================================== */}
      {activeTabLocal === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-xs text-slate-400">{language === 'bn' ? 'মোট মাসিক বেতন বিল' : 'Total Monthly Payroll'}</div>
              <div className="text-xl font-black text-white mt-1">{formatBDT(totalPayroll)}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{data.employees.length} {language === 'bn' ? 'জন স্থায়ী স্টাফ' : 'Employees'}</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-xs text-slate-400">{language === 'bn' ? 'পরিশোধিত বেতন (Paid)' : 'Disbursed (Paid)'}</div>
              <div className="text-xl font-black text-emerald-400 mt-1">{formatBDT(totalPaid)}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{data.salarySheet.filter(s => s.status === 'Paid').length} {language === 'bn' ? 'জনের প্রদান সম্পন্ন' : 'Paid'}</div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
              <div className="text-xs text-slate-400">{language === 'bn' ? 'বকেয়া বেতন (Pending)' : 'Pending Disbursement'}</div>
              <div className="text-xl font-black text-amber-400 mt-1">{formatBDT(totalPending)}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{data.salarySheet.filter(s => s.status === 'Pending').length} {language === 'bn' ? 'জনের অপেক্ষমাণ' : 'Pending Approval'}</div>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">EMP ID</th>
                    <th className="py-3 px-3">{language === 'bn' ? 'নাম ও পদবি' : 'Employee & Designation'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'মূল বেতন (Basic)' : 'Basic'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'বোনাস' : 'Bonus'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'অগ্রিম কর্তন' : 'Advance'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'নেট প্রদেয় (Net)' : 'Net Payable'}</th>
                    <th className="py-3 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                    <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.salarySheet.map((sheet) => {
                    const emp = data.employees.find(e => e.id === sheet.employeeId);
                    const isPaid = sheet.status === 'Paid';

                    return (
                      <tr key={sheet.id} className="hover:bg-slate-800/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-amber-400">{sheet.employeeId}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-200">{emp?.name || sheet.employeeId}</div>
                          <div className="text-[11px] text-slate-400">{emp?.designation}</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">{formatBDT(sheet.basicSalary)}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400">+{formatBDT(sheet.bonus)}</td>
                        <td className="py-3 px-3 text-right font-mono text-rose-400">-{formatBDT(sheet.advance)}</td>
                        <td className="py-3 px-3 text-right font-bold text-white text-xs font-mono">{formatBDT(sheet.netPayable)}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {sheet.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!isPaid && (
                              <button
                                onClick={() => {
                                  setSelectedSalaryRecord(sheet);
                                  setPayData({
                                    accountId: data.accounts[0]?.id || 'acc-cash',
                                    paidAmount: sheet.netPayable,
                                    paymentDate: new Date().toISOString().slice(0, 10)
                                  });
                                  setShowPaySalaryModal(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow transition"
                              >
                                {language === 'bn' ? 'বেতন দিন' : 'Pay Now'}
                              </button>
                            )}
                            {isPaid && (
                              <span className="text-[11px] text-slate-400 font-mono mr-1">
                                {sheet.voucherNo}
                              </span>
                            )}
                            <button
                              onClick={() => setEditingSalarySheet({ ...sheet })}
                              className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs"
                              title={language === 'bn' ? 'বেতন রেকর্ড এডিট করুন' : 'Edit Salary Record'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত ${emp?.name || sheet.employeeId}-এর বেতন রেকর্ড মুছে ফেলতে চান?` : `Delete salary record?`)) {
                                  deleteSalarySheet(sheet.id);
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
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: STAFF & DAILY LABOR DIRECTORY                          */}
      {/* ============================================================== */}
      {activeTabLocal === 'directory' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-3">
              {language === 'bn' ? 'মাসিক বেতনভুক্ত ইঞ্জিনিয়ার ও স্টাফ' : 'Permanent Engineers & Staff'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.employees.map((emp) => (
                <div key={emp.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-400 font-bold">{emp.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                        {emp.status}
                      </span>
                      <button
                        onClick={() => setEditingEmp(emp)}
                        className="p-1 rounded bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300"
                        title="Edit Employee"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত ${emp.name} মুছে ফেলতে চান?` : `Delete employee ${emp.name}?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1 rounded bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-400"
                        title="Delete Employee"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="font-bold text-white text-base">{emp.name}</div>
                  <div className="text-xs text-amber-400 font-medium">{emp.designation}</div>
                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-700/60 space-y-1">
                    <div>Mobile: {emp.mobile}</div>
                    <div>Salary: {formatBDT(emp.monthlySalary)}/মাস</div>
                    <div>Joined: {formatDate(emp.joiningDate)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-3">
              {language === 'bn' ? 'সাইট টেকনিশিয়ান ও দৈনিক লেবার রোস্টার' : 'Site Technicians & Daily Labors'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data.dailyLabors || []).map((labor) => {
                const prj = data.projects.find(p => p.id === labor.assignedProjectId);
                return (
                  <div key={labor.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-400 font-bold">{labor.id}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400">
                          {labor.status}
                        </span>
                        <button
                          onClick={() => setEditingDailyLabor(labor)}
                          className="p-1 rounded bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300"
                          title="Edit Labor Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত ${labor.name} মুছে ফেলতে চান?` : `Delete worker ${labor.name}?`)) {
                              deleteDailyLabor(labor.id);
                            }
                          }}
                          className="p-1 rounded bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-400"
                          title="Delete Worker"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="font-bold text-white text-base">{labor.name}</div>
                    <div className="text-xs text-amber-400 font-medium">{labor.trade}</div>
                    <div className="text-xs text-slate-400 pt-1 border-t border-slate-700/60 space-y-1">
                      <div>দৈনিক রেট: <strong className="text-white">{formatBDT(labor.dailyRate)}/দিন</strong></div>
                      <div>ওভারটাইম রেট: <strong className="text-white">{formatBDT(labor.overtimeRate)}/ঘণ্টা</strong></div>
                      <div>মোবাইল: {labor.phone || '-'}</div>
                      <div>অ্যাসাইনড প্রজেক্ট: {prj ? prj.name : 'General Site'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: SINGLE DAILY ATTENDANCE INPUT                            */}
      {/* ============================================================== */}
      {showRecordAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'দৈনিক লেবার হাজিরা ও মজুরি ইনপুট' : 'Record Daily Labor Attendance'}</span>
              </h3>
              <button onClick={() => setShowRecordAttendanceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleAttendance} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'হাজিরার তারিখ' : 'Date'} *</label>
                  <DateInput
                    required
                    value={attForm.date}
                    onChange={(e) => setAttForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কোন প্রজেক্ট সাইটে কাজ' : 'Project Site'}</label>
                  <select
                    value={attForm.projectId}
                    onChange={(e) => setAttForm(p => ({ ...p, projectId: e.target.value }))}
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
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'লেবার / কর্মী নির্বাচন' : 'Worker'} *</label>
                <select
                  required
                  value={attForm.laborId}
                  onChange={(e) => handleLaborSelectionChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-bold"
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
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'হাজিরার ধরন (Status)' : 'Attendance Status'} *</label>
                  <select
                    value={attForm.status}
                    onChange={(e) => setAttForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-semibold"
                  >
                    <option value="Present">{language === 'bn' ? 'পূর্ণ দিবস (Full Day - 1.0 দিন)' : 'Present (Full Day - 1.0)'}</option>
                    <option value="Half Day">{language === 'bn' ? 'অর্ধ দিবস (Half Day - 0.5 দিন)' : 'Half Day (0.5 Day)'}</option>
                    <option value="Absent">{language === 'bn' ? 'অনুপস্থিত (Absent - 0 দিন)' : 'Absent (0 Day)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'দৈনিক মজুরি রেট (৳)' : 'Daily Rate (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    value={attForm.dailyRate}
                    onChange={(e) => setAttForm(p => ({ ...p, dailyRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম ঘণ্টা (OT Hours)' : 'Overtime Hours'}</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="e.g. 2"
                    value={attForm.otHours}
                    onChange={(e) => setAttForm(p => ({ ...p, otHours: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম রেট (৳/ঘণ্টা)' : 'OT Rate (BDT/hr)'}</label>
                  <input
                    type="number"
                    value={attForm.otRate}
                    onChange={(e) => setAttForm(p => ({ ...p, otRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-rose-400 mb-1 font-semibold">
                  {language === 'bn' ? 'আজকের অগ্রিম গ্রহণ (Advance Taken BDT - মজুরি থেকে কর্তন)' : 'Today Advance Taken (Deduction)'}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={attForm.advanceTaken}
                  onChange={(e) => setAttForm(p => ({ ...p, advanceTaken: e.target.value }))}
                  className="w-full bg-slate-800 border border-rose-500/50 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-rose-400"
                />
              </div>

              {/* Real-time Calculation Preview Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{language === 'bn' ? 'মূল মজুরি (' : 'Basic Wage ('}{singleAttDays} {language === 'bn' ? 'দিন × ' : 'days × '}{attForm.dailyRate}৳):</span>
                  <span className="font-bold text-white">{formatBDT(singleBasicWage)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{language === 'bn' ? 'ওভারটাইম মজুরি (' : 'OT Wage ('}{attForm.otHours || 0} {language === 'bn' ? 'ঘণ্টা × ' : 'hrs × '}{attForm.otRate}৳):</span>
                  <span className="font-bold text-amber-400">+{formatBDT(singleOtWage)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{language === 'bn' ? 'মোট উপার্জিত মজুরি (Gross):' : 'Gross Wage:'}</span>
                  <span className="font-bold text-white">{formatBDT(singleGrossWage)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>{language === 'bn' ? 'অগ্রিম কর্তন:' : 'Advance Deduction:'}</span>
                  <span className="font-bold">-{formatBDT(Number(attForm.advanceTaken || 0))}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-800 text-sm">
                  <span className="font-bold text-slate-200">{language === 'bn' ? 'আজকের নিট প্রদেয় মজুরি:' : 'Net Wage Payable:'}</span>
                  <span className="font-black text-emerald-400">{formatBDT(singleNetPayable)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'নোট / কাজের বিবরণ' : 'Work Description / Note'}</label>
                <input
                  type="text"
                  placeholder="e.g. Column fit-up & welding"
                  value={attForm.note}
                  onChange={(e) => setAttForm(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRecordAttendanceModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {language === 'bn' ? 'হাজিরা ও মজুরি সেভ করুন' : 'Save Attendance Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: BATCH ATTENDANCE MUSTER ROLL                             */}
      {/* ============================================================== */}
      {showBatchAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between z-10">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>{language === 'bn' ? 'একক্লিকে দৈনিক সাইট ব্যাচ হাজিরা শিট (Muster Roll)' : 'Daily Batch Muster Roll'}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'bn' ? 'সাইটের সকল লেবারের আজকের হাজিরা, ওটি ও এডভান্স একসাথে এন্ট্রি করুন' : 'Record attendance for all site workers in one form'}
                </p>
              </div>
              <button onClick={() => setShowBatchAttendanceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatchAttendance} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'তারিখ' : 'Date'} *</label>
                  <DateInput
                    required
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্ট সাইট' : 'Project'} *</label>
                  <select
                    value={batchProject}
                    onChange={(e) => setBatchProject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
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
                      <th className="py-2.5 px-3">লেবার ও ট্রেড</th>
                      <th className="py-2.5 px-3">হাজিরা</th>
                      <th className="py-2.5 px-3">দৈনিক রেট</th>
                      <th className="py-2.5 px-3">ওটি ঘণ্টা</th>
                      <th className="py-2.5 px-3">এডভান্স কর্তন</th>
                      <th className="py-2.5 px-3">নোট</th>
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
                            placeholder="Note"
                            value={row.note}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, note: val } : r));
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
                  onClick={() => setShowBatchAttendanceModal(false)}
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

      {/* ============================================================== */}
      {/* MODAL: EDIT ATTENDANCE ENTRY                                   */}
      {/* ============================================================== */}
      {editingAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'হাজিরা ও মজুরি এন্ট্রি এডিট' : 'Edit Attendance Record'}</span>
              </h3>
              <button onClick={() => setEditingAttendance(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateDailyAttendance(editingAttendance.id, editingAttendance);
                setEditingAttendance(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'তারিখ' : 'Date'}</label>
                  <DateInput
                    required
                    value={editingAttendance.date}
                    onChange={(e) => setEditingAttendance(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'হাজিরার ধরন' : 'Status'}</label>
                  <select
                    value={editingAttendance.status}
                    onChange={(e) => setEditingAttendance(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
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
                    value={editingAttendance.dailyRate}
                    onChange={(e) => setEditingAttendance(p => ({ ...p, dailyRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম ঘণ্টা' : 'OT Hours'}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={editingAttendance.otHours}
                    onChange={(e) => setEditingAttendance(p => ({ ...p, otHours: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম রেট (৳)' : 'OT Rate'}</label>
                  <input
                    type="number"
                    value={editingAttendance.otRate}
                    onChange={(e) => setEditingAttendance(p => ({ ...p, otRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-rose-400 mb-1 font-medium">{language === 'bn' ? 'এডভান্স কর্তন (৳)' : 'Advance'}</label>
                  <input
                    type="number"
                    value={editingAttendance.advanceTaken}
                    onChange={(e) => setEditingAttendance(p => ({ ...p, advanceTaken: e.target.value }))}
                    className="w-full bg-slate-800 border border-rose-500/50 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'পেমেন্ট অবস্থা' : 'Payment Status'}</label>
                <select
                  value={editingAttendance.paymentStatus}
                  onChange={(e) => setEditingAttendance(p => ({ ...p, paymentStatus: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Due">Due (বকেয়া)</option>
                  <option value="Paid">Paid (পরিশোধিত)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'নোট' : 'Note'}</label>
                <input
                  type="text"
                  value={editingAttendance.note || ''}
                  onChange={(e) => setEditingAttendance(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAttendance(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {language === 'bn' ? 'আপডেট সংরক্ষণ' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PAY LABOR WAGES SETTLEMENT (VOUCHER GENERATION)          */}
      {/* ============================================================== */}
      {showPayWageModal && selectedLaborForPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'লেবার মজুরি পরিশোধ ও ভাউচার তৈরি' : 'Disburse Daily Labor Wage'}</span>
              </h3>
              <button onClick={() => setShowPayWageModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmWagePayout} className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">{language === 'bn' ? 'কর্মী:' : 'Worker:'}</div>
                <div className="font-bold text-white text-sm">
                  {selectedLaborForPayout.labor.name} ({selectedLaborForPayout.labor.trade})
                </div>
                <div className="flex justify-between pt-1 text-slate-300">
                  <span>{language === 'bn' ? 'মোট বকেয়া মজুরি ব্যালেন্স:' : 'Outstanding Due Wage:'}</span>
                  <span className="font-bold text-amber-400">{formatBDT(selectedLaborForPayout.netDueWage)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কোন অ্যাকাউন্ট থেকে প্রদান' : 'Payment Account'} *</label>
                <select
                  value={wagePayoutData.accountId}
                  onChange={(e) => setWagePayoutData(p => ({ ...p, accountId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {data.accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Balance: {formatBDT(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রদেয় পরিমাণ (৳)' : 'Amount (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={wagePayoutData.paidAmount}
                    onChange={(e) => setWagePayoutData(p => ({ ...p, paidAmount: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'পরিশোধের তারিখ' : 'Payment Date'} *</label>
                  <DateInput
                    required
                    value={wagePayoutData.paymentDate}
                    onChange={(e) => setWagePayoutData(p => ({ ...p, paymentDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'নোট / বিবরণ' : 'Notes / Remarks'}</label>
                <input
                  type="text"
                  value={wagePayoutData.note}
                  onChange={(e) => setWagePayoutData(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPayWageModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg"
                >
                  {language === 'bn' ? 'মজুরি ভাউচার নিশ্চিত করুন' : 'Confirm Wage Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD NEW DAILY LABOR PROFILE                             */}
      {/* ============================================================== */}
      {showAddDailyLaborModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'নতুন দৈনিক লেবার প্রোফাইল যুক্ত করুন' : 'Add New Daily Labor'}</span>
              </h3>
              <button onClick={() => setShowAddDailyLaborModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addDailyLabor(newLaborData);
                setShowAddDailyLaborModal(false);
                setNewLaborData({
                  name: '',
                  trade: 'Master Fitter & Fabricator',
                  dailyRate: '1000',
                  overtimeRate: '140',
                  phone: '',
                  assignedProjectId: data.projects[0]?.id || '',
                  nid: ''
                });
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'লেবারের নাম' : 'Worker Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. কামাল উদ্দিন (Kamal)"
                  value={newLaborData.name}
                  onChange={(e) => setNewLaborData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কাজের পদবি / ট্রেড' : 'Trade / Skill'} *</label>
                <select
                  value={newLaborData.trade}
                  onChange={(e) => setNewLaborData(p => ({ ...p, trade: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Master Fitter & Fabricator">Master Fitter & Fabricator</option>
                  <option value="Certified 6G Welder">Certified 6G Welder (SMAW / TIG)</option>
                  <option value="Rigging & Truss Erector">Rigging & Truss Erector</option>
                  <option value="Gas Cutter & Grinder">Gas Cutter & Grinder</option>
                  <option value="Steel Structure Painter">Steel Structure Painter</option>
                  <option value="Fabrication Helper">Fabrication Helper</option>
                  <option value="Site Helper">Site Helper</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'দৈনিক মজুরি রেট (৳)' : 'Daily Rate (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1100"
                    value={newLaborData.dailyRate}
                    onChange={(e) => setNewLaborData(p => ({ ...p, dailyRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম রেট (৳/ঘণ্টা)' : 'OT Rate (BDT/hr)'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={newLaborData.overtimeRate}
                    onChange={(e) => setNewLaborData(p => ({ ...p, overtimeRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'}</label>
                  <input
                    type="text"
                    placeholder="018XXXXXXXX"
                    value={newLaborData.phone}
                    onChange={(e) => setNewLaborData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্ট অ্যাসাইন' : 'Assigned Project'}</label>
                  <select
                    value={newLaborData.assignedProjectId}
                    onChange={(e) => setNewLaborData(p => ({ ...p, assignedProjectId: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {data.projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDailyLaborModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {language === 'bn' ? 'লেবার সেভ করুন' : 'Save Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT DAILY LABOR PROFILE                                */}
      {/* ============================================================== */}
      {editingDailyLabor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'লেবার প্রোফাইল এডিট' : 'Edit Labor Profile'}</span>
              </h3>
              <button onClick={() => setEditingDailyLabor(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateDailyLabor(editingDailyLabor.id, editingDailyLabor);
                setEditingDailyLabor(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'লেবারের নাম' : 'Worker Name'} *</label>
                <input
                  type="text"
                  required
                  value={editingDailyLabor.name}
                  onChange={(e) => setEditingDailyLabor(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ট্রেড / পদবি' : 'Trade'} *</label>
                <input
                  type="text"
                  required
                  value={editingDailyLabor.trade}
                  onChange={(e) => setEditingDailyLabor(p => ({ ...p, trade: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'দৈনিক রেট (৳)' : 'Daily Rate'} *</label>
                  <input
                    type="number"
                    required
                    value={editingDailyLabor.dailyRate}
                    onChange={(e) => setEditingDailyLabor(p => ({ ...p, dailyRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ওভারটাইম রেট (৳)' : 'OT Rate'}</label>
                  <input
                    type="number"
                    value={editingDailyLabor.overtimeRate}
                    onChange={(e) => setEditingDailyLabor(p => ({ ...p, overtimeRate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোবাইল' : 'Phone'}</label>
                  <input
                    type="text"
                    value={editingDailyLabor.phone || ''}
                    onChange={(e) => setEditingDailyLabor(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'অবস্থা' : 'Status'}</label>
                  <select
                    value={editingDailyLabor.status || 'Active'}
                    onChange={(e) => setEditingDailyLabor(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingDailyLabor(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {language === 'bn' ? 'আপডেট সেভ করুন' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PAY MONTHLY SALARY                                      */}
      {/* ============================================================== */}
      {showPaySalaryModal && selectedSalaryRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'বেতন পরিশোধ নিশ্চিতকরণ' : 'Disburse Salary Payment'}</span>
              </h3>
              <button onClick={() => setShowPaySalaryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                payEmployeeSalary({
                  salaryId: selectedSalaryRecord.id,
                  employeeId: selectedSalaryRecord.employeeId,
                  accountId: payData.accountId,
                  paidAmount: Number(payData.paidAmount),
                  paymentDate: payData.paymentDate
                });
                setShowPaySalaryModal(false);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">{language === 'bn' ? 'কর্মচারী:' : 'Employee:'}</div>
                <div className="font-bold text-white text-sm">
                  {data.employees.find(e => e.id === selectedSalaryRecord.employeeId)?.name}
                </div>
                <div className="flex justify-between pt-1 text-slate-300">
                  <span>{language === 'bn' ? 'নেট প্রদেয় বেতন:' : 'Net Payable:'}</span>
                  <span className="font-bold text-emerald-400">{formatBDT(selectedSalaryRecord.netPayable)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কোন অ্যাকাউন্ট থেকে প্রদান' : 'Payment Account'} *</label>
                <select
                  value={payData.accountId}
                  onChange={(e) => setPayData(p => ({ ...p, accountId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {data.accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Balance: {formatBDT(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    value={payData.paidAmount}
                    onChange={(e) => setPayData(p => ({ ...p, paidAmount: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'পরিশোধের তারিখ' : 'Payment Date'} *</label>
                  <DateInput
                    required
                    value={payData.paymentDate}
                    onChange={(e) => setPayData(p => ({ ...p, paymentDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowPaySalaryModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg">
                  {language === 'bn' ? 'বেতন পরিশোধ নিশ্চিত করুন' : 'Confirm Disbursement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD NEW MONTHLY EMPLOYEE                                */}
      {/* ============================================================== */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'নতুন কর্মচারী যুক্ত করুন' : 'Add New Employee'}</span>
              </h3>
              <button onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addEmployee(newEmpData);
                setShowAddEmpModal(false);
                setNewEmpData({
                  name: '',
                  designation: '',
                  mobile: '',
                  joiningDate: new Date().toISOString().slice(0, 10),
                  salaryType: 'Monthly',
                  monthlySalary: '',
                  nid: ''
                });
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কর্মচারীর নাম' : 'Employee Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Md. Shahidul Islam"
                  value={newEmpData.name}
                  onChange={(e) => setNewEmpData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'পদবি / ডেজিগনেশন' : 'Designation'} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quality Control Engineer"
                    value={newEmpData.designation}
                    onChange={(e) => setNewEmpData(p => ({ ...p, designation: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile'} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 018XXXXXXXX"
                    value={newEmpData.mobile}
                    onChange={(e) => setNewEmpData(p => ({ ...p, mobile: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মাসিক মূল বেতন (৳)' : 'Monthly Salary (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 35000"
                    value={newEmpData.monthlySalary}
                    onChange={(e) => setNewEmpData(p => ({ ...p, monthlySalary: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'যোগদানের তারিখ' : 'Joining Date'}</label>
                  <DateInput
                    value={newEmpData.joiningDate}
                    onChange={(e) => setNewEmpData(p => ({ ...p, joiningDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddEmpModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg">
                  {language === 'bn' ? 'কর্মচারী সেভ করুন' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: EDIT MONTHLY EMPLOYEE                                   */}
      {/* ============================================================== */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'কর্মচারী তথ্য এডিট' : 'Edit Employee'}</span>
              </h3>
              <button onClick={() => setEditingEmp(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateEmployee(editingEmp.id, editingEmp);
                setEditingEmp(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'নাম' : 'Name'} *</label>
                <input
                  type="text"
                  required
                  value={editingEmp.name}
                  onChange={(e) => setEditingEmp(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'পদবি' : 'Designation'} *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.designation}
                    onChange={(e) => setEditingEmp(p => ({ ...p, designation: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোবাইল' : 'Mobile'} *</label>
                  <input
                    type="text"
                    required
                    value={editingEmp.mobile}
                    onChange={(e) => setEditingEmp(p => ({ ...p, mobile: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মাসিক বেতন (৳)' : 'Monthly Salary'} *</label>
                  <input
                    type="number"
                    required
                    value={editingEmp.monthlySalary}
                    onChange={(e) => setEditingEmp(p => ({ ...p, monthlySalary: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'অবস্থা' : 'Status'}</label>
                  <select
                    value={editingEmp.status}
                    onChange={(e) => setEditingEmp(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setEditingEmp(null)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg">
                  {language === 'bn' ? 'আপডেট সেভ করুন' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Salary Sheet Record */}
      {editingSalarySheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'বেতন রেকর্ড এডিট' : 'Edit Salary Record'}</span>
              </h3>
              <button onClick={() => setEditingSalarySheet(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSalarySheet(editingSalarySheet.id, editingSalarySheet);
                setEditingSalarySheet(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-mono">{editingSalarySheet.employeeId} - {editingSalarySheet.month}</div>
                <div className="font-bold text-white text-sm">
                  {data.employees.find(e => e.id === editingSalarySheet.employeeId)?.name || editingSalarySheet.employeeId}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মূল বেতন (৳)' : 'Basic'} *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingSalarySheet.basicSalary}
                    onChange={(e) => setEditingSalarySheet(p => ({ ...p, basicSalary: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-emerald-400 mb-1 font-medium">{language === 'bn' ? 'বোনাস (৳)' : 'Bonus'}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSalarySheet.bonus}
                    onChange={(e) => setEditingSalarySheet(p => ({ ...p, bonus: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-rose-400 mb-1 font-medium">{language === 'bn' ? 'অগ্রিম কর্তন' : 'Advance'}</label>
                  <input
                    type="number"
                    min="0"
                    value={editingSalarySheet.advance}
                    onChange={(e) => setEditingSalarySheet(p => ({ ...p, advance: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'অবস্থা' : 'Status'}</label>
                <select
                  value={editingSalarySheet.status}
                  onChange={(e) => setEditingSalarySheet(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Due">Due (বকেয়া)</option>
                  <option value="Paid">Paid (পরিশোধিত)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(language === 'bn' ? 'আপনি কি নিশ্চিত এই বেতন রেকর্ডটি মুছে ফেলতে চান?' : 'Delete salary record?')) {
                      deleteSalarySheet(editingSalarySheet.id);
                      setEditingSalarySheet(null);
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSalarySheet(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                  >
                    {language === 'bn' ? 'আপডেট সেভ করুন' : 'Update Record'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
