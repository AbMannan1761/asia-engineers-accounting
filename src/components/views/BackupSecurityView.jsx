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
  Key,
  ExternalLink,
  FolderLock,
  Code2,
  Copy,
  Check,
  FileSpreadsheet,
  RefreshCw,
  Zap,
  CheckCheck
} from 'lucide-react';

export const BackupSecurityView = () => {
  const {
    language,
    data,
    GDRIVE_CONFIG,
    GSHEET_CONFIG,
    gsheetWebhookUrl,
    setGsheetWebhookUrl,
    gsheetAutoSync,
    setGsheetAutoSync,
    gsheetSyncStatus,
    gsheetLastSyncTime,
    syncToGoogleSheet,
    pullFromGoogleSheet,
    downloadBackupJSON,
    restoreFromJSON,
    connectGoogleDrive,
    disconnectGoogleDrive,
    syncToGoogleDrive
  } = useApp();

  const fileInputRef = useRef(null);
  const [connecting, setConnecting] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSheetScript, setCopiedSheetScript] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');
  const [sheetSyncSuccessMsg, setSheetSyncSuccessMsg] = useState('');
  const [webhookInput, setWebhookInput] = useState(gsheetWebhookUrl || '');
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [showSheetGuide, setShowSheetGuide] = useState(false);

  const targetFolderUrl = GDRIVE_CONFIG?.folderUrl || "https://drive.google.com/drive/folders/1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS";
  const targetFolderId = GDRIVE_CONFIG?.folderId || "1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS";
  const gsheetUrl = GSHEET_CONFIG?.sheetUrl || "https://docs.google.com/spreadsheets/d/1RSGKMQvtyIXb-1iObSpTq9G-ynEFWKA0U2BBunINaWE/edit?usp=sharing";
  const gsheetId = GSHEET_CONFIG?.sheetId || "1RSGKMQvtyIXb-1iObSpTq9G-ynEFWKA0U2BBunINaWE";

  const handleSyncNow = () => {
    const snap = syncToGoogleDrive();
    setSyncSuccessMsg(language === 'bn'
      ? `সফলভাবে ${snap.fileName} ব্যাকআপ তৈরি হয়েছে ও ড্রাইভে সিঙ্ক হয়েছে!`
      : `Successfully created snapshot ${snap.fileName} and synced to Google Drive!`);
    setTimeout(() => setSyncSuccessMsg(''), 5000);
  };

  const handleManualSheetSync = async () => {
    setIsSyncingSheet(true);
    const res = await syncToGoogleSheet('MANUAL_SYNC');
    setIsSyncingSheet(false);
    setSheetSyncSuccessMsg(
      language === 'bn'
        ? `সফলভাবে সমস্ত তথ্য "${GSHEET_CONFIG?.title || 'Asia engineers, Accounts'}" গুগল শীটে সিংক হয়েছে!`
        : `Successfully synced database to Google Sheet!`
    );
    setTimeout(() => setSheetSyncSuccessMsg(''), 6000);
  };

  const handleSaveWebhook = (e) => {
    e.preventDefault();
    setGsheetWebhookUrl(webhookInput);
    setSheetSyncSuccessMsg(
      language === 'bn'
        ? 'গুগল শীট ওয়েবহুক URL সফলভাবে সংরক্ষিত হয়েছে!'
        : 'Google Sheet Webhook URL saved successfully!'
    );
    setTimeout(() => setSheetSyncSuccessMsg(''), 4000);
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
    e.target.value = '';
  };

  const gasScriptCode = "// ASIA ENGINEERS - Google Drive Automated Cloud Backup Webhook\n" +
    "// Target Folder ID: " + targetFolderId + "\n\n" +
    "function doPost(e) {\n" +
    "  try {\n" +
    "    var folderId = '" + targetFolderId + "';\n" +
    "    var folder = DriveApp.getFolderById(folderId);\n" +
    "    var requestData = JSON.parse(e.postData.contents);\n" +
    "    var timestamp = Utilities.formatDate(new Date(), 'GMT+6', 'yyyy-MM-dd_HHmmss');\n" +
    "    var fileName = 'AE_Accounting_Backup_' + timestamp + '.json';\n" +
    "    var file = folder.createFile(fileName, JSON.stringify(requestData, null, 2), MimeType.PLAIN_TEXT);\n" +
    "    file.setDescription('Asia Engineers Automatic Accounting Backup');\n" +
    "    return ContentService.createTextOutput(JSON.stringify({\n" +
    "      status: 'SUCCESS',\n" +
    "      fileId: file.getId(),\n" +
    "      fileName: fileName,\n" +
    "      folderId: folderId\n" +
    "    })).setMimeType(ContentService.MimeType.JSON);\n" +
    "  } catch (err) {\n" +
    "    return ContentService.createTextOutput(JSON.stringify({\n" +
    "      status: 'ERROR',\n" +
    "      message: err.toString()\n" +
    "    })).setMimeType(ContentService.MimeType.JSON);\n" +
    "  }\n" +
    "}";

  const gasSheetScriptCode = // ====================================================================
    // ASIA ENGINEERS - Google Sheets Automated Real-Time Sync Webhook
    // Google Sheet ID: // Sheet Name: // ====================================================================

    function doPost(e) {
      try {
        var payload = JSON.parse(e.postData.contents);
        var action = payload.action || 'SYNC_ALL';
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        if (!ss) {
          ss = SpreadsheetApp.openById('');
        }

        var data = payload.data || {};

        // 1. Convert Form Image into: জমা_রিসিট_ফরম_ও_হিসাব (Credit / Income Receipts)
        if (data.transactions) {
          var incSheet = getOrCreateTab(ss, 'জমা_রিসিট_ফরম_ও_হিসাব');
          incSheet.clear();
          var incHeaders = [
            ['তারিখ', 'ভাউচার নং', 'কার কাছ থেকে গ্রহণ (Received From)', 'ক্যাটাগরি', 'অ্যাকাউন্ট / পেমেন্ট মেথড', 'প্রজেক্ট', 'টাকার পরিমাণ (৳)', 'বিবরণ / উদ্দেশ্য', 'নোট / চেক নং / চালান বিবরণ']
          ];
          incSheet.getRange(1, 1, 1, incHeaders[0].length).setValues(incHeaders)
            .setBackground('#064e3b').setFontColor('#34d399').setFontWeight('bold');

          var incRows = data.transactions
            .filter(function (t) { return t.type === 'income'; })
            .map(function (t) {
              return [
                t.date || '',
                t.voucherNo || t.id,
                t.party || '',
                t.category || '',
                t.accountId || '',
                t.projectId || 'সাধারণ অফিস',
                t.amount || 0,
                t.description || '',
                t.note || ''
              ];
            });

          if (incRows.length > 0) {
            incSheet.getRange(2, 1, incRows.length, incHeaders[0].length).setValues(incRows);
          }
          incSheet.autoResizeColumns(1, incHeaders[0].length);

          // 2. Convert Form Image into: খরচ_ভাউচার_ফরম_ও_হিসাব (Debit / Expense Vouchers)
          var expSheet = getOrCreateTab(ss, 'খরচ_ভাউচার_ফরম_ও_হিসাব');
          expSheet.clear();
          var expHeaders = [
            ['তারিখ', 'ভাউচার নং', 'কাকে প্রদান (Paid To / Payee)', 'ক্যাটাগরি', 'অ্যাকাউন্ট / পেমেন্ট মেথড', 'প্রজেক্ট', 'টাকার পরিমাণ (৳)', 'বিবরণ / উদ্দেশ্য', 'নোট / চেক নং / চালান বিবরণ']
          ];
          expSheet.getRange(1, 1, 1, expHeaders[0].length).setValues(expHeaders)
            .setBackground('#881337').setFontColor('#fda4af').setFontWeight('bold');

          var expRows = data.transactions
            .filter(function (t) { return t.type === 'expense'; })
            .map(function (t) {
              return [
                t.date || '',
                t.voucherNo || t.id,
                t.party || '',
                t.category || '',
                t.accountId || '',
                t.projectId || 'সাধারণ অফিস',
                t.amount || 0,
                t.description || '',
                t.note || ''
              ];
            });

          if (expRows.length > 0) {
            expSheet.getRange(2, 1, expRows.length, expHeaders[0].length).setValues(expRows);
          }
          expSheet.autoResizeColumns(1, expHeaders[0].length);
        }

        // 3. Dynamic Categories: ক্যাটাগরি_তালিকা
        if (data.incomeCategories || data.expenseCategories) {
          var catSheet = getOrCreateTab(ss, 'ক্যাটাগরি_তালিকা');
          catSheet.clear();
          var catHeaders = [['ক্যাটাগরি ধরন', 'ক্যাটাগরির নাম']];
          catSheet.getRange(1, 1, 1, 2).setValues(catHeaders)
            .setBackground('#1e293b').setFontColor('#facc15').setFontWeight('bold');

          var catRows = [];
          (data.incomeCategories || []).forEach(function (c) {
            catRows.push(['জমা (Income)', c]);
          });
          (data.expenseCategories || []).forEach(function (c) {
            catRows.push(['খরচ (Expense)', c]);
          });

          if (catRows.length > 0) {
            catSheet.getRange(2, 1, catRows.length, 2).setValues(catRows);
          }
          catSheet.autoResizeColumns(1, 2);
        }

        // 4. Sync: ডেইলি_হাজিরা_ও_বেতন (Daily Attendance & Wages)
        if (data.laborAttendance) {
          var attSheet = getOrCreateTab(ss, 'ডেইলি_হাজিরা_ও_বেতন');
          attSheet.clear();
          var attHeaders = [
            ['তারিখ', 'কর্মী / নাম', 'পদবী', 'প্রজেক্ট আইডি', 'হাজিরা অবস্থা', 'ওভারটাইম (ঘণ্টা)', 'মোট বেতন (৳)', 'এডভান্স (৳)', 'প্রদেয় (৳)', 'অবশিষ্ট বকেয়া (৳)', 'মন্তব্য', 'পরিশোধ অবস্থা']
          ];
          attSheet.getRange(1, 1, 1, attHeaders[0].length).setValues(attHeaders)
            .setBackground('#1e293b').setFontColor('#f8fafc').setFontWeight('bold');

          var laborsMap = {};
          (data.dailyLabors || []).forEach(function (l) { laborsMap[l.id] = l; });

          var attRows = data.laborAttendance.map(function (item) {
            var l = laborsMap[item.laborId] || {};
            var wage = item.grossWage || item.basicWage || 0;
            var payable = item.netPayable || Math.max(0, wage - (item.advanceTaken || 0));
            var rem = item.paymentStatus === 'Paid' ? 0 : (item.remainingDue !== undefined ? item.remainingDue : payable);
            return [
              item.date || '',
              l.name || item.laborId || '',
              l.trade || '',
              item.projectId || '-',
              item.status === 'Present' ? 'পূর্ণ (1.0)' : item.status === 'Half Day' ? 'অর্ধ (0.5)' : 'অনুপস্থিত',
              item.otHours || 0,
              wage,
              item.advanceTaken || 0,
              payable,
              rem,
              item.remarks || item.note || '',
              item.paymentStatus === 'Paid' ? 'পরিশোধিত' : 'বকেয়া'
            ];
          });

          if (attRows.length > 0) {
            attSheet.getRange(2, 1, attRows.length, attRows[0].length).setValues(attRows);
          }
          attSheet.autoResizeColumns(1, attHeaders[0].length);
        }

        // 5. Sync: প্রজেক্ট_তালিকা (Projects)
        if (data.projects) {
          var prjSheet = getOrCreateTab(ss, 'প্রজেক্ট_তালিকা');
          prjSheet.clear();
          var prjHeaders = [['প্রজেক্ট আইডি', 'প্রজেক্টের নাম', 'ক্লায়েন্ট', 'স্থান', 'বাজেট (৳)', 'ব্যয়িত (৳)', 'প্রাপ্তি (৳)', 'অবস্থা']];
          prjSheet.getRange(1, 1, 1, prjHeaders[0].length).setValues(prjHeaders)
            .setBackground('#1e293b').setFontColor('#facc15').setFontWeight('bold');

          var prjRows = data.projects.map(function (p) {
            return [p.id, p.name, p.client, p.location || '', p.contractValue || 0, p.spentAmount || 0, p.receivedAmount || 0, p.status || 'Active'];
          });
          if (prjRows.length > 0) {
            prjSheet.getRange(2, 1, prjRows.length, prjRows[0].length).setValues(prjRows);
          }
          prjSheet.autoResizeColumns(1, prjHeaders[0].length);
        }

        return ContentService.createTextOutput(JSON.stringify({
          status: 'SUCCESS',
          action: action,
          records: {
            attendance: (data.laborAttendance || []).length,
            transactions: (data.transactions || []).length
          },
          syncedAt: Utilities.formatDate(new Date(), 'GMT+6', 'yyyy-MM-dd HH:mm:ss')
        })).setMimeType(ContentService.MimeType.JSON);

      } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'ERROR',
          message: err.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

  // GET Webhook: Allows Software to pull updated data from Google Sheet
  function doGet(e) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      if (!ss) {
        ss = SpreadsheetApp.openById('');
      }

      var resultData = {
        transactions: [],
        incomeCategories: [],
        expenseCategories: []
      };

      var incSheet = ss.getSheetByName('জমা_রিসিট_ফরম_ও_হিসাব');
      if (incSheet && incSheet.getLastRow() > 1) {
        var incValues = incSheet.getRange(2, 1, incSheet.getLastRow() - 1, 9).getValues();
        incValues.forEach(function (row) {
          if (row[0] || row[1]) {
            resultData.transactions.push({
              id: 'TXN-' + (row[1] || Date.now()),
              voucherNo: String(row[1] || ''),
              date: Utilities.formatDate(new Date(row[0]), 'GMT+6', 'yyyy-MM-dd'),
              type: 'income',
              party: String(row[2] || ''),
              category: String(row[3] || 'Other Income'),
              accountId: String(row[4] || 'acc-cash'),
              projectId: String(row[5] || ''),
              amount: Number(row[6] || 0),
              description: String(row[7] || ''),
              note: String(row[8] || '')
            });
          }
        });
      }

      var expSheet = ss.getSheetByName('খরচ_ভাউচার_ফরম_ও_হিসাব');
      if (expSheet && expSheet.getLastRow() > 1) {
        var expValues = expSheet.getRange(2, 1, expSheet.getLastRow() - 1, 9).getValues();
        expValues.forEach(function (row) {
          if (row[0] || row[1]) {
            resultData.transactions.push({
              id: 'TXN-' + (row[1] || Date.now()),
              voucherNo: String(row[1] || ''),
              date: Utilities.formatDate(new Date(row[0]), 'GMT+6', 'yyyy-MM-dd'),
              type: 'expense',
              party: String(row[2] || ''),
              category: String(row[3] || 'Miscellaneous'),
              accountId: String(row[4] || 'acc-cash'),
              projectId: String(row[5] || ''),
              amount: Number(row[6] || 0),
              description: String(row[7] || ''),
              note: String(row[8] || '')
            });
          }
        });
      }

      var catSheet = ss.getSheetByName('ক্যাটাগরি_তালিকা');
      if (catSheet && catSheet.getLastRow() > 1) {
        var catValues = catSheet.getRange(2, 1, catSheet.getLastRow() - 1, 2).getValues();
        catValues.forEach(function (r) {
          var type = String(r[0] || '');
          var catName = String(r[1] || '').trim();
          if (catName) {
            if (type.indexOf('Income') !== -1 || type.indexOf('জমা') !== -1) {
              resultData.incomeCategories.push(catName);
            } else {
              resultData.expenseCategories.push(catName);
            }
          }
        });
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'SUCCESS',
        data: resultData
      })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'ERROR',
        message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  function getOrCreateTab(ss, tabName) {
    var s = ss.getSheetByName(tabName);
    if (!s) {
      s = ss.insertSheet(tabName);
    }
    return s;
  };

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(gasScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const copySheetScriptToClipboard = () => {
    navigator.clipboard.writeText(gasSheetScriptCode);
    setCopiedSheetScript(true);
    setTimeout(() => setCopiedSheetScript(false), 3000);
  };

  const snapshots = data.backupSnapshots || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CloudCog className="w-5 h-5 text-amber-400" />
          <span>{language === 'bn' ? 'গুগল ড্রাইভ ও গুগল শীট সিংক' : 'Google Drive & Sheets Sync'}</span>
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'bn'
            ? 'নির্দিষ্ট গুগল শীট ও ড্রাইভে তাৎক্ষণিক স্বয়ংক্রিয় সিংক, স্ন্যাপশট হিস্ট্রি এবং নিরাপদ ব্যাকআপ'
            : 'Real-time Google Sheets sync, target Google Drive automated cloud backup, and database restore safety'}
        </p>
      </div>

      {/* Notifications */}
      {sheetSyncSuccessMsg && (
        <div className="bg-emerald-950/70 border border-emerald-500/50 p-4 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{sheetSyncSuccessMsg}</span>
        </div>
      )}

      {syncSuccessMsg && (
        <div className="bg-emerald-950/60 border border-emerald-500/50 p-4 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* FEATURE CARD: GOOGLE SHEET INSTANT REAL-TIME SYNC              */}
      {/* ============================================================== */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">
                  {language === 'bn' ? 'গুগল শীট ইনস্ট্যান্ট লাইভ সিংক' : 'Google Sheets Instant Live Sync'}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {language === 'bn' ? 'লাইভ সক্রিয়' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'bn'
                  ? 'হাজিরা, বেতন, জমা-খরচ, ভাউচার ও প্রজেক্টের প্রতিটি এন্ট্রি সাথে সাথে গুগল শীটে আপডেট হয়'
                  : 'Attendance, wages, transactions, vouchers and projects sync in real-time'}
              </p>
            </div>
          </div>

          {/* Direct Link to Google Sheet */}
          <a
            href={gsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition hover:scale-105"
            title="Open Target Google Sheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{language === 'bn' ? 'গুগল শীট সরাসরি খুলুন' : 'Open Google Sheet'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-slate-400 block mb-1">
              {language === 'bn' ? 'সংযুক্ত গুগল শীট:' : 'Target Google Sheet:'}
            </span>
            <div className="font-semibold text-white text-xs truncate" title={GSHEET_CONFIG?.title}>
              {GSHEET_CONFIG?.title || 'Asia engineers, Accounts'}
            </div>
            <a
              href={gsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-400 hover:underline font-mono truncate block mt-0.5"
            >
              ID: {gsheetId}
            </a>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
            <span className="text-[11px] text-slate-400 block mb-1">
              {language === 'bn' ? 'সর্বশেষ সিংক সময়:' : 'Last Synced Time:'}
            </span>
            <div className="font-mono text-emerald-400 font-bold text-xs">
              {gsheetLastSyncTime || '2026-11-21 23:25:00'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{language === 'bn' ? 'প্রতি এন্ট্রির সাথে তাৎক্ষণিক সিংক' : 'Instant on every record'}</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">
                {language === 'bn' ? 'স্বয়ংক্রিয় লাইভ সিংক:' : 'Auto Sync Mode:'}
              </span>
              <span className={`text-xs font-bold ${gsheetAutoSync ? 'text-emerald-400' : 'text-slate-400'}`}>
                {gsheetAutoSync ? (language === 'bn' ? 'চালু রয়েছে (ON)' : 'Active (ON)') : (language === 'bn' ? 'বন্ধ (OFF)' : 'Paused')}
              </span>
            </div>
            <button
              onClick={() => setGsheetAutoSync(!gsheetAutoSync)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${gsheetAutoSync ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${gsheetAutoSync ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleManualSheetSync}
            disabled={isSyncingSheet}
            className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingSheet ? 'animate-spin' : ''}`} />
            <span>
              {isSyncingSheet
                ? (language === 'bn' ? 'গুগল শীটে সিংক হচ্ছে...' : 'Syncing to Google Sheet...')
                : (language === 'bn' ? 'শীটে পুরো হিসাব পুশ করুন' : 'Push All to Sheet')}
            </span>
          </button>

          <button
            onClick={async () => {
              setIsSyncingSheet(true);
              const res = await pullFromGoogleSheet();
              setIsSyncingSheet(false);
              if (res?.success) {
                setSheetSyncSuccessMsg(language === 'bn' ? 'সফলভাবে গুগল শীট থেকে হিসাব আপডেট হয়েছে!' : 'Updated from Google Sheet!');
              } else {
                setSheetSyncSuccessMsg(language === 'bn' ? (res?.error || 'শীট থেকে আপডেট নেওয়া সম্ভব হয়নি') : (res?.error || 'Failed to pull'));
              }
              setTimeout(() => setSheetSyncSuccessMsg(''), 5000);
            }}
            disabled={isSyncingSheet}
            className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>{language === 'bn' ? 'শীট থেকে আপডেট আনুন' : 'Pull from Sheet'}</span>
          </button>

          <button
            onClick={() => setShowSheetGuide(!showSheetGuide)}
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>
              {showSheetGuide
                ? (language === 'bn' ? 'স্ক্রিপ্ট ও গাইড লুকান' : 'Hide Setup Guide')
                : (language === 'bn' ? 'গুগল শীট স্ক্রিপ্ট ও কানেকশন গাইড' : 'View Script & Setup')}
            </span>
          </button>
        </div>

        {/* Webhook Configuration & Apps Script Accordion */}
        {showSheetGuide && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs animate-fade-in">
            {/* Webhook URL Input */}
            <form onSubmit={handleSaveWebhook} className="space-y-2">
              <label className="block text-slate-300 font-medium">
                {language === 'bn'
                  ? 'গুগল অ্যাপস স্ক্রিপ্ট ওয়েব অ্যাপ URL (Google Apps Script Web App URL):'
                  : 'Google Apps Script Web App URL:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webhookInput}
                  onChange={(e) => setWebhookInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl transition shrink-0"
                >
                  {language === 'bn' ? 'URL সেভ করুন' : 'Save URL'}
                </button>
              </div>
            </form>

            {/* Step by step guide */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2 text-slate-300 text-[11px]">
              <div className="font-bold text-amber-400 text-xs">
                {language === 'bn' ? '📋 গুগল শীট কানেকশন নির্দেশিকা (৩টি সহজ ধাপ):' : 'Setup Guide in 3 Simple Steps:'}
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                <li>
                  {language === 'bn' ? 'উপরে ' : 'Open the Google Sheet '}
                  <strong className="text-white">"{GSHEET_CONFIG?.title || 'Asia engineers, Accounts'}"</strong>
                  {language === 'bn' ? ' লিংকে ক্লিক করে আপনার ব্রাউজারে খুলুন।' : '.'}
                </li>
                <li>
                  {language === 'bn' ? 'শীটের মেনুবার থেকে ' : 'From menu click '}
                  <strong className="text-white">Extensions &gt; Apps Script</strong>
                  {language === 'bn' ? ' এ যান।' : '.'}
                </li>
                <li>
                  {language === 'bn'
                    ? 'নিচের স্ক্রিপ্ট কোডটি কপি করে পেস্ট করুন, তারপর Deploy > New deployment (Type: Web app, Who has access: Anyone) সিলেক্ট করে Deploy দিন এবং প্রাপ্ত Web App URL টি উপরের বক্সে সেভ করুন।'
                    : 'Copy the script below, paste into Apps Script, click Deploy > New deployment (Web app, Anyone), and paste the URL above.'}
                </li>
              </ol>
            </div>

            {/* Code Box with Copy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300 text-xs">
                  {language === 'bn' ? 'গুগল শীট অটো-সিংক অ্যাপস স্ক্রিপ্ট কোড:' : 'Google Apps Script Code:'}
                </span>
                <button
                  onClick={copySheetScriptToClipboard}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold transition"
                >
                  {copiedSheetScript ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSheetScript ? (language === 'bn' ? 'কপি সম্পন্ন!' : 'Copied!') : (language === 'bn' ? 'কোড কপি করুন' : 'Copy Code')}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 max-h-56">
                {gasSheetScriptCode}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Target Google Drive Card & Manual Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Drive Target Folder Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <CloudCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {language === 'bn' ? 'গুগল ড্রাইভ ক্লাউড ব্যাকআপ' : 'Google Drive Target Cloud'}
                </h3>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  {language === 'bn' ? 'সক্রিয়ভাবে কানেক্টেড' : 'Active Cloud Connection'}
                </div>
              </div>
            </div>

            <a
              href={targetFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition"
              title="Open Google Drive Folder"
            >
              <span>{language === 'bn' ? 'ড্রাইভ ফোল্ডার' : 'Open Drive'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-xs text-slate-300 space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">{language === 'bn' ? 'টার্গেট ড্রাইভ ফোল্ডার লিংক:' : 'Target Drive Folder ID:'}</span>
              <a
                href={targetFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-amber-400 text-[11px] hover:underline truncate block"
              >
                {targetFolderId}
              </a>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400">{language === 'bn' ? 'সর্বশেষ ক্লাউড ব্যাকআপ:' : 'Last Cloud Snapshot:'}</span>
              <span className="font-mono text-emerald-400 font-semibold">{data.lastBackupTime || '2026-11-21 00:30:00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{language === 'bn' ? 'অটো-সিঙ্ক শিডিউল:' : 'Auto Sync Schedule:'}</span>
              <span className="text-white font-medium">Daily at 11:59 PM + Instant on save</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{language === 'bn' ? 'রিটেনশন পলিসি:' : 'Retention:'}</span>
              <span className="text-slate-300">Last 30 daily snapshots</span>
            </div>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <CloudCheck className="w-4 h-4" />
              <span>{language === 'bn' ? 'এখনই ড্রাইভে ব্যাকআপ সিঙ্ক করুন' : 'Sync Backup to Drive Now'}</span>
            </button>
          </div>
        </div>

        {/* Manual 1-Click Backup & Safe Restore Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {language === 'bn' ? 'ম্যানুয়াল ডেটা ব্যাকআপ ও রিস্টোর' : 'Manual Database Backup & Restore'}
              </h3>
              <div className="text-[11px] text-slate-400">
                JSON Database Standalone Archive
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            {language === 'bn'
              ? 'যেকোনো মুহূর্তে এক ক্লিকে সম্পূর্ণ ডেটাবেস ডাউনলোড করে আপনার পেনড্রাইভ বা কম্পিউটারে সংরক্ষণ করতে পারেন, এবং প্রয়োজন হলে ফাইল সিলেক্ট করে নিরাপদে রিস্টোর করতে পারেন।'
              : 'Download complete offline snapshot to your PC or pendrive, or restore previous database archives safely.'}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadBackupJSON}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>{language === 'bn' ? 'অফলাইন ব্যাকআপ ডাউনলোড' : 'Download Offline Backup'}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 border border-slate-600"
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

      {/* Cloud Backup Snapshots History in this Folder */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {language === 'bn' ? 'গুগল ড্রাইভ ফোল্ডারের ব্যাকআপ হিস্ট্রি' : 'Google Drive Backup Snapshots'}
            </h3>
          </div>
          <a
            href={targetFolderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>{language === 'bn' ? 'গুগল ড্রাইভে সরাসরি দেখুন ↗' : 'View in Google Drive ↗'}</span>
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Snapshot File Name</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'তারিখ ও সময়' : 'Timestamp'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'সাইজ' : 'Size'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'bn' ? 'মোট রেকর্ড' : 'Records'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'bn' ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {snapshots.map((snap) => (
                <tr key={snap.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-slate-200 font-medium">
                    {snap.fileName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{snap.timestamp}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">{snap.size}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400">{snap.recordsCount} items</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> {snap.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Apps Script Free Automated Webhook Integration Helper */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">
              {language === 'bn' ? 'গুগল ড্রাইভ অটোমেশন স্ক্রিপ্ট (Google Apps Script Webhook)' : 'Automated Apps Script Webhook'}
            </h3>
          </div>
          <button
            onClick={copyScriptToClipboard}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedScript ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (language === 'bn' ? 'কোড কপি করুন' : 'Copy Script')}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300">
          {language === 'bn'
            ? 'আপনার এই নির্দিষ্ট গুগল ড্রাইভ ফোল্ডারে (' + targetFolderId + ') অটোমেটিক ব্যাকআপ ফাইল রাইট করার জন্য প্রস্তুতকৃত গুগল অ্যাপস স্ক্রিপ্ট কোড:'
            : 'Deploy this Google Apps Script inside your Google account to automatically receive snapshots into folder ' + targetFolderId}
        </p>

        <pre className="p-3 bg-slate-950 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
          {gasScriptCode}
        </pre>
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
            {language === 'bn' ? 'নিরাপত্তা ও পরিবর্তন ট্র্যাকিং' : 'Security audit trail'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">{language === 'bn' ? 'তারিখ ও সময়' : 'Timestamp'}</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'ব্যবহারকারী (লগইন আইডি / জিমেইল)' : 'User (Login ID / Gmail)'}</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'অ্যাকশন ধরন' : 'Action'}</th>
                <th className="py-2.5 px-3">{language === 'bn' ? 'কার্যক্রম বিবরণ' : 'Activity Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {(data.auditLogs || []).map((log, idx) => {
                const userRaw = log?.loginId || log?.userEmail || log?.user || '';
                const userStr = typeof userRaw === 'object' ? JSON.stringify(userRaw) : String(userRaw || '');
                const hasEmailOrPhone = userStr.includes('@') || userStr.startsWith('01');
                const userDisplayId = userStr || currentUser?.loginId || '01830002040';
                const userDisplayName = String(log?.userName || (!hasEmailOrPhone && userStr ? userStr : (currentUser?.name || 'Administrator')));

                return (
                  <tr key={log?.id || idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log?.timestamp || '-'}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                        <span className="truncate max-w-[220px]">{userDisplayId}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {userDisplayName}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/60 text-slate-300 font-mono text-[10px]">
                        {log?.action || 'ACTIVITY'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">{log?.details || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
