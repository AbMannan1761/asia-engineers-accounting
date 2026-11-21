import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Briefcase,
  PlusCircle,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  Clock,
  X,
  FileText,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { formatBDT, formatDate } from '../../utils/formatters';
import { DateInput } from '../common/DateInput';

export const ProjectsView = () => {
  const {
    language,
    data,
    addProject,
    updateProject,
    deleteProject,
    setActiveTab,
    setSelectedVoucherForPrint
  } = useApp();

  const [selectedProject, setSelectedProject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // New Project Form Data
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    clientPhone: '',
    site: '',
    contractValue: '',
    budget: '',
    startDate: new Date().toISOString().slice(0, 10),
    expectedCompletion: '',
    category: 'Industrial Shed',
    status: 'In Progress'
  });

  // Edit Project Form Data
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    client: '',
    clientPhone: '',
    site: '',
    contractValue: '',
    budget: '',
    receivedAmount: '',
    spentAmount: '',
    startDate: '',
    expectedCompletion: '',
    category: 'Industrial Shed',
    status: 'In Progress'
  });

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.client.trim()) {
      alert(language === 'bn' ? 'প্রজেক্টের নাম ও ক্লায়েন্টের নাম লিখুন!' : 'Please enter project and client names!');
      return;
    }
    addProject(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      client: '',
      clientPhone: '',
      site: '',
      contractValue: '',
      budget: '',
      startDate: new Date().toISOString().slice(0, 10),
      expectedCompletion: '',
      category: 'Industrial Shed',
      status: 'In Progress'
    });
  };

  const handleOpenEdit = (project, e) => {
    if (e) e.stopPropagation();
    setEditingProject(project);
    setEditFormData({
      id: project.id,
      name: project.name || '',
      client: project.client || '',
      clientPhone: project.clientPhone || '',
      site: project.site || '',
      contractValue: project.contractValue || '',
      budget: project.budget || '',
      receivedAmount: project.receivedAmount || 0,
      spentAmount: project.spentAmount || 0,
      startDate: project.startDate || '',
      expectedCompletion: project.expectedCompletion || '',
      category: project.category || 'Industrial Shed',
      status: project.status || 'In Progress'
    });
  };

  const handleUpdateProjectSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.client.trim()) {
      alert(language === 'bn' ? 'প্রজেক্ট ও ক্লায়েন্টের নাম আবশ্যক!' : 'Project and client names are required!');
      return;
    }
    updateProject(editFormData.id, editFormData);
    if (selectedProject && selectedProject.id === editFormData.id) {
      setSelectedProject(prev => ({ ...prev, ...editFormData }));
    }
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId, projectName, e) => {
    if (e) e.stopPropagation();
    const confirmMsg = language === 'bn'
      ? `আপনি কি নিশ্চিত "${projectName}" (${projectId}) প্রজেক্টটি মুছে ফেলতে চান?`
      : `Are you sure you want to delete project "${projectName}" (${projectId})?`;
    if (window.confirm(confirmMsg)) {
      deleteProject(projectId);
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span>{language === 'bn' ? 'প্রজেক্ট ম্যানেজমেন্ট ও প্রজেক্ট অ্যাকাউন্টিং' : 'Project Management & Costing'}</span>
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'bn' 
              ? 'প্রতিটি স্টিল স্ট্রাকচার প্রজেক্টের বাজেট, আয়-ব্যয়, লাভ-ক্ষতি এবং এডিট/আপডেট' 
              : 'Track contract values, billing, expenses, profit margin and edit/update project info'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl shadow transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'bn' ? '+ নতুন প্রজেক্ট' : '+ New Project'}</span>
        </button>
      </div>

      {/* Projects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.projects.map((project) => {
          const contractVal = project.contractValue || 0;
          const received = project.receivedAmount || 0;
          const spent = project.spentAmount || 0;
          const dueFromClient = Math.max(0, contractVal - received);
          const currentProfit = received - spent;
          const isSelected = selectedProject?.id === project.id;
          const budgetPercent = project.budget > 0 ? Math.min(100, Math.round((spent / project.budget) * 100)) : 0;

          return (
            <div
              key={project.id}
              onClick={() => setSelectedProject(isSelected ? null : project)}
              className={`relative cursor-pointer rounded-2xl p-5 border transition-all ${
                isSelected 
                  ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/20 shadow-xl' 
                  : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              {/* Header row with Project ID and Action Buttons */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {project.id}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    project.status === 'Completed' 
                      ? 'bg-emerald-500/15 text-emerald-400' 
                      : project.status === 'On Hold'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-blue-500/15 text-blue-400'
                  }`}>
                    {project.status}
                  </span>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleOpenEdit(project, e)}
                    className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 transition shadow-xs"
                    title={language === 'bn' ? 'প্রজেক্ট এডিট করুন' : 'Edit Project'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                    className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 transition shadow-xs"
                    title={language === 'bn' ? 'প্রজেক্ট মুছুন (Delete)' : 'Delete Project'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-white text-base leading-snug line-clamp-1 mb-1">
                {project.name}
              </h3>

              <div className="text-xs text-amber-400 font-medium mb-1">
                {project.client} {project.clientPhone && <span className="text-slate-400 font-normal">({project.clientPhone})</span>}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-4">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{project.site}</span>
              </div>

              {/* Financial Breakdown Table in card */}
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'চুক্তি মূল্য:' : 'Contract:'}</span>
                  <span className="font-bold text-white">{formatBDT(contractVal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'বিল প্রাপ্তি (জমা):' : 'Received:'}</span>
                  <span className="font-bold text-emerald-400">{formatBDT(received)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{language === 'bn' ? 'প্রজেক্ট খরচ (মালামাল+শ্রম):' : 'Spent:'}</span>
                  <span className="font-bold text-rose-400">{formatBDT(spent)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-300 font-medium">{language === 'bn' ? 'বর্তমান নিট মার্জিন:' : 'Net Margin:'}</span>
                  <span className={`font-bold ${currentProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatBDT(currentProfit)}
                  </span>
                </div>
              </div>

              {/* Budget Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>{language === 'bn' ? 'বাজেট ব্যবহার' : 'Budget Spent'}</span>
                  <span className="font-mono">{budgetPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${budgetPercent > 90 ? 'bg-rose-500' : 'bg-amber-400'}`}
                    style={{ width: `${budgetPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px]">
                <button
                  onClick={(e) => handleOpenEdit(project, e)}
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{language === 'bn' ? 'এডিট করুন' : 'Edit'}</span>
                </button>
                <span className="text-slate-400 hover:text-white font-semibold">
                  {isSelected 
                    ? (language === 'bn' ? 'লেজার বন্ধ করুন ▲' : 'Close Details ▲') 
                    : (language === 'bn' ? 'লেজার ও ভাউচার দেখুন ▼' : 'View Ledger ▼')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Project Detailed Transactions Drawer */}
      {selectedProject && (
        <div className="bg-slate-800/90 border border-amber-500/50 rounded-2xl p-5 shadow-2xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-mono font-bold">{selectedProject.id}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  selectedProject.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'
                }`}>
                  {selectedProject.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">{selectedProject.name}</h3>
              <div className="text-xs text-slate-400">
                Client: {selectedProject.client} | Site: {selectedProject.site}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleOpenEdit(selectedProject, e)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-semibold text-xs border border-amber-500/30 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'প্রজেক্ট এডিট' : 'Edit Project'}</span>
              </button>

              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {language === 'bn' ? 'প্রজেক্ট সংক্রান্ত ভাউচার ও ব্যয় খাতা' : 'Project Vouchers & Expense Ledger'}
            </h4>

            {data.transactions.filter(t => t.projectId === selectedProject.id).length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {language === 'bn' ? 'এই প্রজেক্টে এখনও কোনো ভাউচার এন্ট্রি নেই।' : 'No vouchers recorded for this project yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                      <th className="py-2 px-3">Voucher No</th>
                      <th className="py-2 px-3">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                      <th className="py-2 px-3">{language === 'bn' ? 'বিবরণ / পক্ষ' : 'Description / Party'}</th>
                      <th className="py-2 px-3">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                      <th className="py-2 px-3 text-right">{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount'}</th>
                      <th className="py-2 px-3 text-center">{language === 'bn' ? 'প্রিন্ট' : 'Print'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.transactions
                      .filter(t => t.projectId === selectedProject.id)
                      .map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{txn.voucherNo}</td>
                          <td className="py-2.5 px-3 text-slate-300">{formatDate(txn.date)}</td>
                          <td className="py-2.5 px-3 text-slate-200">{txn.party} - {txn.description}</td>
                          <td className="py-2.5 px-3 text-slate-400">{txn.category}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${
                            txn.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {txn.type === 'income' ? '+' : '-'}{formatBDT(txn.amount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedVoucherForPrint(txn);
                                setActiveTab('vouchers');
                              }}
                              className="p-1 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
                              title="Print A5 Voucher"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add New Project */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? 'নতুন স্টিল স্ট্রাকচার প্রজেক্ট যুক্ত করুন' : 'Add New Steel Project'}</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্টের নাম' : 'Project Name'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navana Logistics Steel Warehouse"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট / প্রতিষ্ঠানের নাম' : 'Client Name'} *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navana Group Ltd"
                    value={formData.client}
                    onChange={(e) => setFormData(p => ({ ...p, client: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট মোবাইল' : 'Client Phone'}</label>
                  <input
                    type="text"
                    placeholder="e.g. 018XXXXXXXX"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(p => ({ ...p, clientPhone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সাইটের ঠিকানা' : 'Site Location'} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhatiary, Sitakunda, Chattogram"
                  value={formData.site}
                  onChange={(e) => setFormData(p => ({ ...p, site: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'চুক্তি মূল্য (Contract BDT)' : 'Contract Value'} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 3500000"
                    value={formData.contractValue}
                    onChange={(e) => setFormData(p => ({ ...p, contractValue: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'আনুমানিক বাজেট (Budget BDT)' : 'Estimated Budget'}</label>
                  <input
                    type="number"
                    placeholder="e.g. 2800000"
                    value={formData.budget}
                    onChange={(e) => setFormData(p => ({ ...p, budget: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্ট ধরন / টাইপ' : 'Category'}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Industrial Shed">Industrial Shed</option>
                    <option value="Pre-Engineered Building">Pre-Engineered Building (PEB)</option>
                    <option value="Lift Core Structures">Lift Core Structures</option>
                    <option value="Specialized & Defense">Specialized & Defense</option>
                    <option value="Commercial Steel Building">Commercial Steel Building</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}</label>
                  <DateInput
                    value={formData.startDate}
                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                >
                  {language === 'bn' ? 'প্রজেক্ট সেভ করুন' : 'Save Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Project */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <span>{language === 'bn' ? `প্রজেক্ট এডিট ও আপডেট (${editFormData.id})` : `Edit Project (${editFormData.id})`}</span>
              </h3>
              <button 
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProjectSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্টের নাম' : 'Project Name'} *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট নাম' : 'Client Name'} *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.client}
                    onChange={(e) => setEditFormData(p => ({ ...p, client: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'ক্লায়েন্ট ফোন' : 'Client Phone'}</label>
                  <input
                    type="text"
                    value={editFormData.clientPhone}
                    onChange={(e) => setEditFormData(p => ({ ...p, clientPhone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সাইটের ঠিকানা' : 'Site Location'} *</label>
                <input
                  type="text"
                  required
                  value={editFormData.site}
                  onChange={(e) => setEditFormData(p => ({ ...p, site: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'চুক্তি মূল্য (Contract BDT)' : 'Contract Value'} *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editFormData.contractValue}
                    onChange={(e) => setEditFormData(p => ({ ...p, contractValue: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'বাজেট (Budget BDT)' : 'Budget'}</label>
                  <input
                    type="number"
                    value={editFormData.budget}
                    onChange={(e) => setEditFormData(p => ({ ...p, budget: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'প্রজেক্ট ধরন / ক্যাটাগরি' : 'Category'}</label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Industrial Shed">Industrial Shed</option>
                    <option value="Pre-Engineered Building">Pre-Engineered Building (PEB)</option>
                    <option value="Lift Core Structures">Lift Core Structures</option>
                    <option value="Specialized & Defense">Specialized & Defense</option>
                    <option value="Commercial Steel Building">Commercial Steel Building</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'কাজের অবস্থা (Status)' : 'Status'}</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="In Progress">In Progress (চলমান)</option>
                    <option value="Completed">Completed (সম্পন্ন)</option>
                    <option value="On Hold">On Hold (স্থগিত)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'শুরুর তারিখ' : 'Start Date'}</label>
                  <DateInput
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">{language === 'bn' ? 'সম্ভাব্য সমাপ্তি তারিখ' : 'Expected Completion'}</label>
                  <DateInput
                    value={editFormData.expectedCompletion}
                    onChange={(e) => setEditFormData(p => ({ ...p, expectedCompletion: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDeleteProject(editFormData.id, editFormData.name)}
                  className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'প্রজেক্ট ডিলিট' : 'Delete'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-lg"
                  >
                    {language === 'bn' ? 'আপডেট সেভ করুন' : 'Update Project'}
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
