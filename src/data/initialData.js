export const COMPANY_INFO = {
  name: "ASIA ENGINEERS",
  tagline: "Steel Structure & Construction Solutions",
  regNo: "TRAD/DSCC/012948/2021",
  address: "CJKS Shopping Complex (Room 3028), Kajir Dewri, Chattogram-4217, Bangladesh",
  phone: "01830002040",
  email: "info@asiaengineersbd.com",
  website: "www.asiaengineersbd.com",
  director: "Engr. M. A. Hannan",
  directorTitle: "Managing Director & CEO"
};

export const GDRIVE_CONFIG = {
  folderId: "1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS",
  folderUrl: "https://drive.google.com/drive/folders/1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS",
  name: "Asia Engineers Cloud Backup Drive",
  targetFolder: "1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS",
  account: "asiaengineersbd@gmail.com",
  connected: true
};

export const GSHEET_CONFIG = {
  sheetId: "1RSGKMQvtyIXb-1iObSpTq9G-ynEFWKA0U2BBunINaWE",
  sheetUrl: "https://docs.google.com/spreadsheets/d/1RSGKMQvtyIXb-1iObSpTq9G-ynEFWKA0U2BBunINaWE/edit?usp=sharing",
  title: "Asia engineers, Accounts",
  connected: true
};

export const INITIAL_INCOME_CATEGORIES = [
  "Client Milestone Bill",
  "Advance Payment",
  "Retention Money Release",
  "Scrap Steel Sales",
  "Subcontracting Income",
  "Consultancy & Design Fee",
  "Other Income"
];

export const INITIAL_EXPENSE_CATEGORIES = [
  "Material Purchase",
  "Labor & Fabrication",
  "Erection & Crane Rent",
  "Consumables & Hardware",
  "Employee Salary",
  "Site Transport & Carrying",
  "Office Rent & Utilities",
  "Equipment Maintenance",
  "Fuel & Generator",
  "Printing, Stationery & Courier",
  "Food & Entertainment",
  "Miscellaneous"
];

export const INITIAL_BACKUP_SNAPSHOTS = [
  {
    id: "SNAP-001",
    fileName: "AE_Accounting_Snapshot_2026-11-21_0030.json",
    timestamp: "2026-11-21 00:30:15",
    size: "52.4 KB",
    recordsCount: 38,
    status: "Synced to Drive",
    folderId: "1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS"
  },
  {
    id: "SNAP-002",
    fileName: "AE_Financial_Statement_Nov2026.xlsx",
    timestamp: "2026-11-20 23:59:00",
    size: "118.2 KB",
    recordsCount: 38,
    status: "Synced to Drive",
    folderId: "1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS"
  },
  {
    id: "SNAP-003",
    fileName: "AE_Accounting_Snapshot_2026-11-20_1830.json",
    timestamp: "2026-11-20 18:30:22",
    size: "49.1 KB",
    recordsCount: 36,
    status: "Synced to Drive",
    folderId: "1oIadpc0EjJS1qAD8-YZO08hDfZ1WXFrS"
  }
];

export const INITIAL_ACCOUNTS = [
  { id: "acc-cash", name: "Main Office Petty Cash", type: "cash", balance: 145000, accountNumber: "Cash in Hand" },
  { id: "acc-city", name: "The City Bank Ltd", type: "bank", balance: 1250000, accountNumber: "CD-120392019201", branch: "Agrabad Branch, CTG" },
  { id: "acc-dbbl", name: "Dutch Bangla Bank Ltd", type: "bank", balance: 840000, accountNumber: "CA-117105002931", branch: "GEC Circle Branch, CTG" },
  { id: "acc-bkash", name: "bKash Merchant Account", type: "mobile_banking", balance: 65000, accountNumber: "01830002040" },
  { id: "acc-nagad", name: "Nagad Business Account", type: "mobile_banking", balance: 35000, accountNumber: "01830002040" }
];

