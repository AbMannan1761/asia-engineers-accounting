import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpenCheck,
  PlusCircle,
  Phone,
  MessageSquare,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  X,
  Edit2,
  Trash2
} from 'lucide-react';
import { formatBDT } from '../../utils/formatters';

export const LedgersView = () => {
  const { language, data, addLedger, updateLedger, deleteLedger } = useApp();

  const [activeTab, setActiveTab] = useState('clients'); // clients | suppliers
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'client',
    phone: '',
    address: '',
    totalBilled: '',
    totalReceived: '',
    totalPurchased: '',
    totalPaid: '',
    dueBalance: ''
  });

  const handleAddLedger = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(language === 'bn' ? 'নাম লিখুন!' : 'Please enter name!');
      return;
    }
    addLedger(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      type: 'client',
      phone: '',
      address: '',
      totalBilled: '',
      totalReceived: '',
      totalPurchased: '',
      totalPaid: '',
      dueBalance: ''
    });
  };

  const clients = data.ledgers.filter(l => l.type === 'client');
  const suppliers = data.ledgers.filter(l => l.type === 'supplier');

  const activeList = (activeTab === 'clients' ? clients : suppliers).filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) || item.phone?.toLowerCase().includes(q) || item.address?.toLowerCase().includes(q);
  });

  // Generate WhatsApp reminder link
  const getWhatsAppLink = (party) => {
    const cleanPhone = (party.phone || '').replace(/[^0-9]/g, '');
    const recipient = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const msg = encodeURIComponent(
      `শ্রদ্ধেয় ${party.name}, শুভেচ্ছা জানবেন। এশিয়া ইঞ্জিনিয়ার্স (ASIA ENGINEERS)-এর স্টিল স্ট্রাকচার প্রজেক্টের আপনার বকেয়া বিলের পরিমাণ: ${formatBDT(party.dueBalance)}। অনুগ্রহ করে বকেয়া পরিশোধের ব্যবস্থা গ্রহণ করবেন। ধন্যবাদ - Engr. M. A. Hannan (Managing Director, 01830002040)`
    );
    return `https://wa.me/${recipient}?text=${msg}`;
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'ক্লায়েন্ট ও সাপ্লায়ার খাতা (Ledger)' : 'Client & Supplier Ledgers'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' 
              ? 'গ্রাহক থেকে পাওনা (Receivables) এবং সাপ্লায়ার দেনা (Payables) স্টেটমেন্ট' 
              : 'Track party balance ledgers, receivables aging, and WhatsApp reminder triggers'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন খাতা খুলুন' : '+ New Party Ledger'}</span>
        </button>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'clients' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'ক্লায়েন্ট পাওনা খাতা (Receivables)' : 'Client Receivables'}
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'suppliers' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'সাপ্লায়ার দেনা খাতা (Payables)' : 'Supplier Payables'}
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'নাম বা মোবাইল খুঁজুন...' : 'Search party, phone...'}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Party Name</th>
                <th className="py-3 px-3">{language === 'bn' ? 'যোগাযোগ ও ঠিকানা' : 'Contact & Address'}</th>
                {activeTab === 'clients' ? (
                  <>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট বিল (Billed)' : 'Total Billed'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট জমা (Received)' : 'Total Received'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'বকেয়া পাওনা (Due)' : 'Outstanding Due'}</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট ক্রয় (Purchased)' : 'Total Purchased'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট পরিশোধ (Paid)' : 'Total Paid'}</th>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'প্রদেয় দেনা (Payable)' : 'Balance Payable'}</th>
                  </>
                )}
                <th className="py-3 px-3 text-center">{language === 'bn' ? 'তাকাদা / রিমাইন্ডার' : 'Reminder'}</th>
                <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activeList.map((party) => {
                const hasDue = (party.dueBalance || 0) > 0;
                return (
                  <tr key={party.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs">{party.name}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">{party.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{party.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{party.address}</div>
                    </td>

                    {activeTab === 'clients' ? (
                      <>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">{formatBDT(party.totalBilled)}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400">{formatBDT(party.totalReceived)}</td>
                        <td className="py-3 px-3 text-right font-bold text-amber-400 font-mono text-xs">
                          {formatBDT(party.dueBalance)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-3 text-right font-mono text-slate-300">{formatBDT(party.totalPurchased)}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400">{formatBDT(party.totalPaid)}</td>
                        <td className="py-3 px-3 text-right font-bold text-rose-400 font-mono text-xs">
                          {formatBDT(party.dueBalance)}
                        </td>
                      </>
                    )}

                    <td className="py-3 px-3 text-center">
                      {hasDue ? (
                        <a
                          href={getWhatsAppLink(party)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold transition"
                          title="Send WhatsApp Payment Due Notice"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-medium">Cleared</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingLedger({ ...party })}
                          className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs"
                          title={language === 'bn' ? 'খাতা এডিট করুন' : 'Edit Ledger'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত "${party.name}" খাতাটি মুছে ফেলতে চান?` : `Delete ledger "${party.name}"?`)) {
                              deleteLedger(party.id);
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

      {/* Modal: Add New Party Ledger */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'নতুন পার্টি লেজার খাতা' : 'Add New Party Ledger'}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLedger} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: 'client' }))}
                  className={`py-2 rounded-lg font-bold transition ${
                    formData.type === 'client' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'bn' ? 'ক্লায়েন্ট (পাওনা)' : 'Client (Receivable)'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: 'supplier' }))}
                  className={`py-2 rounded-lg font-bold transition ${
                    formData.type === 'supplier' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {language === 'bn' ? 'সাপ্লায়ার (দেনা)' : 'Supplier (Payable)'}
                </button>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Company Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anwar Galvanizing Ltd"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোবাইল / হোয়াটসঅ্যাপ নম্বর' : 'Phone / WhatsApp'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 018XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ঠিকানা' : 'Address'}</label>
                <input
                  type="text"
                  placeholder="e.g. Baizid Industrial Area, Chattogram"
                  value={formData.address}
                  onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রারম্ভিক বকেয়া ব্যালেন্স (৳)' : 'Opening Due Balance'}</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={formData.dueBalance}
                  onChange={(e) => setFormData(p => ({ ...p, dueBalance: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg">
                  {language === 'bn' ? 'খাতা তৈরি করুন' : 'Create Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Edit Party Ledger */}
      {editingLedger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? `খাতা এডিট ও আপডেট (${editingLedger.name})` : `Edit Ledger (${editingLedger.name})`}</span>
              </h3>
              <button onClick={() => setEditingLedger(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateLedger(editingLedger.id, editingLedger);
                setEditingLedger(null);
              }}
              className="p-5 space-y-3.5 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Company Name'} *</label>
                <input
                  type="text"
                  required
                  value={editingLedger.name}
                  onChange={(e) => setEditingLedger(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোবাইল / হোয়াটসঅ্যাপ' : 'Phone / WhatsApp'} *</label>
                <input
                  type="text"
                  required
                  value={editingLedger.phone || ''}
                  onChange={(e) => setEditingLedger(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ঠিকানা' : 'Address'}</label>
                <input
                  type="text"
                  value={editingLedger.address || ''}
                  onChange={(e) => setEditingLedger(p => ({ ...p, address: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {editingLedger.type === 'client' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোট বিল (Billed)' : 'Total Billed'}</label>
                    <input
                      type="number"
                      value={editingLedger.totalBilled || 0}
                      onChange={(e) => setEditingLedger(p => ({ ...p, totalBilled: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোট প্রাপ্তি (Received)' : 'Total Received'}</label>
                    <input
                      type="number"
                      value={editingLedger.totalReceived || 0}
                      onChange={(e) => setEditingLedger(p => ({ ...p, totalReceived: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোট ক্রয় (Purchased)' : 'Total Purchased'}</label>
                    <input
                      type="number"
                      value={editingLedger.totalPurchased || 0}
                      onChange={(e) => setEditingLedger(p => ({ ...p, totalPurchased: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মোট পরিশোধ (Paid)' : 'Total Paid'}</label>
                    <input
                      type="number"
                      value={editingLedger.totalPaid || 0}
                      onChange={(e) => setEditingLedger(p => ({ ...p, totalPaid: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'বর্তমান বকেয়া ব্যালেন্স (৳)' : 'Due Balance'}</label>
                <input
                  type="number"
                  value={editingLedger.dueBalance || 0}
                  onChange={(e) => setEditingLedger(p => ({ ...p, dueBalance: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold font-mono text-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত "${editingLedger.name}" খাতাটি মুছে ফেলতে চান?` : `Delete ledger "${editingLedger.name}"?`)) {
                      deleteLedger(editingLedger.id);
                      setEditingLedger(null);
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
                    onClick={() => setEditingLedger(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                  >
                    {language === 'bn' ? 'আপডেট সেভ করুন' : 'Update Ledger'}
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
