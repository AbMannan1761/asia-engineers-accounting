import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Smartphone,
  Building2,
  Phone,
  Mail,
  Globe,
  Share2,
  PlusSquare,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const SettingsView = () => {
  const { COMPANY_INFO, language, currentUser } = useApp();

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span>{language === 'bn' ? 'কোম্পানি সেটিংস ও আইফোন PWA গাইড' : 'Company Settings & iPhone PWA'}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'bn' 
            ? 'প্রতিষ্ঠান পরিচিতি, অ্যাডমিন প্রোফাইল এবং আইফোনে অ্যাপ হিসেবে ইনস্টল করার নিয়ম' 
            : 'Company master configuration and iPhone Add to Home Screen step-by-step guide'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Profile Details */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl p-1.5 flex items-center justify-center">
              <img 
                src="./images/asia_engineers_logo.png" 
                alt="Asia Engineers" 
                className="w-full h-full object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{COMPANY_INFO.name}</h3>
              <div className="text-xs text-amber-400 font-medium">{COMPANY_INFO.tagline}</div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Managing Director:</span>
              <span className="font-bold text-white">{COMPANY_INFO.director}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Hotline Phone:</span>
              <span className="font-mono text-amber-400 font-bold">{COMPANY_INFO.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Official Website:</span>
              <a href={`https://${COMPANY_INFO.website}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                {COMPANY_INFO.website}
              </a>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Trade License:</span>
              <span className="font-mono text-slate-200">{COMPANY_INFO.regNo}</span>
            </div>
            <div className="py-1">
              <span className="text-slate-400 block mb-1">Registered Office:</span>
              <span className="text-slate-200">{COMPANY_INFO.address}</span>
            </div>
          </div>
        </div>

        {/* iPhone Safari PWA Installation Instructions */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {language === 'bn' ? 'আইফোন ও মোবাইলে অ্যাপ আইকন যুক্ত করার নিয়ম' : 'iPhone / Mobile Installation Guide'}
              </h3>
              <div className="text-[11px] text-slate-400">
                PWA / Add to Home Screen Support
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            {language === 'bn' 
              ? 'ইঞ্জিনিয়ার হান্নান সাহেব তাঁর iPhone Safari ব্রাউজার থেকে নিচের ৩টি ধাপে অ্যাপটি হোম স্ক্রিনে ইনস্টল করে সরাসরি অ্যাপ হিসেবে চালাতে পারবেন:' 
              : 'Add Asia Engineers Accounting directly to your iPhone Home Screen without any App Store installation:'}
          </p>

          <ol className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
              <span>
                {language === 'bn' 
                  ? 'আপনার iPhone-এর Safari ব্রাউজারে সফটওয়্যারটি ওপেন করুন।' 
                  : 'Open the accounting web app in iPhone Safari.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
              <span>
                {language === 'bn' 
                  ? 'সাফারির নিচে থাকা শেয়ার আইকনে (Share Button / তীর চিহ্নযুক্ত বক্স) ট্যাপ করুন।' 
                  : 'Tap the Share icon (box with an upward arrow) at the bottom.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
              <span>
                {language === 'bn' 
                  ? 'তালিকা থেকে "Add to Home Screen" (বা "হোম স্ক্রিনে যোগ করুন") অপশনটি নির্বাচন করুন।' 
                  : 'Scroll down and select "Add to Home Screen".'}
              </span>
            </li>
          </ol>

          <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {language === 'bn' 
                ? 'এখন আপনার আইফোনের স্ক্রিনে Asia Engineers লোগো সহ অ্যাপ তৈরি হয়ে যাবে!' 
                : 'Asia Engineers app icon will now appear on your iPhone screen for 1-tap access!'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
