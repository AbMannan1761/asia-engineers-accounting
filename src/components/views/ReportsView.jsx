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
  Printer
} from 'lucide-react';
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

  const [activeReport, setActiveReport] = useState('cash_book'); // cash_book | bank_book | pnl | stock_valuation

  const netProfit = totalIncome - totalExpense;

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

        <button
          onClick={exportAllToExcel}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition self-start"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{language === 'bn' ? 'সম্পূর্ণ আর্থিক হিসাব এক্সেলে ডাউনলোড (.xlsx)' : 'Export Full Excel (.xlsx)'}</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start flex-wrap gap-1">
        {[
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