export const INITIAL_PROJECTS = [
  {
    id: "PRJ-2026-01",
    name: "PHP Motors Automobile Assembly Shed",
    client: "PHP Automobiles Ltd",
    clientPhone: "01711002233",
    site: "Sagarika Road, Chattogram",
    contractValue: 4850000,
    startDate: "2026-01-10",
    expectedCompletion: "2026-05-30",
    status: "In Progress",
    budget: 3900000,
    receivedAmount: 3000000,
    spentAmount: 2650000,
    category: "Industrial Shed"
  },
  {
    id: "PRJ-2026-02",
    name: "Carton Craft Packaging Factory PEB",
    client: "Carton Craft Ltd",
    clientPhone: "01819334455",
    site: "Sitakunda Industrial Zone, CTG",
    contractValue: 7200000,
    startDate: "2026-02-01",
    expectedCompletion: "2026-08-15",
    status: "In Progress",
    budget: 5800000,
    receivedAmount: 4500000,
    spentAmount: 3820000,
    category: "Pre-Engineered Building"
  },
  {
    id: "PRJ-2026-03",
    name: "Bangladesh Navy Gun Workshop Heavy Roof Truss",
    client: "Bangladesh Navy / Naval Dockyard",
    clientPhone: "01769778899",
    site: "Naval Base, Chattogram",
    contractValue: 5600000,
    startDate: "2025-11-15",
    expectedCompletion: "2026-04-10",
    status: "In Progress",
    budget: 4500000,
    receivedAmount: 4200000,
    spentAmount: 3950000,
    category: "Specialized & Defense"
  },
  {
    id: "PRJ-2026-04",
    name: "Unitex Group Lift Core Steel Structure",
    client: "Unitex Group",
    clientPhone: "01812998877",
    site: "Nasirabad H/S, Chattogram",
    contractValue: 1850000,
    startDate: "2026-01-20",
    expectedCompletion: "2026-03-31",
    status: "Completed",
    budget: 1400000,
    receivedAmount: 1850000,
    spentAmount: 1380000,
    category: "Lift Core Structures"
  },
  {
    id: "PRJ-2026-05",
    name: "Hotel Star Park Panoramic Glass Lift Tower",
    client: "Hotel Star Park International",
    clientPhone: "01730445566",
    site: "GEC Circle, Chattogram",
    contractValue: 2450000,
    startDate: "2026-02-15",
    expectedCompletion: "2026-06-20",
    status: "In Progress",
    budget: 1950000,
    receivedAmount: 1200000,
    spentAmount: 980000,
    category: "Lift Core Structures"
  }
];

export const INITIAL_MATERIALS = [
  {
    id: "MAT-001",
    code: "ST-PL-12",
    name: "MS Plate 12mm (Grade A36)",
    category: "MS Plate",
    specification: "12mm x 1500mm x 6000mm",
    unit: "Ton",
    currentStock: 4.8,
    minStockAlert: 2.0,
    unitPriceAvg: 112000,
    warehouse: "Central Steel Yard, CTG"
  },
  {
    id: "MAT-002",
    code: "ST-PL-16",
    name: "MS Plate 16mm (Grade A36)",
    category: "MS Plate",
    specification: "16mm x 1500mm x 6000mm",
    unit: "Ton",
    currentStock: 3.2,
    minStockAlert: 1.5,
    unitPriceAvg: 114000,
    warehouse: "Central Steel Yard, CTG"
  },
  {
    id: "MAT-003",
    code: "ST-BM-300",
    name: "I-Beam / Universal Beam IPE 300",
    category: "I-Beam",
    specification: "300mm x 150mm x 42.2 kg/m",
    unit: "Ton",
    currentStock: 7.5,
    minStockAlert: 3.0,
    unitPriceAvg: 118000,
    warehouse: "Central Steel Yard, CTG"
  },
  {
    id: "MAT-004",
    code: "ST-CH-150",
    name: "MS C-Channel 150x75mm",
    category: "Channel",
    specification: "150mm x 75mm x 6.5mm",
    unit: "Ton",
    currentStock: 2.9,
    minStockAlert: 1.0,
    unitPriceAvg: 109000,
    warehouse: "Central Steel Yard, CTG"
  },
  {
    id: "MAT-005",
    code: "ST-ANG-75",
    name: "MS Equal Angle 75x75x6mm",
    category: "Angle",
    specification: "75mm x 75mm x 6mm (6m length)",
    unit: "Ton",
    currentStock: 1.8,
    minStockAlert: 2.0, // Alert triggered!
    unitPriceAvg: 106000,
    warehouse: "Central Steel Yard, CTG"
  },
  {
    id: "MAT-006",
    code: "ST-PRF-047",
    name: "Profile Color Coated Roofing Sheet 0.47mm",
    category: "Profile Sheet",
    specification: "0.47mm TCT Royal Blue AZ150",
    unit: "SFT",
    currentStock: 8500,
    minStockAlert: 3000,
    unitPriceAvg: 88,
    warehouse: "Central Steel Yard, CTG"
  },
  {
    id: "MAT-007",
    code: "FST-BLT-88",
    name: "High Strength Hex Bolt & Nut Grade 8.8",
    category: "Bolt-Nut",
    specification: "M20 x 75mm Galvanized with Washer",
    unit: "Pcs",
    currentStock: 480,
    minStockAlert: 500, // Alert triggered!
    unitPriceAvg: 125,
    warehouse: "Store Room 3028"
  },
  {
    id: "MAT-008",
    code: "WLD-E7018",
    name: "Welding Electrode E7018 Low Hydrogen",
    category: "Electrode",
    specification: "3.2mm x 350mm (5kg pack)",
    unit: "Packet",
    currentStock: 45,
    minStockAlert: 20,
    unitPriceAvg: 850,
    warehouse: "Store Room 3028"
  },
  {
    id: "MAT-009",
    code: "PNT-ZNC",
    name: "Zinc Chromate Red Oxide Epoxy Primer",
    category: "Paint",
    specification: "High Solid Anti-corrosive (20L Drum)",
    unit: "Drum",
    currentStock: 8,
    minStockAlert: 5,
    unitPriceAvg: 14500,
    warehouse: "Store Room 3028"
  }
];

