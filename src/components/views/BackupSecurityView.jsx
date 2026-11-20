import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CloudCog,
  ShieldCheck,
  CloudCheck,
  CloudOff,
  DownloadCloud,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  Key
} from 'lucide-react';

export const BackupSecurityView = () => {
  const {
    language,
    data,
    downloadBackupJSON,
    restoreFromJSON,
    connectGoogleDrive,
    disconnectGoogleDrive
  } = useApp();

  const fileInputRef = useRef(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnectClick = () => {
    setConnecting(true);
    setTimeout(() => {
      connectGoogleDrive();
      setConnecting(false);
    }, 1200);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        restoreFromJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CloudCog className="w-5 h-5 text-amber-400" />
          <span>{language === 'bn' ? 'গুগল ড্রাইভ ব্যাকআপ ও সিকিউরিটি' : 'Google Drive Backup & Security'}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'bn' 
            ? 'স্বয়ংক্রিয় ক্লাউড ব্যাকআপ, ম্যানুয়াল ডেটা ডাউনলোড, রিস্টোর এবং সিকিউরিটি অডিট ট্রেইল' 
            : 'Automated Google Drive synchronization, manual JSON snapshots, restore safety, and system audit trail'}
        </p>
      </div>

      {/* Cloud & Manual Backup Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Automatic Cloud Backup Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                data.gdriveConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {data.gdriveConnected ? <CloudCheck className="w-6 h-6" /> : <CloudOff className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'bn' ? 'গুগল ড্রাইভ ক্লাউড ব্যাকআপ' : 'Google Drive Cloud Sync'}
                </h3>
                <div className="text-[11px] text-slate-400">
                  Google OAuth 2.0 Integration
                </div>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              data.gdriveConnected ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
            }`}>
              {data.gdriveConnected ? 'Active' : 'Disconnected'}
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">{language === 'bn' ? 'কানেক্টেড অ্যাকাউন্ট:' : 'Target Cloud:'}</span>
              <span className="font-medium text-white">asiaengineersbd@gmail.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{language === 'bn' ? 'সর্বশেষ অটো-ব্যাকআপ:' : 'Last Successful Sync:'}</span>
              <span className="font-mono text-emerald-400">{data.lastBackupTime || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{language === 'bn' ? 'রিটেনশন পলিসি:' : 'Snapshot Retention:'}</span>
              <span className="text-white">Daily auto-snapshot (30 days)</span>
            </div>
          </div>

          <div className="pt-2">
            {data.gdriveConnected ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadBackupJSON}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition"
                >
                  {language === 'bn' ? 'এখনই ড্রাইভে সিঙ্ক করুন (Backup Now)' : 'Sync to Drive Now'}
                </button>
                <button
                  onClick={disconnectGoogleDrive}
                  className="bg-slate-700 hover:bg-rose-900 text-slate-300 hover:text-white text-xs py-2.5 px-3 rounded-xl transition"
                >
                  {language === 'bn' ? 'ডিসকানেক্ট' : 'Disconnect'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectClick}
                disabled={connecting}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <span>{language === 'bn' ? 'সংযোগ স্থাপন করা হচ্ছে...' : 'Authorizing OAuth...'}</span>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>{language === 'bn' ? 'গুগল ড্রাইভ কানেক্ট করুন (OAuth)' : 'Connect Google Drive (OAuth)'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Manual 1-Click Backup & Restore Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {language === 'bn' ? 'ম্যানুয়াল ডেটা ব্যাকআপ ও রিস্টোর' : 'Manual Database Backup & Restore'}
              </h3>
              <div className="text-[11px] text-slate-400">
                Export & Import complete JSON database archive
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            {language === 'bn' 
              ? 'যেকোনো মুহূর্তে এক ক্লিকে সম্পূর্ণ ডেটাবেস ডাউনলোড করে আপনার পেনড্রাইভ বা কম্পিউটারে সংরক্ষণ করতে পারেন।' 
              : 'Download a full standalone JSON archive containing accounts, vouchers, projects, inventory, and staff records.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadBackupJSON}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{language === 'bn' ? 'ব্যাকআপ ডাউনলোড করুন (JSON)' : 'Download Full Backup'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{language === 'bn' ? 'ফাইল থেকে রিস্টোর' : 'Restore from JSON'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* System Security & Audit Log Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              {language === 'bn' ? 'সিস্টেম অ্যাক্টিভিটি ও অডিট লগ (Audit Trail)' : 'System Audit Log & Activity Trail'}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            {language === 'bn' ? 'কে, কখন, কী অ্যাকশন করেছেন' : 'User change tracking'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">{language === 'bn' ? 'তারিখ ও সময়' : 'Timestamp'}</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'ব্যবহারকারী' : 'User'}</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'অ্যাকশন ধরন' : 'Action'}</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'কার্যক্রম বিবরণ' : 'Activity Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-medium text-amber-300">{log.user}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 font-mono text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
