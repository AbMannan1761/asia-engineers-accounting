import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Code2,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  Cpu,
  Layers,
  CheckCircle2,
  Edit3,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Calendar,
  Award,
  Terminal,
  Database,
  RefreshCw,
  X
} from 'lucide-react';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export const DeveloperView = () => {
  const { developerProfile, updateDeveloperProfile, language } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: developerProfile?.name || '',
    englishName: developerProfile?.englishName || '',
    title: developerProfile?.title || '',
    organization: developerProfile?.organization || '',
    phone: developerProfile?.phone || '',
    email: developerProfile?.email || '',
    github: developerProfile?.github || '',
    portfolio: developerProfile?.portfolio || '',
    location: developerProfile?.location || '',
    bio: developerProfile?.bio || '',
    skillsStr: (developerProfile?.skills || []).join(', ')
  });

  const handleOpenEdit = () => {
    setEditForm({
      name: developerProfile?.name || '',
      englishName: developerProfile?.englishName || '',
      title: developerProfile?.title || '',
      organization: developerProfile?.organization || '',
      phone: developerProfile?.phone || '',
      email: developerProfile?.email || '',
      github: developerProfile?.github || '',
      portfolio: developerProfile?.portfolio || '',
      location: developerProfile?.location || '',
      bio: developerProfile?.bio || '',
      skillsStr: (developerProfile?.skills || []).join(', ')
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const skillsArray = editForm.skillsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    updateDeveloperProfile({
      name: editForm.name,
      englishName: editForm.englishName,
      title: editForm.title,
      organization: editForm.organization,
      phone: editForm.phone,
      email: editForm.email,
      github: editForm.github,
      portfolio: editForm.portfolio,
      location: editForm.location,
      bio: editForm.bio,
      skills: skillsArray.length > 0 ? skillsArray : developerProfile?.skills
    });

    setIsEditModalOpen(false);
  };

  const handleCopyContact = () => {
    const text = `Developer & Architect: ${developerProfile?.name}
Title: ${developerProfile?.title}
Organization: ${developerProfile?.organization}
Phone: ${developerProfile?.phone}
Email: ${developerProfile?.email}
GitHub: ${developerProfile?.github}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>সিস্টেম আর্কিটেক্ট ও সফটওয়্যার ইঞ্জিনিয়ার</span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <span>{language === 'bn' ? 'ডেভেলপার পরিচিতি ও প্রোফাইল' : 'Developer & Architect Profile'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ASIA ENGINEERS ক্লাউড অ্যাকাউন্টিং ও ইআরপি সফটওয়্যারের আর্কিটেকচার, ক্লাউড ডাটাবেজ ও ফুল-স্ট্যাক ডেভেলপমেন্ট
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyContact}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            title="যোগাযোগের তথ্য কপি করুন"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-bold">কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>কন্ট্যাক্ট কপি</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenEdit}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>তথ্য এডিট করুন</span>
          </button>
        </div>
      </div>

      {/* Main Profile Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-2xl">
        {/* Decorative Top Gradient Line */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-amber-500 to-cyan-500" />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-800">
            {/* Developer Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border-2 border-amber-500/50 flex items-center justify-center shadow-xl shadow-amber-500/10 overflow-hidden">
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <Terminal className="w-10 h-10 text-amber-400 mb-1" />
                  <span className="text-[11px] font-mono font-bold text-amber-300">ABM / DEV</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-md" title="সক্রিয় ও অনুমোদিত ডেভেলপার">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {developerProfile?.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Lead Architect
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Verified Developer
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-amber-400/90">
                {developerProfile?.title}
              </p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{developerProfile?.organization}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{developerProfile?.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Contact & Links Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
            <a
              href={`tel:${developerProfile?.phone}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">মোবাইল / কল</div>
                <div className="text-xs font-mono font-semibold text-white truncate">{developerProfile?.phone}</div>
              </div>
            </a>

            <a
              href={`mailto:${developerProfile?.email}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ইমেইল ঠিকানা</div>
                <div className="text-xs font-mono font-semibold text-white truncate">{developerProfile?.email}</div>
              </div>
            </a>

            <a
              href={developerProfile?.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <GithubIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                  <span>গিটহাব প্রোফাইল</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400" />
                </div>
                <div className="text-xs font-mono font-semibold text-white truncate">AbMannan1761</div>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">অভিজ্ঞতা ও রোল</div>
                <div className="text-xs font-semibold text-white truncate">{developerProfile?.experienceYears || '৮+ বছর'} | Full-Stack</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Bio, Skills & Project Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio & Core Skills */}
        <div className="space-y-6 lg:col-span-1">
          {/* Bio Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>সংক্ষিপ্ত পরিচিতি ও বায়ো</span>
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              {developerProfile?.bio}
            </p>
          </div>

          {/* Core Tech Stack & Skills */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>প্রযুক্তিগত দক্ষতা ও স্ট্যাক</span>
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {(developerProfile?.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700 hover:border-amber-500/40 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* System Specs Badge */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>সফটওয়্যার স্পেসিফিকেশন</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">সিস্টেমের নাম:</span>
                <span className="font-semibold text-white">ASIA ENGINEERS ERP</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">ভার্সন:</span>
                <span className="font-mono text-amber-400 font-bold">v2.5 Enterprise</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">লাইভ ডাটাবেজ:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Google Cloud Live Sync
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">প্ল্যাটফর্ম সাপোর্ট:</span>
                <span className="text-slate-200">Web, iOS Safari PWA, Android, Windows</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">কোড রেপো:</span>
                <span className="font-mono text-slate-300">GitHub (Clean & Secured)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Architectural Highlights & Modules Built */}
        <div className="space-y-6 lg:col-span-2">
          {/* Engineering Modules Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>সফটওয়্যারের মূল ফিচারস ও আর্কিটেকচারাল অবদান</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  এই ইআরপি সিস্টেমে ডেভেলপ করা প্রধান মডিউল ও অটোমেশন সার্ভিসসমূহ
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span>Real-Time Sync Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Feature 1 */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-emerald-500/40 transition-all space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    01
                  </div>
                  <h4 className="text-sm font-bold text-white">গুগল শীট রিয়েল-টাইম ২-ওয়ে সিংক</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  সফটওয়্যারের প্রতিটি লেনদেন, প্রজেক্ট, স্টক ও হাজিরা এন্ট্রি সাথে সাথে গুগল শীটে অটোমেটিক পোস্ট হয়। আবার গুগল শীট থেকেও যে কোনো সময় ডেটা আপডেট ও সিংক করা যায়।
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-amber-500/40 transition-all space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                    02
                  </div>
                  <h4 className="text-sm font-bold text-white">ডাবল-এন্ট্রি অ্যাকাউন্টিং ও লেজার</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ক্যাশ, ব্যাংক এবং মোবাইল ব্যাংকিং সহ মাল্টিপল অ্যাকাউন্টের সম্পূর্ণ ব্যালেন্স শীট, ট্রানজ্যাকশন ফিল্টারিং, লাভ-ক্ষতি হিসাব ও রিয়েল-টাইম আর্থিক রিপোর্ট।
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-cyan-500/40 transition-all space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                    03
                  </div>
                  <h4 className="text-sm font-bold text-white">সাইট ডেইলি লেবার হাজিরা ও পে-রোল</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  সাইটের দৈনিক শ্রমিকদের নাম, পদবী, প্রজেক্টওয়াইজ হাজিরা, ওভারটাইম ঘণ্টা হিসাব, অগ্রিম কর্তন ও স্বয়ংক্রিয় নিট প্রদেয় মজুরি হিসাবের সম্পূর্ণ শীট।
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-purple-500/40 transition-all space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-xs">
                    04
                  </div>
                  <h4 className="text-sm font-bold text-white">A4 ও A5 অফিসিয়াল ভাউচার প্রিন্ট</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ক্লিক করলেই প্রাতিষ্ঠানিক মানি রিসিট (জমা রিসিট) এবং ডেবিট/ক্রেডিট ভাউচার কথায় টাকা কনভার্ট সহ স্ট্যান্ডার্ড A4 ও A5 সাইজে প্রিন্ট ও পিডিএফ এক্সপোর্ট।
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-blue-500/40 transition-all space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                    05
                  </div>
                  <h4 className="text-sm font-bold text-white">স্টিল মালামাল স্টক ও প্রজেক্ট ট্র্যাকিং</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  নির্মাণ সামগ্রী ও স্টিল ম্যাটেরিয়ালস (টনে/কেজিতে) ইনওয়ার্ড-আউটওয়ার্ড স্টক নিয়ন্ত্রণ, রি-অর্ডার এলার্ট এবং আরএফকিউ প্রজেক্ট ওয়াইজ খরচ বরাদ্দ।
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 hover:border-emerald-500/40 transition-all space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    06
                  </div>
                  <h4 className="text-sm font-bold text-white">নিরাপদ ডিরেক্টর অথেন্টিকেশন ও অডিট লগ</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  ডিরেক্টর বা অ্যাডমিন পিন ভেরিফিকেশন, পাসওয়ার্ড আই-টগল শো/হাইড নিরাপত্তা এবং প্রতিটি ভাউচার সৃষ্টি ও পরিবর্তনের টাইমস্ট্যাম্প সহ অডিট লগ ট্র্যাকিং।
                </p>
              </div>
            </div>
          </div>

          {/* Quick Notice & Support Card */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>সফটওয়্যার কাস্টমাইজেশন ও কারিগরি সহায়তা</span>
              </div>
              <p className="text-xs text-slate-300">
                যেকোনো নতুন ফিচার সংযোজন, শীট ফরম্যাট কাস্টমাইজেশন বা টেকনিক্যাল সাপোর্টের জন্য ডেভেলপার সাথে সরাসরি যোগাযোগ করতে পারবেন।
              </p>
            </div>
            <a
              href={`tel:${developerProfile?.phone}`}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              সরাসরি কল করুন
            </a>
          </div>
        </div>
      </div>

      {/* Edit Developer Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">ডেভেলপার পরিচিতি এডিট করুন</h3>
                  <p className="text-xs text-slate-400">আপনার নাম, পদবী, মোবাইল, ইমেইল ও সোশ্যাল লিংক আপডেট করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEdit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ডেভেলপারের পূর্ণ নাম (বাংলা) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    placeholder="ইঞ্জি. মোহাম্মদ আব্দুল মান্নান"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    নাম (English)
                  </label>
                  <input
                    type="text"
                    value={editForm.englishName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, englishName: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    placeholder="Engr. Md. Abdul Mannan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  পদবী ও স্পেশালাইজেশন *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  placeholder="চিফ সিস্টেম আর্কিটেক্ট ও সিনিয়র ফুল-স্ট্যাক সফটওয়্যার ইঞ্জিনিয়ার"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  প্রতিষ্ঠান / কর্মক্ষেত্র
                </label>
                <input
                  type="text"
                  value={editForm.organization}
                  onChange={(e) => setEditForm(prev => ({ ...prev, organization: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  placeholder="বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (BTRC) / ফ্রিল্যান্স সফটওয়্যার"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                    placeholder="01928571761"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ইমেইল ঠিকানা *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                    placeholder="abmannan1761@gmail.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    গিটহাব প্রোফাইল লিংক
                  </label>
                  <input
                    type="text"
                    value={editForm.github}
                    onChange={(e) => setEditForm(prev => ({ ...prev, github: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-hidden focus:border-amber-500"
                    placeholder="https://github.com/AbMannan1761"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    অবস্থান / ঠিকানা
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    placeholder="ঢাকা ও চট্টগ্রাম, বাংলাদেশ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সংক্ষিপ্ত বায়ো / বিবরণী
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 resize-none"
                  placeholder="আপনার কাজের অভিজ্ঞতা ও ভূমিকা সম্পর্কে লিখুন..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  দক্ষতা ও প্রযুক্তি (কমা দিয়ে আলাদা করুন)
                </label>
                <input
                  type="text"
                  value={editForm.skillsStr}
                  onChange={(e) => setEditForm(prev => ({ ...prev, skillsStr: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  placeholder="React.js, Tailwind CSS, Google Cloud, Apps Script, Accounting Systems"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
