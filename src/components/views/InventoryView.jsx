import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  X,
  FileCheck2,
  Calendar
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';

export const InventoryView = () => {
  const { language, data, recordStockMovement, addMaterial } = useApp();

  const [activeTab, setActiveTab] = useState('stock'); // stock | movements
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showOutwardModal, setShowOutwardModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Movement Form
  const [movData, setMovData] = useState({
    materialId: data.materials[0]?.id || '',
    qty: '',
    rate: '',
    supplier: '',
    projectId: '',
    date: new Date().toISOString().slice(0, 10),
    note: ''
  });

  // New Material Form
  const [newMatData, setNewMatData] = useState({
    code: '',
    name: '',
    category: 'MS Plate',
    specification: '',
    unit: 'Ton',
    currentStock: '0',
    minStockAlert: '1',
    unitPriceAvg: '110000',
    warehouse: 'Central Steel Yard, CTG'
  });

  const handleInwardSubmit = (e) => {
    e.preventDefault();
    if (!movData.qty || Number(movData.qty) <= 0) {
      alert(language === 'bn' ? 'সঠিক পরিমাণ (Quantity) লিখুন!' : 'Please enter valid quantity!');
      return;
    }
    recordStockMovement({
      ...movData,
      type: 'inward'
    });
    setShowInwardModal(false);
    setMovData({
      materialId: data.materials[0]?.id || '',
      qty: '',
      rate: '',
      supplier: '',
      projectId: '',
      date: new Date().toISOString().slice(0, 10),
      note: ''
    });
  };

  const handleOutwardSubmit = (e) => {
    e.preventDefault();
    if (!movData.qty || Number(movData.qty) <= 0) {
      alert(language === 'bn' ? 'সঠিক পরিমাণ (Quantity) লিখুন!' : 'Please enter valid quantity!');
      return;
    }
    const success = recordStockMovement({
      ...movData,
      type: 'outward'
    });
    if (success) {
      setShowOutwardModal(false);
      setMovData({
        materialId: data.materials[0]?.id || '',
        qty: '',
        rate: '',
        supplier: '',
        projectId: '',
        date: new Date().toISOString().slice(0, 10),
        note: ''
      });
    }
  };

  const handleAddMaterialSubmit = (e) => {
    e.preventDefault();
    if (!newMatData.name.trim() || !newMatData.code.trim()) {
      alert(language === 'bn' ? 'নাম ও কোড দিন!' : 'Please enter name and code!');
      return;
    }
    addMaterial(newMatData);
    setShowAddMaterialModal(false);
  };

  const filteredMaterials = data.materials.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
  });

  const totalStockValuation = data.materials.reduce((sum, m) => sum + (m.currentStock * m.unitPriceAvg), 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'স্টিল মালামাল ও ইনভেন্টরি স্টক' : 'Steel Stock & Inventory'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' 
              ? 'MS Plate, I-Beam, Channel, Angle, Bolt-Nut, Electrode এবং সাইট ইস্যু ট্র্যাকিং' 
              : 'Steel materials stock balance, inward purchases, site outward issues and valuation'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowInwardModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{language === 'bn' ? '+ মালামাল গ্রহণ (Inward)' : '+ Stock Inward'}</span>
          </button>

          <button
            onClick={() => setShowOutwardModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-2 rounded-xl shadow transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{language === 'bn' ? '- সাইটে ইস্যু (Outward)' : '- Issue to Site'}</span>
          </button>

          <button
            onClick={() => setShowAddMaterialModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl shadow transition"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>{language === 'bn' ? '+ নতুন আইটেম' : '+ New Item'}</span>
          </button>
        </div>
      </div>

      {/* Inventory Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="text-xs text-slate-400">{language === 'bn' ? 'মোট বর্তমান স্টক মূল্য' : 'Total Stock Valuation'}</div>
          <div className="text-xl font-black text-amber-400 mt-1">{formatBDT(totalStockValuation)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{data.materials.length} {language === 'bn' ? 'টি আইটেম নিবন্ধিত' : 'Catalog Items'}</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="text-xs text-slate-400">{language === 'bn' ? 'লো-স্টক সতর্কবার্তা' : 'Low Stock Alerts'}</div>
          <div className="text-xl font-black text-rose-400 mt-1">
            {data.materials.filter(m => m.currentStock <= m.minStockAlert).length} {language === 'bn' ? 'টি আইটেম' : 'Items'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{language === 'bn' ? 'পুনরায় ক্রয়ের প্রয়োজন' : 'Reorder recommended'}</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="text-xs text-slate-400">{language === 'bn' ? 'স্টক মুভমেন্ট রেকর্ড' : 'Movement Records'}</div>
          <div className="text-xl font-black text-blue-400 mt-1">{data.stockMovements.length} {language === 'bn' ? 'টি' : 'Logs'}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{language === 'bn' ? 'ইনওয়ার্ড ও আউটওয়ার্ড চালান' : 'Inward & Outward challans'}</div>
        </div>
      </div>

      {/* View Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'stock' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'বর্তমান স্টক রেজিস্টার' : 'Current Stock Register'}
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'movements' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'bn' ? 'মালামাল আনা-নেওয়ার ইতিহাস (Logs)' : 'Movement History'}
          </button>
        </div>

        {activeTab === 'stock' && (
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'মালামালের নাম বা কোড খুঁজুন...' : 'Search item name, code...'}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Current Stock Register Table */}
      {activeTab === 'stock' ? (
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Item Code</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'মালামালের বিবরণ / সাইজ' : 'Material & Specs'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'বর্তমান স্টক' : 'Stock Qty'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'মিনিমাম অ্যালার্ট' : 'Min Alert'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'গড় দর (৳)' : 'Avg Rate'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'মোট মূল্য (৳)' : 'Total Value'}</th>
                  <th className="py-3 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredMaterials.map((mat) => {
                  const isLow = mat.currentStock <= mat.minStockAlert;
                  const totalVal = Math.round(mat.currentStock * mat.unitPriceAvg);

                  return (
                    <tr key={mat.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">{mat.code}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{mat.name}</div>
                        <div className="text-[11px] text-slate-400">{mat.specification}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 text-[11px]">
                          {mat.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-white text-xs">
                        {mat.currentStock} {mat.unit}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {mat.minStockAlert} {mat.unit}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300 font-mono">
                        {formatBDT(mat.unitPriceAvg)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-300 font-mono">
                        {formatBDT(totalVal)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                            Available
                          </span>
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
        /* Tab 2: Stock Movements History */
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-700/80 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Challan / Voucher</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'ধরন' : 'Type'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'মালামাল' : 'Material'}</th>
                  <th className="py-3 px-3 text-right">{language === 'bn' ? 'পরিমাণ' : 'Quantity'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'সাপ্লায়ার / সাইট প্রজেক্ট' : 'Supplier / Project'}</th>
                  <th className="py-3 px-3">{language === 'bn' ? 'নোট' : 'Notes'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.stockMovements.map((mov) => {
                  const isInward = mov.type === 'inward';
                  const project = data.projects.find(p => p.id === mov.projectId);
                  return (
                    <tr key={mov.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">{mov.voucherNo}</td>
                      <td className="py-3 px-3 text-slate-300">{formatDate(mov.date)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isInward ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {isInward ? 'INWARD (ক্রয়)' : 'OUTWARD (সাইট)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{mov.materialName}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        {isInward ? '+' : '-'}{mov.qty} {mov.unit}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {isInward ? (
                          <span>{mov.supplier}</span>
                        ) : (
                          <span className="text-amber-400 font-mono">{project ? project.id : 'Site'}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{mov.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Stock Inward (Purchase) */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'মালামাল ক্রয় ও গোডাউনে এন্ট্রি (Inward)' : 'Record Stock Inward (Purchase)'}</span>
              </h3>
              <button onClick={() => setShowInwardModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInwardSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মালামাল নির্বাচন' : 'Material Item'} *</label>
                <select
                  value={movData.materialId}
                  onChange={(e) => setMovData(p => ({ ...p, materialId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {data.materials.map(m => (
                    <option key={m.id} value={m.id}>{m.code} - {m.name} ({m.unit})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্রয়ের পরিমাণ' : 'Quantity'} *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5"
                    value={movData.qty}
                    onChange={(e) => setMovData(p => ({ ...p, qty: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'দর / রেট (৳)' : 'Unit Rate'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 115000"
                    value={movData.rate}
                    onChange={(e) => setMovData(p => ({ ...p, rate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সাপ্লায়ার / মিল' : 'Supplier Name'}</label>
                <input
                  type="text"
                  placeholder="e.g. BSRM Steels Ltd"
                  value={movData.supplier}
                  onChange={(e) => setMovData(p => ({ ...p, supplier: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'নোট / চালান নম্বর' : 'Challan # / Notes'}</label>
                <input
                  type="text"
                  placeholder="e.g. Challan #BSRM-9021 from Sitakunda yard"
                  value={movData.note}
                  onChange={(e) => setMovData(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowInwardModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg">
                  {language === 'bn' ? 'স্টকে যোগ করুন' : 'Confirm Inward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Stock Outward (Issue to Site) */}
      {showOutwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'প্রজেক্ট সাইটে মালামাল ইস্যু (Outward)' : 'Issue Material to Project Site'}</span>
              </h3>
              <button onClick={() => setShowOutwardModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOutwardSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মালামাল নির্বাচন' : 'Material Item'} *</label>
                <select
                  value={movData.materialId}
                  onChange={(e) => setMovData(p => ({ ...p, materialId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {data.materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name} (Stock: {m.currentStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কোন প্রজেক্ট সাইটে ইস্যু' : 'Target Project'} *</label>
                <select
                  required
                  value={movData.projectId}
                  onChange={(e) => setMovData(p => ({ ...p, projectId: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">{language === 'bn' ? '-- প্রজেক্ট বেছে নিন --' : '-- Select Project --'}</option>
                  {data.projects.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ইস্যুর পরিমাণ' : 'Issue Quantity'} *</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 2.5"
                  value={movData.qty}
                  onChange={(e) => setMovData(p => ({ ...p, qty: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ব্যবহারের বিবরণ / সাইট নোট' : 'Issue Notes'}</label>
                <input
                  type="text"
                  placeholder="e.g. Roof truss column connection"
                  value={movData.note}
                  onChange={(e) => setMovData(p => ({ ...p, note: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowOutwardModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg">
                  {language === 'bn' ? 'ইস্যু সম্পন্ন করুন' : 'Confirm Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Material */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'নতুন স্টিল মালামাল ক্যাটালগে যুক্ত করুন' : 'Add New Material Catalog'}</span>
              </h3>
              <button onClick={() => setShowAddMaterialModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'আইটেম কোড' : 'Item Code'} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ST-PL-20"
                    value={newMatData.code}
                    onChange={(e) => setNewMatData(p => ({ ...p, code: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={newMatData.category}
                    onChange={(e) => setNewMatData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="MS Plate">MS Plate</option>
                    <option value="I-Beam">I-Beam</option>
                    <option value="Channel">Channel</option>
                    <option value="Angle">Angle</option>
                    <option value="Flat Bar">Flat Bar</option>
                    <option value="Pipe">Pipe</option>
                    <option value="Profile Sheet">Profile Sheet</option>
                    <option value="Bolt-Nut">Bolt-Nut</option>
                    <option value="Electrode">Electrode</option>
                    <option value="Paint">Paint</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'মালামালের পূর্ণ নাম' : 'Material Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MS Plate 20mm (Grade A36)"
                  value={newMatData.name}
                  onChange={(e) => setNewMatData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'স্পেসিফিকেশন / মাপ' : 'Specification'}</label>
                <input
                  type="text"
                  placeholder="e.g. 20mm x 1500mm x 6000mm"
                  value={newMatData.specification}
                  onChange={(e) => setNewMatData(p => ({ ...p, specification: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'একক (Unit)' : 'Unit'}</label>
                  <select
                    value={newMatData.unit}
                    onChange={(e) => setNewMatData(p => ({ ...p, unit: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Ton">Ton</option>
                    <option value="KG">KG</option>
                    <option value="Pcs">Pcs</option>
                    <option value="SFT">SFT</option>
                    <option value="Feet">Feet</option>
                    <option value="Packet">Packet</option>
                    <option value="Drum">Drum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রারম্ভিক স্টক' : 'Initial Stock'}</label>
                  <input
                    type="number"
                    step="any"
                    value={newMatData.currentStock}
                    onChange={(e) => setNewMatData(p => ({ ...p, currentStock: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'অ্যালার্ট লিমিট' : 'Min Alert'}</label>
                  <input
                    type="number"
                    step="any"
                    value={newMatData.minStockAlert}
                    onChange={(e) => setNewMatData(p => ({ ...p, minStockAlert: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddMaterialModal(false)} className="px-4 py-2 rounded-xl text-slate-400 hover:text-white">
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg">
                  {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
