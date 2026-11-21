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
  Download
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

  // If no voucher selected, default to the latest transaction
  const activeTxn = selectedVoucherForPrint || data.transactions[0];

  const isIncome = activeTxn?.type === 'income';
  const voucherTitle = isIncome ? 'MONEY RECEIPT (টাকা জমা রিসিট)' : 'PAYMENT VOUCHER (টাকা পরিশোধ ভাউচার)';
  const partyLabel = isIncome ? 'Received with thanks from' : 'Paid in favor of (Payee)';
  const onAccountLabel = isIncome ? 'On Account / Purpose of' : 'Being the payment for';

  const project = data.projects.find(p => p.id === activeTxn?.projectId);
  const account = data.accounts.find(a => a.id === activeTxn?.accountId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header & Controls (Hidden in Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'ভাউচার ও মানি রিসিট প্রিন্ট প্রিভিউ' : 'Voucher & Receipt Printing'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' 
              ? 'অফিসিয়াল A4 প্রিন্ট লেআউট, টাকার অংক কথায় ও স্বাক্ষরের স্থান' 
              : 'Standard A4 print format with amount in words and official signature blocks'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Select Voucher Dropdown */}
          <select
            value={activeTxn?.id}
            onChange={(e) => {
              const found = data.transactions.find(t => t.id === e.target.value);
              if (found) setSelectedVoucherForPrint(found);
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            {data.transactions.map((t) => (
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
              <span className={`inline-block px-3 py-1 text-xs font-extrabold uppercase rounded border ${
                isIncome 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-600' 
                  : 'bg-rose-50 text-rose-800 border-rose-600'
              }`}>
                {voucherTitle}
              </span>
              <div className="text-sm font-mono font-black text-slate-900 mt-2">
                No: {activeTxn?.voucherNo}
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
            <span className="font-bold text-slate-700 w-48 shrink-0">{partyLabel}:</span>
            <span className="font-bold text-base text-slate-950 uppercase">{activeTxn?.party}</span>
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
                {account?.name || activeTxn?.accountId} {activeTxn?.note ? `(${activeTxn.note})` : ''}
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
