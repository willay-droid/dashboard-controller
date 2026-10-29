"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// Tipe Data untuk Katalog Produk
interface SaaSProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  monthlyPrice: string;
  permanentPrice: string;
  badge: string;
  features: string[];
}

// Mock Data Katalog Aplikasi Siap Pakai (Bisa lu tambah lagi sewaktu-waktu)
const SAAS_PRODUCTS: SaaSProduct[] = [
  {
    id: "qr-absensi",
    name: "Sistem QR Absensi Perusahaan",
    category: "Absensi & SDM",
    description:
      "Solusi absensi digital anti-titip absen dengan live QR kamera scanner dan sinkronisasi real-time ke Google Spreadsheet.",
    monthlyPrice: "Rp 99.000",
    permanentPrice: "Rp 1.499.000",
    badge: "Most Popular",
    features: [
      "Scanner Kamera Cepat & Akurat",
      "Koneksi Langsung Google Spreadsheet",
      "Bebas Antrean & Ramah Mobile",
      "Dukungan Teknis & Maintenance Penuh",
    ],
  },
  {
    id: "amira-pos",
    name: "E-Commerce & Smart POS Kasir",
    category: "Retail & Toko Roti",
    description:
      "Aplikasi kasir penjualan toko, manajemen stok barang real-time, pencatatan transaksi otomatis, dan katalog web pelanggan.",
    monthlyPrice: "Rp 149.000",
    permanentPrice: "Rp 2.499.000",
    badge: "Siap Pakai",
    features: [
      "Katalog Produk Digital Interaktif",
      "Pencatatan Penjualan & Cetak Struk",
      "Dashboard Manajemen Stok Barang",
      "Cloud Hosting & Auto Backup",
    ],
  },
  {
    id: "alker-monitoring",
    name: "Monitoring Aset & IoT Loker",
    category: "Teknisi & Logistik",
    description:
      "Sistem pelacakan peminjaman alat kerja, autentikasi loker teknisi, laporan kerusakan, dan dashboard admin monitoring.",
    monthlyPrice: "Rp 129.000",
    permanentPrice: "Rp 1.999.000",
    badge: "Enterprise",
    features: [
      "Pelacakan Status Aset & Peminjaman",
      "Autentikasi Multi-User Teknisi & Admin",
      "Audit Log Penggunaan Alat",
      "Notifikasi Otomatis",
    ],
  },
];

