import { useState, useMemo, useEffect, FormEvent } from "react";
import { generatePDFDocument } from "./pdfGenerator";
import {
  INITIAL_BRANCHES,
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
  INITIAL_USER_SESSIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_ADJUSTMENTS,
  Product,
  Supplier,
  Customer,
  Transaction,
  StockAdjustment,
  UserSession,
} from "./data";
import {
  ShoppingCart,
  PlusCircle,
  Package,
  Users,
  TrendingUp,
  Coins,
  Truck,
  Building2,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  RefreshCw,
  Trash2,
  DollarSign,
  Briefcase,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function App() {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem("pos_user");
    return saved ? JSON.parse(saved) : INITIAL_USER_SESSIONS[0];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("pos_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("pos_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(() => {
    const saved = localStorage.getItem("pos_adjustments");
    return saved ? JSON.parse(saved) : INITIAL_ADJUSTMENTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem("pos_suppliers");
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("pos_customers");
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [activeMenu, setActiveMenu] = useState<string>("dashboard");

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem("pos_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("pos_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("pos_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("pos_adjustments", JSON.stringify(adjustments));
  }, [adjustments]);

  useEffect(() => {
    localStorage.setItem("pos_suppliers", JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem("pos_customers", JSON.stringify(customers));
  }, [customers]);

  // Reset function to initial data
  const handleResetData = () => {
    if (window.confirm("Apakah Anda yakin ingin menyetel ulang data POS ke pengaturan awal?")) {
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setAdjustments(INITIAL_ADJUSTMENTS);
      setSuppliers(INITIAL_SUPPLIERS);
      setCustomers(INITIAL_CUSTOMERS);
      setCurrentUser(INITIAL_USER_SESSIONS[0]);
      setActiveMenu("dashboard");
    }
  };

  // --- POS CART STATE ---
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("cust-1");
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Kredit'>("Tunai");
  const [amountPaidInput, setAmountPaidInput] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>(currentUser.branch);

  // Sync selected branch when user switcher updates
  useEffect(() => {
    setSelectedBranch(currentUser.branch);
  }, [currentUser]);

  // --- PURCHASE STATE (Pembelian supplier) ---
  const [purchaseCart, setPurchaseCart] = useState<{ product: Product; quantity: number; customCost?: number }[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("sup-1");
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<'Tunai' | 'Kredit'>("Tunai");
  const [purchaseAmountPaid, setPurchaseAmountPaid] = useState<string>("");

  // --- STOCK MONITOR FILTERS ---
  const [stockSearch, setStockSearch] = useState<string>("");
  const [stockCategoryFilter, setStockCategoryFilter] = useState<string>("Semua");
  const [stockBranchFilter, setStockBranchFilter] = useState<string>("Semua");
  const [showAdjustmentModal, setShowAdjustmentModal] = useState<boolean>(false);
  const [selectedAdjProduct, setSelectedAdjProduct] = useState<Product | null>(null);
  const [adjQty, setAdjQty] = useState<number>(1);
  const [adjReason, setAdjReason] = useState<string>("");
  const [adjBranch, setAdjBranch] = useState<string>("");

  // --- POS SELECTION FILTERS & VIEWS ---
  const [posSearch, setPosSearch] = useState<string>("");
  const [posCategory, setPosCategory] = useState<string>("Semua");

  // --- DEBTS & RECEIVABLES FILTERS & SETTLEMENTS ---
  const [debtRecTab, setDebtRecTab] = useState<'piutang' | 'hutang'>("piutang");
  const [selectedDebtTx, setSelectedDebtTx] = useState<Transaction | null>(null);
  const [settlementAmount, setSettlementAmount] = useState<number>(0);

  // --- RECENT RECEIPT DISPLAY MODAL ---
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  // --- NEW ENTITY FORMS ---
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Monitor");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdUnit, setNewProdUnit] = useState("Unit");

  // --- HELPER METRIC CALCULATIONS ---
  // Apply filtering based on simulator role if necessary
  const activeBranchContext = currentUser.role === 'admin' ? 'Semua' : currentUser.branch;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (currentUser.role === 'admin') return true;
      if (currentUser.role === 'cabang' || currentUser.role === 'kurir') {
        return tx.branch === currentUser.branch;
      }
      if (currentUser.role === 'sales') {
        // Sales views sales order made by them
        return tx.salesId === currentUser.id || tx.branch === currentUser.branch;
      }
      return true;
    });
  }, [transactions, currentUser]);

  const dashboardMetrics = useMemo(() => {
    const branchTx = transactions.filter(t => activeBranchContext === 'Semua' || t.branch === activeBranchContext);
    
    let totalSales = 0;
    let totalPurchase = 0;
    let totalPiutang = 0; // Receivable
    let totalHutang = 0;  // Payable

    branchTx.forEach(tx => {
      if (tx.status === 'Batal') return;
      if (tx.type === 'penjualan') {
        totalSales += tx.totalAmount;
        totalPiutang += tx.remainingBalance;
      } else {
        totalPurchase += tx.totalAmount;
        totalHutang += tx.remainingBalance;
      }
    });

    // Alert stock
    let lowStockCount = 0;
    products.forEach(p => {
      if (activeBranchContext === 'Semua') {
        const totalStockVal = (Object.values(p.stock) as number[]).reduce((a, b) => a + b, 0);
        if (totalStockVal < 10) lowStockCount++;
      } else {
        const localStock = p.stock[activeBranchContext] || 0;
        if (localStock < 5) lowStockCount++;
      }
    });

    return { totalSales, totalPurchase, totalPiutang, totalHutang, lowStockCount };
  }, [transactions, products, activeBranchContext]);

  // --- CHART DATA PREPARATION ---
  const salesByBranchData = useMemo(() => {
    const branchSales: Record<string, number> = {};
    INITIAL_BRANCHES.forEach(b => { branchSales[b] = 0; });

    transactions.forEach(tx => {
      if (tx.type === 'penjualan' && tx.status !== 'Batal') {
        branchSales[tx.branch] = (branchSales[tx.branch] || 0) + tx.totalAmount;
      }
    });

    return Object.entries(branchSales).map(([name, total]) => ({ name: name.split(" ")[0], Total: total }));
  }, [transactions]);

  const salesTrendData = useMemo(() => {
    // Generate dates in correct trend mapping inside June 2026
    const daily: Record<string, { tanggal: string; Penjualan: number; Pembelian: number }> = {};
    for (let i = 1; i <= 8; i++) {
      const key = `2026-06-0${i}`;
      daily[key] = { tanggal: `0${i}/06`, Penjualan: 0, Pembelian: 0 };
    }

    transactions.forEach(tx => {
      const dateStr = tx.date.split("T")[0];
      if (daily[dateStr]) {
        if (tx.type === 'penjualan') {
          daily[dateStr].Penjualan += tx.totalAmount;
        } else {
          daily[dateStr].Pembelian += tx.totalAmount;
        }
      }
    });

    return Object.values(daily);
  }, [transactions]);

  // --- ACTIONS ---

  // Handle adding custom customer on the fly
  const handleAddCustomerSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newCustomerName) return;
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustomerName,
      phone: newCustomerPhone || "-",
      address: newCustomerAddress || "-"
    };
    const updated = [...customers, newCust];
    setCustomers(updated);
    setSelectedCustomer(newCust.id);
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerAddress("");
    setShowAddCustomer(false);
  };

  // Add new product manual form
  const handleAddProductSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSku) return;
    const initialStocks: Record<string, number> = {};
    INITIAL_BRANCHES.forEach(b => {
      initialStocks[b] = b === selectedBranch ? 10 : 0; // Default seed 10 on active branch
    });

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      sku: newProdSku.toUpperCase(),
      category: newProdCategory,
      price: Number(newProdPrice) || 0,
      cost: Number(newProdCost) || 0,
      unit: newProdUnit,
      stock: initialStocks
    };

    setProducts([...products, newProd]);
    setNewProdName("");
    setNewProdSku("");
    setNewProdPrice("");
    setNewProdCost("");
    setShowAddProduct(false);
  };

  // 1. ADD TO POS CART
  const addToCart = (product: Product) => {
    const branchStockQty = product.stock[selectedBranch] || 0;
    const existing = cart.find(item => item.product.id === product.id);
    const existingQty = existing ? existing.quantity : 0;

    if (existingQty >= branchStockQty) {
      alert(`Stok tidak mencukupi! Hanya tersedia ${branchStockQty} ${product.unit} di ${selectedBranch}`);
      return;
    }

    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  // Update POS Cart qty
  const updateCartQty = (productId: string, delta: number) => {
    const item = cart.find(c => c.product.id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter(c => c.product.id !== productId));
      return;
    }

    const branchStockQty = item.product.stock[selectedBranch] || 0;
    if (newQty > branchStockQty) {
      alert(`Stok tidak mencukupi! Hanya tersedia ${branchStockQty} ${item.product.unit} di ${selectedBranch}`);
      return;
    }

    setCart(cart.map(c => c.product.id === productId ? { ...c, quantity: newQty } : c));
  };

  // Checkout POS Penjualan
  const handlePOSCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    const totalCalculated = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const paid = paymentMethod === 'Tunai' ? totalCalculated : (Number(amountPaidInput) || 0);

    if (paymentMethod === 'Kredit' && paid >= totalCalculated) {
      alert("Jika Metode Kredit/Piutang, nominal bayar harus lebih kecil dari total belanja!");
      return;
    }

    const remaining = totalCalculated - paid;

    // Generate Invoice Number
    const now = new Date();
    const dateFormatted = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const invoiceNum = `INV/${dateFormatted}/${randomSuffix}`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: invoiceNum,
      date: now.toISOString(),
      type: 'penjualan',
      branch: selectedBranch,
      customerId: selectedCustomer,
      salesId: currentUser.role === 'sales' ? currentUser.id : 'user-3', // Default Sales Ahmed Rian if logged as different
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        cost: item.product.cost,
      })),
      paymentMethod,
      status: 'Selesai',
      deliveryStatus: 'Menunggu Kurir', // Direct set for courier assignment
      assignedCourier: 'user-4', // Default Courier Asep
      totalAmount: totalCalculated,
      amountPaid: paid,
      remainingBalance: remaining
    };

    // Update Product stocks
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.product.id === p.id);
      if (cartItem) {
        const currentLocalStock = p.stock[selectedBranch] || 0;
        return {
          ...p,
          stock: {
            ...p.stock,
            [selectedBranch]: Math.max(0, currentLocalStock - cartItem.quantity)
          }
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    setTransactions([newTx, ...transactions]);
    setCart([]);
    setAmountPaidInput("");
    setReceiptTx(newTx); // Display printable invoice visual modal
    alert(`Transaksi Penjualan ${invoiceNum} sukses dibuat!${remaining > 0 ? ` Tercatat piutang sebesar Rp ${remaining.toLocaleString('id-ID')}` : ''}`);
  };

  // 2. PURCHASE (PEMBELIAN SUPPLIER) ACTIONS
  const addToPurchaseCart = (product: Product) => {
    const existing = purchaseCart.find(item => item.product.id === product.id);
    if (existing) {
      setPurchaseCart(purchaseCart.map(item =>
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setPurchaseCart([...purchaseCart, { product, quantity: 1, customCost: product.cost }]);
    }
  };

  const updatePurchaseQty = (productId: string, delta: number) => {
    setPurchaseCart(purchaseCart.map(item => {
      if (item.product.id === productId) {
        const nextQ = item.quantity + delta;
        return nextQ > 0 ? { ...item, quantity: nextQ } : null;
      }
      return item;
    }).filter(Boolean) as { product: Product; quantity: number; customCost?: number }[]);
  };

  const handlePurchaseCheckout = () => {
    if (purchaseCart.length === 0) {
      alert("Masukkan minimal 1 produk pembelian!");
      return;
    }

    const totalCalculated = purchaseCart.reduce((acc, item) => acc + ((item.customCost || item.product.cost) * item.quantity), 0);
    const paid = purchasePaymentMethod === 'Tunai' ? totalCalculated : (Number(purchaseAmountPaid) || 0);
    const remaining = totalCalculated - paid;

    const now = new Date();
    const dateFormatted = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const poNum = `PO/${dateFormatted}/${randomSuffix}`;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoiceNumber: poNum,
      date: now.toISOString(),
      type: 'pembelian',
      branch: selectedBranch,
      supplierId: selectedSupplier,
      items: purchaseCart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.customCost || item.product.cost,
        cost: item.customCost || item.product.cost
      })),
      paymentMethod: purchasePaymentMethod,
      status: 'Selesai',
      totalAmount: totalCalculated,
      amountPaid: paid,
      remainingBalance: remaining
    };

    // Increase Product stock
    const updatedProducts = products.map(p => {
      const cartItem = purchaseCart.find(c => c.product.id === p.id);
      if (cartItem) {
        const currentLocalStock = p.stock[selectedBranch] || 0;
        return {
          ...p,
          stock: {
            ...p.stock,
            [selectedBranch]: currentLocalStock + cartItem.quantity
          }
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    setTransactions([newTx, ...transactions]);
    setPurchaseCart([]);
    setPurchaseAmountPaid("");
    alert(`Pembelian Stok ${poNum} Berhasil! Stok di ${selectedBranch} bertambah.${remaining > 0 ? ` Tercatat hutang sebesar Rp ${remaining.toLocaleString('id-ID')}` : ''}`);
  };

  // 3. STOCK ADJUSTMENT ACTION
  const openAdjustmentModal = (product: Product) => {
    setSelectedAdjProduct(product);
    setAdjQty(1);
    setAdjReason("Koreksi Stock Opname");
    setAdjBranch(currentUser.role === 'admin' ? "Pusat (Jakarta)" : currentUser.branch);
    setShowAdjustmentModal(true);
  };

  const submitStockAdjustment = () => {
    if (!selectedAdjProduct) return;

    const currentLocalStock = selectedAdjProduct.stock[adjBranch] || 0;
    const finalStock = currentLocalStock + adjQty;

    if (finalStock < 0) {
      alert("Pengurangan stock melebihi stock fisik saat ini yang ada!");
      return;
    }

    const newAdj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      date: new Date().toISOString(),
      productId: selectedAdjProduct.id,
      productName: selectedAdjProduct.name,
      branch: adjBranch,
      changeQty: adjQty,
      reason: adjReason,
      operator: currentUser.name
    };

    // Update product stock state
    const updatedProducts = products.map(p => {
      if (p.id === selectedAdjProduct.id) {
        return {
          ...p,
          stock: {
            ...p.stock,
            [adjBranch]: finalStock
          }
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    setAdjustments([newAdj, ...adjustments]);
    setShowAdjustmentModal(false);
    setSelectedAdjProduct(null);
    alert(`Penyesuaian stok untuk ${selectedAdjProduct.name} sukses diperbarui di ${adjBranch}!`);
  };

  // 4. DEB/REC RECEIVABLE & PAYABLE SETTLEMENT ACTIONS
  const initiateSettlement = (tx: Transaction) => {
    setSelectedDebtTx(tx);
    setSettlementAmount(tx.remainingBalance);
  };

  const processSettlement = () => {
    if (!selectedDebtTx) return;

    if (settlementAmount <= 0 || settlementAmount > selectedDebtTx.remainingBalance) {
      alert("Jumlah pembayaran pelunasan tidak valid!");
      return;
    }

    const updatedTxs = transactions.map(tx => {
      if (tx.id === selectedDebtTx.id) {
        const targetPaid = tx.amountPaid + settlementAmount;
        const targetBalance = tx.remainingBalance - settlementAmount;
        return {
          ...tx,
          amountPaid: targetPaid,
          remainingBalance: targetBalance
        };
      }
      return tx;
    });

    setTransactions(updatedTxs);
    alert(`Selesai! Nominal Rp ${settlementAmount.toLocaleString('id-ID')} berhasil dibayarkan.`);
    setSelectedDebtTx(null);
  };

  // 5. COURIER TASK UPDATE
  const updateCourierDelivery = (txId: string, nextStatus: Transaction['deliveryStatus'], notes?: string) => {
    const updatedTxs = transactions.map(tx => {
      if (tx.id === txId) {
        return {
          ...tx,
          deliveryStatus: nextStatus,
          courierNotes: notes || tx.courierNotes,
        };
      }
      return tx;
    });

    setTransactions(updatedTxs);
    alert("Status Pengiriman kurir berhasil diupdate!");
  };

  // --- FILTERED VIEWS ---
  const stockFilteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(stockSearch.toLowerCase()) || p.sku.toLowerCase().includes(stockSearch.toLowerCase());
      const matchesCategory = stockCategoryFilter === "Semua" || p.category === stockCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, stockSearch, stockCategoryFilter]);

  const posFilteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
      const matchesCategory = posCategory === "Semua" || p.category === posCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, posSearch, posCategory]);

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* SIMULATOR HEADER SYSTEM (PROMINENT CONTROLS TO RE-ROLE) */}
      <div id="sim-banner" className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white px-4 py-2 flex flex-wrap gap-4 items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded-sm text-xs font-mono font-bold">MODE SIMULATOR MULTI-USER</span>
          <p className="text-sm">Ganti User di samping untuk menguji pembatasan fitur (<b>Admin, Cabang, Sales, Kurir</b>):</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <select 
            id="user-simulator-select"
            className="bg-white text-slate-900 border-none outline-none font-medium px-3 py-1 rounded text-sm shadow cursor-pointer focus:ring-2 focus:ring-amber-300"
            value={currentUser.id}
            onChange={(e) => {
              const matched = INITIAL_USER_SESSIONS.find(u => u.id === e.target.value);
              if (matched) {
                setCurrentUser(matched);
                // Also set proper active menu for courir role
                if (matched.role === 'kurir') {
                  setActiveMenu("kurir");
                } else {
                  setActiveMenu("dashboard");
                }
              }
            }}
          >
            {INITIAL_USER_SESSIONS.map(usr => (
              <option key={usr.id} value={usr.id}>
                {usr.name} — [{(usr.role).toUpperCase()}]
              </option>
            ))}
          </select>
          <button 
            id="btn-reset-app"
            onClick={handleResetData}
            title="Setel ulang semua database lokal ke awal"
            className="bg-red-800 hover:bg-red-900 text-white rounded px-3 py-1 text-xs font-semibold flex items-center gap-1 transition shadow-sm cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Setel Ulang Data
          </button>
        </div>
      </div>

      {/* HEADER UTAMA */}
      <header id="main-nav" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div id="header-wrapper" className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Sistem POS Kasir & Stok</h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Aktif: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})</span>
                <span className="text-slate-300">•</span>
                <span>Branch: <strong className="text-slate-800">{currentUser.branch}</strong></span>
              </div>
            </div>
          </div>

          {/* MENUS ACCORDING TO ROLES */}
          <nav id="header-menu-list" className="flex flex-wrap gap-1 bg-slate-100 p-1.5 rounded-lg text-sm font-semibold">
            {currentUser.role !== 'kurir' && (
              <>
                <button
                  id="tab-dashboard"
                  onClick={() => setActiveMenu("dashboard")}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeMenu === "dashboard" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Dashboard
                </button>
                <button
                  id="tab-isipenjualan"
                  onClick={() => setActiveMenu("pos-penjualan")}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeMenu === "pos-penjualan" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                >
                  POS Penjualan
                </button>
                {/* Sales doesn't do purchase orders */}
                {currentUser.role !== 'sales' && (
                  <button
                    id="tab-isipembelian"
                    onClick={() => setActiveMenu("pos-pembelian")}
                    className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeMenu === "pos-pembelian" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    PO Pembelian
                  </button>
                )}
                <button
                  id="tab-stok"
                  onClick={() => setActiveMenu("stok")}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeMenu === "stok" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Monitor Stok
                </button>
                {/* Sales doesn't see complete finance, but can check receivables (Piutang) */}
                <button
                  id="tab-finance"
                  onClick={() => setActiveMenu("keuangan")}
                  className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeMenu === "keuangan" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                >
                  Hutang & Piutang
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    id="tab-laporan"
                    onClick={() => setActiveMenu("laporan")}
                    className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeMenu === "laporan" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    Laporan Penjualan
                  </button>
                )}
              </>
            )}
            
            {/* Courier specific view */}
            {currentUser.role === 'kurir' && (
              <button
                id="tab-kurir"
                onClick={() => setActiveMenu("kurir")}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${activeMenu === "kurir" ? "bg-white text-indigo-600 shadow" : "text-slate-600"}`}
              >
                Pengiriman Kurir ({transactions.filter(t => t.type === 'penjualan' && t.deliveryStatus && t.deliveryStatus !== 'Selesai Diterima').length})
              </button>
            )}

            {/* Global Document & PDF Download Button */}
            <button
              id="tab-risalah-pdf"
              onClick={() => setActiveMenu("panduan")}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${activeMenu === "panduan" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
            >
              <FileText className="h-4 w-4 text-indigo-500" />
              <span>Risalah & PDF</span>
            </button>
          </nav>
        </div>
      </header>

      {/* BODY CONTENT ROUTING */}
      <main id="main-content-area" className="flex-grow max-w-7xl w-full mx-auto p-4">
        
        {/* ======================= 1. DASHBOARD MENU ======================= */}
        {activeMenu === "dashboard" && (
          <div id="menu-dashboard-section" className="space-y-6">
            
            {/* HERO ROLE CARD */}
            <div className="bg-indigo-900 rounded-2xl text-white p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-12 opacity-10 pointer-events-none">
                <Building2 className="h-64 w-64" />
              </div>
              <div className="relative z-10 max-w-2xl space-y-2">
                <span className="bg-indigo-800 text-indigo-200 border border-indigo-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                  Peran Saat Ini: {currentUser.role}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Selamat Datang, {currentUser.name}!
                </h2>
                <p className="text-indigo-200 text-sm leading-relaxed">
                  {currentUser.role === 'admin' && "Anda memiliki kuasa penuh atas seluruh data cabang, produk, transaksi suplai pembelian, neraca hutang-piutang pelanggan, penyesuaian stok opname fisik, serta visual laporan penjualan."}
                  {currentUser.role === 'cabang' && `Sebagai kepala cabang untuk ${currentUser.branch}, data penjualan, stok, dan otorisasi purchase order Anda difilter secara aman khusus untuk operasional wilayah Anda.`}
                  {currentUser.role === 'sales' && "Optimalkan pesanan pelanggan di lapangan. Cek persediaan stok di cabang secara riil sebelum memproses transaksi cash/kredit pelanggan Anda."}
                  {currentUser.role === 'kurir' && "Perhatikan tugas pengantaran armada logistik Anda di Bandung/Pusat. Informasikan sisa piutang COD beralih lunas langsung di sistem."}
                </p>
              </div>
            </div>

            {/* HIGH LEVEL KPIS */}
            <div id="kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Omset Penjualan</p>
                  <p className="text-xl font-black text-slate-900">
                    Rp {dashboardMetrics.totalSales.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-slate-400">Total kotor penjualan tercatat</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="bg-rose-100 text-rose-600 p-3.5 rounded-xl">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider font-semibold">Beban Pembelian</p>
                  <p className="text-xl font-black text-slate-900">
                    Rp {dashboardMetrics.totalPurchase.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-slate-400">Restock suplai ke supplier</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="bg-amber-100 text-amber-700 p-3.5 rounded-xl">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Piutang</p>
                  <p className="text-xl font-black text-rose-600">
                    Rp {dashboardMetrics.totalPiutang.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-amber-600 font-semibold">Tergantung di pelanggan</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3.5 rounded-xl">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pemberitahuan Stok</p>
                  <p className="text-xl font-black text-slate-900">
                    {dashboardMetrics.lowStockCount} Item
                  </p>
                  <p className="text-[10px] text-rose-500 font-semibold">{dashboardMetrics.lowStockCount > 0 ? "⚠️ Stok tipis di bawah batas!" : "Semua stok aman"}</p>
                </div>
              </div>
            </div>

            {/* SUB-DASHBOARD GRAPHS PREVIEW & IMPORTANT SHORTCUTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* CHARTS BRIEF */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Tren Operasional Bulanan</h3>
                    <p className="text-xs text-slate-500">Perbandingan harian grafik penjualan dg pembelian</p>
                  </div>
                  <span className="bg-slate-100 px-2.5 py-1 text-xs rounded text-slate-700 font-medium font-mono">Juni 2026</span>
                </div>
                
                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="tanggal" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `Rp ${val/1000}k`} />
                      <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                      <Legend />
                      <Line type="monotone" dataKey="Penjualan" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Pembelian" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* LIST OUTSTANDING DEBT ALERTS TO ACTION */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900">Perlu Penagihan Piutang</h3>
                    <span className="bg-rose-50 text-rose-600 text-[10px] px-2 py-0.5 rounded font-black uppercase">Outstanding</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Selesaikan piutang pelanggan untuk menjaga kelancaran modal kas operasional.</p>

                  <div className="space-y-3">
                    {transactions
                      .filter(t => t.type === 'penjualan' && t.remainingBalance > 0)
                      .slice(0, 3)
                      .map(tx => {
                        const cust = customers.find(c => c.id === tx.customerId);
                        return (
                          <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between text-xs gap-1">
                            <div className="flex justify-between font-semibold">
                              <span className="text-slate-800">{cust?.name || "Pelanggan Umum"}</span>
                              <span className="text-rose-600">Rp {tx.remainingBalance.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-400">
                              <span>Invoice: {tx.invoiceNumber}</span>
                              <button 
                                id={`settle-direct-${tx.id}`}
                                onClick={() => {
                                  setDebtRecTab('piutang');
                                  setActiveMenu('keuangan');
                                  initiateSettlement(tx);
                                }}
                                className="text-indigo-600 hover:underline font-bold"
                              >
                                Tagih &rarr;
                              </button>
                            </div>
                          </div>
                        );
                    })}
                    {transactions.filter(t => t.type === 'penjualan' && t.remainingBalance > 0).length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-xs text-medium">
                        Tidak ada piutang yang tertunggak. Bagus!
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    id="btn-nav-pos-quick"
                    onClick={() => setActiveMenu('pos-penjualan')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg text-xs flex justify-center items-center gap-1.5 shadow"
                  >
                    <ShoppingCart className="h-3.5 w-3.5" /> Buka POS Penjualan Kasir
                  </button>
                </div>
              </div>

            </div>

            {/* RETRIEVE LAST 5 LOG TRANSACTIONS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">Riwayat Transaksi Terkini</h3>
                  <p className="text-xs text-slate-500">Log mutasi penjualan dan pembelian di seluruh cabang</p>
                </div>
                <button
                  id="btn-goto-finance-sec"
                  onClick={() => setActiveMenu('stok')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Monitor Stok & Adjust &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table id="tbl-recent-txs" className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-2.5">Tgl & Nota</th>
                      <th className="py-2.5">Cabang</th>
                      <th className="py-2.5">Tipe</th>
                      <th className="py-2.5">Entitas</th>
                      <th className="py-2.5">Produk Transaksi</th>
                      <th className="py-2.5 text-right">Total Transaksi</th>
                      <th className="py-2.5 text-center">Metode</th>
                      <th className="py-2.5 text-center">Status Sisa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.slice(0, 5).map(tx => {
                      const isSale = tx.type === 'penjualan';
                      const partyName = isSale
                        ? (customers.find(c => c.id === tx.customerId)?.name || "Pelanggan Umum")
                        : (suppliers.find(s => s.id === tx.supplierId)?.name || "Supplier Umum");
                      
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3">
                            <div className="font-semibold text-slate-900">{tx.invoiceNumber}</div>
                            <div className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('id-ID')} {new Date(tx.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</div>
                          </td>
                          <td className="py-3 font-medium text-slate-700">{tx.branch}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded font-black text-[10px] ${isSale ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {isSale ? 'PENJUALAN' : 'PEMBELIAN'}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-slate-700">{partyName}</td>
                          <td className="py-3 text-[11px] text-slate-500 max-w-xs truncate">
                            {tx.items.map(it => `${it.productName} (${it.quantity}x)`).join(", ")}
                          </td>
                          <td className="py-3 text-right font-black text-slate-950">
                            Rp {tx.totalAmount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-sm font-semibold text-[10px] ${tx.paymentMethod === 'Tunai' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-50 text-indigo-700'}`}>
                              {tx.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {tx.remainingBalance > 0 ? (
                              <span className="text-rose-600 font-bold text-[11px]">Sisa Rp {tx.remainingBalance.toLocaleString('id-ID')}</span>
                            ) : (
                              <span className="text-emerald-600 font-bold text-[11px]">Lunas 👍</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* ======================= 2. POS PENJUALAN KASIR ======================= */}
        {activeMenu === "pos-penjualan" && (
          <div id="menu-pos-section" className="space-y-4">
            
            {/* ALERT WARN SALES NOT SAME CONTEXT */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 text-indigo-900 text-xs">
              <Info className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Informasi POS Aktif</p>
                <p className="mt-0.5">Semua nominal penjualan, harga item, dan sisa stok dikalkulasikan secara aman berdasarkan <b>{selectedBranch}</b>. {currentUser.role === 'sales' && "Role Anda saat ini adalah Sales, transaksi Anda otomatis tercatat atas nama Anda."}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* LEFT: PRODUCTS CATALOG (3 COLS) */}
              <div className="lg:col-span-3 space-y-4">
                
                {/* TOOLBAR SEARCH & FILTER */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-2 justify-between">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="pos-search-input"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Cari nama monitor / Sku..."
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2 text-xs">
                    <select
                      id="pos-cat-filter"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2"
                      value={posCategory}
                      onChange={(e) => setPosCategory(e.target.value)}
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Aksesoris">Aksesoris</option>
                      <option value="Penyimpanan">Penyimpanan</option>
                    </select>

                    <select
                      id="pos-branch-select"
                      className="bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold text-indigo-700"
                      value={selectedBranch}
                      onChange={(e) => {
                        // Admin or role has right to simulate branches POS
                        if (currentUser.role === 'admin') {
                          setSelectedBranch(e.target.value);
                        } else {
                          alert("Akses dibatasi! Cabang terkunci untuk peran Anda.");
                        }
                      }}
                      disabled={currentUser.role !== 'admin'}
                    >
                      {INITIAL_BRANCHES.map(br => (
                        <option key={br} value={br}>{br}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* PRODUCT GRID */}
                <div id="catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posFilteredProducts.map(prod => {
                    const localStock = prod.stock[selectedBranch] || 0;
                    const inCart = cart.find(c => c.product.id === prod.id);
                    const qtyInCart = inCart ? inCart.quantity : 0;
                    const isOutOfStock = localStock === 0;

                    return (
                      <div 
                        key={prod.id} 
                        className={`bg-white rounded-xl border p-4 flex flex-col justify-between transition-all ${isOutOfStock ? 'opacity-65 border-slate-200' : 'border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-1 text-[11px] font-bold text-slate-400 uppercase">
                            <span>{prod.sku}</span>
                            <span>{prod.category}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 h-10 mb-2">{prod.name}</h4>
                          
                          <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs mb-3">
                            <span className="text-slate-500 font-medium">Stok ({selectedBranch.split(" ")[0]}):</span>
                            <span className={`font-black ${localStock < 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                              {localStock} {prod.unit}
                            </span>
                          </div>
                        </div>

                        <div>
                          <p id={`price-${prod.sku}`} className="text-sm font-extrabold text-indigo-600 mb-3 block">
                            Rp {prod.price.toLocaleString('id-ID')}
                          </p>

                          <button
                            id={`btn-add-to-cart-${prod.sku}`}
                            onClick={() => addToCart(prod)}
                            disabled={isOutOfStock}
                            className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                              isOutOfStock 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : qtyInCart > 0 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                            }`}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {qtyInCart > 0 ? `Masuk (${qtyInCart})` : 'Tambah Kasir'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {posFilteredProducts.length === 0 && (
                  <div className="bg-white rounded-xl py-12 border border-slate-200 text-center text-slate-500 text-xs font-semibold">
                    Tidak ada monitor atau aksesoris bernuansa "{posSearch}"
                  </div>
                )}
              </div>

              {/* RIGHT: CART SUMMARY CHECKOUT (2 COLS) */}
              <div className="lg:col-span-2 space-y-4">
                <div id="cart-panel" className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                  
                  {/* HEADER CART */}
                  <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-indigo-600" />
                      <h3 className="font-extrabold text-slate-900 text-sm">Keranjang Belanja POS</h3>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2.5 py-0.5 rounded font-black">
                      {cart.reduce((a, b) => a + b.quantity, 0)} Item
                    </span>
                  </div>

                  {/* CART ITEMS CONTAINER */}
                  <div className="p-4 space-y-3 divide-y divide-slate-100 h-72 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product.id} className="pt-3 flex items-start justify-between gap-2 text-xs">
                        <div className="flex-grow space-y-1">
                          <h5 className="font-bold text-slate-800 line-clamp-1">{item.product.name}</h5>
                          <p className="text-[10px] text-slate-400">@ Rp {item.product.price.toLocaleString('id-ID')}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                            <button 
                              id={`minus-${item.product.sku}`}
                              onClick={() => updateCartQty(item.product.id, -1)}
                              className="px-2 py-0.5 hover:bg-slate-200 font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2.5 text-[11px] font-bold text-slate-800">{item.quantity}</span>
                            <button 
                              id={`plus-${item.product.sku}`}
                              onClick={() => updateCartQty(item.product.id, 1)}
                              className="px-2 py-0.5 hover:bg-slate-200 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          
                          <p className="w-20 text-right font-black text-slate-900">
                            Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}

                    {cart.length === 0 && (
                      <div className="h-full flex flex-col justify-center items-center text-center py-12 text-slate-400 space-y-2">
                        <ShoppingCart className="h-10 w-10 text-slate-300" />
                        <p className="text-xs font-semibold">Keranjang masih kosong</p>
                        <p className="text-[10px] text-slate-400 max-w-xs">Silakan pilih monitor dan aksesoris di sebelah kiri untuk menambah pesanan pelanggan</p>
                      </div>
                    )}
                  </div>

                  {/* CUSTOMER CUSTOM & PAYMENT FORM */}
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50 space-y-4">
                    
                    {/* CUSTOMER SELECTION WITH INLINE ADD */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase">Pelanggan</label>
                        <button
                          id="btn-toggle-add-cust"
                          onClick={() => setShowAddCustomer(!showAddCustomer)}
                          className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                        >
                          + Pelanggan Baru
                        </button>
                      </div>

                      {showAddCustomer && (
                        <form onSubmit={handleAddCustomerSubmit} className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs mb-3 space-y-2.5 text-xs">
                          <p className="font-bold text-slate-700">Daftarkan Pelanggan Baru</p>
                          <input
                            id="new-cust-name-input"
                            type="text"
                            placeholder="Nama Lengkap"
                            className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            required
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              id="new-cust-phone-input"
                              type="text"
                              placeholder="No Hp"
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none"
                              value={newCustomerPhone}
                              onChange={(e) => setNewCustomerPhone(e.target.value)}
                            />
                            <input
                              id="new-cust-addr-input"
                              type="text"
                              placeholder="Alamat domisili"
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 focus:outline-none"
                              value={newCustomerAddress}
                              onChange={(e) => setNewCustomerAddress(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowAddCustomer(false)} type="button" className="px-2.5 py-1 bg-slate-100 rounded text-slate-600">Batal</button>
                            <button id="submit-add-customer-form" type="submit" className="px-2.5 py-1 bg-indigo-600 rounded text-white font-bold cursor-pointer">Simpan</button>
                          </div>
                        </form>
                      )}

                      <select
                        id="pos-customer-select"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                        value={selectedCustomer}
                        onChange={(e) => setSelectedCustomer(e.target.value)}
                      >
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                        ))}
                      </select>
                    </div>

                    {/* METHOD PAYMENT */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Metode Bayar</label>
                        <select
                          id="pos-pay-method"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none cursor-pointer"
                          value={paymentMethod}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value as 'Tunai' | 'Kredit');
                            if (e.target.value === 'Tunai') setAmountPaidInput("");
                          }}
                        >
                          <option value="Tunai">Tunai / Cash Lunas</option>
                          <option value="Kredit">Kredit / Piutang Tempo</option>
                        </select>
                      </div>

                      {paymentMethod === 'Kredit' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kredit Uang Muka (DP)</label>
                          <input
                            id="pos-down-payment-input"
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                            placeholder="Rp Bayar sekarang"
                            value={amountPaidInput}
                            onChange={(e) => setAmountPaidInput(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* SUMMARY COST METRIC */}
                    <div className="space-y-1.5 pt-3 border-t border-slate-200/60 bg-white p-3 rounded-lg text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Total Nilai Barang:</span>
                        <span className="font-semibold text-slate-900">
                          Rp {cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      {paymentMethod === 'Kredit' && (
                        <>
                          <div className="flex justify-between text-slate-500">
                            <span>Uang Muka (DP):</span>
                            <span className="text-slate-800">
                              Rp {(Number(amountPaidInput) || 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold text-rose-600">
                            <span>Pencatatan Sisa Piutang:</span>
                            <span>
                              Rp {Math.max(0, cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) - (Number(amountPaidInput) || 0)).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-extrabold text-sm text-slate-900">
                        <span>Total Pembayaran:</span>
                        <span className="text-indigo-600 price-highlight">
                          Rp {cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <button
                      id="btn-pos-pay-complete"
                      onClick={handlePOSCheckout}
                      disabled={cart.length === 0}
                      className={`w-full py-3 h-12 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow cursor-pointer ${
                        cart.length === 0 
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                          : 'bg-indigo-600 hover:bg-slate-900 hover:scale-[1.01] text-white'
                      }`}
                    >
                      Selesaikan & Bayar
                    </button>

                  </div>

                </div>
              </div>

            </div>

          </div>
        )}


        {/* ======================= 3. PO PEMBELIAN (SUPPLIER REPLENISH) ======================= */}
        {activeMenu === "pos-pembelian" && currentUser.role !== 'sales' && (
          <div id="menu-pembelian-section" className="space-y-4">
            
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 text-rose-900 text-xs">
              <Info className="h-5 w-5 text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Modul Pembelian Supplier (Product Restocking)</p>
                <p className="mt-0.5">Simulasi pengadaan barang dari partner supplier resmi untuk restoking monitor dan aksesoris di <b>{selectedBranch}</b>.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* LEFT: PRODUCTS SELECTION LIST FOR PO (3 COLS) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Pilih Monitor / Aksesoris yang Ingin Diorder</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {products.map(prod => {
                      const branchStockQty = prod.stock[selectedBranch] || 0;
                      return (
                        <div key={prod.id} className="border border-slate-100 hover:border-rose-400 p-3.5 rounded-xl bg-white flex justify-between items-center transition">
                          <div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase bg-slate-100 px-1 py-0.5 rounded">{prod.sku}</span>
                            <h5 className="font-bold text-slate-800 text-xs line-clamp-1 mt-1">{prod.name}</h5>
                            <p className="text-[11px] text-slate-400">Harga Beli Supplier: <span className="font-semibold text-slate-700">Rp {prod.cost.toLocaleString('id-ID')}</span></p>
                            <p className="text-[10px] text-slate-400">Stok Saat Ini: <span className="font-semibold text-slate-600">{branchStockQty} {prod.unit}</span></p>
                          </div>
                          
                          <button
                            id={`btn-purch-add-${prod.sku}`}
                            onClick={() => addToPurchaseCart(prod)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="h-3.5 w-3.5" /> Ambil PO
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT: PO REPLENISH CART & MUTATION (2 COLS) */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-250 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-4 border-b border-slate-100 bg-rose-50/20 flex items-center justify-between">
                    <span className="font-black text-xs text-rose-700 uppercase tracking-wide">Ringkasan Purchase Order (PO)</span>
                    <span className="bg-rose-100 text-rose-800 text-[10px] px-2 py-0.5 rounded font-bold">{purchaseCart.length} Item</span>
                  </div>

                  <div className="p-4 space-y-3 divide-y divide-slate-100 min-h-64 h-64 overflow-y-auto">
                    {purchaseCart.map(item => (
                      <div key={item.product.id} className="pt-3 flex items-start justify-between gap-1 text-xs">
                        <div className="flex-grow space-y-1">
                          <h6 className="font-bold text-slate-800 line-clamp-1">{item.product.name}</h6>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">Rp Beli:</span>
                            <input
                              type="number"
                              className="w-20 bg-slate-50 border border-slate-200 text-[10px] rounded p-0.5 font-bold"
                              value={item.customCost ?? item.product.cost}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPurchaseCart(purchaseCart.map(pc => pc.product.id === item.product.id ? { ...pc, customCost: val } : pc));
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex border border-slate-200 rounded bg-slate-50">
                            <button onClick={() => updatePurchaseQty(item.product.id, -1)} className="px-1.5 py-0.5 hover:bg-slate-200">-</button>
                            <span className="px-2 font-bold">{item.quantity}</span>
                            <button onClick={() => updatePurchaseQty(item.product.id, 1)} className="px-1.5 py-0.5 hover:bg-slate-200">+</button>
                          </div>
                          
                          <p className="w-20 text-right font-black text-slate-900">
                            Rp {((item.customCost ?? item.product.cost) * item.quantity).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    ))}

                    {purchaseCart.length === 0 && (
                      <div className="h-full flex flex-col justify-center items-center text-center py-12 text-slate-400 space-y-2">
                        <Package className="h-8 w-8 text-rose-200" />
                        <p className="text-xs font-semibold">Tentukan barang yang dibeli</p>
                        <p className="text-[10px] text-slate-400">Silakan pilih monitor di sebelah kiri untuk ditambahkan ke daftar PO restoking</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                    
                    {/* SUPPLIER MATCHING */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Supplier Utama</label>
                      <select
                        id="po-supplier-select"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                      >
                        {suppliers.map(sup => (
                          <option key={sup.id} value={sup.id}>{sup.name} ({sup.phone})</option>
                        ))}
                      </select>
                    </div>

                    {/* METHOD PAYMENT */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Metode Bayar PO</label>
                        <select
                          id="po-pay-method"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                          value={purchasePaymentMethod}
                          onChange={(e) => {
                            setPurchasePaymentMethod(e.target.value as 'Tunai' | 'Kredit');
                            if (e.target.value === 'Tunai') setPurchaseAmountPaid("");
                          }}
                        >
                          <option value="Tunai">Tunai / Cash Lunas</option>
                          <option value="Kredit">Kredit / Sisa Hutang</option>
                        </select>
                      </div>

                      {purchasePaymentMethod === 'Kredit' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dp Dibayar Cash</label>
                          <input
                            id="po-dp-input"
                            type="number"
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                            placeholder="Rp Bayar"
                            value={purchaseAmountPaid}
                            onChange={(e) => setPurchaseAmountPaid(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* TOTAL */}
                    <div className="bg-white border border-slate-150 p-3 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between font-bold text-slate-900 text-sm">
                        <span>Total Belanja Cabang:</span>
                        <span className="text-rose-600">
                          Rp {purchaseCart.reduce((acc, item) => acc + ((item.customCost ?? item.product.cost) * item.quantity), 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      
                      {purchasePaymentMethod === 'Kredit' && (
                        <div className="flex justify-between text-xs text-rose-500 font-bold">
                          <span>Sisa Jadi Hutang Tempo:</span>
                          <span>
                            Rp {Math.max(0, purchaseCart.reduce((acc, item) => acc + ((item.customCost ?? item.product.cost) * item.quantity), 0) - (Number(purchaseAmountPaid) || 0)).toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      id="btn-po-checkout"
                      onClick={handlePurchaseCheckout}
                      disabled={purchaseCart.length === 0}
                      className={`w-full py-2.5 rounded-lg text-xs font-black uppercase transition-all shadow cursor-pointer ${
                        purchaseCart.length === 0 
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-rose-600 hover:bg-slate-900 text-white shadow-rose-200'
                      }`}
                    >
                      Proses Belanja Penambahan Stok &rarr;
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}


        {/* ======================= 4. MONITOR & PENYESUAIAN STOK ======================= */}
        {activeMenu === "stok" && (
          <div id="menu-stock-section" className="space-y-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Unit Monitor Persediaan Barang</h3>
                  <p className="text-xs text-slate-500">Monitor mutasi stok, status aman/kritis, serta lakukan audit koreksi gudang.</p>
                </div>

                <div className="flex gap-2 flex-wrap text-xs">
                  {currentUser.role === 'admin' && (
                    <button
                      id="btn-add-product-modal"
                      onClick={() => setShowAddProduct(!showAddProduct)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" /> Tambah Monitor Baru
                    </button>
                  )}
                  
                  <button 
                    id="btn-goto-pos"
                    onClick={() => setActiveMenu('pos-penjualan')}
                    className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    Buka Kasir POS
                  </button>
                </div>
              </div>

              {showAddProduct && (
                <form onSubmit={handleAddProductSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <p className="font-extrabold text-slate-800 text-sm">Registrasi Master Monitor / Produk Baru</p>
                    <button type="button" onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-slate-600 font-bold">Tutup</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Nama Monitor / Sku</label>
                      <input
                        id="new-prod-name"
                        type="text"
                        placeholder="e.g. Asus ProArt PA278CV"
                        className="w-full bg-white border border-slate-200 p-2 rounded focus:outline-none"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Kode SKU Kode Batang</label>
                      <input
                        id="new-prod-sku"
                        type="text"
                        placeholder="e.g. MON-ASU-27"
                        className="w-full bg-white border border-slate-200 p-2 rounded focus:outline-none"
                        value={newProdSku}
                        onChange={(e) => setNewProdSku(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Kategori Barang</label>
                      <select
                        id="new-prod-category"
                        className="w-full bg-white border border-slate-200 p-2 rounded focus:outline-none"
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                      >
                        <option value="Monitor">Monitor</option>
                        <option value="Aksesoris">Aksesoris</option>
                        <option value="Penyimpanan">Penyimpanan</option>
                        <option value="Audio">Audio</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600">Satuan Unit</label>
                      <input
                        id="new-prod-unit"
                        type="text"
                        placeholder="Unit, Pcs, Box..."
                        className="w-full bg-white border border-slate-200 p-2 rounded focus:outline-none"
                        value={newProdUnit}
                        onChange={(e) => setNewProdUnit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1 text-slate-600">
                      <label className="block font-bold">Harga Jual POS (Rp)</label>
                      <input
                        id="new-prod-price"
                        type="number"
                        placeholder="e.g. 1500000"
                        className="w-full bg-white border border-slate-200 p-2 rounded focus:outline-none font-bold"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold">Harga Beli Kulakan Supplier (Rp)</label>
                      <input
                        id="new-prod-cost"
                        type="number"
                        placeholder="e.g. 1100000"
                        className="w-full bg-white border border-slate-200 p-2 rounded focus:outline-none"
                        value={newProdCost}
                        onChange={(e) => setNewProdCost(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <button id="submit-new-product-form" type="submit" className="w-full bg-indigo-600 hover:bg-slate-900 text-white font-extrabold p-2 rounded shadow cursor-pointer">
                        Simpan Master Barang Baru
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* SEARCH & ACCORDING FILTERS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="stock-search-field"
                    type="text"
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none"
                    placeholder="Saring nama monitor / sku..."
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select
                    id="stock-category-selector"
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                    value={stockCategoryFilter}
                    onChange={(e) => setStockCategoryFilter(e.target.value)}
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Penyimpanan">Penyimpanan</option>
                  </select>

                  <select
                    id="stock-branch-selector"
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none font-bold text-indigo-700"
                    value={stockBranchFilter}
                    onChange={(e) => setStockBranchFilter(e.target.value)}
                    disabled={currentUser.role !== 'admin'}
                  >
                    {currentUser.role === 'admin' ? (
                      <>
                        <option value="Semua">Semua Lokasi Cabang</option>
                        {INITIAL_BRANCHES.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </>
                    ) : (
                      <option value={currentUser.branch}>{currentUser.branch}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* STOCK TABLE LISTING */}
              <div className="overflow-x-auto">
                <table id="tbl-stocks-listing" className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-widest font-black">
                      <th className="py-3">SKU & CODE</th>
                      <th className="py-3">Kategori</th>
                      <th className="py-3">Nama Monitor / Aksesoris</th>
                      <th className="py-3 font-semibold text-slate-900">Harga Jual Retail</th>
                      <th className="py-3">Harga Kulak Supplier</th>
                      {currentUser.role === 'admin' ? (
                        INITIAL_BRANCHES.map(brName => (
                          <th key={brName} className="py-3 text-center">{brName.split(" ")[0]}</th>
                        ))
                      ) : (
                        <th className="py-3 text-center">{currentUser.branch}</th>
                      )}
                      
                      {currentUser.role !== 'sales' && <th className="py-3 text-right">Penyesuaian (Audit)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stockFilteredProducts.map(prod => {
                      return (
                        <tr key={prod.id} className="hover:bg-slate-50 transition">
                          <td className="py-3">
                            <span className="font-mono bg-slate-100 px-2 py-1 text-slate-700 text-[10px] rounded font-bold">{prod.sku}</span>
                          </td>
                          <td className="py-3 text-slate-500 font-semibold uppercase text-[10px]">{prod.category}</td>
                          <td className="py-3 font-extrabold text-slate-900">{prod.name}</td>
                          <td className="py-3 font-medium text-slate-850">Rp {prod.price.toLocaleString('id-ID')}</td>
                          <td className="py-3 text-slate-500">Rp {prod.cost.toLocaleString('id-ID')}</td>
                          
                          {currentUser.role === 'admin' ? (
                            INITIAL_BRANCHES.map(brName => {
                              const qty = prod.stock[brName] || 0;
                              return (
                                <td key={brName} className="py-3 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] ${qty < 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-800'}`}>
                                    {qty} {prod.unit}
                                  </span>
                                </td>
                              );
                            })
                          ) : (
                            <td className="py-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full font-black text-xs ${(prod.stock[currentUser.branch] || 0) < 5 ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-800'}`}>
                                {prod.stock[currentUser.branch] || 0} {prod.unit}
                              </span>
                            </td>
                          )}

                          {currentUser.role !== 'sales' && (
                            <td className="py-3 text-right">
                              <button
                                id={`btn-adjust-${prod.sku}`}
                                onClick={() => openAdjustmentModal(prod)}
                                className="bg-slate-800 hover:bg-slate-900 text-white rounded px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                              >
                                Koreksi Stok
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {stockFilteredProducts.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-bold text-xs">
                  Tidak ada barang monitor dalam gudang berlabel "{stockSearch}"
                </div>
              )}
            </div>

            {/* ADJUSTMENT MODAL FOR STOCK OPNAME */}
            {showAdjustmentModal && selectedAdjProduct && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-300 max-w-md w-full shadow-2xl p-6 space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-1.5 text-slate-900">
                      <Briefcase className="h-5 w-5 text-indigo-500" />
                      <h4 className="font-extrabold text-sm sm:text-base">Koreksi Penyesuaian Stok (Audit)</h4>
                    </div>
                    <button 
                      onClick={() => setShowAdjustmentModal(false)}
                      className="text-slate-400 hover:text-slate-600 font-black"
                    >
                      &times;
                    </button>
                  </div>

                  <div className="space-y-4 text-xs text-slate-700">
                    <p className="bg-stone-50 p-3 rounded-lg border border-slate-200">
                      Koreksi stok dialokasikan dg persetujuan Kepala Gudang. Perubahan stok akan tercatat permanen di riwayat log penyesuaian.
                    </p>

                    <div>
                      <span className="block font-bold text-slate-400 uppercase text-[9px] mb-0.5">Produk Monitor</span>
                      <p className="font-bold text-slate-900 text-sm">{selectedAdjProduct.name}</p>
                      <p className="text-slate-400">SKU: {selectedAdjProduct.sku}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Gudang Cabang</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none"
                          value={adjBranch}
                          onChange={(e) => setAdjBranch(e.target.value)}
                          disabled={currentUser.role !== 'admin'}
                        >
                          {INITIAL_BRANCHES.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Stok Fisik Saat Ini</label>
                        <p className="font-black text-slate-950 p-2 bg-slate-100 rounded text-center">
                          {selectedAdjProduct.stock[adjBranch] || 0} {selectedAdjProduct.unit}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Aksi Perubahan</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none font-bold"
                          onChange={(e) => {
                            const multiplier = e.target.value === 'tambah' ? 1 : -1;
                            setAdjQty(Math.abs(adjQty) * multiplier);
                          }}
                        >
                          <option value="tambah">Tambah Stok (+)</option>
                          <option value="kurang">Kurangi Stok (-)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-600 mb-1">Jumlah Deviasi (Kuantitas)</label>
                        <input
                          id="adjust-qty-input"
                          type="number"
                          className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none"
                          value={Math.abs(adjQty)}
                          onChange={(e) => {
                            const val = Math.max(1, Number(e.target.value));
                            const sign = adjQty >= 0 ? 1 : -1;
                            setAdjQty(val * sign);
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 mb-1">Alasan Koreksi</label>
                      <input
                        id="adjust-reason-input"
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none text-xs"
                        placeholder="e.g. Audit fisik bulanan / Monitor rusak di etalase"
                        value={adjReason}
                        onChange={(e) => setAdjReason(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-3">
                      <button 
                        onClick={() => setShowAdjustmentModal(false)}
                        className="px-3 py-1.5 bg-slate-100 rounded-md text-slate-600"
                      >
                        Batal
                      </button>
                      
                      <button
                        id="btn-confirm-stock-adjustment"
                        onClick={submitStockAdjustment}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-slate-950 text-white rounded-md font-bold cursor-pointer"
                      >
                        Terapkan Koreksi &rarr;
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* STOCK ADJUSTMENT AUDIT LOG TABLE */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm mb-3">Audit Log Penyesuaian Terakhir (History Stock Opname)</h4>
              
              <div className="overflow-x-auto">
                <table id="tbl-adjustments-log" className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-2">Tanggal Audit</th>
                      <th className="py-2">Gudang Cabang</th>
                      <th className="py-2">Produk</th>
                      <th className="py-2 text-center">Deviasi Kuantitas</th>
                      <th className="py-2">Alasan Deviasi</th>
                      <th className="py-2 text-right">Otoritas User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adjustments.map(adj => (
                      <tr key={adj.id}>
                        <td className="py-3 text-slate-400">{new Date(adj.date).toLocaleDateString('id-ID')}</td>
                        <td className="py-3 font-bold text-slate-700">{adj.branch}</td>
                        <td className="py-3 font-semibold text-indigo-700">{adj.productName}</td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-0.5 rounded font-black ${adj.changeQty > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-rose-700'}`}>
                            {adj.changeQty > 0 ? `+${adj.changeQty}` : adj.changeQty} Unit
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 font-medium italic">"{adj.reason}"</td>
                        <td className="py-3 text-right text-slate-900 font-semibold">{adj.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}


        {/* ======================= 5. LAPORAN HUTANG & PIUTANG (A/P A/R) ======================= */}
        {activeMenu === "keuangan" && (
          <div id="menu-finance-section" className="space-y-4">
            
            {/* SUBMENU TAB COINS */}
            <div className="flex border-b border-slate-200">
              <button
                id="tab-view-piutang"
                onClick={() => setDebtRecTab('piutang')}
                className={`py-3 px-6 text-sm font-extrabold border-b-2 cursor-pointer transition ${debtRecTab === 'piutang' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Piutang Pelanggan (Receivables)
              </button>
              
              <button
                id="tab-view-hutang"
                onClick={() => setDebtRecTab('hutang')}
                className={`py-3 px-6 text-sm font-extrabold border-b-2 cursor-pointer transition ${debtRecTab === 'hutang' ? 'border-indigo-600 text-indigo-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Hutang ke Supplier (Payables)
              </button>
            </div>

            {/* A. PIUTANG SECTION */}
            {debtRecTab === 'piutang' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="mb-4">
                    <h3 className="font-extrabold text-slate-900 text-base">Rekapitulasi Piutang Penjualan Pelanggan</h3>
                    <p className="text-xs text-slate-500">Daftar hutang pelanggan yang timbul dari pembelian bertempo kredit. Pembayaran bisa direkam dicicil maupun lunas sekaligus.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table id="tbl-piutang" className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-2.5">No. Nota</th>
                          <th className="py-2.5">Tanggal Invoice</th>
                          <th className="py-2.5">Cabang</th>
                          <th className="py-2.5">Nama Toko / Pelanggan</th>
                          <th className="py-2.5 text-right">Nilai Belanja</th>
                          <th className="py-2.5 text-right">Sudah Dibayar (DP)</th>
                          <th className="py-2.5 text-right text-rose-600 font-bold">Outstanding Piutang</th>
                          <th className="py-2.5 text-center">Status</th>
                          <th className="py-2.5 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions
                          .filter(t => t.type === 'penjualan' && t.paymentMethod === 'Kredit')
                          .map(tx => {
                            const cust = customers.find(c => c.id === tx.customerId);
                            const isLunas = tx.remainingBalance === 0;

                            return (
                              <tr key={tx.id} className="hover:bg-slate-50 transition">
                                <td className="py-3 font-semibold text-slate-900">{tx.invoiceNumber}</td>
                                <td className="py-3 text-slate-500">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                                <td className="py-3">{tx.branch}</td>
                                <td className="py-3 font-extrabold text-slate-800">{cust?.name || "Pelanggan Umum"}</td>
                                <td className="py-3 text-right">Rp {tx.totalAmount.toLocaleString('id-ID')}</td>
                                <td className="py-3 text-right">Rp {tx.amountPaid.toLocaleString('id-ID')}</td>
                                <td className="py-3 text-right font-black text-rose-600">Rp {tx.remainingBalance.toLocaleString('id-ID')}</td>
                                <td className="py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isLunas ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}>
                                    {isLunas ? "LUNAS" : "BELUM LUNAS"}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  {!isLunas ? (
                                    <button
                                      id={`btn-collect-piutang-${tx.id}`}
                                      onClick={() => initiateSettlement(tx)}
                                      className="bg-indigo-600 hover:bg-slate-900 text-white rounded px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                                    >
                                      Terima Bayar
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-medium">Selesai Lunas</span>
                                  )}
                                </td>
                              </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {transactions.filter(t => t.type === 'penjualan' && t.paymentMethod === 'Kredit').length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">Belum ada invoice bertempo Piutang.</div>
                  )}
                </div>
              </div>
            )}

            {/* B. HUTANG SECTION */}
            {debtRecTab === 'hutang' && (
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="mb-4">
                    <h3 className="font-extrabold text-slate-900 text-base">Hutang Belanja Cabang ke Supplier</h3>
                    <p className="text-xs text-slate-500">Mencatat kewajiban bayar tempo atas purchase order monitor kepada partner distributor resmi.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table id="tbl-hutang" className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-2.5">No. PO</th>
                          <th className="py-2.5">Tanggal PO</th>
                          <th className="py-2.5">Cabang Pemilik</th>
                          <th className="py-2.5">Partner Supplier</th>
                          <th className="py-2.5 text-right">Total Transaksi</th>
                          <th className="py-2.5 text-right">Telah Dicicil</th>
                          <th className="py-2.5 text-right text-rose-600 font-bold">Outstanding Hutang</th>
                          <th className="py-2.5 text-center">Status</th>
                          <th className="py-2.5 text-right">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions
                          .filter(t => t.type === 'pembelian' && t.paymentMethod === 'Kredit')
                          .map(tx => {
                            const sup = suppliers.find(s => s.id === tx.supplierId);
                            const isLunas = tx.remainingBalance === 0;

                            return (
                              <tr key={tx.id} className="hover:bg-slate-50 transition">
                                <td className="py-3 font-semibold text-slate-900">{tx.invoiceNumber}</td>
                                <td className="py-3 text-slate-500">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                                <td className="py-3">{tx.branch}</td>
                                <td className="py-3 font-extrabold text-slate-800">{sup?.name || "Supplier Umum"}</td>
                                <td className="py-3 text-right">Rp {tx.totalAmount.toLocaleString('id-ID')}</td>
                                <td className="py-3 text-right">Rp {tx.amountPaid.toLocaleString('id-ID')}</td>
                                <td className="py-3 text-right font-black text-rose-600">Rp {tx.remainingBalance.toLocaleString('id-ID')}</td>
                                <td className="py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isLunas ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                                    {isLunas ? "LUNAS" : "BELUM LUNAS"}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  {!isLunas ? (
                                    <button
                                      id={`btn-settle-hutang-${tx.id}`}
                                      onClick={() => initiateSettlement(tx)}
                                      className="bg-rose-600 hover:bg-slate-900 text-white rounded px-2.5 py-1 text-[10px] font-bold cursor-pointer"
                                    >
                                      Bayar Hutang
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-semibold">Tuntas Lunas</span>
                                  )}
                                </td>
                              </tr>
                            );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {transactions.filter(t => t.type === 'pembelian' && t.paymentMethod === 'Kredit').length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">Belum ada PO kredit ke Supplier.</div>
                  )}
                </div>
              </div>
            )}

            {/* SETTLEMENT MODAL FOR AP/AR */}
            {selectedDebtTx && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl border border-slate-350 max-w-sm w-full shadow-2xl p-6 space-y-4 text-xs text-slate-700">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h5 className="font-extrabold text-sm text-slate-900">
                      Pencatatan Settle Pelunasan {selectedDebtTx.type === 'penjualan' ? 'Piutang' : 'Hutang'}
                    </h5>
                    <button onClick={() => setSelectedDebtTx(null)} className="text-slate-400 hover:text-slate-600 font-bold">&times;</button>
                  </div>

                  <p>Input nominal kas riil yang diserah-terimakan hari ini untuk mengurangi sisa outstanding bertempo.</p>

                  <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-lg">
                    <p className="font-bold text-slate-800">Nota: {selectedDebtTx.invoiceNumber}</p>
                    <p>Total Transaksi: Rp {selectedDebtTx.totalAmount.toLocaleString('id-ID')}</p>
                    <p className="font-bold text-rose-600">Sisa Outstanding: Rp {selectedDebtTx.remainingBalance.toLocaleString('id-ID')}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-600">Jumlah Kas Bayar (Rp)</label>
                    <input
                      id="settlement-amount-input"
                      type="number"
                      className="w-full bg-white border border-slate-250 rounded p-2 focus:outline-none font-bold text-emerald-600 focus:ring-1 focus:ring-indigo-500"
                      value={settlementAmount}
                      onChange={(e) => setSettlementAmount(Number(e.target.value))}
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setSelectedDebtTx(null)} className="px-3 py-1 bg-slate-100 rounded text-slate-600">Batal</button>
                    <button 
                      id="btn-submit-settlement"
                      onClick={processSettlement} 
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-slate-900 text-white rounded font-bold cursor-pointer"
                    >
                      Konfirmasi Pelunasan &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}


        {/* ======================= 6. LAPORAN PENJUALAN & GRAPHANALYTICS (ADMIN) ======================= */}
        {activeMenu === "laporan" && currentUser.role === 'admin' && (
          <div id="menu-laporan-section" className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ROW 1: SALES DISTRIBUTION BY BRANCH (PIE CHART) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Porsi Penjualan per Cabang</h4>
                  <p className="text-xs text-slate-500">Persentase kontribusi omset antar lokasi gudang cabang</p>
                </div>

                <div className="h-60 mt-2 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByBranchData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="Total"
                      >
                        {salesByBranchData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b'][index % 3]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `Rp ${Number(v).toLocaleString('id-ID')}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ROW 2: DETAILED BAR CHART REVENUE VS COST */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 lg:col-span-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Performa Harian Margin Keuntungan</h4>
                  <p className="text-xs text-slate-500">Mengukur laba kotor harian (Omset Jual vs Beban HPP Beli)</p>
                </div>

                <div className="h-60 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesTrendData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="tanggal" fontSize={11} stroke="#94a3b8" />
                      <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `Rp ${v/1000}k`} />
                      <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                      <Legend />
                      <Bar dataKey="Penjualan" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Pembelian" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* PERFORMANCE OF AGENTS LIST */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Target & Penjualan Tim Sales (Multi-User Performance)</h4>
                  <p className="text-xs text-slate-500">Memonitor kinerja personal armada sales lapangan.</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 text-xs rounded-lg uppercase tracking-wider">Live tracking</span>
              </div>

              <div className="space-y-4">
                {[
                  { id: "user-3", name: "Ahmad Rian (Sales Lapangan)", target: 20000000, color: "bg-indigo-600" },
                ].map(agent => {
                  const actual = transactions
                    .filter(t => t.type === 'penjualan' && t.salesId === agent.id && t.status !== 'Batal')
                    .reduce((acc, t) => acc + t.totalAmount, 0);
                  const progressPct = Math.min(100, (actual / agent.target) * 100);

                  return (
                    <div key={agent.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{agent.name}</span>
                        <span>Rp {actual.toLocaleString('id-ID')} / Target Rp {agent.target.toLocaleString('id-ID')}</span>
                      </div>
                      
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${agent.color} rounded-full transition-all duration-500`} style={{ width: `${progressPct}%` }}></div>
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Pencapaian Target Real-time: <strong className="text-slate-700">{progressPct.toFixed(1)}%</strong></span>
                        <span className="font-medium italic">Faktur dicatat sistem: {transactions.filter(t => t.type === 'penjualan' && t.salesId === agent.id).length} Nota</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ======================= 7. JALUR PENGIRIMAN LOGISTIK (KURIR COURIER) ======================= */}
        {activeMenu === "kurir" && (
          <div id="menu-kurir-section" className="space-y-4">
            
            <div className="bg-indigo-900 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-15">
                <Truck className="h-28 w-28 text-white" />
              </div>
              <div className="relative z-10 space-y-1">
                <span className="bg-white/10 px-2.5 py-1 rounded text-[10px] font-mono uppercase">Panel Kerja Kurir</span>
                <h3 className="font-extrabold text-base sm:text-lg">Daftar Antaran Barang & Logistik COD</h3>
                <p className="text-xs text-indigo-200 max-w-lg">Bantu cabang mempercepat perputaran kas dengan merubah status kiriman ke tangan pembeli, dan mengkonfirmasi pelunasan tagihan sisa COD.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* CURRENT TASKS */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-black text-slate-900 text-sm">Tugas Delivery Masuk</h4>
                
                <div className="space-y-3">
                  {transactions
                    .filter(t => t.type === 'penjualan' && t.deliveryStatus && t.deliveryStatus !== 'Selesai Diterima')
                    .map(tx => {
                      const cust = customers.find(c => c.id === tx.customerId);
                      return (
                        <div key={tx.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                          <div className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 font-semibold text-slate-800">
                            <span>Nota: {tx.invoiceNumber}</span>
                            <span className="text-slate-400">({tx.branch.split(" ")[0]})</span>
                          </div>

                          <div className="space-y-1">
                            <p>Pelanggan: <strong className="text-slate-950">{cust?.name}</strong></p>
                            <p>No Handphone: <strong className="text-slate-800">{cust?.phone}</strong></p>
                            <p>Tujuan Antar: <span className="text-slate-500">{cust?.address}</span></p>
                            
                            <p className="pt-2 border-t border-slate-100 text-[11px] font-bold">
                              Isi Monitor: <span className="text-slate-600 italic">{tx.items.map(it => `${it.productName} (${it.quantity}u)`).join(", ")}</span>
                            </p>
                            
                            {tx.remainingBalance > 0 && (
                              <p className="text-rose-600 font-black">Sisa COD Harus Ditagih: Rp {tx.remainingBalance.toLocaleString('id-ID')}</p>
                            )}
                          </div>

                          <div className="flex gap-1 justify-end pt-2 border-t border-slate-200/50">
                            {tx.deliveryStatus === 'Menunggu Kurir' ? (
                              <button
                                id={`btn-pickup-${tx.id}`}
                                onClick={() => updateCourierDelivery(tx.id, 'Dalam Pengiriman')}
                                className="bg-indigo-600 hover:bg-slate-950 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
                              >
                                <Truck className="h-3 w-3" /> Ambil untuk Dikirim
                              </button>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  id={`btn-delivered-cash-${tx.id}`}
                                  onClick={() => {
                                    // Settle outstanding COD balance if fully lunas on door
                                    const notesInput = window.prompt("Tuliskan memo penerimaan/nama penerima:", "Diterima langsung oleh ybs.");
                                    const confirmSettle = tx.remainingBalance > 0 
                                      ? window.confirm("Apakah pembeli membayar sisa piutang COD senilai Rp " + tx.remainingBalance.toLocaleString('id-ID') + "? (Ini otomatis mengosongkan saldo piutang transaksi)")
                                      : false;

                                    if (confirmSettle) {
                                      // update remaining balance to 0 and paid amount to full
                                      const uTxs = transactions.map(utx => utx.id === tx.id ? { ...utx, deliveryStatus: 'Selesai Diterima', courierNotes: notesInput || "", amountPaid: utx.totalAmount, remainingBalance: 0 } : utx);
                                      setTransactions(uTxs as Transaction[]);
                                      alert("Order berstatus dikirim dan piutang COD berhasil dilunaskan di kasir!");
                                    } else {
                                      updateCourierDelivery(tx.id, 'Selesai Diterima', notesInput || "");
                                    }
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
                                >
                                  <CheckCircle className="h-3 w-3" /> Tandai Selesai / Lunas COD
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                  })}

                  {transactions.filter(t => t.type === 'penjualan' && t.deliveryStatus && t.deliveryStatus !== 'Selesai Diterima').length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-bold text-xs">Semua antaran terpantau selesai dikirim! 👍</div>
                  )}
                </div>
              </div>

              {/* COMPLETED TASKS COURIER LOG */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-black text-slate-900 text-sm">Riwayat Antaran Selesai</h4>
                
                <div className="space-y-3">
                  {transactions
                    .filter(t => t.type === 'penjualan' && t.deliveryStatus === 'Selesai Diterima')
                    .map(tx => {
                      const cust = customers.find(c => c.id === tx.customerId);
                      return (
                        <div key={tx.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>Nota: {tx.invoiceNumber}</span>
                            <span className="text-emerald-600 text-[10px]">SUCCESS DELIVERED</span>
                          </div>
                          <p className="text-slate-600 font-medium">Pelanggan: {cust?.name}</p>
                          <p className="text-slate-400 text-[10px] italic">Tanda Terima: "{tx.courierNotes || "Tanpa memo penerima"}"</p>
                        </div>
                      );
                    })}

                  {transactions.filter(t => t.type === 'penjualan' && t.deliveryStatus === 'Selesai Diterima').length === 0 && (
                    <div className="text-center py-6 text-slate-450 text-[11.5px] italic">Belum ada riwayat tuntas kirim hari ini.</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================= 8. RISALAH & DOCUMENTATION VIEW ======================= */}
        {activeMenu === "panduan" && (
          <div id="menu-panduan-section" className="space-y-6">
            
            {/* DOWNLOAD HEADER CARD */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl text-white p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-12 opacity-10 pointer-events-none">
                <FileText className="h-64 w-64" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl space-y-2">
                  <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                    Modul Ekspor PDF
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Risalah Spesifikasi &amp; Topologi Website
                  </h2>
                  <p className="text-indigo-200 text-sm leading-relaxed">
                    Hasilkan dokumen PDF resmi yang memuat spesifikasi teknis lengkap, kegunaan setiap menu, diagram topologi multi-user, serta ringkasan analitik terkini.
                  </p>
                </div>
                <div>
                  <button
                    id="btn-download-pdf-doc"
                    onClick={() => generatePDFDocument({
                      appName: "Sistem POS Kasir & Stok",
                      currentUser: currentUser,
                      metrics: {
                        totalSales: dashboardMetrics.totalSales,
                        totalCost: dashboardMetrics.totalPurchase,
                        totalReceivables: dashboardMetrics.totalPiutang,
                        totalPayables: dashboardMetrics.totalHutang
                      }
                    })}
                    className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3.5 rounded-xl transition duration-150 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 text-sm"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Unduh PDF Resmi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* HIGH-FIDELITY IN-APP READ PREVIEW */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-10 space-y-8 max-w-4xl mx-auto text-slate-700 leading-relaxed font-sans">
              
              {/* Document Header */}
              <div className="border-b border-slate-100 pb-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">SPESIFIKASI TEKNIS &amp; RISALAH SISTEM</h3>
                  <p className="text-slate-500 text-sm">Sistem POS Kasir &amp; Stok Multi-User Terdistribusi • v2.1</p>
                </div>
                <div className="text-right">
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Live System
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Status: Stabil &amp; Sinkron</p>
                </div>
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
                <div>
                  <p className="text-slate-400 font-medium">OTORISATOR DOKUMEN</p>
                  <p className="font-bold text-slate-800 mt-0.5">{currentUser.name} ({currentUser.role.toUpperCase()})</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">TANGGAL PENERBITAN</p>
                  <p className="font-bold text-slate-800 mt-0.5">15 Juli 2026</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">PERSENTASE KESERASIAN DATA</p>
                  <p className="font-bold text-emerald-600 mt-0.5">100% Real-time Terdistribusi</p>
                </div>
              </div>

              {/* 1. LATAR BELAKANG */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="h-6 w-1 rounded-full bg-indigo-600"></span>
                  <h4 className="text-lg font-extrabold tracking-tight">1. Latar Belakang Masalah</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Dalam lanskap bisnis ritel modern yang memiliki banyak jaringan cabang, efisiensi operasional sangat bergantung pada keakuratan sinkronisasi data antar divisi. Masalah klasik yang sering dihadapi adalah ketidakselarasan informasi stok produk antara gudang pusat dan toko cabang, keterlambatan pencatatan piutang pelanggan dari transaksi kredit sales di lapangan, serta rumitnya rekonsiliasi kas masuk yang dititipkan melalui kurir pengantar logistik.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Penggunaan metode pencatatan manual atau sistem kasir standalone tradisional terbukti memicu terjadinya selisih stok (stock opname), potensi piutang macet yang tidak terdeteksi, serta hilangnya peluang penjualan akibat keterlambatan pengisian stok kosong. Dokumen ini disusun sebagai risalah resmi yang menjabarkan struktur, fungsi, kegunaan, dan topologi dari Sistem POS Kasir &amp; Stok Multi-User Terdistribusi yang dirancang untuk menjawab tantangan tersebut.
                </p>
              </div>

              {/* 2. PENDAHULUAN */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="h-6 w-1 rounded-full bg-indigo-600"></span>
                  <h4 className="text-lg font-extrabold tracking-tight">2. Pendahuluan &amp; Solusi Terpadu</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sistem POS Kasir &amp; Stok Multi-User adalah aplikasi kasir (Point of Sale) modern, offline-ready, dan terintegrasi penuh yang menyatukan empat pilar utama operasional ritel ke dalam satu database tersentralisasi. Platform ini dikembangkan menggunakan teknologi React 18, Vite, dan Tailwind CSS untuk menjamin antarmuka yang sangat responsif, andal, dan ramah pengguna.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sistem ini memiliki keunggulan berupa pembatasan hak akses yang ketat sesuai dengan peran kerja (role-based access control), modul POS penjualan tunai maupun kredit, sistem pemesanan suplai barang (PO Pembelian) otomatis, monitoring sisa stok terdistribusi real-time, manajemen piutang usaha yang rapi, laporan laba rugi visual, serta modul pelacak tugas pengiriman kurir logistik.
                </p>
              </div>

              {/* 3. TOPOLOGI */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="h-6 w-1 rounded-full bg-indigo-600"></span>
                  <h4 className="text-lg font-extrabold tracking-tight">3. Topologi Arsitektur Terdistribusi</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sistem memanfaatkan arsitektur database terdistribusi satu arah di mana setiap perubahan data di tingkat cabang disinkronisasikan secara instan ke server pusat. Berikut adalah skema visual interaktif alur kerja multi-user:
                </p>

                {/* Topology Diagram UI */}
                <div className="bg-slate-900 text-indigo-300 p-6 rounded-xl font-mono text-xs overflow-x-auto shadow-inner space-y-3 border border-slate-800">
                  <div className="text-emerald-400 font-bold text-center border-b border-indigo-900 pb-2 mb-2">
                    ALUR INTEGRASI LOGISTIK &amp; FINANSIAL (REAL-TIME SINKRON)
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="p-2 bg-indigo-950/60 rounded border border-indigo-900/50">
                      <p className="text-indigo-400 font-bold">1. ADMIN PUSAT</p>
                      <p className="text-slate-400 text-[9px] mt-1">Otoritas &amp; Laporan</p>
                    </div>
                    <div className="p-2 bg-indigo-950/60 rounded border border-indigo-900/50">
                      <p className="text-indigo-400 font-bold">2. CABANG TOKO</p>
                      <p className="text-slate-400 text-[9px] mt-1">POS &amp; PO Pembelian</p>
                    </div>
                    <div className="p-2 bg-indigo-950/60 rounded border border-indigo-900/50">
                      <p className="text-indigo-400 font-bold">3. SALES LAPANGAN</p>
                      <p className="text-slate-400 text-[9px] mt-1">Pesanan Kredit/Cash</p>
                    </div>
                    <div className="p-2 bg-indigo-950/60 rounded border border-indigo-900/50">
                      <p className="text-indigo-400 font-bold">4. ARMADA KURIR</p>
                      <p className="text-slate-400 text-[9px] mt-1">Pengantaran &amp; COD</p>
                    </div>
                  </div>
                  <div className="text-center text-slate-400 py-1 text-[11px]">
                    ⇅
                  </div>
                  <div className="bg-slate-950 p-3 rounded text-center text-[11px] text-slate-300 border border-indigo-950">
                    <p className="font-bold text-white">DATABASE UTAMA SENTRALISASI</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Kalkulasi Laba: Rp {dashboardMetrics.totalSales.toLocaleString('id-ID')} (Omset) | Piutang Aktif: Rp {dashboardMetrics.totalPiutang.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Aliran Finansial (Hutang-Piutang)</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Penjualan bertipe Kredit otomatis mencatat Piutang usaha. Pembelian stok bertipe Kredit ke Supplier mencatat Hutang dagang. Pelunasan di kasir atau logistik melunaskan saldo secara dinamis.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Aliran Fisik &amp; Logistik</h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Barang PO masuk menambah stok cabang. Penjualan barang mengurangi stok cabang bersangkutan secara riil. Transaksi penjualan memicu daftar tugas logistik kurir pengiriman otomatis.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. PENJELASAN MENU */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="h-6 w-1 rounded-full bg-indigo-600"></span>
                  <h4 className="text-lg font-extrabold tracking-tight">4. Fungsi &amp; Kegunaan Setiap Menu Utama</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Dashboard Analitik</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Pusat kendali visual untuk memantau ringkasan omset penjualan kotor, pengeluaran belanja modal (PO Supplier), sisa piutang tertunggak, dan total hutang usaha secara interaktif. Dilengkapi Bar Chart penjualan produk terlaris dan Pie Chart persebaran kategori stok.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">POS Penjualan (Kasir Digital)</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Mesin kasir digital responsif yang melayani transaksi penjualan cepat, pencarian SKU/nama produk dinamis, pendaftaran customer baru on-the-fly, kalkulator kembalian otomatis, serta pencetakan bukti nota transaksi struk POS terstandar.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Monitor Stok &amp; Koreksi Opname</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Menampilkan rincian ketersediaan stok fisik barang di setiap cabang secara rinci. Pengguna dengan peran Admin atau Kepala Cabang memiliki otoritas untuk melakukan revisi stock opname jika ditemukan selisih barang, dilengkapi log alasan dan nama operator.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                      <Coins className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Manajemen Hutang &amp; Piutang</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Memantau sisa saldo kewajiban hutang ritel kepada supplier serta tagihan piutang dari pelanggan yang belum terbayar. Finance/Admin dapat melunaskan cicilan hutang-piutang dagang secara parsial atau langsung lunas.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Pengiriman Armada Kurir</h5>
                      <p className="text-xs text-slate-600 mt-1">
                        Modul khusus logistik kurir. Memungkinkan kurir menandai barang pesanan pelanggan 'Dalam Pengiriman' serta menyelesaikan status menjadi 'Selesai Diterima' dengan memasukkan nama penerima fisik dan melakukan pelunasan sisa COD tunai langsung ke sistem.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. PENUTUP */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="h-6 w-1 rounded-full bg-indigo-600"></span>
                  <h4 className="text-lg font-extrabold tracking-tight">5. Kesimpulan</h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sistem POS Kasir &amp; Stok Multi-User Terdistribusi bukan sekadar alat pencatat penjualan biasa, melainkan fondasi digital utama untuk menyatukan kerja kolaborasi seluruh staf gudang, kasir toko, tim sales marketing, armada kurir pengantaran barang, hingga pimpinan manajemen ritel dalam satu alur kerja yang serasi, transparan, dan dapat dipertanggungjawabkan.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Dengan keandalan yang optimal, performa yang gegas, serta kemudahan kustomisasi fitur di masa mendatang, platform ini siap mendukung akselerasi PT Ritel Sentosa Bersama menjadi pemain terdepan di era transformasi ritel digital modern.
                </p>
              </div>

              {/* Signature */}
              <div className="flex justify-end pt-6">
                <div className="text-center border-t border-slate-100 pt-4 w-64 text-xs">
                  <p className="text-slate-400 font-medium">Disetujui secara digital oleh:</p>
                  <p className="font-extrabold text-slate-800 mt-3">Tim Pengembang &amp; IT</p>
                  <p className="text-[10px] text-indigo-600 font-bold mt-0.5">PT Ritel Sentosa Bersama</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer id="system-footer" className="bg-white border-t border-slate-200 py-6 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-500">POS Multi-User dan Stok Monitor v2.1</p>
            <p className="mt-0.5">Satu sentral database terdistribusi untuk admin cabang, logistik kurir, & sales.</p>
          </div>
          <div>
            <p>UI Polished with Tailwind CSS & Lucide Icons</p>
            <p className="text-[10px] text-slate-300">Waktu Server: 2026-06-08 06:40:47 UTC</p>
          </div>
        </div>
      </footer>

      {/* RECEIPT PREVIEW PRINTOUT MODAL */}
      {receiptTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-300 max-w-sm w-full shadow-2xl p-6 text-slate-800 space-y-4 font-mono text-xs">
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-sm text-slate-900 font-sans">BUKTI INVOICE STRUK POS</h4>
              <p className="text-[11px] font-sans text-indigo-600">{receiptTx.branch}</p>
              <p className="text-[10px] text-slate-400">Nota: {receiptTx.invoiceNumber}</p>
              <p className="text-[9px] text-slate-400">Tgl: {new Date(receiptTx.date).toLocaleString('id-ID')}</p>
            </div>

            <div className="border-t border-dashed border-slate-250 pt-2 space-y-1.5 pb-2 border-b">
              {receiptTx.items.map(it => (
                <div key={it.productId} className="flex justify-between">
                  <span>{it.productName.slice(0, 18)}.. x{it.quantity}</span>
                  <span>Rp {(it.price * it.quantity).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span>TOTAL BELANJA:</span>
                <span className="font-bold">Rp {receiptTx.totalAmount.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>DIBAYAR (DP):</span>
                <span>Rp {receiptTx.amountPaid.toLocaleString('id-ID')}</span>
              </div>
              {receiptTx.remainingBalance > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>SISA PIUTANG:</span>
                  <span>Rp {receiptTx.remainingBalance.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="text-center pt-3 border-t border-dashed border-slate-200 font-sans text-[10px] text-slate-400">
              <p>Terima kasih telah berbelanja!</p>
              <p>Barang yang sudah dibeli tidak dapat ditukar.</p>
            </div>

            <button
              id="btn-close-receipt-modal"
              onClick={() => setReceiptTx(null)}
              className="w-full bg-slate-900 hover:bg-slate-850 text-white font-sans py-2 rounded-lg font-bold text-[11px] tracking-wider uppercase cursor-pointer"
            >
              Tutup Nota Kasir
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
