import { jsPDF } from "jspdf";

export interface PDFData {
  appName: string;
  currentUser: {
    name: string;
    role: string;
    branch: string;
  };
  metrics: {
    totalSales: number;
    totalCost: number;
    totalReceivables: number;
    totalPayables: number;
  };
}

export function generatePDFDocument(data: PDFData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for drawing header & footer on all pages
  const drawPageTemplate = (pageNum: number, totalPages: number) => {
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(99, 102, 241); // indigo-500
    doc.text("DOKUMEN SPESIFIKASI TEKNIS & RISALAH SISTEM", margin, 12);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Sistem POS Kasir & Stok Multi-User v2.1", pageWidth - margin - 55, 12);

    // Decorative line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(margin, 15, pageWidth - margin, 15);

    // Footer line
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Konfiden & Rahasia — Diunduh oleh " + data.currentUser.name + " (" + data.currentUser.role.toUpperCase() + ")", margin, pageHeight - 10);
    doc.text(`Halaman ${pageNum} dari ${totalPages}`, pageWidth - margin - 22, pageHeight - 10);
  };

  // Helper to draw text block with automatic line wrapping
  const drawParagraph = (text: string, y: number, fontSize = 10, isBold = false): number => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);
    doc.setTextColor(51, 65, 85); // slate-700
    const lines = doc.splitTextToSize(text, contentWidth);
    
    let currentY = y;
    lines.forEach((line: string) => {
      doc.text(line, margin, currentY);
      currentY += (fontSize * 0.45) + 2; // line spacing
    });
    return currentY;
  };

  const drawBulletPoint = (label: string, desc: string, y: number, fontSize = 10): number => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(fontSize);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("• " + label + ":", margin, y);
    
    // Calculate indentation offset for description
    const labelWidth = doc.getTextWidth("• " + label + ": ");
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85); // slate-700
    
    const lines = doc.splitTextToSize(desc, contentWidth - labelWidth);
    let currentY = y;
    lines.forEach((line: string, index: number) => {
      const xOffset = index === 0 ? margin + labelWidth : margin + 5;
      doc.text(line, xOffset, currentY);
      currentY += (fontSize * 0.45) + 2;
    });
    return currentY;
  };

  const totalPages = 4;

  // ==================== PAGE 1: TITLE & LATAR BELAKANG ====================
  // Document Title Header Box
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(margin, 25, contentWidth, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("RISALAH & TOPOLOGI TEKNIS", margin + 10, 40);
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Sistem POS Kasir & Stok Multi-User Terdistribusi", margin + 10, 48);
  doc.setFontSize(9);
  doc.text("Dibuat khusus untuk PT Ritel Sentosa Bersama — Versi 2.1", margin + 10, 56);

  // Metadata Table
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.rect(margin, 73, contentWidth, 24, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("Tanggal Dokumen:", margin + 5, 79);
  doc.text("Otorisator:", margin + 5, 85);
  doc.text("Status Sistem:", margin + 5, 91);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text("15 Juli 2026", margin + 35, 79);
  doc.text(`${data.currentUser.name} (${data.currentUser.role.toUpperCase()})`, margin + 35, 85);
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFont("helvetica", "bold");
  doc.text("LIVE & OPERASIONAL (STABIL)", margin + 35, 91);

  // 1. LATAR BELAKANG
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text("1. Latar Belakang Masalah", margin, 110);
  
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1);
  doc.line(margin, 112, margin + 45, 112);

  let nextY = 118;
  nextY = drawParagraph(
    "Dalam lanskap bisnis ritel modern yang memiliki banyak jaringan cabang, efisiensi operasional sangat bergantung pada keakuratan sinkronisasi data antar divisi. Masalah klasik yang sering dihadapi adalah ketidakselarasan informasi stok produk antara gudang pusat dan toko cabang, keterlambatan pencatatan piutang pelanggan dari transaksi kredit sales di lapangan, serta rumitnya rekonsiliasi kas masuk yang dititipkan melalui kurir pengantar logistik.",
    nextY
  );
  nextY += 2;
  nextY = drawParagraph(
    "Penggunaan metode pencatatan manual atau sistem kasir standalone tradisional terbukti memicu terjadinya selisih stok (stock opname), potensi piutang macet yang tidak terdeteksi, serta hilangnya peluang penjualan akibat keterlambatan pengisian stok kosong. Dokumen ini disusun sebagai risalah resmi yang menjabarkan struktur, fungsi, kegunaan, dan topologi dari Sistem POS Kasir & Stok Multi-User Terdistribusi yang dirancang untuk menjawab tantangan tersebut.",
    nextY
  );

  // 2. PENDAHULUAN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text("2. Pendahuluan & Solusi", margin, nextY + 10);
  
  doc.line(margin, nextY + 12, margin + 45, nextY + 12);
  
  nextY = nextY + 18;
  nextY = drawParagraph(
    "Sistem POS Kasir & Stok Multi-User adalah aplikasi kasir (Point of Sale) modern, offline-ready, dan terintegrasi penuh yang menyatukan empat pilar utama operasional ritel ke dalam satu database tersentralisasi. Platform ini dikembangkan menggunakan teknologi React 18, Vite, dan Tailwind CSS untuk menjamin antarmuka yang sangat responsif, andal, dan ramah pengguna.",
    nextY
  );
  nextY += 2;
  nextY = drawParagraph(
    "Sistem ini memiliki keunggulan berupa pembatasan hak akses yang ketat sesuai dengan peran kerja (role-based access control), modul POS penjualan tunai maupun kredit, sistem pemesanan suplai barang (PO Pembelian) otomatis, monitoring sisa stok terdistribusi real-time, manajemen piutang usaha yang rapi, laporan laba rugi visual, serta modul pelacak tugas pengiriman kurir logistik.",
    nextY
  );

  drawPageTemplate(1, totalPages);

  // ==================== PAGE 2: TOPOLOGI SISTEM ====================
  doc.addPage();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text("3. Topologi Arsitektur Sistem", margin, 25);
  
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1);
  doc.line(margin, 27, margin + 55, 27);

  nextY = 33;
  nextY = drawParagraph(
    "Topologi arsitektur aplikasi menggunakan model Terdistribusi dengan Sinkronisasi Sentral (Distributed-Sync Model). Di bawah ini digambarkan bagaimana aliran data mengalir dari berbagai tipe pengguna ke satu database inti:",
    nextY
  );

  // Topologi Schema Visual
  nextY += 5;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.rect(margin, nextY, contentWidth, 80, "FD");

  doc.setFont("courier", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const schemaY = nextY + 8;
  doc.text("                     +---------------------------------------+", margin + 4, schemaY);
  doc.text("                     |        DATABASE SENTRAL (CLOUD)       |", margin + 4, schemaY + 4);
  doc.text("                     |  (Stok, Transaksi, Keuangan, Mutasi)  |", margin + 4, schemaY + 8);
  doc.text("                     +-------------------+-------------------+", margin + 4, schemaY + 12);
  doc.text("                                         |", margin + 4, schemaY + 16);
  doc.text("         +-------------------------------+-------------------------------+", margin + 4, schemaY + 20);
  doc.text("         |                               |                               |", margin + 4, schemaY + 24);
  doc.text("  +------+------+                 +------+------+                 +------+------+", margin + 4, schemaY + 28);
  doc.text("  | ROLE: ADMIN |                 | ROLE: CABANG |                 | ROLE: SALES |", margin + 4, schemaY + 32);
  doc.text("  | * Full Akses|                 | * Stok Lokal|                 | * Lapangan  |", margin + 4, schemaY + 36);
  doc.text("  | * Keuangan  |                 | * POS Toko  |                 | * Catat Cash|", margin + 4, schemaY + 40);
  doc.text("  | * Laporan   |                 | * Terima PO |                 | * Order COD |", margin + 4, schemaY + 44);
  doc.text("  +------+------+                 +------+------+                 +------+------+", margin + 4, schemaY + 48);
  doc.text("         |                               |                               |", margin + 4, schemaY + 52);
  doc.text("         +-------------------------------+-------------------------------+", margin + 4, schemaY + 56);
  doc.text("                                         |", margin + 4, schemaY + 60);
  doc.text("                     +-------------------+-------------------+", margin + 4, schemaY + 64);
  doc.text("                     |            ROLE: LOGISTIK / KURIR     |", margin + 4, schemaY + 68);
  doc.text("                     |            (Kirim Barang, Lunas COD)  |", margin + 4, schemaY + 72);
  doc.text("                     +---------------------------------------+", margin + 4, schemaY + 76);

  nextY += 88;
  doc.setFont("helvetica", "normal");
  nextY = drawParagraph(
    "Arsitektur ini mendukung kelancaran operasional dengan skenario bisnis terpadu berikut:",
    nextY
  );
  nextY += 3;

  nextY = drawBulletPoint(
    "Pusat & Cabang (Admin / Cabang)",
    "Admin mengawasi seluruh aktivitas stok di 3 wilayah (Pusat Jakarta, Bandung, dan Surabaya). Cabang bertugas mengelola penjualan lokal dan menerima tambahan suplai.",
    nextY
  );
  nextY += 2;
  nextY = drawBulletPoint(
    "Aliran Pengadaan Barang",
    "Admin/Kepala Cabang membuat PO Pembelian ke Supplier. Stok di gudang terpilih bertambah otomatis begitu PO berstatus selesai.",
    nextY
  );
  nextY += 2;
  nextY = drawBulletPoint(
    "Aliran Penjualan Lapangan (Sales)",
    "Sales memproses pesanan langsung dari pelanggan. Transaksi dapat diatur kredit sehingga memicu sisa piutang dagang dan otomatis mendaftarkan tugas pengiriman barang pada daftar kurir.",
    nextY
  );
  nextY += 2;
  nextY = drawBulletPoint(
    "Aliran Penyelesaian Logistik (Kurir)",
    "Kurir menerima tugas logistik pengantaran barang fisik, memvalidasi nama penerima, mengonfirmasi jika pembeli membayar sisa COD tunai di pintu rumah, yang kemudian otomatis menyinkronkan saldo kas lunas di sistem.",
    nextY
  );

  drawPageTemplate(2, totalPages);

  // ==================== PAGE 3: FITUR DAN MENU UTAMA ====================
  doc.addPage();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text("4. Penjelasan Detil Fitur & Menu", margin, 25);
  
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1);
  doc.line(margin, 27, margin + 55, 27);

  nextY = 34;

  nextY = drawBulletPoint(
    "Dashboard & KPI Ringkasan",
    "Menyajikan 4 indikator keuangan utama: Omset Penjualan Kotor, Pengeluaran Modal (PO Pembelian), Total Sisa Piutang Pelanggan, dan Hutang Usaha ke Supplier. Dilengkapi visualisasi diagram batang (Bar Chart) performa penjualan per jenis produk dan diagram lingkaran (Pie Chart) persentase kepemilikan stok barang berdasarkan kategorisasi produk.",
    nextY
  );
  nextY += 3;

  nextY = drawBulletPoint(
    "POS Penjualan Kasir",
    "Mesin kasir digital yang mendukung input pencarian produk cepat, manajemen keranjang belanja dinamis, pemilihan pembeli (customer database) on-the-fly, kalkulator kembalian otomatis, serta penentuan metode bayar Tunai (Cash) atau Kredit (Piutang) dengan pencatatan uang muka (DP). Setelah checkout, sistem menghasilkan struk belanja yang dapat langsung dicetak atau diunduh.",
    nextY
  );
  nextY += 3;

  nextY = drawBulletPoint(
    "PO Pembelian Supplier",
    "Formulir digital pengajuan pengadaan stok dari cabang ke mitra supplier resmi (seperti LG Corp, Asus Tek, Samsung Corp, dll). Memungkinkan pencatatan harga beli modal aktual, penentuan uang muka pembelian, dan pelunasan secara kredit (Hutang Dagang). Selesai disubmit, kuantitas stok produk bersangkutan langsung ditambahkan ke cabang penerima.",
    nextY
  );
  nextY += 3;

  nextY = drawBulletPoint(
    "Monitor Stok & Penyesuaian (Stock Opname)",
    "Tabel inventori dinamis yang menunjukkan sisa persediaan barang di masing-masing lokasi secara rinci. Modul ini dilengkapi dengan tombol 'Koreksi Stok Opname' bagi Admin/Kepala Cabang untuk merevisi jumlah stok fisik nyata di lapangan apabila terjadi barang rusak, hilang, atau salah hitung, lengkap dengan kolom alasan koreksi dan nama operator penanggung jawab.",
    nextY
  );
  nextY += 3;

  nextY = drawBulletPoint(
    "Hutang & Piutang Dagang",
    "Panel keuangan interaktif untuk memonitor daftar transaksi piutang (tagihan yang masih tertanggung pada pembeli) dan hutang usaha (kewajiban bayar perusahaan ke supplier). Tersedia fitur 'Pelunasan Mandiri' yang mempermudah staf finance untuk mencicil atau langsung melunaskan sisa sengketa piutang/hutang hingga lunas.",
    nextY
  );
  nextY += 3;

  nextY = drawBulletPoint(
    "Laporan Penjualan & Analitik",
    "Khusus diakses oleh Admin, berisi rekapitulasi laba rugi bulanan terperinci, grafik tren penjualan interaktif, statistik performa sales marketing terbaik, serta log rincian mutasi transaksi kas untuk audit harian yang transparan.",
    nextY
  );
  
  drawPageTemplate(3, totalPages);

  // ==================== PAGE 4: PENGIRIMAN KURIR & PENUTUP ====================
  doc.addPage();
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text("4. Penjelasan Detil Fitur & Menu (Lanjutan)", margin, 25);
  
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(1);
  doc.line(margin, 27, margin + 70, 27);

  nextY = 34;

  nextY = drawBulletPoint(
    "Pengiriman Logistik Kurir",
    "Modul khusus pengantaran kurir. Setiap transaksi penjualan kredit (atau COD) akan terdaftar di sini secara real-time. Kurir dapat mengambil pesanan ('Ambil untuk Dikirim') yang mengubah status menjadi 'Dalam Pengiriman'. Setelah barang sampai, kurir menekan tombol 'Selesai / Lunas COD' untuk memasukkan nama penerima barang, serta melunaskan sisa tagihan secara cash instan jika pembeli melakukan bayar COD.",
    nextY
  );
  nextY += 6;

  // 5. MANFAAT DAN KEGUNAAN UTAMA
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text("5. Manfaat & Kegunaan Utama Bagi Bisnis", margin, nextY + 5);
  
  doc.line(margin, nextY + 7, margin + 70, nextY + 7);
  nextY += 13;

  nextY = drawParagraph(
    "Penerapan sistem digital terpadu ini memberikan dampak nyata yang signifikan pada kelancaran bisnis sehari-hari, antara lain:",
    nextY
  );
  nextY += 3;

  nextY = drawBulletPoint(
    "Akurasi Inventori 99.9%",
    "Menghilangkan risiko duplikasi data pencatatan dan meminimalkan kesalahan selisih stok fisik berkat fitur koreksi stock opname terpusat.",
    nextY
  );
  nextY += 2;
  nextY = drawBulletPoint(
    "Cash Flow Terjaga Baik",
    "Manajemen piutang mendeteksi secara langsung pembeli yang menunggak cicilan kredit sehingga tim penagih dapat segera bergerak.",
    nextY
  );
  nextY += 2;
  nextY = drawBulletPoint(
    "Kepuasan Pelanggan Meningkat",
    "Sinergi antara sales lapangan yang responsif mencatat pesanan dan kurir pengantar logistik yang andal memastikan pengiriman tepat waktu.",
    nextY
  );
  nextY += 2;
  nextY = drawBulletPoint(
    "Pengambilan Keputusan Cepat",
    "Grafik laba kotor, margin laba, dan data transaksi kasir harian siap digunakan oleh pimpinan perusahaan kapan saja sebagai acuan ekspansi usaha.",
    nextY
  );
  nextY += 6;

  // 6. PENUTUP
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text("6. Penutup", margin, nextY + 5);
  
  doc.line(margin, nextY + 7, margin + 25, nextY + 7);
  nextY += 13;

  nextY = drawParagraph(
    "Sistem POS Kasir & Stok Multi-User Terdistribusi bukan sekadar alat pencatat penjualan biasa, melainkan fondasi digital utama untuk menyatukan kerja kolaborasi seluruh staf gudang, kasir toko, tim sales marketing, armada kurir pengantaran barang, hingga pimpinan manajemen ritel dalam satu alur kerja yang serasi, transparan, dan dapat dipertanggungjawabkan.",
    nextY
  );
  nextY += 2;
  nextY = drawParagraph(
    "Dengan keandalan yang optimal, performa yang gegas, serta kemudahan kustomisasi fitur di masa mendatang, platform ini siap mendukung akselerasi PT Ritel Sentosa Bersama menjadi pemain terdepan di era transformasi ritel digital modern.",
    nextY
  );

  // Signature box
  nextY += 12;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin + 90, nextY, 80, 24, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("Disetujui secara digital oleh:", margin + 95, nextY + 6);
  doc.setFont("helvetica", "normal");
  doc.text("Tim Pengembang Sistem & IT", margin + 95, nextY + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(79, 70, 229);
  doc.text("PT Ritel Sentosa Bersama", margin + 95, nextY + 18);

  drawPageTemplate(4, totalPages);

  // Save the PDF
  doc.save("Spesifikasi_Risalah_Sistem_POS.pdf");
}
