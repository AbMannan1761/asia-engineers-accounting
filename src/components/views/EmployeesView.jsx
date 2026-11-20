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
  CreditCard
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

export const EmployeesView = () => {
  const { language, data, addEmployee, payEmployeeSalary, setActiveTab, setSelectedVoucherForPrint } = useApp();

  const [activeTab, setActiveTabLocal] = useState('sheet'); // sheet | employees
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showPaySalaryModal, setShowPaySalaryModal] = useState(false);
  const [selectedSalaryRecord, setSelectedSalaryRecord] = useState(null);

  // New Employee Form
  const [newEmpData, setNewEmpData] = useState({
    name: '',
    designation: '',
    mobile: '',
    joiningDate: new Date().toISOString().slice(0, 10),
    salaryType: 'Monthly',
    monthlySalary: '',
    nid: ''
  });

  // Pay Salary Form
  const [payData, setPayData] = useState({
    accountId: data.accounts[0]?.id || 'acc-cash',
    paidAmount: '',
    paymentDate: new Date().toISOString().slice(0, 10)
  });

  const handleAddEmployee = (e) => {
    e.preventDefault();
    if (!newEmpData.name.trim() || !newEmpData.monthlySalary) {
      alert(language === 'bn' ? 'নাম ও বেতন দিন!' : 'Please enter name and salary!');
      return;
    }
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
  };

  const handleOpenPayModal = (salaryRecord) => {
    setSelectedSalaryRecord(salaryRecord);
    setPayData({
      accountId: data.accounts[0]?.id || 'acc-cash',
      paidAmount: salaryRecord.netPayable,
      paymentDate: new Date().toISOString().slice(0, 10)
    });
    setShowPaySalaryModal(true);
  };

  const handleConfirmSalaryPayment = (e) => {
    e.preventDefault();
    if (!selectedSalaryRecord) return;

    payEmployeeSalary({
      salaryId: selectedSalaryRecord.id,
      employeeId: selectedSalaryRecord.employeeId,
      accountId: payData.accountId,
      paidAmount: Number(payData.paidAmount),
      paymentDate: payData.paymentDate
    });

    setShowPaySalaryModal(false);
    setSelectedSalaryRecord(null);
  };

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
            <span>{language === 'bn' ? 'কর্মচারী ও মাসিক বেতন শিট' : 'Employee & Salary Management'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' 
              ? 'বেসিক, বোনাস, অগ্রিম কর্তন, নেট পেয়াবল ও বেতন প্রদান ভাউচার' 
              : 'Monthly salary sheet calculation, advance deductions, and payment disbursement'}
          </p>
        </div>

        <button
          onClick={() => setShowAddEmpModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন কর্মচারী' : '+ New Employee'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="text-xs text-slate-400">{language === 'bn' ? 'মোট মাসিক বেতন বিল' : 'Total Monthly Payroll'}</div>
          <div className="text-xl font-black text-white mt-1">{formatBDT(totalPayroll)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{data.employees.length} {language === 'bn' ? 'জন স্টাফ ও টেকনিশিয়ান' : 'Employees'}</div>
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

      {/* View Switcher */}
      <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start">
        <button
          onClick={() => setActiveTabLocal('sheet')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'sheet' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          {language === 'bn' ? 'মাসিক বেতন শিট (ফেব্রুয়ারি ২০২৬)' : 'Monthly Salary Sheet'}
        </button>
        <button
          onClick={() => setActiveTabLocal('employees')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'employees' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          {language === 'bn' ? 'কর্মচারী তালিকা ও প্রোফাইল' : 'Employee Directory'}
        </button>
      </div>

      {/* Tab 1: Monthly Salary Sheet Table */}
      {activeTab === 'sheet' ? (
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
                        {isPaid ? (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {sheet.voucherNo}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenPayModal(sheet)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow transition"
                          >
                            {language === 'bn' ? 'বেতন দিন' : 'Pay Now'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Employee Profiles Directory */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.employees.map((emp) => (
            <div key={emp.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-400 font-bold">{emp.id}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                  {emp.status}
                </span>
              </div>
              <div className="font-bold text-white text-base">{emp.name}</div>
              <div className="text-xs text-amber-400 font-medium">{emp.designation}</div>
              <div className="text-xs text-slate-400 pt-1 border-t border-slate-700/60 space-y-1">
                <div>Mobile: {emp.mobile}</div>
                <div>Salary Type: {emp.salaryType} ({formatBDT(emp.monthlySalary)}/mo)</div>
                <div>Joined: {formatDate(emp.joiningDate)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Pay Employee Salary */}
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

            <form onSubmit={handleConfirmSalaryPayment} className="p-5 space-y-3.5 text-xs">
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
                  <input
                    type="date"
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

      {/* Modal: Add New Employee */}
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

            <form onSubmit={handleAddEmployee} className="p-5 space-y-3.5 text-xs">
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
                  <input
                    type="date"
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
    </div>
  );
};
