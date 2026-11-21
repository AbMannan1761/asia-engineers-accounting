import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Printer,
  ChevronDown,
  Building2,
  Calendar,
  CreditCard,
  UserCheck,
  CheckCircle2,
  Download,
  Filter,
  ArrowLeftRight
} from 'lucide-react';
import { formatBDT, formatDate, numberToWords } from '../../utils/formatters';

export const VouchersView = () => {
  const {
    COMPANY_INFO,
    language,
    data,
    selectedVoucherForPrint,
    setSelectedVoucherForPrint
  } = useApp();

  const [filterType, setFilterType] = useState('all'); // all | debit | credit | transfer
  const [selectedTitleMode, setSelectedTitleMode] = useState('auto'); // auto | debit | credit | receipt | journal

  // Filter transaction list based on type
  const filteredTransactions = data.transactions.filter(t => {
    if (filterType === 'debit') return t.type === 'expense';
    if (filterType === 'credit') return t.type === 'income';
    if (filterType === 'transfer') return t.type === 'transfer';
    return true;
  });

  // If no voucher selected or selected voucher filtered out, default to the latest matching transaction
  const activeTxn = (selectedVoucherForPrint && filteredTransactions.some(t => t.id === selectedVoucherForPrint.id))
    ? selectedVoucherForPrint
    : (filteredTransactions[0] || data.transactions[0]);

  const isIncome = activeTxn?.type === 'income';
  const isExpense = activeTxn?.type === 'expense';
  const isTransfer = activeTxn?.type === 'transfer';

  // Determine title badge text and style
  const getVoucherTitleInfo = () => {
    let mode = selectedTitleMode;
    if (mode === 'auto') {
      if (isExpense) mode = 'debit';
      else if (isIncome) mode = 'credit';
      else if (isTransfer) mode = 'journal';
      else mode = 'debit';
    }

    if (mode === 'debit') {
      return {
        badgeEn: 'DEBIT VOUCHER',
        badgeBn: 'ডেবিট ভাউচার (টাকা পরিশোধ / ব্যয়)',
        color: 'bg-rose-50 text-rose-800 border-rose-600',
        dotColor: 'bg-rose-500'
      };
    }
    if (mode === 'credit') {
      return {
        badgeEn: 'CREDIT VOUCHER',
        badgeBn: 'ক্রেডিট ভাউচার (টাকা জমা / প্রাপ্তি)',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-600',
        dotColor: 'bg-emerald-500'
      };
    }
    if (mode === 'receipt') {
      return {
        badgeEn: 'MONEY RECEIPT',
        badgeBn: 'মানি রিসিট (টাকা জমা প্রাপ্তি রসিদ)',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-600',
        dotColor: 'bg-emerald-500'
      };
    }
    return {
      badgeEn: 'JOURNAL VOUCHER',
      badgeBn: 'জার্নাল ভাউচার (তহবিল স্থানান্তর)',
      color: 'bg-blue-50 text-blue-800 border-blue-600',
      dotColor: 'bg-blue-500'
    };
  };

  const titleInfo = getVoucherTitleInfo();

  const partyLabel = isIncome 
    ? (language === 'bn' ? 'টাকা প্রাপ্তি (Received with thanks from)' : 'Received with thanks from')
    : isTransfer
    ? (language === 'bn' ? 'উৎস ও গন্তব্য হিসাব (Transfer)' : 'Transfer Accounts')
    : (language === 'bn' ? 'প্রাপক / ব্যয়ের খাত (Paid in favor of)' : 'Paid in favor of (Payee)');

  const onAccountLabel = isIncome 
    ? (language === 'bn' ? 'যে বাবদ প্রাপ্তি (On Account / Purpose of)' : 'On Account / Purpose of')
    : (language === 'bn' ? 'যে বাবদ প্রদান (Being the payment for)' : 'Being the payment for');

  const project = data.projects.find(p => p.id === activeTxn?.projectId);
  const account = data.accounts.find(a => a.id === activeTxn?.accountId);
  const toAccount = activeTxn?.toAccountId ? data.accounts.find(a => a.id === activeTxn?.toAccountId) : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header & Controls (Hidden in Print) */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>{language === 'bn' ? 'ডেবিট ও ক্রেডিট ভাউচার প্রিন্ট প্রিভিউ' : 'Debit & Credit Voucher Printing'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'bn' 
                ? 'অফিসিয়াল A4 প্রিন্ট লেআউট, টাকার অংক কথায় ও স্বাক্ষরের স্থান' 
                : 'Standard A4 print format with amount in words and official signature blocks'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Select Voucher Dropdown */}
            <select
              value={activeTxn?.id}
              onChange={(e) => {
                const found = data.transactions.find(t => t.id === e.target.value);
                if (found) setSelectedVoucherForPrint(found);
              }}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400 max-w-xs"
            >
              {filteredTransactions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.voucherNo} - {t.party} ({formatBDT(t.amount)})
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'bn' ? 'প্রিন্ট করুন (A4)' : 'Print Voucher'}</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar: Debit Voucher, Credit Voucher, Journal Voucher Options */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Filter by Voucher Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'bn' ? 'ভাউচার তালিকা:' : 'Show Vouchers:'}</span>
            </span>

            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  filterType === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' ? 'সকল' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('debit')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  filterType === 'debit'
                    ? 'bg-rose-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>{language === 'bn' ? 'ডেবিট ভাউচার (ব্যয়)' : 'Debit Vouchers'}</span>
              </button>
              <button
                onClick={() => setFilterType('credit')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  filterType === 'credit'
                    ? 'bg-emerald-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{language === 'bn' ? 'ক্রেডিট ভাউচার (জমা)' : 'Credit Vouchers'}</span>
              </button>
              <button
                onClick={() => setFilterType('transfer')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  filterType === 'transfer'
                    ? 'bg-blue-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>{language === 'bn' ? 'জার্নাল ভাউচার' : 'Journal'}</span>
              </button>
            </div>
          </div>

          {/* Right: Print Title Format Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-semibold">
              {language === 'bn' ? 'প্রিন্ট হেডিং অপশন:' : 'Print Heading:'}
            </span>
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1 text-[11px]">
              <button
                onClick={() => setSelectedTitleMode('auto')}
                className={`px-2 py-1 rounded-lg transition ${
                  selectedTitleMode === 'auto'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Automatically match Debit / Credit based on transaction type"
              >
                {language === 'bn' ? 'স্বয়ংক্রিয় (Auto)' : 'Auto'}
              </button>
              <button
                onClick={() => setSelectedTitleMode('debit')}
                className={`px-2 py-1 rounded-lg transition ${
                  selectedTitleMode === 'debit'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' ? 'ডেবিট ভাউচার' : 'Debit Voucher'}
              </button>
              <button
                onClick={() => setSelectedTitleMode('credit')}
                className={`px-2 py-1 rounded-lg transition ${
                  selectedTitleMode === 'credit'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' ? 'ক্রেডিট ভাউচার' : 'Credit Voucher'}
              </button>
              <button
                onClick={() => setSelectedTitleMode('receipt')}
                className={`px-2 py-1 rounded-lg transition ${
                  selectedTitleMode === 'receipt'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' ? 'মানি রিসিট' : 'Money Receipt'}
              </button>
              <button
                onClick={() => setSelectedTitleMode('journal')}
                className={`px-2 py-1 rounded-lg transition ${
                  selectedTitleMode === 'journal'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'bn' ? 'জার্নাল ভাউচার' : 'Journal'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Voucher Paper Card (A4 White Canvas) */}
      <div className="printable-voucher-card bg-white text-slate-900 rounded-2xl p-6 lg:p-10 shadow-2xl max-w-4xl mx-auto border border-slate-300">
        {/* Company Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-16 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center">
                <img 
                  src="./images/asia_engineers_logo.png" 
                  alt="Asia Engineers" 
                  className="h-12 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-950 tracking-wider">
                  {COMPANY_INFO.name}
                </h1>
                <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                  {COMPANY_INFO.tagline}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {COMPANY_INFO.address}
                </div>
                <div className="text-xs text-slate-600">
                  Phone: <span className="font-semibold text-slate-900">{COMPANY_INFO.phone}</span> | Web: <span className="font-semibold text-slate-900">{COMPANY_INFO.website}</span>
                </div>
              </div>
            </div>

            {/* Voucher Title & Number Box */}
            <div className="text-right">
              <span className={`inline-block px-3 py-1.5 text-xs font-black uppercase rounded border tracking-wide ${titleInfo.color}`}>
                {titleInfo.badgeEn}
              </span>
              <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                {titleInfo.badgeBn}
              </div>
              <div className="text-sm font-mono font-black text-slate-900 mt-1.5">
                Voucher No: {activeTxn?.voucherNo}
              </div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">
                Date: <span className="font-bold text-slate-900">{formatDate(activeTxn?.date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Fields Body */}
        <div className="space-y-4 text-sm">
          {/* Party row */}
          <div className="flex items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
            <span className="font-bold text-slate-700 w-52 shrink-0">{partyLabel}:</span>
            <span className="font-bold text-base text-slate-950 uppercase">
              {isTransfer 
                ? `${account?.name || activeTxn?.accountId} ➔ ${toAccount?.name || activeTxn?.toAccountId}`
                : activeTxn?.party}
            </span>
          </div>

          {/* Amount In Figures & Words */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-dashed border-slate-300 pb-2">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-slate-700 shrink-0">Amount in Figures:</span>
              <span className="font-black text-lg text-slate-950 bg-slate-100 px-3 py-0.5 rounded border border-slate-300 font-mono">
                {formatBDT(activeTxn?.amount)}
              </span>
            </div>
            <div className="md:col-span-2 flex items-baseline gap-2">
              <span className="font-bold text-slate-700 shrink-0">In Words:</span>
              <span className="font-semibold text-slate-900 italic capitalize">
                {numberToWords(activeTxn?.amount)}
              </span>
            </div>
          </div>

          {/* Payment Method & Project Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-dashed border-slate-300 pb-2">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-slate-700 shrink-0">Payment Method:</span>
              <span className="font-medium text-slate-900">
                {isTransfer 
                  ? `Bank Transfer (${account?.name} to ${toAccount?.name})`
                  : `${account?.name || activeTxn?.accountId} ${activeTxn?.note ? `(${activeTxn.note})` : ''}`}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-slate-700 shrink-0">Project / Site:</span>
              <span className="font-medium text-slate-900">
                {project ? `${project.id} - ${project.name}` : 'General Office / Overhead'}
              </span>
            </div>
          </div>

          {/* On Account Of / Description */}
          <div className="border-b border-dashed border-slate-300 pb-3">
            <div className="font-bold text-slate-700 mb-1">{onAccountLabel}:</div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium min-h-[50px]">
              {activeTxn?.description}
            </div>
          </div>
        </div>

        {/* Official 3-Part Signature Blocks */}
        <div className="pt-20 mt-8 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="border-t border-slate-700 pt-2 font-semibold text-slate-800">
              Prepared By
            </div>
          </div>

          <div>
            <div className="border-t border-slate-700 pt-2 font-semibold text-slate-800">
              Checked By (Engineer)
            </div>
          </div>

          <div>
            <div className="border-t border-slate-700 pt-2 font-bold text-slate-900 uppercase">
              Managing Director (Approved)
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <div>Generated by ASIA ENGINEERS Cloud ERP Software</div>
          <div>Printed on: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};