export const INITIAL_EMPLOYEES = [
  {
    id: "EMP-001",
    name: "Engr. M. A. Hannan",
    designation: "Managing Director & Chief Engineer",
    mobile: "01830002040",
    joiningDate: "2020-01-01",
    salaryType: "Monthly",
    monthlySalary: 120000,
    status: "Active",
    nid: "1982159203940"
  },
  {
    id: "EMP-002",
    name: "Engr. Masum Billah",
    designation: "Project & Planning Engineer",
    mobile: "01815123456",
    joiningDate: "2022-03-15",
    salaryType: "Monthly",
    monthlySalary: 55000,
    status: "Active",
    nid: "1994159203941"
  },
  {
    id: "EMP-003",
    name: "Md. Rafiqul Islam",
    designation: "Senior Site Supervisor",
    mobile: "01712987654",
    joiningDate: "2021-06-01",
    salaryType: "Monthly",
    monthlySalary: 38000,
    status: "Active",
    nid: "1988159203942"
  },
  {
    id: "EMP-004",
    name: "Md. Kamal Hossain",
    designation: "Master Steel Fabricator & Fitter",
    mobile: "01911445566",
    joiningDate: "2022-01-10",
    salaryType: "Monthly",
    monthlySalary: 32000,
    status: "Active",
    nid: "1985159203943"
  },
  {
    id: "EMP-005",
    name: "Jahangir Alam",
    designation: "Certified 6G SMAW Welder",
    mobile: "01822334455",
    joiningDate: "2023-02-01",
    salaryType: "Daily/Monthly",
    monthlySalary: 28000,
    status: "Active",
    nid: "1992159203944"
  },
  {
    id: "EMP-006",
    name: "Abul Kalam",
    designation: "Erection & Rigging Foreman",
    mobile: "01611778899",
    joiningDate: "2023-05-15",
    salaryType: "Monthly",
    monthlySalary: 26000,
    status: "Active",
    nid: "1990159203945"
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-001",
    voucherNo: "AE-RC-2026-0001",
    type: "income",
    date: "2026-03-01",
    party: "PHP Automobiles Ltd",
    projectId: "PRJ-2026-01",
    category: "Client Milestone Bill",
    amount: 1000000,
    accountId: "acc-city",
    description: "2nd running bill for PHP Motors assembly shed column erection",
    preparedBy: "Engr. Masum Billah",
    approvedBy: "Engr. M. A. Hannan",
    note: "Payment received via Cheque #983204 deposited in City Bank"
  },
  {
    id: "TXN-002",
    voucherNo: "AE-PV-2026-0001",
    type: "expense",
    date: "2026-03-02",
    party: "BSRM Steels Ltd",
    projectId: "PRJ-2026-02",
    category: "Material Purchase",
    amount: 540000,
    accountId: "acc-city",
    description: "Purchase of 4.5 Ton MS I-Beam & Channels for Carton Craft PEB",
    preparedBy: "Md. Rafiqul Islam",
    approvedBy: "Engr. M. A. Hannan",
    note: "Paid via BEFTN from City Bank. Challan #BSRM-8891 attached"
  },
  {
    id: "TXN-003",
    voucherNo: "AE-PV-2026-0002",
    type: "expense",
    date: "2026-03-03",
    party: "Site Rigging Team",
    projectId: "PRJ-2026-03",
    category: "Labor & Fabrication",
    amount: 85000,
    accountId: "acc-cash",
    description: "Weekly labor wage for heavy roof truss lifting at Navy Gun Workshop",
    preparedBy: "Abul Kalam",
    approvedBy: "Engr. M. A. Hannan",
    note: "Paid in cash on site with muster roll signatures"
  },
  {
    id: "TXN-004",
    voucherNo: "AE-RC-2026-0002",
    type: "income",
    date: "2026-03-04",
    party: "Hotel Star Park International",
    projectId: "PRJ-2026-05",
    category: "Advance Payment",
    amount: 500000,
    accountId: "acc-dbbl",
    description: "Project mobilization advance for Panoramic glass lift tower",
    preparedBy: "Engr. Masum Billah",
    approvedBy: "Engr. M. A. Hannan",
    note: "Online fund transfer into DBBL Account"
  },
  {
    id: "TXN-005",
    voucherNo: "AE-PV-2026-0003",
    type: "expense",
    date: "2026-03-05",
    party: "Chittagong Hardware & Fasteners",
    projectId: "PRJ-2026-05",
    category: "Consumables & Hardware",
    amount: 42500,
    accountId: "acc-bkash",
    description: "Anchor bolts Grade 8.8 and cutting discs for Star Park lift shaft",
    preparedBy: "Md. Kamal Hossain",
    approvedBy: "Engr. M. A. Hannan",
    note: "Paid via bKash Merchant payment"
  },
  {
    id: "TXN-006",
    voucherNo: "AE-PV-2026-0004",
    type: "expense",
    date: "2026-03-06",
    party: "Office Landlord CJKS",
    projectId: null,
    category: "Office Rent & Utilities",
    amount: 25000,
    accountId: "acc-cash",
    description: "Monthly office rent Room 3028 CJKS Complex for March 2026",
    preparedBy: "Engr. Masum Billah",
    approvedBy: "Engr. M. A. Hannan",
    note: "Cash payment receipt #CJKS-903"
  }
];

