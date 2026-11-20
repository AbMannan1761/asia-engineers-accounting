import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  PlusCircle,
  ArrowLeftRight,
  Search,
  Filter,
  Download,
  Printer,
  Calendar,
  Building,
  Briefcase,
  X,
  FileCheck2,
  Paperclip
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

export const AccountingView = () => {
  const {
    language,
    data,
    addTransaction,
    transferFunds,
    setActiveTab,
    setSelectedVoucherForPrint
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all'); // all | income | expense | transfer
  const [selectedAccountId, setSelectedAccountId] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // New Transaction Form State
  const [formData, setFormData] = useState({
    type: 'income',
    date: new Date().toISOString().slice(0, 10),
    party: '',
    category: 'Client Milestone Bill',
    amount: '',
    accountId: data.accounts[0]?.id || 'acc-cash',
    projectId: '',
    description: '',
    note: ''
  });

  // Transfer Form State
  const [transferData, setTransferData] = useState({
    fromAccountId: data.accounts[0]?.id || 'acc-cash',
    toAccountId: data.accounts[1]?.id || 'acc-city',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: ''
  });

  // Filter transactions
  const filteredTxns = data.transactions.filter(txn => {
    if (activeFilter !== 'all' && txn.type !== activeFilter) return false;
    if (selectedAccountId !== 'all' && txn.accountId !== selectedAccountId && txn.toAccountId !== selectedAccountId) return false;
    if (selectedProjectId !== 'all' && txn.projectId !== selectedProjectId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchVoucher = txn.voucherNo?.toLowerCase().includes(q);
      const matchParty = txn.party?.toLowerCase().includes(q);
      const matchDesc = txn.description?.toLowerCase().includes(q);
      const matchCat = txn.category?.toLowerCase().includes(q);
      if (!matchVoucher && !matchParty && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন!' : 'Please enter a valid amount!');
      return;
    }
    if (!formData.party.trim()) {
      alert(language === 'bn' ? 'পক্ষ / গ্রাহক / ভেন্ডারের নাম দিন!' : 'Please enter party name!');
      return;
    }

    const created = addTransaction(formData);
    setShowAddModal(false);
    // Reset form
    setFormData({
      type: 'income',
      date: new Date().toISOString().slice(0, 10),
      party: '',
      category: 'Client Milestone Bill',
      amount: '',
      accountId: data.accounts[0]?.id || 'acc-cash',
      projectId: '',
      description: '',
      note: ''
    });

    if (window.confirm(language === 'bn' 
      ? `লেনদেন সফলভাবে সংরক্ষণ করা হয়েছে (${created.voucherNo})। আপনি কি ভাউচার প্রিন্ট করতে চান?` 
      : `Transaction saved (${created.voucherNo}). Do you want to print the voucher now?`)) {
      setSelectedVoucherForPrint(created);
      setActiveTab('vouchers');
    }
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (transferData.fromAccountId === transferData.toAccountId) {
      alert(language === 'bn' ? 'উৎস ও গন্তব্য অ্যাকাউন্ট ভিন্ন হতে হবে!' : 'From and To accounts must be different!');
      return;
    }
    const success = transferFunds(transferData);
    if (success) {
      setShowTransferModal(false);
      setTransferData({
        fromAccountId: data.accounts[0]?.id || 'acc-cash',
        toAccountId: data.accounts[1]?.id || 'acc-city',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        description: ''
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'জমা-খরচ ও ব্যাংক হিসাব' : 'Cash & Bank Accounting'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' 
              ? 'প্রতিটি লেনদেনের ক্যাশ, ব্যাংক ও ভাউচার ট্র্যাকিং' 
              : 'Record all daily income, payments, and inter-account transfers'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormData(prev => ({ ...prev, type: 'income', category: 'Client Milestone Bill' }));
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'bn' ? '+ জমা (Receipt)' : '+ Income Receipt'}</span>
          </button>

          <button
            onClick={() => {
              setFormData(prev => ({ ...prev, type: 'expense', category: 'Material Purchase' }));
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'bn' ? '+ খরচ (Payment)' : '+ Payment Voucher'}</span>
          </button>

          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{language === 'bn' ? 'ট্রান্সফার' : 'Transfer'}</span>
          </button>
        </div>
      </div>

      {/* Account Balances Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {data.accounts.map(acc => (
          <div
            key={acc.id}
            onClick={() => setSelectedAccountId(selectedAccountId === acc.id ? 'all' : acc.id)}
            className={`cursor-pointer border rounded-xl p-3 transition-all ${
              selectedAccountId === acc.id 
                ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/30' 
                : 'bg-slate-800/80 border-slate-700/60 hover:border-slate-600'
            }`}
          >
            <div className="text-[11px] text-slate-400 truncate">{acc.name}</div>
            <div className="text-sm font-bold text-white mt-1">{formatBDT(acc.balance)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">{acc.accountNumber}</div>
          </div>
        ))}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Type Tabs */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start">
          {[
            { id: 'all', label: language === 'bn' ? 'সকল' : 'All' },
            { id: 'income', label: language === 'bn' ? 'জমা (Income)' : 'Income' },
            { id: 'expense', label: language === 'bn' ? 'খরচ (Expense)' : 'Expense' },
            { id: 'transfer', label: language === 'bn' ? 'ট্রান্সফার' : 'Transfer' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dropdown Filters & Search Box */}
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">{language === 'bn' ? 'সকল প্রজেক্ট' : 'All Projects'}</option>
            {data.projects.map(p => (
              <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'ভাউচার, বিবরণ বা পক্ষ খুঁজুন...' : 'Search voucher, party...'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Voucher No</th>
                <th className="py-3 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-3 px-3">{language === 'bn' ? 'পক্ষ / বিবরণ' : 'Party & Description'}</th>
                <th className="py-3 px-3">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                <th className="py-3 px-3">{language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}</th>
                <th className="py-3 px-3">{language === 'bn' ? 'প্রজেক্ট' : 'Project'}</th>
                <th className="py-3 px-3 text-right">{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount'}</th>
                <th className="py-3 px-3 text-center">{language === 'bn' ? 'ভাউচার' : 'Print'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    {language === 'bn' ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions found'}
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => {
                  const isIncome = txn.type === 'income';
                  const isTransfer = txn.type === 'transfer';
                  const account = data.accounts.find(a => a.id === txn.accountId);
                  const toAccount = txn.toAccountId ? data.accounts.find(a => a.id === txn.toAccountId) : null;
                  const project = data.projects.find(p => p.id === txn.projectId);

                  return (
                    <tr key={txn.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {txn.voucherNo}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {formatDate(txn.date)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{txn.party}</div>
                        <div className="text-[11px] text-slate-400 max-w-xs truncate">{txn.description}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700/60 text-slate-300 text-[11px]">
                          {txn.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {isTransfer ? (
                          <div className="text-[11px]">
                            <span className="text-rose-400">{account?.name || txn.accountId}</span>
                            <span className="text-slate-500 mx-1">➔</span>
                            <span className="text-emerald-400">{toAccount?.name || txn.toAccountId}</span>
                          </div>
                        ) : (
                          <span>{account?.name || '-'}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {project ? (
                          <span className="text-amber-300 font-mono text-[11px]">
                            {project.id}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className={`py-3 px-3 text-right font-bold text-xs ${
                        isIncome ? 'text-emerald-400' : isTransfer ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                        {isIncome ? '+' : isTransfer ? '⇄ ' : '-'}{formatBDT(txn.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedVoucherForPrint(txn);
                            setActiveTab('vouchers');
                          }}
                          className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                          title="View / Print A4 Voucher"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Income/Expense Transaction */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PlusCircle className={`w-4 h-4 ${formData.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span>
                  {formData.type === 'income' 
                    ? (language === 'bn' ? 'নতুন জমা / মানি রিসিট এন্ট্রি' : 'New Money Receipt (Income)') 
                    : (language === 'bn' ? 'নতুন খরচ / পেমেন্ট ভাউচার এন্ট্রি' : 'New Payment Voucher (Expense)')}
                </span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: 'income', category: 'Client Milestone Bill' }))}
                  className={`py-2 rounded-lg font-bold transition ${
                    formData.type === 'income'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'bn' ? 'জমা (Income / Receipt)' : 'Income Receipt'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: 'expense', category: 'Material Purchase' }))}
                  className={`py-2 rounded-lg font-bold transition ${
                    formData.type === 'expense'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'bn' ? 'খরচ (Expense / Payment)' : 'Expense Voucher'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'তারিখ' : 'Date'} *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {formData.type === 'income' 
                    ? (language === 'bn' ? 'কার কাছ থেকে গ্রহণ (Received From)' : 'Received From (Client/Party)') 
                    : (language === 'bn' ? 'কাকে প্রদান (Paid To / Payee)' : 'Paid To (Vendor/Payee)')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={formData.type === 'income' ? 'e.g. PHP Automobiles Ltd' : 'e.g. BSRM Steels Ltd'}
                  value={formData.party}
                  onChange={(e) => setFormData(p => ({ ...p, party: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'} *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {formData.type === 'income' ? (
                      <>
                        <option value="Client Milestone Bill">Client Milestone Bill</option>
                        <option value="Advance Payment">Advance Payment</option>
                        <option value="Retention Money Release">Retention Money Release</option>
                        <option value="Scrap Steel Sales">Scrap Steel Sales</option>
                        <option value="Other Income">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Material Purchase">Material Purchase (Steel/Plate/Beam)</option>
                        <option value="Labor & Fabrication">Labor & Fabrication Wage</option>
                        <option value="Erection & Crane Rent">Erection & Crane/Equipment</option>
                        <option value="Consumables & Hardware">Consumables & Bolts/Paints</option>
                        <option value="Employee Salary">Employee Salary</option>
                        <option value="Site Transport & Carrying">Transport & Carrying</option>
                        <option value="Office Rent & Utilities">Office Rent & Utilities</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'অ্যাকাউন্ট / পেমেন্ট মেথড' : 'Account'} *</label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData(p => ({ ...p, accountId: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {data.accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({formatBDT(a.balance)})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সংশ্লিষ্ট প্রজেক্ট (ঐচ্ছিক)' : 'Project (Optional)'}</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData(p => ({ ...p, projectId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">{language === 'bn' ? 'কোনো প্রজেক্ট নেই (সাধারণ অফিস ব্যয়/আয়)' : 'No Project (General Office)'}</option>
                  {data.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'বিবরণ / উদ্দেশ্য' : 'Description'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2nd running bill for column erection"
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'নোট / চেক নং / চালান বিবরণ' : 'Notes / Cheque #'}</label>
                <input
                  type="text"
                  placeholder="e.g. Cheque #983204 City Bank"
                  value={formData.note}
                  onChange={(e) => setFormData(p => ({ ...p, note: e.target.value }))}
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
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-lg ${
                    formData.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  {language === 'bn' ? 'সংরক্ষণ ও ভাউচার তৈরি করুন' : 'Save & Generate Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inter-Account Transfer */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                <span>{language === 'bn' ? 'এক অ্যাকাউন্ট থেকে অন্য অ্যাকাউন্টে ট্রান্সফার' : 'Inter-Account Fund Transfer'}</span>
              </h3>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'উৎস অ্যাকাউন্ট (From Account)' : 'From Account'} *</label>
                <select
                  value={transferData.fromAccountId}
                  onChange={(e) => setTransferData(p => ({ ...p, fromAccountId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {data.accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Balance: {formatBDT(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'গন্তব্য অ্যাকাউন্ট (To Account)' : 'To Account'} *</label>
                <select
                  value={transferData.toAccountId}
                  onChange={(e) => setTransferData(p => ({ ...p, toAccountId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {data.accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (Balance: {formatBDT(a.balance)})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ট্রান্সফার পরিমাণ (৳)' : 'Amount (BDT)'} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50000"
                    value={transferData.amount}
                    onChange={(e) => setTransferData(p => ({ ...p, amount: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'তারিখ' : 'Date'} *</label>
                  <input
                    type="date"
                    required
                    value={transferData.date}
                    onChange={(e) => setTransferData(p => ({ ...p, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'বিবরণ / কারণ' : 'Description'}</label>
                <input
                  type="text"
                  placeholder="e.g. Cash withdrawal from bank for site expenses"
                  value={transferData.description}
                  onChange={(e) => setTransferData(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg"
                >
                  {language === 'bn' ? 'ট্রান্সফার সম্পন্ন করুন' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
