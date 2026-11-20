import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  COMPANY_INFO,
  INITIAL_ACCOUNTS,
  INITIAL_PROJECTS,
  INITIAL_MATERIALS,
  INITIAL_EMPLOYEES,
  INITIAL_TRANSACTIONS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SALARY_SHEET,
  INITIAL_LEDGERS,
  INITIAL_AUDIT_LOGS
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
        return JSON.parse(saved);
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
      ledgers: INITIAL_LEDGERS,
      auditLogs: INITIAL_AUDIT_LOGS,
      gdriveConnected: false,
      lastBackupTime: '2026-11-20 18:30:00',
      activeTab: 'dashboard'
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState(null);

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

    return txnRecord;
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

  return (
    <AppContext.Provider
      value={{
        COMPANY_INFO,
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
        transferFunds,
        addProject,
        recordStockMovement,
        addMaterial,
        addEmployee,
        payEmployeeSalary,
        addLedger,
        exportAllToExcel,
        downloadBackupJSON,
        restoreFromJSON,
        connectGoogleDrive,
        disconnectGoogleDrive,
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
