import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  COMPANY_INFO,
  GDRIVE_CONFIG,
  GSHEET_CONFIG,
  INITIAL_BACKUP_SNAPSHOTS,
  INITIAL_ACCOUNTS,
  INITIAL_PROJECTS,
  INITIAL_MATERIALS,
  INITIAL_EMPLOYEES,
  INITIAL_TRANSACTIONS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SALARY_SHEET,
  INITIAL_DAILY_LABORS,
  INITIAL_LABOR_ATTENDANCE,
  INITIAL_LEDGERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_INCOME_CATEGORIES,
  INITIAL_EXPENSE_CATEGORIES,
  INITIAL_DEVELOPER_PROFILE
} from '../data/initialData';

const AppContext = createContext();

const STORAGE_KEY = 'AE_ACCOUNTING_DATA_V1';

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('AE_LANG') || 'bn');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('AE_AUTH') !== 'false');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Engr. M. A. Hannan',
    role: 'Administrator / Director',
    phone: '01830002040',
    email: 'hannan@asiaengineersbd.com'
  });

  // State initialization with localStorage fallback
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          accounts: parsed.accounts || INITIAL_ACCOUNTS,
          projects: parsed.projects || INITIAL_PROJECTS,
          materials: parsed.materials || INITIAL_MATERIALS,
          employees: parsed.employees || INITIAL_EMPLOYEES,
          transactions: parsed.transactions || INITIAL_TRANSACTIONS,
          stockMovements: parsed.stockMovements || INITIAL_STOCK_MOVEMENTS,
          salarySheet: parsed.salarySheet || INITIAL_SALARY_SHEET,
          dailyLabors: parsed.dailyLabors || INITIAL_DAILY_LABORS,
          laborAttendance: parsed.laborAttendance || INITIAL_LABOR_ATTENDANCE,
          ledgers: parsed.ledgers || INITIAL_LEDGERS,
          auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          incomeCategories: parsed.incomeCategories || INITIAL_INCOME_CATEGORIES,
          expenseCategories: parsed.expenseCategories || INITIAL_EXPENSE_CATEGORIES,
          developerProfile: (() => {
            const dp = parsed.developerProfile || INITIAL_DEVELOPER_PROFILE;
            if (!dp.name || dp.name.includes("Masum") || dp.phone === "01830002040" || !dp.phone) {
              return {
                ...dp,
                name: "ইঞ্জি. মোহাম্মদ আব্দুল মান্নান",
                englishName: "Engr. Md. Abdul Mannan",
                phone: "01928571761"
              };
            }
            return dp;
          })(),
          gdriveConnected: parsed.gdriveConnected ?? true,
          gdriveFolderId: parsed.gdriveFolderId || GDRIVE_CONFIG.folderId,
          gdriveFolderUrl: parsed.gdriveFolderUrl || GDRIVE_CONFIG.folderUrl,
          backupSnapshots: parsed.backupSnapshots || INITIAL_BACKUP_SNAPSHOTS,
          lastBackupTime: parsed.lastBackupTime || '2026-11-21 00:30:00',
          activeTab: parsed.activeTab || 'dashboard'
        };
      }
    } catch (e) {
      console.error('Error loading stored data:', e);
    }
    return {
      accounts: INITIAL_ACCOUNTS,
      projects: INITIAL_PROJECTS,
      materials: INITIAL_MATERIALS,
      employees: INITIAL_EMPLOYEES,
      transactions: INITIAL_TRANSACTIONS,
      stockMovements: INITIAL_STOCK_MOVEMENTS,
      salarySheet: INITIAL_SALARY_SHEET,
      dailyLabors: INITIAL_DAILY_LABORS,
      laborAttendance: INITIAL_LABOR_ATTENDANCE,
      ledgers: INITIAL_LEDGERS,
      auditLogs: INITIAL_AUDIT_LOGS,
      incomeCategories: INITIAL_INCOME_CATEGORIES,
      expenseCategories: INITIAL_EXPENSE_CATEGORIES,
      developerProfile: INITIAL_DEVELOPER_PROFILE,
      gdriveConnected: true,
      gdriveFolderId: GDRIVE_CONFIG.folderId,
      gdriveFolderUrl: GDRIVE_CONFIG.folderUrl,
      backupSnapshots: INITIAL_BACKUP_SNAPSHOTS,
      lastBackupTime: '2026-11-21 00:30:00',
      activeTab: 'dashboard'
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState(null);

  // Google Sheets Instant Real-Time Sync State
  const [gsheetWebhookUrl, setGsheetWebhookUrlState] = useState(() => {
    const saved = localStorage.getItem('AE_GSHEET_WEBHOOK_URL');
    if (saved && saved.startsWith('http') && !saved.includes('demo') && saved.length > 25) {
      return saved;
    }
    const defaultUrl = GSHEET_CONFIG.webhookUrl || 'https://script.google.com/macros/s/AKfycby3Ef_nuVL-vQogTvAY5HEhqsh91VSnI-7vUX2L6BTAzVvlwarnV3AyFSpgoWGEk40/exec';
    localStorage.setItem('AE_GSHEET_WEBHOOK_URL', defaultUrl);
    return defaultUrl;
  });
  const [gsheetAutoSync, setGsheetAutoSyncState] = useState(() => {
    const saved = localStorage.getItem('AE_GSHEET_AUTOSYNC');
    return saved !== null ? saved === 'true' : true;
  });
  const [gsheetSyncStatus, setGsheetSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
  const [gsheetLastSyncTime, setGsheetLastSyncTime] = useState(() => {
    return localStorage.getItem('AE_GSHEET_LAST_SYNC') || '2026-11-21 23:25:00';
  });

  const setGsheetWebhookUrl = (url) => {
    setGsheetWebhookUrlState(url);
    localStorage.setItem('AE_GSHEET_WEBHOOK_URL', url);
  };

  const setGsheetAutoSync = (val) => {
    setGsheetAutoSyncState(val);
    localStorage.setItem('AE_GSHEET_AUTOSYNC', String(val));
  };

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }, [data]);

  // Save language
  useEffect(() => {
    localStorage.setItem('AE_LANG', language);
  }, [language]);

  const login = (username, password) => {
    // Standard credential check for Director / Administrator
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (
      (cleanUser === 'admin' || cleanUser === '01830002040' || cleanUser === 'hannan' || cleanUser === 'director') &&
      (cleanPass === 'ae2026' || cleanPass === 'admin' || cleanPass === '1234' || cleanPass === '01830002040')
    ) {
      setIsAuthenticated(true);
      setShowLoginModal(false);
      localStorage.setItem('AE_AUTH', 'true');
      logAudit('USER_LOGIN', `Director ${currentUser.name} signed in successfully`);
      return { success: true };
    }
    return { success: false, error: language === 'bn' ? 'ইউজারনেম বা পাসওয়ার্ড সঠিক নয়!' : 'Invalid username or password!' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem('AE_AUTH', 'false');
    logAudit('USER_LOGOUT', `Director ${currentUser.name} logged out`);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'bn' ? 'en' : 'bn');
  };

  // Helper to append audit log
  const logAudit = (action, details) => {
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser.name,
      action,
      details
    };
    setData(prev => ({
      ...prev,
      auditLogs: [newLog, ...prev.auditLogs]
    }));
  };

  // Generate Unique Sequential Voucher Number: AE-RC-2026-XXXX or AE-PV-2026-XXXX
  const generateVoucherNumber = (type) => {
    const year = new Date().getFullYear();
    const prefix = type === 'income' ? `AE-RC-${year}-` : `AE-PV-${year}-`;
    const matchingTxns = data.transactions.filter(t => t.voucherNo && t.voucherNo.startsWith(prefix));
    const nextSeq = matchingTxns.length + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  };

  // 1. Add Transaction
  const addTransaction = (newTxn) => {
    const voucherNo = newTxn.voucherNo || generateVoucherNumber(newTxn.type);
    const txnRecord = {
      ...newTxn,
      id: `TXN-${Date.now()}`,
      voucherNo,
      preparedBy: newTxn.preparedBy || currentUser.name,
      approvedBy: currentUser.name,
      amount: Number(newTxn.amount)
    };

    setData(prev => {
      // Update account balance
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.id === txnRecord.accountId) {
          const delta = txnRecord.type === 'income' ? txnRecord.amount : -txnRecord.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      });

      // Update project amounts if project assigned
      let updatedProjects = prev.projects;
      if (txnRecord.projectId) {
        updatedProjects = prev.projects.map(p => {
          if (p.id === txnRecord.projectId) {
            if (txnRecord.type === 'income') {
              return { ...p, receivedAmount: (p.receivedAmount || 0) + txnRecord.amount };
            } else {
              return { ...p, spentAmount: (p.spentAmount || 0) + txnRecord.amount };
            }
          }
          return p;
        });
      }

      // Update Client or Supplier ledger
      const updatedLedgers = prev.ledgers.map(l => {
        if (l.name === txnRecord.party) {
          if (l.type === 'client' && txnRecord.type === 'income') {
            const newReceived = (l.totalReceived || 0) + txnRecord.amount;
            return { ...l, totalReceived: newReceived, dueBalance: Math.max(0, (l.totalBilled || 0) - newReceived) };
          }
          if (l.type === 'supplier' && txnRecord.type === 'expense') {
            const newPaid = (l.totalPaid || 0) + txnRecord.amount;
            return { ...l, totalPaid: newPaid, dueBalance: Math.max(0, (l.totalPurchased || 0) - newPaid) };
          }
        }
        return l;
      });

      return {
        ...prev,
        transactions: [txnRecord, ...prev.transactions],
        accounts: updatedAccounts,
        projects: updatedProjects,
        ledgers: updatedLedgers
      };
    });

    logAudit(
      txnRecord.type === 'income' ? 'MONEY_RECEIPT_CREATED' : 'PAYMENT_VOUCHER_CREATED',
      `${voucherNo}: ৳${txnRecord.amount.toLocaleString()} - ${txnRecord.party} (${txnRecord.description})`
    );

    if (gsheetAutoSync) {
      setTimeout(() => syncToGoogleSheet('ADD_TRANSACTION', txnRecord), 50);
    }

    return txnRecord;
  };

  const updateTransaction = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => {
        if (t.id === id) {
          return {
            ...t,
            ...updatedFields,
            amount: updatedFields.amount !== undefined ? Number(updatedFields.amount) : t.amount
          };
        }
        return t;
      })
    }));
    logAudit('TRANSACTION_UPDATED', `Updated transaction ${id}`);
    if (gsheetAutoSync) {
      setTimeout(() => syncToGoogleSheet('UPDATE_TRANSACTION', { id, ...updatedFields }), 50);
    }
  };

  const deleteTransaction = (id) => {
    const txn = data.transactions.find(t => t.id === id);
    if (!txn) return;
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
    logAudit('TRANSACTION_DELETED', `Deleted transaction ${txn.voucherNo || id}`);
    if (gsheetAutoSync) {
      setTimeout(() => syncToGoogleSheet('DELETE_TRANSACTION', { id, voucherNo: txn.voucherNo }), 50);
    }
  };

  // 2. Fund Transfer between accounts (e.g. Bank to Cash or Cash to Bank)
  const transferFunds = ({ fromAccountId, toAccountId, amount, description, date }) => {
    const numAmount = Number(amount);
    const fromAcc = data.accounts.find(a => a.id === fromAccountId);
    const toAcc = data.accounts.find(a => a.id === toAccountId);

    if (!fromAcc || !toAcc || numAmount <= 0) return false;
    if (fromAcc.balance < numAmount) {
      alert(language === 'bn' ? 'অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient funds in the source account!');
      return false;
    }

    const year = new Date().getFullYear();
    const voucherNo = `AE-TR-${year}-${String(Date.now()).slice(-4)}`;

    const transferTxn = {
      id: `TRF-${Date.now()}`,
      voucherNo,
      type: 'transfer',
      date: date || new Date().toISOString().slice(0, 10),
      party: `${fromAcc.name} ➔ ${toAcc.name}`,
      category: 'Inter-Account Transfer',
      amount: numAmount,
      accountId: fromAccountId,
      toAccountId: toAccountId,
      description: description || `Fund transferred from ${fromAcc.name} to ${toAcc.name}`,
      preparedBy: currentUser.name,
      approvedBy: currentUser.name
    };

    setData(prev => ({
      ...prev,
      transactions: [transferTxn, ...prev.transactions],
      accounts: prev.accounts.map(acc => {
        if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - numAmount };
        if (acc.id === toAccountId) return { ...acc, balance: acc.balance + numAmount };
        return acc;
      })
    }));

    logAudit('ACCOUNT_TRANSFER', `Transferred ৳${numAmount.toLocaleString()} from ${fromAcc.name} to ${toAcc.name}`);
    return true;
  };

  // 3. Projects
  const addProject = (project) => {
    const newPrj = {
      ...project,
      id: project.id || `PRJ-2026-${String(data.projects.length + 1).padStart(2, '0')}`,
      contractValue: Number(project.contractValue || 0),
      budget: Number(project.budget || 0),
      receivedAmount: Number(project.receivedAmount || 0),
      spentAmount: Number(project.spentAmount || 0),
      status: project.status || 'In Progress'
    };
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, newPrj]
    }));
    logAudit('PROJECT_CREATED', `Project ${newPrj.id}: ${newPrj.name} (${newPrj.client})`);
  };

  const updateProject = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id === id) {
          return {
            ...p,
            ...updatedFields,
            contractValue: updatedFields.contractValue !== undefined ? Number(updatedFields.contractValue) : p.contractValue,
            budget: updatedFields.budget !== undefined ? Number(updatedFields.budget) : p.budget,
            receivedAmount: updatedFields.receivedAmount !== undefined ? Number(updatedFields.receivedAmount) : p.receivedAmount,
            spentAmount: updatedFields.spentAmount !== undefined ? Number(updatedFields.spentAmount) : p.spentAmount
          };
        }
        return p;
      })
    }));
    logAudit('PROJECT_UPDATED', `Updated project ${id}`);
  };

  const deleteProject = (id) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
    logAudit('PROJECT_DELETED', `Deleted project ${id}`);
  };

  // 4. Material Inward (Purchase) & Outward (Issue to Site)
  const recordStockMovement = (movement) => {
    const { materialId, type, qty, rate, supplier, projectId, note, date } = movement;
    const numQty = Number(qty);
    const numRate = Number(rate);
    const targetMat = data.materials.find(m => m.id === materialId);
    if (!targetMat) return false;

    if (type === 'outward' && targetMat.currentStock < numQty) {
      alert(language === 'bn' ? 'স্টকে পর্যাপ্ত পরিমাণ মালামাল নেই!' : 'Insufficient stock quantity!');
      return false;
    }

    const year = new Date().getFullYear();
    const voucherNo = type === 'inward'
      ? `AE-MAT-IN-${year}-${String(Date.now()).slice(-4)}`
      : `AE-MAT-OUT-${year}-${String(Date.now()).slice(-4)}`;

    const newMov = {
      id: `MOV-${Date.now()}`,
      date: date || new Date().toISOString().slice(0, 10),
      materialId,
      materialName: targetMat.name,
      type,
      qty: numQty,
      unit: targetMat.unit,
      rate: numRate,
      supplier: supplier || '-',
      projectId: projectId || null,
      voucherNo,
      note: note || ''
    };

    setData(prev => {
      const updatedMaterials = prev.materials.map(m => {
        if (m.id === materialId) {
          const newQty = type === 'inward' ? (m.currentStock + numQty) : (m.currentStock - numQty);
          return { ...m, currentStock: Math.round(newQty * 100) / 100 };
        }
        return m;
      });

      return {
        ...prev,
        materials: updatedMaterials,
        stockMovements: [newMov, ...prev.stockMovements]
      };
    });

    logAudit(
      type === 'inward' ? 'STOCK_PURCHASE_INWARD' : 'STOCK_ISSUE_OUTWARD',
      `${targetMat.name}: ${numQty} ${targetMat.unit} (${type.toUpperCase()})`
    );

    return true;
  };

  const updateStockMovement = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      stockMovements: prev.stockMovements.map(m => {
        if (m.id === id) {
          return {
            ...m,
            ...updatedFields,
            qty: updatedFields.qty !== undefined ? Number(updatedFields.qty) : m.qty
          };
        }
        return m;
      })
    }));
    logAudit('STOCK_MOVEMENT_UPDATED', `Updated movement ${id}`);
  };

  const deleteStockMovement = (id) => {
    setData(prev => ({
      ...prev,
      stockMovements: prev.stockMovements.filter(m => m.id !== id)
    }));
    logAudit('STOCK_MOVEMENT_DELETED', `Deleted movement ${id}`);
  };

  const addMaterial = (mat) => {
    const newMat = {
      ...mat,
      id: `MAT-${String(data.materials.length + 1).padStart(3, '0')}`,
      currentStock: Number(mat.currentStock || 0),
      minStockAlert: Number(mat.minStockAlert || 0),
      unitPriceAvg: Number(mat.unitPriceAvg || 0)
    };
    setData(prev => ({
      ...prev,
      materials: [...prev.materials, newMat]
    }));
    logAudit('MATERIAL_CATALOG_ADDED', `${newMat.code} - ${newMat.name}`);
  };

  const updateMaterial = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      materials: prev.materials.map(m => {
        if (m.id === id) {
          return {
            ...m,
            ...updatedFields,
            currentStock: updatedFields.currentStock !== undefined ? Number(updatedFields.currentStock) : m.currentStock,
            minStockAlert: updatedFields.minStockAlert !== undefined ? Number(updatedFields.minStockAlert) : m.minStockAlert,
            unitPriceAvg: updatedFields.unitPriceAvg !== undefined ? Number(updatedFields.unitPriceAvg) : m.unitPriceAvg
          };
        }
        return m;
      })
    }));
    logAudit('MATERIAL_UPDATED', `Updated material ${id}`);
  };

  const deleteMaterial = (id) => {
    setData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id)
    }));
    logAudit('MATERIAL_DELETED', `Deleted material ${id}`);
  };

  // 5. Employee & Salary Processing
  const addEmployee = (emp) => {
    const newEmp = {
      ...emp,
      id: `EMP-${String(data.employees.length + 1).padStart(3, '0')}`,
      monthlySalary: Number(emp.monthlySalary || 0),
      status: 'Active'
    };
    setData(prev => ({
      ...prev,
      employees: [...prev.employees, newEmp]
    }));
    logAudit('EMPLOYEE_ADDED', `${newEmp.id}: ${newEmp.name} (${newEmp.designation})`);
  };

  const updateEmployee = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.map(e => {
        if (e.id === id) {
          return {
            ...e,
            ...updatedFields,
            monthlySalary: updatedFields.monthlySalary !== undefined ? Number(updatedFields.monthlySalary) : e.monthlySalary
          };
        }
        return e;
      })
    }));
    logAudit('EMPLOYEE_UPDATED', `Updated employee ${id}`);
  };

  const deleteEmployee = (id) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== id)
    }));
    logAudit('EMPLOYEE_DELETED', `Deleted employee ${id}`);
  };

  const payEmployeeSalary = ({ salaryId, employeeId, accountId, paidAmount, paymentDate }) => {
    const emp = data.employees.find(e => e.id === employeeId);
    const acc = data.accounts.find(a => a.id === accountId);
    if (!emp || !acc) return;

    const voucherNo = generateVoucherNumber('expense');

    // 1. Add expense transaction
    addTransaction({
      voucherNo,
      type: 'expense',
      date: paymentDate || new Date().toISOString().slice(0, 10),
      party: `${emp.name} (${emp.designation})`,
      category: 'Employee Salary',
      amount: paidAmount,
      accountId: accountId,
      description: `Monthly salary disbursement for ${emp.name}`,
      note: `Paid via ${acc.name}. Voucher #${voucherNo}`
    });

    // 2. Update salary sheet
    setData(prev => ({
      ...prev,
      salarySheet: prev.salarySheet.map(s => {
        if (s.id === salaryId) {
          return {
            ...s,
            status: 'Paid',
            paidDate: paymentDate || new Date().toISOString().slice(0, 10),
            paymentMethod: acc.name,
            voucherNo
          };
        }
        return s;
      })
    }));

    logAudit('SALARY_PAID', `Disbursed ৳${paidAmount.toLocaleString()} to ${emp.name} via ${acc.name}`);
  };

  const updateSalarySheet = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      salarySheet: prev.salarySheet.map(s => {
        if (s.id === id) {
          const basic = updatedFields.basicSalary !== undefined ? Number(updatedFields.basicSalary) : s.basicSalary;
          const bonus = updatedFields.bonus !== undefined ? Number(updatedFields.bonus) : s.bonus;
          const advance = updatedFields.advance !== undefined ? Number(updatedFields.advance) : s.advance;
          const net = basic + bonus - advance;
          return {
            ...s,
            ...updatedFields,
            basicSalary: basic,
            bonus: bonus,
            advance: advance,
            netPayable: net
          };
        }
        return s;
      })
    }));
    logAudit('SALARY_RECORD_UPDATED', `Updated salary record ${id}`);
  };

  const deleteSalarySheet = (id) => {
    setData(prev => ({
      ...prev,
      salarySheet: prev.salarySheet.filter(s => s.id !== id)
    }));
    logAudit('SALARY_RECORD_DELETED', `Deleted salary record ${id}`);
  };

  // 6. Client / Supplier Ledger additions
  const addLedger = (ledger) => {
    const newLedger = {
      ...ledger,
      id: `LED-${String(data.ledgers.length + 1).padStart(3, '0')}`,
      totalBilled: Number(ledger.totalBilled || 0),
      totalReceived: Number(ledger.totalReceived || 0),
      totalPurchased: Number(ledger.totalPurchased || 0),
      totalPaid: Number(ledger.totalPaid || 0),
      dueBalance: Number(ledger.dueBalance || 0),
      status: 'Active'
    };
    setData(prev => ({
      ...prev,
      ledgers: [...prev.ledgers, newLedger]
    }));
    logAudit('LEDGER_CREATED', `${newLedger.name} (${newLedger.type})`);
  };

  const updateLedger = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      ledgers: prev.ledgers.map(l => {
        if (l.id === id) {
          return {
            ...l,
            ...updatedFields,
            totalBilled: updatedFields.totalBilled !== undefined ? Number(updatedFields.totalBilled) : l.totalBilled,
            totalReceived: updatedFields.totalReceived !== undefined ? Number(updatedFields.totalReceived) : l.totalReceived,
            totalPurchased: updatedFields.totalPurchased !== undefined ? Number(updatedFields.totalPurchased) : l.totalPurchased,
            totalPaid: updatedFields.totalPaid !== undefined ? Number(updatedFields.totalPaid) : l.totalPaid,
            dueBalance: updatedFields.dueBalance !== undefined ? Number(updatedFields.dueBalance) : l.dueBalance
          };
        }
        return l;
      })
    }));
    logAudit('LEDGER_UPDATED', `Updated ledger ${id}`);
  };

  const deleteLedger = (id) => {
    setData(prev => ({
      ...prev,
      ledgers: prev.ledgers.filter(l => l.id !== id)
    }));
    logAudit('LEDGER_DELETED', `Deleted ledger ${id}`);
  };

  // 7. Daily Labor Roster & Master Attendance Management
  const addDailyLabor = (labor) => {
    const newLabor = {
      ...labor,
      id: `DL-${String((data.dailyLabors || []).length + 1).padStart(3, '0')}`,
      dailyRate: Number(labor.dailyRate || 0),
      overtimeRate: Number(labor.overtimeRate || 0),
      status: labor.status || 'Active'
    };
    setData(prev => ({
      ...prev,
      dailyLabors: [...(prev.dailyLabors || []), newLabor]
    }));
    logAudit('DAILY_LABOR_ADDED', `Added daily worker ${newLabor.id}: ${newLabor.name} (${newLabor.trade})`);
    return newLabor;
  };

  const updateDailyLabor = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      dailyLabors: (prev.dailyLabors || []).map(l => {
        if (l.id === id) {
          return {
            ...l,
            ...updatedFields,
            dailyRate: updatedFields.dailyRate !== undefined ? Number(updatedFields.dailyRate) : l.dailyRate,
            overtimeRate: updatedFields.overtimeRate !== undefined ? Number(updatedFields.overtimeRate) : l.overtimeRate
          };
        }
        return l;
      })
    }));
    logAudit('DAILY_LABOR_UPDATED', `Updated daily worker ${id}`);
  };

  const deleteDailyLabor = (id) => {
    setData(prev => ({
      ...prev,
      dailyLabors: (prev.dailyLabors || []).filter(l => l.id !== id)
    }));
    logAudit('DAILY_LABOR_DELETED', `Deleted daily worker ${id}`);
  };

  // Record Attendance (Single or Batch)
  const recordDailyAttendance = (records) => {
    const list = Array.isArray(records) ? records : [records];
    const newEntries = list.map((rec, idx) => {
      const attendanceDays = rec.status === 'Present' ? 1.0 : rec.status === 'Half Day' ? 0.5 : 0;
      const dailyRate = Number(rec.dailyRate || 0);
      const otHours = Number(rec.otHours || 0);
      const otRate = Number(rec.otRate || 0);
      const advanceTaken = Number(rec.advanceTaken || 0);
      const basicWage = Math.round(attendanceDays * dailyRate);
      const otWage = Math.round(otHours * otRate);
      const grossWage = basicWage + otWage;
      const netPayable = Math.max(0, grossWage - advanceTaken);

      return {
        id: rec.id || `ATT-${Date.now()}-${idx}`,
        date: rec.date || new Date().toISOString().slice(0, 10),
        laborId: rec.laborId,
        projectId: rec.projectId || null,
        status: rec.status || 'Present',
        attendanceDays,
        dailyRate,
        basicWage,
        otHours,
        otRate,
        otWage,
        grossWage,
        advanceTaken,
        netPayable,
        paymentStatus: rec.paymentStatus || 'Due',
        paidVoucherNo: rec.paidVoucherNo || '-',
        note: rec.note || ''
      };
    });

    setData(prev => ({
      ...prev,
      laborAttendance: [...newEntries, ...(prev.laborAttendance || [])]
    }));
    logAudit('LABOR_ATTENDANCE_RECORDED', `Recorded attendance for ${newEntries.length} worker entries`);
    if (gsheetAutoSync) {
      setTimeout(() => syncToGoogleSheet('ADD_ATTENDANCE', newEntries), 50);
    }
    return newEntries;
  };

  const updateDailyAttendance = (id, updatedFields) => {
    setData(prev => ({
      ...prev,
      laborAttendance: (prev.laborAttendance || []).map(att => {
        if (att.id === id) {
          const merged = { ...att, ...updatedFields };
          const attendanceDays = merged.status === 'Present' ? 1.0 : merged.status === 'Half Day' ? 0.5 : 0;
          const dailyRate = Number(merged.dailyRate || 0);
          const otHours = Number(merged.otHours || 0);
          const otRate = Number(merged.otRate || 0);
          const advanceTaken = Number(merged.advanceTaken || 0);
          const basicWage = Math.round(attendanceDays * dailyRate);
          const otWage = Math.round(otHours * otRate);
          const grossWage = basicWage + otWage;
          const netPayable = Math.max(0, grossWage - advanceTaken);

          return {
            ...merged,
            attendanceDays,
            dailyRate,
            otHours,
            otRate,
            advanceTaken,
            basicWage,
            otWage,
            grossWage,
            netPayable
          };
        }
        return att;
      })
    }));
    logAudit('LABOR_ATTENDANCE_UPDATED', `Updated attendance record ${id}`);
    if (gsheetAutoSync) {
      setTimeout(() => syncToGoogleSheet('UPDATE_ATTENDANCE', { id, ...updatedFields }), 50);
    }
  };

  const deleteDailyAttendance = (id) => {
    setData(prev => ({
      ...prev,
      laborAttendance: (prev.laborAttendance || []).filter(a => a.id !== id)
    }));
    logAudit('LABOR_ATTENDANCE_DELETED', `Deleted attendance record ${id}`);
    if (gsheetAutoSync) {
      setTimeout(() => syncToGoogleSheet('DELETE_ATTENDANCE', { id }), 50);
    }
  };

  // Disburse Labor Wage Settlement (Cash/Bank)
  const disburseLaborWage = ({ laborId, accountId, paidAmount, paymentDate, attendanceIds = [], note = '' }) => {
    const labor = (data.dailyLabors || []).find(l => l.id === laborId);
    const acc = data.accounts.find(a => a.id === accountId);
    if (!labor || !acc || Number(paidAmount) <= 0) return false;

    const voucherNo = generateVoucherNumber('expense');

    // 1. Create expense transaction
    addTransaction({
      voucherNo,
      type: 'expense',
      date: paymentDate || new Date().toISOString().slice(0, 10),
      party: `${labor.name} (${labor.trade})`,
      category: 'Labor & Fabrication',
      amount: Number(paidAmount),
      accountId: accountId,
      projectId: labor.assignedProjectId || null,
      description: `Daily labor wage disbursement for ${labor.name} (${labor.trade})`,
      note: note || `Disbursed from ${acc.name}. Voucher #${voucherNo}`
    });

    // 2. Mark attendance records as Paid
    if (attendanceIds.length > 0) {
      setData(prev => ({
        ...prev,
        laborAttendance: (prev.laborAttendance || []).map(att => {
          if (attendanceIds.includes(att.id)) {
            return {
              ...att,
              paymentStatus: 'Paid',
              paidVoucherNo: voucherNo
            };
          }
          return att;
        })
      }));
    }

    logAudit('LABOR_WAGE_DISBURSED', `Paid ৳${Number(paidAmount).toLocaleString()} wage to ${labor.name} via ${acc.name} (${voucherNo})`);
    return voucherNo;
  };

  // 7. Export to Excel (.xlsx) using xlsx library
  const exportAllToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Accounts Sheet
      const accountsData = data.accounts.map(a => ({
        "Account Name": a.name,
        "Type": a.type,
        "Account / Ref": a.accountNumber,
        "Balance (BDT)": a.balance
      }));
      const wsAccounts = XLSX.utils.json_to_sheet(accountsData);
      XLSX.utils.book_append_sheet(wb, wsAccounts, "Cash & Bank Accounts");

      // Transactions Sheet
      const txnsData = data.transactions.map(t => ({
        "Voucher No": t.voucherNo,
        "Date": t.date,
        "Type": t.type,
        "Party / Client": t.party,
        "Category": t.category,
        "Amount (BDT)": t.amount,
        "Account": data.accounts.find(a => a.id === t.accountId)?.name || t.accountId,
        "Description": t.description,
        "Prepared By": t.preparedBy,
        "Approved By": t.approvedBy
      }));
      const wsTxns = XLSX.utils.json_to_sheet(txnsData);
      XLSX.utils.book_append_sheet(wb, wsTxns, "General Ledger Txns");

      // Projects Sheet
      const projectsData = data.projects.map(p => ({
        "Project Code": p.id,
        "Project Name": p.name,
        "Client": p.client,
        "Site Location": p.site,
        "Contract Value": p.contractValue,
        "Total Received": p.receivedAmount,
        "Total Spent": p.spentAmount,
        "Net Margin (Profit)": (p.receivedAmount - p.spentAmount),
        "Status": p.status
      }));
      const wsProjects = XLSX.utils.json_to_sheet(projectsData);
      XLSX.utils.book_append_sheet(wb, wsProjects, "Projects Summary");

      // Materials Stock Sheet
      const stockData = data.materials.map(m => ({
        "Code": m.code,
        "Item Name": m.name,
        "Category": m.category,
        "Unit": m.unit,
        "Current Stock": m.currentStock,
        "Min Stock Alert": m.minStockAlert,
        "Avg Unit Price": m.unitPriceAvg,
        "Total Valuation (BDT)": Math.round(m.currentStock * m.unitPriceAvg)
      }));
      const wsStock = XLSX.utils.json_to_sheet(stockData);
      XLSX.utils.book_append_sheet(wb, wsStock, "Steel Stock Inventory");

      // Salary Sheet
      const salaryData = data.salarySheet.map(s => {
        const emp = data.employees.find(e => e.id === s.employeeId);
        return {
          "Employee": emp?.name || s.employeeId,
          "Month": s.month,
          "Basic Salary": s.basicSalary,
          "Bonus": s.bonus,
          "Advance Taken": s.advance,
          "Net Payable": s.netPayable,
          "Status": s.status,
          "Voucher": s.voucherNo
        };
      });
      const wsSalary = XLSX.utils.json_to_sheet(salaryData);
      XLSX.utils.book_append_sheet(wb, wsSalary, "Salary Register");

      // Daily Labor Attendance & Wages Sheet
      const laborAttendanceData = (data.laborAttendance || []).map(att => {
        const labor = (data.dailyLabors || []).find(l => l.id === att.laborId);
        const prj = data.projects.find(p => p.id === att.projectId);
        return {
          "Record ID": att.id,
          "Date": att.date,
          "Worker Name": labor?.name || att.laborId,
          "Trade": labor?.trade || "-",
          "Project": prj?.name || att.projectId || "General Site",
          "Status": att.status,
          "Days": att.attendanceDays,
          "Daily Rate (BDT)": att.dailyRate,
          "Basic Wage (BDT)": att.basicWage,
          "OT Hours": att.otHours,
          "OT Rate (BDT)": att.otRate,
          "OT Wage (BDT)": att.otWage,
          "Gross Wage (BDT)": att.grossWage,
          "Advance Taken (BDT)": att.advanceTaken,
          "Net Payable (BDT)": att.netPayable,
          "Payment Status": att.paymentStatus,
          "Voucher No": att.paidVoucherNo || "-",
          "Notes": att.note || ""
        };
      });
      const wsLabor = XLSX.utils.json_to_sheet(laborAttendanceData);
      XLSX.utils.book_append_sheet(wb, wsLabor, "Daily Labor & Wages");

      // Write and trigger download
      const fileName = `ASIA_ENGINEERS_Financial_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      logAudit('EXCEL_EXPORT', `Generated financial spreadsheet: ${fileName}`);
    } catch (err) {
      console.error('Failed to export excel:', err);
      alert('Excel export error: ' + err.message);
    }
  };

  // 8. 1-Click JSON Backup Download
  const downloadBackupJSON = () => {
    const backupObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      company: COMPANY_INFO,
      ...data
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AE_Backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setData(prev => ({
      ...prev,
      lastBackupTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }));
    logAudit('MANUAL_BACKUP_DOWNLOAD', 'Complete JSON database backup exported');
  };

  // 9. Restore Database from JSON
  const restoreFromJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.accounts || !parsed.transactions || !parsed.projects) {
        throw new Error('Invalid backup file structure.');
      }
      if (window.confirm(language === 'bn'
        ? 'সতর্কতা! বর্তমান ডেটা প্রতিস্থাপিত হবে। আপনি কি নিশ্চিত ব্যাকআপ রিস্টোর করতে চান?'
        : 'Warning! Current data will be replaced. Are you sure you want to restore this backup?')) {

        setData(parsed);
        alert(language === 'bn' ? 'সফলভাবে ডেটা রিস্টোর সম্পন্ন হয়েছে!' : 'Data restored successfully!');
        logAudit('DATABASE_RESTORE', 'Database restored from backup archive');
      }
    } catch (e) {
      alert('Restore failed: ' + e.message);
    }
  };

  // 10. Google Drive Simulation
  const connectGoogleDrive = () => {
    setData(prev => ({
      ...prev,
      gdriveConnected: true,
      lastBackupTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }));
    logAudit('GDRIVE_CONNECTED', 'Google Drive OAuth connected for automated cloud snapshots');
  };

  const disconnectGoogleDrive = () => {
    setData(prev => ({ ...prev, gdriveConnected: false }));
    logAudit('GDRIVE_DISCONNECTED', 'Google Drive connection terminated');
  };

  const syncToGoogleDrive = () => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const dateSlug = new Date().toISOString().slice(0, 10);
    const timeSlug = new Date().toTimeString().slice(0, 5).replace(':', '');
    const fileName = `AE_Cloud_Backup_${dateSlug}_${timeSlug}.json`;

    const newSnapshot = {
      id: `SNAP-${Date.now()}`,
      fileName,
      timestamp,
      size: `${Math.round(JSON.stringify(data).length / 1024 * 10) / 10} KB`,
      recordsCount: data.transactions.length + data.projects.length + data.materials.length,
      status: "Synced to Drive",
      folderId: GDRIVE_CONFIG.folderId
    };

    setData(prev => ({
      ...prev,
      lastBackupTime: timestamp,
      backupSnapshots: [newSnapshot, ...(prev.backupSnapshots || INITIAL_BACKUP_SNAPSHOTS)]
    }));

    downloadBackupJSON();
    logAudit('GDRIVE_SYNC', `Synced snapshot ${fileName} to Google Drive (${GDRIVE_CONFIG.folderId})`);
    return newSnapshot;
  };

  // Google Sheets Instant Real-Time Sync function
  const syncToGoogleSheet = async (actionType = 'SYNC_ALL', specificData = null) => {
    setGsheetSyncStatus('syncing');
    const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const payload = {
      sheetId: GSHEET_CONFIG.sheetId,
      sheetUrl: GSHEET_CONFIG.sheetUrl,
      title: GSHEET_CONFIG.title,
      action: actionType,
      timestamp: nowTime,
      user: currentUser.name,
      payload: specificData || null,
      data: {
        transactions: data.transactions,
        laborAttendance: data.laborAttendance,
        dailyLabors: data.dailyLabors,
        projects: data.projects,
        materials: data.materials,
        employees: data.employees,
        accounts: data.accounts,
        incomeCategories: data.incomeCategories || INITIAL_INCOME_CATEGORIES,
        expenseCategories: data.expenseCategories || INITIAL_EXPENSE_CATEGORIES
      }
    };

    try {
      if (gsheetWebhookUrl && gsheetWebhookUrl.trim().startsWith('http')) {
        await fetch(gsheetWebhookUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify(payload)
        });
      }
      setGsheetSyncStatus('success');
      setGsheetLastSyncTime(nowTime);
      localStorage.setItem('AE_GSHEET_LAST_SYNC', nowTime);
      logAudit('GSHEET_SYNC', `Real-time synced (${actionType}) to Google Sheet: ${GSHEET_CONFIG.title}`);
      return { success: true, timestamp: nowTime };
    } catch (err) {
      console.warn('Google Sheet sync notice:', err);
      setGsheetSyncStatus('error');
      return { success: false, error: err.message };
    }
  };

  // Pull / Fetch changes from Google Sheet into local software
  const pullFromGoogleSheet = async () => {
    setGsheetSyncStatus('syncing');
    try {
      if (!gsheetWebhookUrl || !gsheetWebhookUrl.trim().startsWith('http')) {
        throw new Error('Please configure a valid Google Apps Script Web App URL first.');
      }
      const fetchUrl = `${gsheetWebhookUrl.trim()}?action=GET_ALL&sheetId=${GSHEET_CONFIG.sheetId}`;
      const res = await fetch(fetchUrl);
      const json = await res.json();
      if (json && json.status === 'SUCCESS' && json.data) {
        setData(prev => ({
          ...prev,
          transactions: json.data.transactions || prev.transactions,
          laborAttendance: json.data.laborAttendance || prev.laborAttendance,
          incomeCategories: json.data.incomeCategories || prev.incomeCategories,
          expenseCategories: json.data.expenseCategories || prev.expenseCategories
        }));
        setGsheetSyncStatus('success');
        logAudit('GSHEET_PULL', 'Successfully pulled latest data from Google Sheet');
        return { success: true, count: (json.data.transactions || []).length };
      } else {
        throw new Error(json?.message || 'Invalid response from Google Sheet Webhook');
      }
    } catch (err) {
      console.warn('Pull from Google Sheet notice:', err);
      setGsheetSyncStatus('idle');
      return { success: false, error: err.message };
    }
  };

  // Dynamic Transaction Categories Management (Add / Delete)
  const addCategory = (type, categoryName) => {
    const trimmed = (categoryName || '').trim();
    if (!trimmed) return;
    const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
    setData(prev => {
      const existing = prev[key] || (type === 'income' ? INITIAL_INCOME_CATEGORIES : INITIAL_EXPENSE_CATEGORIES);
      if (existing.includes(trimmed)) return prev;
      return {
        ...prev,
        [key]: [...existing, trimmed]
      };
    });
    logAudit('CATEGORY_ADDED', `Added new ${type} category: ${trimmed}`);
    if (gsheetAutoSync) {
      setTimeout(() => syncToGoogleSheet('UPDATE_CATEGORIES'), 100);
    }
  };

  const deleteCategory = (type, categoryName) => {
    const key = type === 'income' ? 'incomeCategories' : 'expenseCategories';
    setData(prev => {
      const existing = prev[key] || (type === 'income' ? INITIAL_INCOME_CATEGORIES : INITIAL_EXPENSE_CATEGORIES);
      return {
        ...prev,
        [key]: existing.filter(c => c !== categoryName)
      };
    });
    logAudit('CATEGORY_DELETED', `Deleted ${type} category: ${categoryName}`);
    if (gsheetAutoSync) {
      setTimeout(() => syncToGoogleSheet('UPDATE_CATEGORIES'), 100);
    }
  };

  // Automatic real-time background sync to Google Sheet on data updates
  useEffect(() => {
    if (!gsheetAutoSync) return;
    const timer = setTimeout(() => {
      syncToGoogleSheet('AUTO_SYNC');
    }, 1500);
    return () => clearTimeout(timer);
  }, [
    data.transactions,
    data.laborAttendance,
    data.projects,
    data.materials,
    data.employees,
    gsheetAutoSync
  ]);

  // Global calculations
  const totalIncome = data.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalCashBalance = data.accounts
    .filter(a => a.type === 'cash')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const totalBankBalance = data.accounts
    .filter(a => a.type !== 'cash')
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  const totalReceivable = data.ledgers
    .filter(l => l.type === 'client')
    .reduce((sum, l) => sum + (l.dueBalance || 0), 0);

  const totalPayable = data.ledgers
    .filter(l => l.type === 'supplier')
    .reduce((sum, l) => sum + (l.dueBalance || 0), 0);

  const lowStockItems = data.materials.filter(m => m.currentStock <= m.minStockAlert);

  const updateDeveloperProfile = (updatedProfile) => {
    setData(prev => ({
      ...prev,
      developerProfile: {
        ...(prev.developerProfile || INITIAL_DEVELOPER_PROFILE),
        ...updatedProfile
      }
    }));
  };

  return (
    <AppContext.Provider
      value={{
        COMPANY_INFO,
        GDRIVE_CONFIG,
        GSHEET_CONFIG,
        developerProfile: data.developerProfile || INITIAL_DEVELOPER_PROFILE,
        updateDeveloperProfile,
        gsheetWebhookUrl,
        setGsheetWebhookUrl,
        gsheetAutoSync,
        setGsheetAutoSync,
        gsheetSyncStatus,
        gsheetLastSyncTime,
        syncToGoogleSheet,
        pullFromGoogleSheet,
        addCategory,
        deleteCategory,
        incomeCategories: data.incomeCategories || INITIAL_INCOME_CATEGORIES,
        expenseCategories: data.expenseCategories || INITIAL_EXPENSE_CATEGORIES,
        language,
        toggleLanguage,
        currentUser,
        isAuthenticated,
        setIsAuthenticated,
        showLoginModal,
        setShowLoginModal,
        login,
        logout,
        activeTab,
        setActiveTab,
        data,
        selectedVoucherForPrint,
        setSelectedVoucherForPrint,
        // Actions
        addTransaction,
        updateTransaction,
        deleteTransaction,
        transferFunds,
        addProject,
        updateProject,
        deleteProject,
        recordStockMovement,
        updateStockMovement,
        deleteStockMovement,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        payEmployeeSalary,
        updateSalarySheet,
        deleteSalarySheet,
        addDailyLabor,
        updateDailyLabor,
        deleteDailyLabor,
        recordDailyAttendance,
        updateDailyAttendance,
        deleteDailyAttendance,
        disburseLaborWage,
        addLedger,
        updateLedger,
        deleteLedger,
        exportAllToExcel,
        downloadBackupJSON,
        restoreFromJSON,
        connectGoogleDrive,
        disconnectGoogleDrive,
        syncToGoogleDrive,
        logAudit,
        // Metrics
        totalIncome,
        totalExpense,
        totalCashBalance,
        totalBankBalance,
        totalReceivable,
        totalPayable,
        lowStockItems
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
