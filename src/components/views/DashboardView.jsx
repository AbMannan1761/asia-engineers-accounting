import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  Building,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Briefcase,
  FileText,
  Clock,
  Printer,
  ChevronRight,
  ArrowLeftRight
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

export const DashboardView = () => {
  const {
    language,
    data,
    totalIncome,
    totalExpense,
    totalCashBalance,
    totalBankBalance,
    totalReceivable,
    totalPayable,
    lowStockItems,
    setActiveTab,
    setSelectedVoucherForPrint
  } = useApp();

  const netBalance = totalIncome - totalExpense;
  const activeProjects = data.projects.filter(p => p.status === 'In Progress');

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Action Bar */}
      <div className="bg-gradient-to-r from-slate-800/90 via-slate-800 to-amber-950/40 border border-slate-700/80 rounded-2xl p-3.5 lg:p-4 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
              {language === 'bn' ? 'অ্যাকাউন্টিং ড্যাশবোর্ড' : 'Executive Dashboard'}
            </span>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('accounting')}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'bn' ? '+ জমা / রিসিট' : '+ Money Receipt'}</span>
            </button>
            <button
              onClick={() => setActiveTab('accounting')}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{language === 'bn' ? '+ খরচ / ভাউচার' : '+ Payment Voucher'}</span>
            </button>
            <button
              onClick={() => setActiveTab('accounting')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{language === 'bn' ? 'ফান্ড ট্রান্সফার' : 'Transfer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert Bar: Low Material Stock */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-950/50 border border-amber-600/40 rounded-xl p-3.5 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-bold text-amber-300">
              {language === 'bn' ? 'সতর্কতা: স্টিল মালামাল স্টক অ্যালার্ট!' : 'Warning: Low Material Stock Level!'}
            </div>
            <div className="text-slate-300 mt-0.5">
              {lowStockItems.map(m => `${m.name} (${m.currentStock} ${m.unit} অবশিষ্ট)`).join(', ')}
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('inventory')}
            className="text-xs font-bold text-amber-400 hover:underline shrink-0"
          >
            {language === 'bn' ? 'স্টক দেখুন →' : 'View Stock →'}
          </button>
        </div>
      )}

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {/* Cash in Hand */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'ক্যাশ ইন হ্যান্ড (Petty Cash)' : 'Cash in Hand'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-white mt-2">
            {formatBDT(totalCashBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === 'bn' ? 'অফিস ক্যাশ বাক্স' : 'Main Office Drawer'}
          </div>
        </div>

        {/* Total Bank Balance */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'ব্যাংক ও মোবাইল ব্যাংকিং' : 'Total Bank Balances'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-white mt-2">
            {formatBDT(totalBankBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {data.accounts.filter(a => a.type !== 'cash').length} {language === 'bn' ? 'টি সক্রিয় একাউন্ট' : 'Active Accounts'}
          </div>
        </div>

        {/* Client Receivables (পাওনা) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'ক্লায়েন্টের কাছে পাওনা (Due)' : 'Receivables from Clients'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-amber-400 mt-2">
            {formatBDT(totalReceivable)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === 'bn' ? 'বকেয়া বিল আদায়যোগ্য' : 'Outstanding invoices'}
          </div>
        </div>

        {/* Supplier Payables (দেনা) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              {language === 'bn' ? 'সাপ্লায়ার দেনা (Payable)' : 'Payable to Suppliers'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl lg:text-2xl font-bold text-rose-400 mt-2">
            {formatBDT(totalPayable)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {language === 'bn' ? 'স্টিল/মালামাল বিল প্রদেয়' : 'Material bill balance'}
          </div>
        </div>
      </div>

      {/* Secondary Row: Bank Accounts Detailed Breakdown & Financial Income/Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bank & Accounts Breakdown */}
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'ব্যাংক একাউন্ট সমূহ' : 'Accounts & Wallets'}</span>
            </h3>
            <button 
              onClick={() => setActiveTab('accounting')}
              className="text-xs text-amber-400 hover:underline font-medium"
            >
              {language === 'bn' ? 'বিস্তারিত →' : 'Details →'}
            </button>
          </div>

          <div className="space-y-3">
            {data.accounts.map((acc) => (
              <div 
                key={acc.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-200 text-xs">{acc.name}</div>
                  <div className="text-[10px] text-slate-400">{acc.accountNumber}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white text-xs">{formatBDT(acc.balance)}</div>
                  <div className="text-[10px] text-slate-400 uppercase">{acc.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Income vs Total Expense Summary Card */}
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'আর্থিক প্রবাহ সারাংশ' : 'Cash Flow Summary'}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Net Balance: {formatBDT(netBalance)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>{language === 'bn' ? 'সর্বমোট জমা / বিল প্রাপ্তি' : 'Total Income Received'}</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-emerald-400">
                {formatBDT(totalIncome)}
              </div>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/20 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>{language === 'bn' ? 'সর্বমোট খরচ / মালামাল ও শ্রম' : 'Total Expenses Disbursed'}</span>
              </div>
              <div className="text-xl lg:text-2xl font-black text-rose-400">
                {formatBDT(totalExpense)}
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-around text-center text-xs">
            <div>
              <div className="text-slate-400">{language === 'bn' ? 'চলমান প্রজেক্ট' : 'Active Projects'}</div>
              <div className="font-bold text-amber-400 text-sm">{activeProjects.length}</div>
            </div>
            <div className="border-r border-slate-800 h-8"></div>
            <div>
              <div className="text-slate-400">{language === 'bn' ? 'মোট কর্মচারী' : 'Total Employees'}</div>
              <div className="font-bold text-slate-200 text-sm">{data.employees.length}</div>
            </div>
            <div className="border-r border-slate-800 h-8"></div>
            <div>
              <div className="text-slate-400">{language === 'bn' ? 'মোট ভাউচার' : 'Total Vouchers'}</div>
              <div className="font-bold text-slate-200 text-sm">{data.transactions.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Projects Progress Overview */}
      <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'চলমান স্টিল স্ট্রাকচার প্রজেক্টসমূহ' : 'Ongoing Steel Projects'}</span>
          </h3>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            {language === 'bn' ? 'সকল প্রজেক্ট দেখুন →' : 'View All Projects →'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.slice(0, 3).map((prj) => {
            const spentPercent = prj.budget > 0 ? Math.min(100, Math.round((prj.spentAmount / prj.budget) * 100)) : 0;
            return (
              <div 
                key={prj.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {prj.id}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {prj.status}
                  </span>
                </div>

                <div className="font-bold text-slate-200 text-sm line-clamp-1">
                  {prj.name}
                </div>
                <div className="text-xs text-slate-400 mb-3">
                  {prj.client}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{language === 'bn' ? 'চুক্তি মূল্য:' : 'Contract Value:'}</span>
                    <span className="font-semibold text-white">{formatBDT(prj.contractValue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{language === 'bn' ? 'ক্লায়েন্ট জমা:' : 'Received:'}</span>
                    <span className="font-semibold text-emerald-400">{formatBDT(prj.receivedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{language === 'bn' ? 'প্রজেক্ট খরচ:' : 'Spent:'}</span>
                    <span className="font-semibold text-rose-400">{formatBDT(prj.spentAmount)}</span>
                  </div>

                  {/* Budget Spent Progress Bar */}
                  <div className="pt-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>{language === 'bn' ? 'বাজেট ব্যবহার' : 'Budget Spent'}</span>
                      <span className="font-mono">{spentPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          spentPercent > 90 ? 'bg-rose-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${spentPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions & Vouchers Table */}
      <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? 'সাম্প্রতিক ভাউচার ও লেনদেন' : 'Recent Vouchers & Transactions'}</span>
          </h3>
          <button
            onClick={() => setActiveTab('accounting')}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            {language === 'bn' ? 'সকল লেনদেন →' : 'View All →'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Voucher No</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'বিবরণ / পক্ষ' : 'Party & Description'}</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.transactions.slice(0, 6).map((txn) => {
                const isIncome = txn.type === 'income';
                const isTransfer = txn.type === 'transfer';
                return (
                  <tr key={txn.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono font-medium text-amber-400">
                      {txn.voucherNo}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {formatDate(txn.date)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-200">{txn.party}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{txn.description}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                        {txn.category}
                      </span>
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold text-xs ${
                      isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-rose-400'
                    }`}>
                      {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{formatBDT(txn.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => {
                          setSelectedVoucherForPrint(txn);
                          setActiveTab('vouchers');
                        }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                        title="Print / View A4 Voucher"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