export const INITIAL_STOCK_MOVEMENTS = [
  {
    id: "MOV-001",
    date: "2026-03-02",
    materialId: "MAT-003",
    materialName: "I-Beam / Universal Beam IPE 300",
    type: "inward",
    qty: 4.5,
    unit: "Ton",
    rate: 120000,
    supplier: "BSRM Steels Ltd",
    voucherNo: "AE-PV-2026-0001",
    projectId: "PRJ-2026-02",
    note: "Received at Sitakunda yard for Carton Craft PEB"
  },
  {
    id: "MOV-002",
    date: "2026-03-03",
    materialId: "MAT-007",
    materialName: "High Strength Hex Bolt & Nut Grade 8.8",
    type: "outward",
    qty: 120,
    unit: "Pcs",
    rate: 125,
    supplier: "-",
    voucherNo: "AE-ISS-2026-001",
    projectId: "PRJ-2026-01",
    note: "Issued to PHP Motors assembly site for truss connection"
  },
  {
    id: "MOV-003",
    date: "2026-03-04",
    materialId: "MAT-008",
    materialName: "Welding Electrode E7018 Low Hydrogen",
    type: "outward",
    qty: 15,
    unit: "Packet",
    rate: 850,
    supplier: "-",
    voucherNo: "AE-ISS-2026-002",
    projectId: "PRJ-2026-03",
    note: "Issued to Navy Gun Workshop for 6G welding"
  }
];