export default function PublicMarketplace() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State Modal (Pop-up)
  const [activeModal, setActiveModal] = useState<
    "none" | "package-select" | "order-form"
  >("none");
  const [selectedProduct, setSelectedProduct] = useState<SaaSProduct | null>(
    null,
  );
  const [selectedPlanType, setSelectedPlanType] = useState<
    "monthly" | "permanent"
  >("monthly");
  const [isCustomAppOrder, setIsCustomAppOrder] = useState(false);

  // State Form Pemesanan
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    companyName: "",
    gmail: "",
    whatsapp: "",
    budget: "",
    description: "",
  });

  // Sinkronisasi Tema
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  // 1. Handler Klik Produk Katalog (Buka Modal Pilih Paket)
  const handleSelectProduct = (product: SaaSProduct) => {
    setSelectedProduct(product);
    setIsCustomAppOrder(false);
    setSelectedPlanType("monthly");
    setActiveModal("package-select");
  };

  // 2. Handler Lanjut dari Pilih Paket ke Form Order
  const handleProceedToForm = (plan: "monthly" | "permanent") => {
    setSelectedPlanType(plan);
    setActiveModal("order-form");
  };

  // 3. Handler Tombol Pesan Custom App Baru
  const handleOpenCustomAppOrder = () => {
    setSelectedProduct(null);
    setIsCustomAppOrder(true);
    setActiveModal("order-form");
  };

  // 4. Tutup Modal & Reset
  const handleCloseModal = () => {
    setActiveModal("none");
    setIsSuccess(false);
  };

  // 5. Submit Order ke API Telegram
  const router = useRouter();

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Ambil detail harga dan kategori
    const categoryLabel = selectedProduct ? selectedProduct.name : "Custom App";
    const priceVal = selectedProduct
      ? selectedPlanType === "monthly"
        ? selectedProduct.monthlyPrice
        : selectedProduct.permanentPrice
      : formData.budget || "Custom";
    const planVal = selectedPlanType === "monthly" ? "Bulanan" : "Permanen";

    // Bikin Nomor Invoice sementara / instan dari depan
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceId = `INV-${dateStr}-${randomSuffix}`;

    // Susun URL Invoice dengan semua data pesanan
    const invUrl = `/invoice/${invoiceId}?client=${encodeURIComponent(formData.clientName)}&company=${encodeURIComponent(formData.companyName || "-")}&gmail=${encodeURIComponent(formData.gmail)}&wa=${encodeURIComponent(formData.whatsapp)}&service=${encodeURIComponent(categoryLabel)}&plan=${encodeURIComponent(planVal)}&price=${encodeURIComponent(priceVal)}&desc=${encodeURIComponent(formData.description || "-")}&action=new-order`;

    // Langsung pindah ke halaman invoice seketika
    router.push(invUrl);
  };

  return (
    <div className="relative min-h-screen p-4 sm:p-8 bg-[url('/vibrant_neon_interpretation_of_venus.jpg')] bg-cover bg-center bg-fixed bg-no-repeat bg-black/55 bg-blend-overlay text-gray-100 font-sans">
      {/* HEADER UTAMA */}
      <header className="max-w-6xl mx-auto mb-10 p-4 sm:p-6 rounded-3xl backdrop-blur-xl bg-white/40 dark:bg-[#111827]/40 border border-white/60 dark:border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-[10px] tracking-widest font-extrabold uppercase px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
            SaaS & Software Marketplace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-2">
            🚀 Solusi Aplikasi Siap Pakai & Automasi Bisnis
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            Pilih software siap deploy untuk perusahaan Anda atau diskusikan
            pembuatan sistem aplikasi custom.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* TOMBOL PESAN APLIKASI CUSTOM BARU */}
          <button
            onClick={handleOpenCustomAppOrder}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
          >
            ✨ Pesan Custom Web App
          </button>

          {/* TOGGLE TEMA */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-black/30 border border-white/20 text-yellow-300 hover:bg-black/50 transition-all text-sm"
            title="Toggle Mode"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* KATALOG MULTI-APLIKASI SIAP PAKAI */}
      <main className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                📦 Katalog Software Siap Deploy
              </h2>
              <p className="text-xs sm:text-sm text-gray-300">
                Pilih aplikasi yang sesuai dengan kebutuhan operasional
                perusahaan Anda.
              </p>
            </div>
          </div>

          {/* GRID MULTI-APLIKASI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAAS_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group p-6 rounded-3xl backdrop-blur-xl bg-white/40 dark:bg-[#111827]/40 border border-white/60 dark:border-white/10 shadow-xl hover:border-emerald-400/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {product.badge}
                    </span>
                    <span className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-200 mt-2 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    {product.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-gray-200"
                      >
                        <span className="text-emerald-400">✔</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-300 block">
                      Mulai dari
                    </span>
                    <span className="text-base font-extrabold text-white">
                      {product.monthlyPrice}
                      <span className="text-[10px] font-normal text-gray-300">
                        /bln
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectProduct(product)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25 transition-all"
                  >
                    Pilih & Order 👉
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BANNER BAWAH: JIKA BUTUH SISTEM KHUSUS */}
        <div className="p-6 rounded-3xl backdrop-blur-xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-white/20 shadow-xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-white">
              Tidak menemukan sistem yang sesuai dengan alur bisnis Anda?
            </h4>
            <p className="text-xs text-gray-300">
              Kami melayani pembuatan Bot Telegram/WhatsApp, sistem Google Apps
              Script, Dashboard Custom, dan Integrasi API.
            </p>
          </div>
          <button
            onClick={handleOpenCustomAppOrder}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-gray-900 hover:bg-gray-100 transition shadow-lg shrink-0"
          >
            Konsultasikan Custom App 💬
          </button>
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL 1: POP-UP PILIH PAKET (BULANAN VS PERMANEN)          */}
      {/* ========================================================= */}
      {activeModal === "package-select" && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-[#0f172a]/95 border border-white/20 shadow-2xl text-white">
            {/* Header Pop-up */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Langkah 1: Tentukan Skema Lisensi
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Dua Pilihan Paket */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Opsi Bulanan */}
              <div
                onClick={() => handleProceedToForm("monthly")}
                className="cursor-pointer p-5 rounded-2xl border border-white/20 bg-white/5 hover:border-emerald-400 hover:bg-emerald-950/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-300 px-2 py-0.5 bg-emerald-500/20 rounded">
                    SaaS Bulanan
                  </span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {selectedProduct.monthlyPrice}
                    </span>
                    <span className="text-xs text-gray-400">/ bulan</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    Cocok untuk uji coba operasional awal dengan cashflow
                    terjangkau dan full maintenance cloud.
                  </p>
                </div>
                <div className="mt-5 text-xs text-emerald-400 font-semibold group-hover:underline">
                  Pilih Langganan Bulanan ➔
                </div>
              </div>

              {/* Opsi Permanen */}
              <div
                onClick={() => handleProceedToForm("permanent")}
                className="cursor-pointer p-5 rounded-2xl border border-white/20 bg-white/5 hover:border-blue-400 hover:bg-blue-950/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-[10px] font-bold text-blue-300 px-2 py-0.5 bg-blue-500/20 rounded">
                    Beli Putus / Sekali Bayar
                  </span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      {selectedProduct.permanentPrice}
                    </span>
                    <span className="text-xs text-gray-400">/ selamanya</span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2">
                    Lisensi hak pakai permanen tanpa iuran bulanan. Termasuk
                    setup custom subdomain dan panduan lengkap.
                  </p>
                </div>
                <div className="mt-5 text-xs text-blue-400 font-semibold group-hover:underline">
                  Pilih Lisensi Permanen ➔
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-gray-400">
              Klik salah satu paket di atas untuk melanjutkan ke pengisian
              formulir kontak & aktivasi Gmail.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: POP-UP FORMULIR PEMESANAN & GMAIL AKTIVASI        */}
      {/* ========================================================= */}
      {activeModal === "order-form" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl backdrop-blur-2xl bg-[#0f172a]/95 border border-white/20 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            {/* Header Pop-up Form */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {isCustomAppOrder
                    ? "Permintaan Custom"
                    : "Konfirmasi & Aktivasi"}
                </span>
                <h3 className="text-xl font-bold mt-1">
                  {isCustomAppOrder
                    ? "✨ Pesan Custom Web App / Otomasi"
                    : `📝 Formulir ${selectedProduct?.name}`}
                </h3>
                {!isCustomAppOrder && (
                  <p className="text-xs text-gray-300 mt-0.5">
                    Paket:{" "}
                    <span className="font-semibold text-emerald-300">
                      {selectedPlanType === "monthly"
                        ? `Bulanan (${selectedProduct?.monthlyPrice}/bln)`
                        : `Permanen (${selectedProduct?.permanentPrice})`}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-white rounded-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Kondisi Sukses Kirim */}
            {isSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="text-5xl">🎉</div>
                <h4 className="text-lg font-bold text-emerald-400">
                  Pesanan Berhasil Diteruskan!
                </h4>
                <p className="text-xs text-gray-300">
                  Terima kasih, <strong>{formData.clientName}</strong>.
                  Notifikasi pesanan telah otomatis masuk ke sistem kami. Kami
                  akan segera menghubungi nomor WhatsApp{" "}
                  <strong>{formData.whatsapp}</strong> untuk langkah aktivasi
                  selanjutnya.
                </p>
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nama PIC */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Nama Pemesan / PIC *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={formData.clientName}
                      onChange={(e) =>
                        setFormData({ ...formData, clientName: e.target.value })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  {/* Perusahaan */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Nama Perusahaan / Bisnis
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: PT Sukses Mandiri"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Akun Gmail */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Alamat Gmail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="akunanda@gmail.com"
                      value={formData.gmail}
                      onChange={(e) =>
                        setFormData({ ...formData, gmail: e.target.value })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Nomor WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0812xxxxxxxx"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                {/* Kolom Khusus Jika Custom App Order */}
                {isCustomAppOrder && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Estimasi Budget Proyek (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Rp 1.500.000 - Rp 3.000.000"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                )}

                {/* Deskripsi Kebutuhan */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    {isCustomAppOrder
                      ? "Detail Kebutuhan Aplikasi *"
                      : "Catatan Tambahan (Opsional)"}
                  </label>
                  <textarea
                    rows={3}
                    required={isCustomAppOrder}
                    placeholder={
                      isCustomAppOrder
                        ? "Jelaskan alur aplikasi yang Anda inginkan (misal: bot kirim laporan harian otomatis ke grup telegram)..."
                        : "Tuliskan jika ada permintaan khusus atau jumlah cabang..."
                    }
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  ></textarea>
                </div>

                {/* Tombol Kirim Form */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-1/3 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-2/3 py-2.5 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5 ${
                      isCustomAppOrder
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-indigo-500/25"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/25"
                    }`}
                  >
                    {isSubmitting ? "Mengirim Data..." : "🚀 Kirim Pesanan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
