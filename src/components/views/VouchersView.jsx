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
  ArrowLeftRight,
  Maximize2
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
  const [paperSize, setPaperSize] = useState('A5'); // A4 | A5

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
    ? (language === 'bn' ? 'টাকা প্রাপ্তি' : 'Received from')
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
      {/* Injected Print Stylesheet for A4 / A5 Paper */}
      <style>{`
        @media print {
          @page {
            size: ${paperSize} portrait;
            margin: ${paperSize === 'A4' ? '10mm 12mm' : '5mm 6mm'};
          }
          /* Hide all application navigation, controls, and external browser extension widgets */
          header,
          aside,
          nav,
          footer,
          .no-print,
          button,
          input,
          select,
          textarea,
          body > iframe,
          body > *:not(#root) {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
          }
          body, html, #root, #root > div, main, main > div {
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            display: block !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
          }
          .printable-voucher-card {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 1.5px solid #0f172a !important;
            border-radius: 6px !important;
            padding: ${paperSize === 'A4' ? '18px 24px' : '14px 18px'} !important;
            background: #ffffff !important;
            color: #0f172a !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* Header & Controls (Hidden in Print) */}
      <div className="no-print space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>{language === 'bn' ? `ডেবিট ও ক্রেডিট ভাউচার প্রিন্ট প্রিভিউ (${paperSize})` : `Debit & Credit Voucher Printing (${paperSize})`}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'bn'
                ? `অফিসিয়াল ${paperSize} প্রিন্ট লেআউট, টাকার অংক কথায় ও স্বাক্ষরের স্থান`
                : `Standard ${paperSize} print format with amount in words and official signature blocks`}
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

            {/* Print Button (A4 / A5) */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition"
              title={`Print voucher on ${paperSize} size paper`}
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'bn' ? `প্রিন্ট করুন (${paperSize})` : `Print Voucher (${paperSize})`}</span>
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
                className={`px-2.5 py-1 rounded-lg font-medium transition ${filterType === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                {language === 'bn' ? 'সকল' : 'All'}
              </button>
              <button
                onClick={() => setFilterType('debit')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${filterType === 'debit'
                  ? 'bg-rose-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>{language === 'bn' ? 'ডেবিট ভাউচার (ব্যয়)' : 'Debit Vouchers'}</span>
              </button>
              <button
                onClick={() => setFilterType('credit')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${filterType === 'credit'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{language === 'bn' ? 'ক্রেডিট ভাউচার (জমা)' : 'Credit Vouchers'}</span>
              </button>
              <button
                onClick={() => setFilterType('transfer')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${filterType === 'transfer'
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>{language === 'bn' ? 'জার্নাল ভাউচার' : 'Journal'}</span>
              </button>
            </div>
          </div>

          {/* Right: Print Title Format & A5 Orientation Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Paper Size Switcher: A4 or A5 */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold">{language === 'bn' ? 'সাইজ:' : 'Paper:'}</span>
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1 text-[11px]">
                <button
                  onClick={() => setPaperSize('A4')}
                  className={`px-3 py-1 rounded-lg transition font-bold ${paperSize === 'A4'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                  title="A4 Size Paper (Full Sheet)"
                >
                  A4
                </button>
                <button
                  onClick={() => setPaperSize('A5')}
                  className={`px-3 py-1 rounded-lg transition font-bold ${paperSize === 'A5'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                    }`}
                  title="A5 Size Paper (Standard Voucher Pad)"
                >
                  A5
                </button>
              </div>
            </div>

            {/* Heading Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold">
                {language === 'bn' ? 'হেডিং:' : 'Title:'}
              </span>
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-1 text-[11px]">
                <button
                  onClick={() => setSelectedTitleMode('auto')}
                  className={`px-2 py-1 rounded-lg transition ${selectedTitleMode === 'auto'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                    }`}
                  title="Automatically match Debit / Credit"
                >
                  {language === 'bn' ? 'Auto' : 'Auto'}
                </button>
                <button
                  onClick={() => setSelectedTitleMode('debit')}
                  className={`px-2 py-1 rounded-lg transition ${selectedTitleMode === 'debit'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {language === 'bn' ? 'ডেবিট' : 'Debit'}
                </button>
                <button
                  onClick={() => setSelectedTitleMode('credit')}
                  className={`px-2 py-1 rounded-lg transition ${selectedTitleMode === 'credit'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {language === 'bn' ? 'ক্রেডিট' : 'Credit'}
                </button>
                <button
                  onClick={() => setSelectedTitleMode('receipt')}
                  className={`px-2 py-1 rounded-lg transition ${selectedTitleMode === 'receipt'
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {language === 'bn' ? 'রিসিট' : 'Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Voucher Paper Card (A4 / A5 Canvas) */}
      <div className={`printable-voucher-card bg-white text-slate-900 rounded-2xl p-5 sm:p-7 shadow-2xl mx-auto border border-slate-300 transition-all ${paperSize === 'A4' ? 'max-w-2xl' : 'max-w-xl'
        }`}>
        {/* Company Header */}
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Brand Logo on top, Address & Contact directly underneath */}
            <div className="flex flex-col items-start gap-1.5">
              <div className="h-12 px-2.5 py-1 bg-[#07192f] border border-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <img
                  src="./images/asia_engineers_logo.png"
                  alt="Asia Engineers"
                  className="h-9 object-contain"
                />
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 leading-snug mt-0.5">
                <div className="font-medium text-slate-700">
                  <div>CJKS Shopping Complex (Room 3028),</div>
                  <div>Kajir Dewri, Chattogram-4217, Bangladesh</div>
                </div>
                <div className="mt-0.5">
                  Phone: <span className="font-semibold text-slate-900">{COMPANY_INFO.phone}</span> | Web: <span className="font-semibold text-slate-900">{COMPANY_INFO.website}</span>
                </div>
              </div>
            </div>

            {/* Voucher Title & Number Box */}
            <div className="text-right shrink-0">
              <span className={`inline-block px-2.5 py-1 text-[11px] sm:text-xs font-black uppercase rounded border tracking-wide ${titleInfo.color}`}>
                {titleInfo.badgeEn}
              </span>
              <div className="text-[10px] font-bold text-slate-700 mt-0.5">
                {titleInfo.badgeBn}
              </div>
              <div className="text-xs sm:text-sm font-mono font-black text-slate-900 mt-1">
                Voucher No: {activeTxn?.voucherNo}
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Date: <span className="font-bold text-slate-900">{formatDate(activeTxn?.date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Fields Body (Optimized for A5) */}
        <div className="space-y-3 text-xs sm:text-sm">
          {/* Party row */}
          <div className="flex items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
            <span className="font-bold text-slate-700 w-48 shrink-0">{partyLabel}:</span>
            <span className="font-bold text-sm sm:text-base text-slate-950 uppercase">
              {isTransfer
                ? `${account?.name || activeTxn?.accountId} ➔ ${toAccount?.name || activeTxn?.toAccountId}`
                : activeTxn?.party}
            </span>
          </div>

          {/* Amount In Figures */}
          <div className="flex items-center gap-3 border-b border-dashed border-slate-300 pb-2">
            <span className="font-bold text-slate-700 shrink-0">
              {language === 'bn' ? 'টাকার পরিমাণ (অংকে):' : 'Amount in Figures:'}
            </span>
            <span className="font-black text-base sm:text-lg text-slate-950 bg-slate-100 px-3 py-1 rounded border border-slate-400 font-mono shadow-2xs">
              {formatBDT(activeTxn?.amount)}
            </span>
          </div>

          {/* Amount In Words (Dedicated row below figures) */}
          <div className="flex items-start sm:items-center gap-2 border-b border-dashed border-slate-300 pb-2">
            <span className="font-bold text-slate-700 shrink-0">
              {language === 'bn' ? 'টাকার পরিমাণ (কথায়):' : 'Amount in Words:'}
            </span>
            <span className="font-semibold text-slate-950 italic capitalize text-xs sm:text-sm bg-slate-50 px-2.5 py-1 rounded border border-slate-200 flex-1">
              {numberToWords(activeTxn?.amount)}
            </span>
          </div>

          {/* Payment Method */}
          <div className="flex items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
            <span className="font-bold text-slate-700 shrink-0">
              {language === 'bn' ? 'পেমেন্ট মাধ্যম (Payment Method):' : 'Payment Method:'}
            </span>
            <span className="font-medium text-slate-900">
              {isTransfer
                ? `Bank Transfer (${account?.name} to ${toAccount?.name})`
                : `${account?.name || activeTxn?.accountId} ${activeTxn?.note ? `(${activeTxn.note})` : ''}`}
            </span>
          </div>

          {/* Project / Site */}
          <div className="flex items-baseline gap-2 border-b border-dashed border-slate-300 pb-2">
            <span className="font-bold text-slate-700 shrink-0">
              {language === 'bn' ? 'প্রজেক্ট / সাইট (Project / Site):' : 'Project / Site:'}
            </span>
            <span className="font-medium text-slate-900">
              {project ? `${project.id} - ${project.name}` : 'General Office / Overhead'}
            </span>
          </div>

          {/* On Account Of / Description */}
          <div className="border-b border-dashed border-slate-300 pb-2.5">
            <div className="font-bold text-slate-700 mb-0.5">{onAccountLabel}:</div>
            <div className="p-2 sm:p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-900 font-medium min-h-[36px] text-[11px] sm:text-xs">
              {activeTxn?.description}
            </div>
          </div>
        </div>

        {/* Official 3-Part Signature Blocks (Generous Signing Space, 1-Page Fit) */}
        <div className="pt-16 sm:pt-20 mt-4 grid grid-cols-3 gap-4 text-center text-[11px] sm:text-xs">
          <div>
            <div className="border-t border-slate-700 pt-1.5 font-semibold text-slate-800">
              Prepared By
            </div>
          </div>

          <div>
            <div className="border-t border-slate-700 pt-1.5 font-semibold text-slate-800">
              Checked By (Engineer)
            </div>
          </div>

          <div>
            <div className="border-t border-slate-700 pt-1.5 font-bold text-slate-900 uppercase">
              Managing Director (Approved)
            </div>
          </div>
        </div>

        {/* Footer Note (Anchored at very bottom) */}
        <div className="mt-6 pt-1.5 border-t border-slate-200 flex items-center justify-between gap-2 text-[8px] sm:text-[9px] text-slate-500 whitespace-nowrap">
          <span className="truncate">Generated by ASIA ENGINEERS Cloud ERP</span>
          <span className="shrink-0">
            Printed: {new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} ({paperSize})
          </span>
        </div>
      </div>
    </div>
  );
};