export const INITIAL_SALARY_SHEET = [
  {
    id: "SAL-2026-02-001",
    employeeId: "EMP-002",
    month: "February 2026",
    basicSalary: 55000,
    bonus: 5000,
    advance: 10000,
    deduction: 0,
    netPayable: 50000,
    status: "Paid",
    paidDate: "2026-03-01",
    paymentMethod: "The City Bank Ltd",
    voucherNo: "AE-PV-2026-0005"
  },
  {
    id: "SAL-2026-02-002",
    employeeId: "EMP-003",
    month: "February 2026",
    basicSalary: 38000,
    bonus: 2000,
    advance: 5000,
    deduction: 0,
    netPayable: 35000,
    status: "Paid",
    paidDate: "2026-03-01",
    paymentMethod: "Main Office Petty Cash",
    voucherNo: "AE-PV-2026-0006"
  },
  {
    id: "SAL-2026-02-003",
    employeeId: "EMP-004",
    month: "February 2026",
    basicSalary: 32000,
    bonus: 1500,
    advance: 0,
    deduction: 0,
    netPayable: 33500,
    status: "Paid",
    paidDate: "2026-03-01",
    paymentMethod: "Main Office Petty Cash",
    voucherNo: "AE-PV-2026-0007"
  },
  {
    id: "SAL-2026-02-004",
    employeeId: "EMP-005",
    month: "February 2026",
    basicSalary: 28000,
    bonus: 0,
    advance: 3000,
    deduction: 0,
    netPayable: 25000,
    status: "Pending",
    paidDate: null,
    paymentMethod: "Pending Approval",
    voucherNo: "-"
  },
  {
    id: "SAL-2026-02-005",
    employeeId: "EMP-006",
    month: "February 2026",
    basicSalary: 26000,
    bonus: 0,
    advance: 0,
    deduction: 0,
    netPayable: 26000,
    status: "Pending",
    paidDate: null,
    paymentMethod: "Pending Approval",
    voucherNo: "-"
  }
];

export const INITIAL_LEDGERS = [
  {
    id: "LED-001",
    name: "PHP Automobiles Ltd",
    type: "client",
    phone: "01711002233",
    address: "Sagarika Road, Chattogram",
    totalBilled: 4850000,
    totalReceived: 3000000,
    dueBalance: 1850000,
    status: "Active"
  },
  {
    id: "LED-002",
    name: "Carton Craft Ltd",
    type: "client",
    phone: "01819334455",
    address: "Sitakunda, Chattogram",
    totalBilled: 7200000,
    totalReceived: 4500000,
    dueBalance: 2700000,
    status: "Active"
  },
  {
    id: "LED-003",
    name: "Bangladesh Navy / Naval Base",
    type: "client",
    phone: "01769778899",
    address: "Naval Base, Chattogram",
    totalBilled: 5600000,
    totalReceived: 4200000,
    dueBalance: 1400000,
    status: "Active"
  },
  {
    id: "LED-004",
    name: "Hotel Star Park International",
    type: "client",
    phone: "01730445566",
    address: "GEC Circle, Chattogram",
    totalBilled: 2450000,
    totalReceived: 1200000,
    dueBalance: 1250000,
    status: "Active"
  },
  {
    id: "LED-005",
    name: "BSRM Steels Ltd",
    type: "supplier",
    phone: "01730055221",
    address: "Ali Mansion, Sadarghat, CTG",
    totalPurchased: 2150000,
    totalPaid: 1750000,
    dueBalance: 400000,
    status: "Active"
  },
  {
    id: "LED-006",
    name: "AKS Steel (Abul Khair)",
    type: "supplier",
    phone: "01819887766",
    address: "Agrabad C/A, Chattogram",
    totalPurchased: 1420000,
    totalPaid: 1100000,
    dueBalance: 320000,
    status: "Active"
  },
  {
    id: "LED-007",
    name: "Berger Paints Bangladesh Ltd",
    type: "supplier",
    phone: "01713221100",
    address: "Nasirabad, Chattogram",
    totalPurchased: 380000,
    totalPaid: 280000,
    dueBalance: 100000,
    status: "Active"
  }
];

