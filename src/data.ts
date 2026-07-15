export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number; // Selling price
  cost: number;  // Purchasing price
  stock: Record<string, number>; // branchName -> quantity
  unit: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // transaction price
  cost: number;  // transaction cost (for calculating profit)
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string;
  type: 'penjualan' | 'pembelian';
  branch: string;
  supplierId?: string; // for pembelian
  customerId?: string; // for penjualan
  salesId?: string;    // for penjualan
  items: TransactionItem[];
  paymentMethod: 'Tunai' | 'Kredit';
  status: 'Selesai' | 'Batal';
  deliveryStatus?: 'Tidak Ada' | 'Menunggu Kurir' | 'Dalam Pengiriman' | 'Selesai Diterima';
  assignedCourier?: string;
  courierNotes?: string;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number; // for hutang/piutang tracking
}

export interface StockAdjustment {
  id: string;
  date: string;
  productId: string;
  productName: string;
  branch: string;
  changeQty: number; // e.g. +5 or -2
  reason: string;
  operator: string;
}

export interface UserSession {
  id: string;
  name: string;
  role: 'admin' | 'cabang' | 'sales' | 'kurir';
  branch: string; // branch associated
}

export const INITIAL_BRANCHES = [
  "Pusat (Jakarta)",
  "Cabang Bandung",
  "Cabang Surabaya"
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: "sup-1", name: "PT. Monitor Nusantara", phone: "021-5551234", address: "Kawasan Industri Sunter, Jakarta" },
  { id: "sup-2", name: "CV. Sinar Jaya Abadi", phone: "022-7778901", address: "Jl. Soekarno Hatta No. 45, Bandung" },
  { id: "sup-3", name: "Distributor Gadget Utama", phone: "031-8884321", address: "Gubeng, Surabaya" }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: "cust-1", name: "Toko Berkah Abadi", phone: "08123456789", address: "Jl. Merdeka No. 10, Bandung" },
  { id: "cust-2", name: "Bpk. Hendra (Retailer)", phone: "08198765432", address: "Jl. Diponegoro No. 8, Surabaya" },
  { id: "cust-3", name: "CV. Sukses Makmur", phone: "08561122334", address: "Kebon Jeruk, Jakarta" },
  { id: "cust-4", name: "Ibu Maria (Reseller)", phone: "08219988776", address: "Dago, Bandung" }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "LED Monitor Dell 24\" SE2422H",
    sku: "MON-DELL-24",
    category: "Monitor",
    price: 1550000,
    cost: 1150000,
    unit: "Unit",
    stock: {
      "Pusat (Jakarta)": 35,
      "Cabang Bandung": 12,
      "Cabang Surabaya": 8
    }
  },
  {
    id: "prod-2",
    name: "Samsung Odyssey G3 24\" 144Hz",
    sku: "MON-SAMS-G3",
    category: "Monitor",
    price: 2450000,
    cost: 1950000,
    unit: "Unit",
    stock: {
      "Pusat (Jakarta)": 20,
      "Cabang Bandung": 8,
      "Cabang Surabaya": 6
    }
  },
  {
    id: "prod-3",
    name: "Gaming Mechanical Keyboard Blue Switch",
    sku: "ACC-KB-MECH",
    category: "Aksesoris",
    price: 650000,
    cost: 420000,
    unit: "Pcs",
    stock: {
      "Pusat (Jakarta)": 50,
      "Cabang Bandung": 25,
      "Cabang Surabaya": 15
    }
  },
  {
    id: "prod-4",
    name: "Wireless Optical Mouse Ergonomic",
    sku: "ACC-MS-WRL",
    category: "Aksesoris",
    price: 185000,
    cost: 110000,
    unit: "Pcs",
    stock: {
      "Pusat (Jakarta)": 100,
      "Cabang Bandung": 40,
      "Cabang Surabaya": 30
    }
  },
  {
    id: "prod-5",
    name: "SSD NVMe Gen4 1TB High-Speed",
    sku: "STR-SSD-1TB",
    category: "Penyimpanan",
    price: 1150000,
    cost: 850000,
    unit: "Pcs",
    stock: {
      "Pusat (Jakarta)": 45,
      "Cabang Bandung": 15,
      "Cabang Surabaya": 12
    }
  }
];

