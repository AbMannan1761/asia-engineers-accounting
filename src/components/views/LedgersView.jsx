import React, { useState, useEffect } from 'react';
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
  const { language, data, addLedger, updateLedger, deleteLedger, deepLinkFilter, setDeepLinkFilter } = useApp();

  const [activeTab, setActiveTab] = useState('clients'); // clients | suppliers
  const [selectedClientFilter, setSelectedClientFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (deepLinkFilter && deepLinkFilter.tab === 'ledgers') {
      if (deepLinkFilter.ledgerTab) {
        setActiveTab(deepLinkFilter.ledgerTab);
      }
      setDeepLinkFilter(null);
    }
  }, [deepLinkFilter, setDeepLinkFilter]);

  const [formData, setFormData] = useState({
    name: '',
    projectName: '',
    projectId: '',
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
      alert(language === 'bn' ? 'ক্লায়েন্ট বা প্রতিষ্ঠানের নাম লিখুন!' : 'Please enter name!');
      return;
    }
    addLedger(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      projectName: '',
      projectId: '',
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

  // Construct individual Client + Project rows so each project of a client has its own dedicated row
  const clientProjectRows = [];

  // 1. Projects from data.projects
  (data.projects || []).forEach(p => {
    const clientName = (p.client || '').trim();
    if (clientName) {
      const pTxns = (data.transactions || []).filter(t =>
        t.projectId === p.id ||
        (t.projectId && t.projectId.toLowerCase() === p.id.toLowerCase()) ||
        (p.name && t.party && t.party.toLowerCase().includes(p.name.toLowerCase()))
      );
      const txReceived = pTxns.filter(t => t.type === 'income').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const effectiveBilled = Number(p.contractValue) || 0;
      const effectiveReceived = Math.max(Number(p.receivedAmount) || 0, txReceived);
      const effectiveDue = Math.max(0, effectiveBilled - effectiveReceived);

      const matchingLedger = (data.ledgers || []).find(l =>
        l.type === 'client' && (
          l.projectId === p.id ||
          l.id === `LED-${p.id}` ||
          l.name.toLowerCase().trim() === clientName.toLowerCase()
        )
      );

      clientProjectRows.push({
        id: `CP-${p.id}`,
        ledgerId: matchingLedger?.id || `LED-${p.id}`,
        projectId: p.id,
        name: clientName,
        clientName: clientName,
        projectName: p.name,
        category: p.category || 'Steel Structure',
        phone: p.clientPhone || matchingLedger?.phone || '',
        address: p.site || p.location || matchingLedger?.address || '',
        totalBilled: effectiveBilled,
        totalReceived: effectiveReceived,
        dueBalance: effectiveDue,
        status: p.status || 'In Progress',
        isProjectBased: true
      });
    }
  });

  // 2. Any ledger clients without an active project in data.projects
  (data.ledgers || []).filter(l => l.type === 'client').forEach(l => {
    const alreadyIncluded = clientProjectRows.some(r =>
      (l.projectId && r.projectId === l.projectId) ||
      (r.projectName && l.projectName && r.projectName.toLowerCase() === l.projectName.toLowerCase())
    );
    if (!alreadyIncluded) {
      const effectiveBilled = Number(l.totalBilled) || 0;
      const effectiveReceived = Number(l.totalReceived) || 0;
      const effectiveDue = l.dueBalance !== undefined ? Number(l.dueBalance) : Math.max(0, effectiveBilled - effectiveReceived);
      clientProjectRows.push({
        id: l.id,
        ledgerId: l.id,
        projectId: l.projectId || null,
        name: l.name,
        clientName: l.name,
        projectName: l.projectName || (language === 'bn' ? 'সাধারণ খাতা (নির্দিষ্ট প্রজেক্ট নেই)' : 'General / No Project'),
        category: 'General Client',
        phone: l.phone || '',
        address: l.address || '',
        totalBilled: effectiveBilled,
        totalReceived: effectiveReceived,
        dueBalance: effectiveDue,
        status: l.status || 'Active',
        isProjectBased: false
      });
    }
  });

  // Unique clients list for dropdown filter
  const distinctClientNames = Array.from(new Set(clientProjectRows.map(r => r.name))).filter(Boolean);

  // Summary figures
  const totalClientBilled = clientProjectRows.reduce((sum, r) => sum + r.totalBilled, 0);
  const totalClientReceived = clientProjectRows.reduce((sum, r) => sum + r.totalReceived, 0);
  const totalClientDue = clientProjectRows.reduce((sum, r) => sum + r.dueBalance, 0);

  const suppliers = (data.ledgers || []).filter(l => l.type === 'supplier');

  const activeList = (activeTab === 'clients' ? clientProjectRows : suppliers).filter(item => {
    if (activeTab === 'clients' && selectedClientFilter !== 'all' && item.name.toLowerCase() !== selectedClientFilter.toLowerCase()) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.projectName && item.projectName.toLowerCase().includes(q)) ||
      (item.phone && item.phone.toLowerCase().includes(q)) ||
      (item.address && item.address.toLowerCase().includes(q)) ||
      (item.projectId && item.projectId.toLowerCase().includes(q))
    );
  });

  // Generate WhatsApp reminder link mentioning exact project name
  const getWhatsAppLink = (party) => {
    const cleanPhone = (party.phone || '').replace(/[^0-9]/g, '');
    const recipient = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
    const projectText = party.projectName && party.projectName !== 'General / No Project' ? ` "${party.projectName}" প্রজেক্টের` : '';
    const partyName = party.clientName || party.name;
    const msg = encodeURIComponent(
      `শ্রদ্ধেয় ${partyName}, শুভেচ্ছা জানবেন। এশিয়া ইঞ্জিনিয়ার্স (ASIA ENGINEERS)-এর${projectText} আপনার বকেয়া বিলের পরিমাণ: ${formatBDT(party.dueBalance)}। অনুগ্রহ করে বকেয়া পরিশোধের ব্যবস্থা গ্রহণ করবেন। ধন্যবাদ - Engr. M. A. Hannan (Managing Director, 01830002040)`
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
              ? 'প্রতিটি ক্লায়েন্টের প্রজেক্ট-ভিত্তিক বিল, জমা ও বকেয়া পাওনা (Receivables) এবং সাপ্লায়ার দেনা স্টেটমেন্ট' 
              : 'Party balance ledgers, project-wise receivables, and WhatsApp reminder triggers'}
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              projectName: '',
              projectId: '',
              type: activeTab === 'clients' ? 'client' : 'supplier',
              phone: '',
              address: '',
              totalBilled: '',
              totalReceived: '',
              totalPurchased: '',
              totalPaid: '',
              dueBalance: ''
            });
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow transition self-start cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন খাতা খুলুন' : '+ New Party Ledger'}</span>
        </button>
      </div>

      {/* Summary KPI Bar for Clients */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {language === 'bn' ? 'মোট ক্লায়েন্ট ও প্রজেক্ট' : 'Client Projects'}
            </span>
            <div className="font-bold text-white text-sm sm:text-base font-mono mt-0.5">
              {distinctClientNames.length} {language === 'bn' ? 'ক্লায়েন্ট' : 'Clients'} • {clientProjectRows.length} {language === 'bn' ? 'প্রজেক্ট' : 'Projects'}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {language === 'bn' ? 'সর্বমোট বিল (Billed)' : 'Total Billed'}
            </span>
            <div className="font-bold text-slate-200 text-sm sm:text-base font-mono mt-0.5">
              {formatBDT(totalClientBilled)}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-3 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
              {language === 'bn' ? 'সর্বমোট জমা (Received)' : 'Total Received'}
            </span>
            <div className="font-bold text-emerald-400 text-sm sm:text-base font-mono mt-0.5">
              +{formatBDT(totalClientReceived)}
            </div>
          </div>

          <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-3 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
              {language === 'bn' ? 'সর্বমোট বকেয়া পাওনা' : 'Total Due Balance'}
            </span>
            <div className="font-bold text-amber-400 text-sm sm:text-base font-mono mt-0.5">
              {formatBDT(totalClientDue)}
            </div>
          </div>
        </div>
      )}

      {/* View Switcher, Client Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'clients' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'ক্লায়েন্ট পাওনা খাতা (Receivables)' : 'Client Receivables'}
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'suppliers' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'সাপ্লায়ার দেনা খাতা (Payables)' : 'Supplier Payables'}
            </button>
          </div>

          {/* Client Filter Dropdown: easily filter all projects under one client */}
          {activeTab === 'clients' && distinctClientNames.length > 1 && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <label className="text-xs text-slate-400 font-medium whitespace-nowrap">
                {language === 'bn' ? 'ক্লায়েন্ট:' : 'Client:'}
              </label>
              <select
                value={selectedClientFilter}
                onChange={(e) => setSelectedClientFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
              >
                <option value="all">
                  🌐 {language === 'bn' ? `সকল ক্লায়েন্ট (${distinctClientNames.length})` : `All Clients (${distinctClientNames.length})`}
                </option>
                {distinctClientNames.map(cName => {
                  const pCount = clientProjectRows.filter(r => r.name.toLowerCase() === cName.toLowerCase()).length;
                  return (
                    <option key={cName} value={cName}>
                      {cName} ({pCount} {language === 'bn' ? 'টি প্রজেক্ট' : 'Projects'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'clients' ? (language === 'bn' ? 'ক্লায়েন্ট বা প্রজেক্ট খুঁজুন...' : 'Search client, project...') : (language === 'bn' ? 'সাপ্লায়ার নাম খুঁজুন...' : 'Search supplier...')}
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
                <th className="py-3 px-3">{activeTab === 'clients' ? (language === 'bn' ? 'ক্লায়েন্ট নেম (Client Name)' : 'Client Name') : 'Party Name'}</th>
                <th className="py-3 px-3">{language === 'bn' ? 'যোগাযোগ ও সাইট' : 'Contact & Site'}</th>
                {activeTab === 'clients' && (
                  <th className="py-3 px-3">{language === 'bn' ? 'প্রজেক্টের নাম (Project Name)' : 'Project Name'}</th>
                )}
                {activeTab === 'clients' ? (
                  <>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট বিল (Billed)' : 'Total Billed'}</th>
                    <th className="py-3 px-3 text-right text-emerald-400">{language === 'bn' ? 'মোট জমা (Received)' : 'Total Received'}</th>
                    <th className="py-3 px-3 text-right text-amber-400">{language === 'bn' ? 'বকেয়া পাওনা (Due)' : 'Outstanding Due'}</th>
                  </>
                ) : (
                  <>
                    <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট ক্রয় (Purchased)' : 'Total Purchased'}</th>
                    <th className="py-3 px-3 text-right text-emerald-400">{language === 'bn' ? 'মোট পরিশোধ (Paid)' : 'Total Paid'}</th>
                    <th className="py-3 px-3 text-right text-rose-400">{language === 'bn' ? 'প্রদেয় দেনা (Payable)' : 'Balance Payable'}</th>
                  </>
                )}
                <th className="py-3 px-3 text-center">{language === 'bn' ? 'তাকাদা / রিমাইন্ডার' : 'Reminder'}</th>
                <th className="py-3 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activeList.map((party) => {
                const hasDue = (party.dueBalance || 0) > 0;
                const clientProjectsCount = activeTab === 'clients'
                  ? clientProjectRows.filter(r => r.name.toLowerCase() === party.name.toLowerCase()).length
                  : 0;

                return (
                  <tr key={party.id} className="hover:bg-slate-800/50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <span>{party.clientName || party.name}</span>
                        {activeTab === 'clients' && clientProjectsCount > 1 && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold" title={`${clientProjectsCount} projects under this client`}>
                            {clientProjectsCount} {language === 'bn' ? 'টি প্রজেক্ট' : 'prjs'}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {party.projectId || party.id}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{party.phone || '-'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{party.address || '-'}</div>
                    </td>

                    {/* Column 3: Project Name (Dedicated Column per Project) */}
                    {activeTab === 'clients' && (
                      <td className="py-3 px-3">
                        <div className="font-bold text-amber-300 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                          <span className="truncate max-w-xs">{party.projectName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {party.category || 'Steel Structure'} {party.status ? `• ${party.status}` : ''}
                        </div>
                      </td>
                    )}

                    {activeTab === 'clients' ? (
                      <>
                        <td className="py-3 px-3 text-right font-mono text-slate-300 font-semibold">{formatBDT(party.totalBilled)}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">{formatBDT(party.totalReceived)}</td>
                        <td className="py-3 px-3 text-right font-bold text-amber-400 font-mono text-xs">
                          {formatBDT(party.dueBalance)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-3 text-right font-mono text-slate-300 font-semibold">{formatBDT(party.totalPurchased)}</td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">{formatBDT(party.totalPaid)}</td>
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
                          title={language === 'bn' ? `হোয়াটসঅ্যাপে "${party.projectName || party.name}" বকেয়ার তাকাদা পাঠান` : "Send WhatsApp Payment Due Notice"}
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
                          onClick={() => setEditingLedger({
                            id: party.ledgerId || party.id,
                            projectId: party.projectId,
                            name: party.clientName || party.name,
                            projectName: party.projectName || '',
                            type: party.type || 'client',
                            phone: party.phone || '',
                            address: party.address || '',
                            totalBilled: party.totalBilled || 0,
                            totalReceived: party.totalReceived || 0,
                            dueBalance: party.dueBalance || 0
                          })}
                          className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs cursor-pointer"
                          title={language === 'bn' ? 'খাতা এডিট করুন' : 'Edit Ledger'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const itemName = party.projectName ? `${party.name} (${party.projectName})` : party.name;
                            if (window.confirm(language === 'bn' ? `আপনি কি নিশ্চিত "${itemName}" খাতাটি মুছে ফেলতে চান?` : `Delete ledger "${itemName}"?`)) {
                              deleteLedger(party.ledgerId || party.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition shadow-xs cursor-pointer"
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
                <label className="block text-slate-400 mb-1 font-medium">
                  {formData.type === 'client' ? (language === 'bn' ? 'ক্লায়েন্ট / প্রতিষ্ঠানের নাম' : 'Client Name') : (language === 'bn' ? 'সাপ্লায়ার নাম' : 'Supplier Name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={formData.type === 'client' ? "e.g. RFL Group / PHP Automobiles Ltd" : "e.g. BSRM Steels Ltd"}
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {formData.type === 'client' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্টের নাম (Project Name)' : 'Project Name'} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Beam Supply / Lift Core / Plate Cutting"
                    value={formData.projectName || ''}
                    onChange={(e) => setFormData(p => ({ ...p, projectName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {language === 'bn' ? 'ক্লায়েন্টের এই নির্দিষ্ট প্রজেক্টের নাম দিন (যেমন: Beam Supply, Lift Core, ইত্যাদি)' : 'Specific project name under this client'}
                  </span>
                </div>
              )}

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
                <label className="block text-slate-400 mb-1 font-medium">
                  {editingLedger.type === 'client' ? (language === 'bn' ? 'ক্লায়েন্ট / প্রতিষ্ঠানের নাম' : 'Client Name') : (language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Company Name')} *
                </label>
                <input
                  type="text"
                  required
                  value={editingLedger.name}
                  onChange={(e) => setEditingLedger(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              {editingLedger.type === 'client' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্টের নাম (Project Name)' : 'Project Name'} *</label>
                  <input
                    type="text"
                    required
                    value={editingLedger.projectName || ''}
                    onChange={(e) => setEditingLedger(p => ({ ...p, projectName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

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