export const INITIAL_DAILY_LABORS = [
  {
    id: "DL-001",
    name: "কামাল উদ্দিন (Kamal)",
    trade: "Master Fitter & Fabricator",
    dailyRate: 1100,
    overtimeRate: 150,
    phone: "01811223344",
    nid: "1987159203941",
    assignedProjectId: "PRJ-2026-01",
    status: "Active"
  },
  {
    id: "DL-002",
    name: "জাহাঙ্গীর আলম (Jahangir)",
    trade: "Certified 6G Welder",
    dailyRate: 1200,
    overtimeRate: 160,
    phone: "01722334455",
    nid: "1990159203942",
    assignedProjectId: "PRJ-2026-03",
    status: "Active"
  },
  {
    id: "DL-003",
    name: "আবুল হোসেন (Abul)",
    trade: "Rigging & Truss Erector",
    dailyRate: 950,
    overtimeRate: 130,
    phone: "01633445566",
    nid: "1992159203943",
    assignedProjectId: "PRJ-2026-01",
    status: "Active"
  },
  {
    id: "DL-004",
    name: "সোহেল রানা (Sohel)",
    trade: "Gas Cutter & Grinder",
    dailyRate: 850,
    overtimeRate: 110,
    phone: "01944556677",
    nid: "1995159203944",
    assignedProjectId: "PRJ-2026-02",
    status: "Active"
  },
  {
    id: "DL-005",
    name: "নুরুল ইসলাম (Nurul)",
    trade: "Fabrication Helper",
    dailyRate: 700,
    overtimeRate: 90,
    phone: "01555667788",
    nid: "1998159203945",
    assignedProjectId: "PRJ-2026-01",
    status: "Active"
  },
  {
    id: "DL-006",
    name: "রুবেল মিয়া (Rubel)",
    trade: "Site Helper",
    dailyRate: 650,
    overtimeRate: 85,
    phone: "01866778899",
    nid: "2000159203946",
    assignedProjectId: "PRJ-2026-02",
    status: "Active"
  }
];

export const INITIAL_LABOR_ATTENDANCE = [
  {
    id: "ATT-20260301-01",
    date: "2026-03-01",
    laborId: "DL-001",
    projectId: "PRJ-2026-01",
    status: "Present",
    attendanceDays: 1.0,
    dailyRate: 1100,
    basicWage: 1100,
    otHours: 3,
    otRate: 150,
    otWage: 450,
    grossWage: 1550,
    advanceTaken: 500,
    netPayable: 1050,
    paymentStatus: "Paid",
    paidVoucherNo: "AE-PV-2026-0003",
    note: "PHP Motors assembly shed column erection"
  },
  {
    id: "ATT-20260301-02",
    date: "2026-03-01",
    laborId: "DL-002",
    projectId: "PRJ-2026-03",
    status: "Present",
    attendanceDays: 1.0,
    dailyRate: 1200,
    basicWage: 1200,
    otHours: 2,
    otRate: 160,
    otWage: 320,
    grossWage: 1520,
    advanceTaken: 0,
    netPayable: 1520,
    paymentStatus: "Paid",
    paidVoucherNo: "AE-PV-2026-0003",
    note: "Navy gun workshop truss 6G welding"
  },
  {
    id: "ATT-20260302-01",
    date: "2026-03-02",
    laborId: "DL-001",
    projectId: "PRJ-2026-01",
    status: "Present",
    attendanceDays: 1.0,
    dailyRate: 1100,
    basicWage: 1100,
    otHours: 4,
    otRate: 150,
    otWage: 600,
    grossWage: 1700,
    advanceTaken: 300,
    netPayable: 1400,
    paymentStatus: "Due",
    paidVoucherNo: "-",
    note: "Rafter alignment & torque tightening"
  },
  {
    id: "ATT-20260302-02",
    date: "2026-03-02",
    laborId: "DL-003",
    projectId: "PRJ-2026-01",
    status: "Present",
    attendanceDays: 1.0,
    dailyRate: 950,
    basicWage: 950,
    otHours: 2,
    otRate: 130,
    otWage: 260,
    grossWage: 1210,
    advanceTaken: 200,
    netPayable: 1010,
    paymentStatus: "Due",
    paidVoucherNo: "-",
    note: "Crane heavy lifting assistance"
  },
  {
    id: "ATT-20260303-01",
    date: "2026-03-03",
    laborId: "DL-004",
    projectId: "PRJ-2026-02",
    status: "Present",
    attendanceDays: 1.0,
    dailyRate: 850,
    basicWage: 850,
    otHours: 3,
    otRate: 110,
    otWage: 330,
    grossWage: 1180,
    advanceTaken: 0,
    netPayable: 1180,
    paymentStatus: "Due",
    paidVoucherNo: "-",
    note: "Carton Craft PEB purlin cutting & fit-up"
  },
  {
    id: "ATT-20260303-02",
    date: "2026-03-03",
    laborId: "DL-005",
    projectId: "PRJ-2026-01",
    status: "Half Day",
    attendanceDays: 0.5,
    dailyRate: 700,
    basicWage: 350,
    otHours: 0,
    otRate: 90,
    otWage: 0,
    grossWage: 350,
    advanceTaken: 100,
    netPayable: 250,
    paymentStatus: "Due",
    paidVoucherNo: "-",
    note: "Morning session site helper"
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: "LOG-001",
    timestamp: "2026-03-01 10:15:00",
    user: "Engr. M. A. Hannan",
    action: "VOUCHER_CREATED",
    details: "Created Money Receipt AE-RC-2026-0001 for BDT 1,000,000 (PHP Motors)"
  },
  {
    id: "LOG-002",
    timestamp: "2026-03-02 14:30:22",
    user: "Engr. M. A. Hannan",
    action: "VOUCHER_APPROVED",
    details: "Approved Payment Voucher AE-PV-2026-0001 for BDT 540,000 (BSRM Steels)"
  },
  {
    id: "LOG-003",
    timestamp: "2026-03-04 16:45:10",
    user: "Engr. M. A. Hannan",
    action: "STOCK_INWARD",
    details: "Recorded inward movement of 4.5 Ton I-Beam from BSRM"
  }
];