export const INITIAL_USER_SESSIONS: UserSession[] = [
  { id: "user-1", name: "Budi Santoso (Direktur)", role: "admin", branch: "Pusat (Jakarta)" },
  { id: "user-2", name: "Siti Rahma (Manager Bandung)", role: "cabang", branch: "Cabang Bandung" },
  { id: "user-3", name: "Ahmad Rian (Sales Lapangan)", role: "sales", branch: "Pusat (Jakarta)" },
  { id: "user-4", name: "Asep Sunandar (Kurir Logistik)", role: "kurir", branch: "Cabang Bandung" }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Past sales
  {
    id: "tx-1",
    invoiceNumber: "INV/20260601/001",
    date: "2026-06-01T09:30:00Z",
    type: "penjualan",
    branch: "Pusat (Jakarta)",
    customerId: "cust-3",
    salesId: "user-3",
    items: [
      { productId: "prod-1", productName: "LED Monitor Dell 24\" SE2422H", quantity: 5, price: 1550000, cost: 1150000 },
      { productId: "prod-5", productName: "SSD NVMe Gen4 1TB High-Speed", quantity: 3, price: 1150000, cost: 850000 }
    ],
    paymentMethod: "Kredit",
    status: "Selesai",
    deliveryStatus: "Selesai Diterima",
    assignedCourier: "user-4",
    courierNotes: "Diterima oleh Resepsionis CV Sukses Makmur",
    totalAmount: 11200000,
    amountPaid: 4000000,
    remainingBalance: 7200000 // Piutang yang masih outstanding
  },
  {
    id: "tx-2",
    invoiceNumber: "INV/20260603/002",
    date: "2026-06-03T14:15:00Z",
    type: "penjualan",
    branch: "Cabang Bandung",
    customerId: "cust-1",
    salesId: "user-3",
    items: [
      { productId: "prod-2", productName: "Samsung Odyssey G3 24\" 144Hz", quantity: 2, price: 2450000, cost: 1950000 },
      { productId: "prod-3", productName: "Gaming Mechanical Keyboard Blue Switch", quantity: 2, price: 650000, cost: 420000 }
    ],
    paymentMethod: "Tunai",
    status: "Selesai",
    deliveryStatus: "Selesai Diterima",
    assignedCourier: "user-4",
    courierNotes: "Diserahkan langsung ke pemilik Toko Berkah",
    totalAmount: 6200000,
    amountPaid: 6200000,
    remainingBalance: 0
  },
  {
    id: "tx-3",
    invoiceNumber: "INV/20260605/003",
    date: "2026-06-05T11:00:00Z",
    type: "penjualan",
    branch: "Cabang Surabaya",
    customerId: "cust-2",
    items: [
      { productId: "prod-1", productName: "LED Monitor Dell 24\" SE2422H", quantity: 2, price: 1550000, cost: 1150000 },
      { productId: "prod-4", productName: "Wireless Optical Mouse Ergonomic", quantity: 10, price: 185000, cost: 110000 }
    ],
    paymentMethod: "Kredit",
    status: "Selesai",
    deliveryStatus: "Dalam Pengiriman",
    assignedCourier: "user-4",
    totalAmount: 4950000,
    amountPaid: 1500000,
    remainingBalance: 3450000 // Piutang outstanding
  },
  // Past purchases (pembelian)
  {
    id: "tx-4",
    invoiceNumber: "PO/20260528/001",
    date: "2026-05-28T10:00:00Z",
    type: "pembelian",
    branch: "Pusat (Jakarta)",
    supplierId: "sup-1",
    items: [
      { productId: "prod-1", productName: "LED Monitor Dell 24\" SE2422H", quantity: 20, price: 1150000, cost: 1150000 },
      { productId: "prod-2", productName: "Samsung Odyssey G3 24\" 144Hz", quantity: 10, price: 1950000, cost: 1950000 }
    ],
    paymentMethod: "Kredit",
    status: "Selesai",
    totalAmount: 42500000,
    amountPaid: 20000000,
    remainingBalance: 22500000 // Hutang outstanding
  },
  {
    id: "tx-5",
    invoiceNumber: "PO/20260602/002",
    date: "2026-06-02T16:45:00Z",
    type: "pembelian",
    branch: "Cabang Bandung",
    supplierId: "sup-2",
    items: [
      { productId: "prod-3", productName: "Gaming Mechanical Keyboard Blue Switch", quantity: 15, price: 420000, cost: 420000 }
    ],
    paymentMethod: "Tunai",
    status: "Selesai",
    totalAmount: 6300000,
    amountPaid: 6300000,
    remainingBalance: 0
  }
];

export const INITIAL_ADJUSTMENTS: StockAdjustment[] = [
  {
    id: "adj-1",
    date: "2026-06-04T08:00:00Z",
    productId: "prod-3",
    productName: "Gaming Mechanical Keyboard Blue Switch",
    branch: "Cabang Bandung",
    changeQty: -1,
    reason: "Produk demo rusak fisik",
    operator: "Siti Rahma"
  },
  {
    id: "adj-2",
    date: "2026-06-06T13:20:00Z",
    productId: "prod-1",
    productName: "LED Monitor Dell 24\" SE2422H",
    branch: "Pusat (Jakarta)",
    changeQty: 2,
    reason: "Audit hasil stock opname fisik lebih",
    operator: "Budi Santoso"
  }
];