export const INITIAL_DEVELOPER_PROFILE = {
  name: "আব্দুল মান্নান (ABM) / Engr. Masum",
  englishName: "Abdul Mannan (ABM) / Engr. Masum Billah",
  title: "চিফ সিস্টেম আর্কিটেক্ট ও সিনিয়র ফুল-স্ট্যাক সফটওয়্যার ইঞ্জিনিয়ার",
  englishTitle: "Lead Software Architect & Full-Stack Solutions Engineer",
  organization: "বাংলাদেশ টেলিযোগাযোগ নিয়ন্ত্রণ কমিশন (BTRC) / ফ্রিল্যান্স সফটওয়্যার সলিউশনস",
  englishOrg: "BTRC / Freelance Engineering & Enterprise Systems",
  phone: "01830002040",
  altPhone: "+880 1830-002040",
  email: "abmannan1761@gmail.com",
  github: "https://github.com/AbMannan1761",
  portfolio: "https://abmannan1761.github.io/asia-engineers-accounting/",
  location: "ঢাকা ও চট্টগ্রাম, বাংলাদেশ",
  experienceYears: "৮+ বছর",
  bio: "স্ট্রাকচারাল ইঞ্জিনিয়ারিং ও এন্টারপ্রাইজ অ্যাকাউন্টিং সলিউশন ডিজাইন ও ডেভেলপমেন্ট বিশেষজ্ঞ। আধুনিক ওয়েব আর্কিটেকচার, রিয়েল-টাইম গুগল ক্লাউড ডাটাবেজ অটোমেশন এবং প্রফেশনাল ইআরপি সিস্টেম ডেভেলপমেন্টে অভিজ্ঞ।",
  skills: [
    "React.js & Modern Web Architecture",
    "Tailwind CSS & Responsive UI/UX",
    "Google Apps Script & Real-Time Cloud Sync",
    "Accounting & ERP Business Logic",
    "Database Architecture & API Integration",
    "Offline-first PWA & Local Storage Optimization",
    "Production Deployment & Automation"
  ],
  projectContribution: {
    system: "ASIA ENGINEERS Cloud Accounting & ERP Software",
    version: "v2.5 Professional Enterprise Edition",
    keyModules: [
      "রিয়েল-টাইম ২-ওয়ে গুগল শীট লাইভ ডাটাবেজ সিংক",
      "অটোমেটেড লেজার, ডাবল এন্ট্রি ব্যালেন্স শীট ও পি&এল রিপোর্ট",
      "প্রজেক্ট ম্যানেজমেন্ট, ইনভেন্টরি স্টক নিয়ন্ত্রণ ও আরএফকিউ ট্র্যাকিং",
      "সাইট ডেইলি লেবার হাজিরা, ওভারটাইম হিসাব ও সাপ্তাহিক পে-রোল",
      "A4 ও A5 অফিসিয়াল মানি রিসিট ও ডেবিট/ক্রেডিট ভাউচার জেনারেশন",
      "নিরাপদ পিন/পাসওয়ার্ড ভিত্তিক ডিরেক্টর এক্সেস কন্ট্রোল ও অডিট লগ"
    ]
  }
};
