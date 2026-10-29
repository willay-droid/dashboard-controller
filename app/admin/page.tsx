"use client";

import { useState, useEffect, TouchEvent } from "react";

interface ClientLicense {
  id: string;
  companyName: string;
  picName: string;
  whatsapp: string;
  planType: "Bulanan" | "Permanen" | "Custom";
  dueDate: string;
  isActive: boolean;
}

export default function AdminController() {
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // State 4 Aplikasi Edge Config
  const [statusAmira, setStatusAmira] = useState(true);
  const [statusQr, setStatusQr] = useState(true);
  const [statusAlker, setStatusAlker] = useState(true);
  const [statusPortfolio, setStatusPortfolio] = useState(true);
  const [loadingApp, setLoadingApp] = useState<string | null>(null);

  // State Waktu & Tema
  const [time, setTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State Manajemen Klien (Diberi default array kosong [])
  const [clients, setClients] = useState<ClientLicense[]>([]);
  // State untuk melacak proses loading data dari Vercel KV
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  // State Modal Tambah Klien Manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    companyName: "",
    picName: "",
    whatsapp: "",
    planType: "Bulanan" as "Bulanan" | "Permanen",
    dueDate: "",
  });

  // Init Waktu & Tema
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    return () => clearInterval(timer);
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

  // Fetch Edge Config & Vercel KV Clients
  useEffect(() => {
    const fetchEdgeStatus = async () => {
      try {
        const res = await fetch("/api/status?t=" + Date.now(), {
          cache: "no-store",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const amiraItem = data.find(
            (item: any) => item.key === "maintenance_amira",
          );
          const qrItem = data.find(
            (item: any) => item.key === "maintenance_qr",
          );
          const alkerItem = data.find(
            (item: any) => item.key === "maintenance_alker",
          );
          const portfolioItem = data.find(
            (item: any) => item.key === "maintenance_portfolio",
          );

          setStatusAmira(!amiraItem?.value);
          setStatusQr(!qrItem?.value);
          setStatusAlker(!alkerItem?.value);
          setStatusPortfolio(!portfolioItem?.value);
        }
      } catch (error) {
        console.error("Gagal load Edge Config:", error);
      }
    };

    const fetchKVClients = async () => {
      try {
        setIsLoadingClients(true);
        const res = await fetch("/api/clients?t=" + Date.now(), {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.clients)) {
          setClients(data.clients);
        }
      } catch (error) {
        console.error("Gagal load KV Clients:", error);
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchEdgeStatus();
    fetchKVClients();
  }, []);

  // Handler Edge Config Toggle
  const handleToggle = async (
    appName: string,
    currentStatus: boolean,
    setStatus: (val: boolean) => void,
  ) => {
    setLoadingApp(appName);
    try {
      const res = await fetch("/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName, isMaintenance: currentStatus }),
      });
      if (res.ok) setStatus(!currentStatus);
    } catch {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setLoadingApp(null);
    }
  };

  // Handler Client Lisensi Toggle (Save to KV)
  const toggleClientStatus = async (id: string) => {
    const target = clients.find((c) => c.id === id);
    if (!target) return;

    const newStatus = !target.isActive;

    // Optimistic Update UI
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: newStatus } : c)),
    );

    // Simpan ke KV
    try {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id, isActive: newStatus }),
      });
    } catch (err) {
      console.error("Gagal update status lisensi:", err);
    }
  };

  // Handler Tambah Klien Manual (Save to KV)
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.companyName || !newClient.picName) return;

    const item: ClientLicense = {
      id: "MANUAL-" + Date.now(),
      companyName: newClient.companyName,
      picName: newClient.picName,
      whatsapp: newClient.whatsapp,
      planType: newClient.planType,
      dueDate:
        newClient.planType === "Permanen"
          ? "Lifetime"
          : newClient.dueDate || "1 Bulan ke Depan",
      isActive: true,
    };

    setClients([item, ...clients]); // Optimistic UI Update
    setIsModalOpen(false);

    try {
      await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", client: item }),
      });
    } catch (err) {
      console.error("Gagal menambah klien ke KV:", err);
    }

    setNewClient({
      companyName: "",
      picName: "",
      whatsapp: "",
      planType: "Bulanan",
      dueDate: "",
    });
  };

  // Handler Swipe HP
  const handleTouchStart = (e: TouchEvent) =>
    setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 60 && currentSlide === 0) setCurrentSlide(1);
    if (diff < -60 && currentSlide === 1) setCurrentSlide(0);
    setTouchStartX(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-screen p-4 sm:p-8 bg-[url('/vibrant_neon_interpretation_of_venus.jpg')] bg-cover bg-center bg-fixed bg-no-repeat bg-black/55 bg-blend-overlay text-gray-100 font-sans overflow-x-hidden"
    >
      <header className="max-w-6xl mx-auto mb-6 p-4 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-[#111827]/40 border border-white/60 dark:border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 transition-all">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            ⚡ Central Command
          </h1>
          <p className="text-xs text-gray-700 dark:text-gray-300">
            {currentSlide === 0
              ? "Panel Saklar Remote & Maintenance Mode"
              : "Panel Manajemen Lisensi Klien (Tersinkron Vercel KV)"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-black/30 p-1 rounded-xl border border-white/20">
            <button
              onClick={() => setCurrentSlide(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentSlide === 0 ? "bg-emerald-500 text-white shadow-md" : "text-gray-300 hover:text-white"}`}
            >
              🎮 Controller
            </button>
            <button
              onClick={() => setCurrentSlide(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${currentSlide === 1 ? "bg-emerald-500 text-white shadow-md" : "text-gray-300 hover:text-white"}`}
            >
              🏢 Klien & Lisensi ({clients.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isMounted && (
              <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-xl bg-black/30 border border-white/20 text-emerald-400">
                {time.toLocaleTimeString("en-GB")}
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-black/30 border border-white/20 text-yellow-300 hover:bg-black/50 transition-all text-xs"
            >
              {isDarkMode ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      {/* Navigasi Desktop Kanan-Kiri */}
      {currentSlide === 0 ? (
        <button
          onClick={() => setCurrentSlide(1)}
          className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 items-center justify-center group"
        >
          <span className="text-lg font-bold">➔</span>
        </button>
      ) : (
        <button
          onClick={() => setCurrentSlide(0)}
          className="hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-110 items-center justify-center group"
        >
          <span className="text-lg font-bold">⬅</span>
        </button>
      )}

      <div className="max-w-6xl mx-auto overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* SLIDE 1: CONTROLLER (Edge Config) */}
          <div className="w-full shrink-0 px-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amira */}
              <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-[#111827]/40 border border-white/60 dark:border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      🍞 Toko Roti Amira
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusAmira ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"}`}
                    >
                      {statusAmira ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-300">
                    Maintenance Switch
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusAmira}
                      disabled={loadingApp === "Toko Roti Amira"}
                      onChange={() =>
                        handleToggle(
                          "Toko Roti Amira",
                          statusAmira,
                          setStatusAmira,
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* QR Absensi */}
              <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-[#111827]/40 border border-white/60 dark:border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      📲 Master QR Absensi
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusQr ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"}`}
                    >
                      {statusQr ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-300">
                    Maintenance Switch
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusQr}
                      disabled={loadingApp === "QR Absensi"}
                      onChange={() =>
                        handleToggle("QR Absensi", statusQr, setStatusQr)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* Monitoring Alker */}
              <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-[#111827]/40 border border-white/60 dark:border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      🛠️ Monitoring Alker
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusAlker ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"}`}
                    >
                      {statusAlker ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-300">
                    Maintenance Switch
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusAlker}
                      disabled={loadingApp === "Monitoring Alker"}
                      onChange={() =>
                        handleToggle(
                          "Monitoring Alker",
                          statusAlker,
                          setStatusAlker,
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* Willy Portfolio */}
              <div className="p-5 rounded-2xl backdrop-blur-xl bg-white/40 dark:bg-[#111827]/40 border border-white/60 dark:border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      💼 Willy Portfolio
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusPortfolio ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"}`}
                    >
                      {statusPortfolio ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-300">
                    Maintenance Switch
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={statusPortfolio}
                      disabled={loadingApp === "Willy Portfolio"}
                      onChange={() =>
                        handleToggle(
                          "Willy Portfolio",
                          statusPortfolio,
                          setStatusPortfolio,
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 2: MANAJEMEN LISENSI KLIEN (KV DB) */}
          <div className="w-full shrink-0 px-1">
            <div className="p-6 rounded-3xl backdrop-blur-xl bg-white/40 dark:bg-[#111827]/40 border border-white/60 shadow-2xl space-y-6 min-h-[500px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    🏢 Manajemen Klien & Lisensi
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-md transition-all"
                >
                  ➕ Tambah Klien Manual
                </button>
              </div>

              {/* PERINGATAN JIKA MASTER SAKLAR OFF */}
              {!statusQr && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <p className="text-xs text-rose-300 font-semibold">
                      Master QR Absensi sedang OFFLINE. Semua akses klien
                      otomatis ditangguhkan.
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentSlide(0)}
                    className="text-xs text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg transition"
                  >
                    Nyalakan Master
                  </button>
                </div>
              )}

              {isLoadingClients ? (
                <div className="text-center py-10 text-gray-300 text-sm">
                  Mengambil data dari Vercel KV...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-200 border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 font-semibold uppercase bg-black/20">
                        <th className="p-3.5">Invoice / PIC</th>
                        <th className="p-3.5">WhatsApp</th>
                        <th className="p-3.5">Paket</th>
                        <th className="p-3.5">Jatuh Tempo</th>
                        <th className="p-3.5">Status Lisensi</th>
                        <th className="p-3.5 text-center">Saklar Akses</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {clients.map((c) => {
                        // LOGIKA SINKRONISASI: Jika master OFF, paksakan status terlihat OFF.
                        const displayStatus = statusQr ? c.isActive : false;

                        return (
                          <tr key={c.id} className="hover:bg-white/5">
                            <td className="p-3.5">
                              <div className="font-bold text-white text-sm">
                                {c.companyName}
                              </div>
                              <div className="text-[11px] text-gray-400">
                                {c.id} | PIC: {c.picName}
                              </div>
                            </td>
                            <td className="p-3.5">
                              <a
                                href={`https://wa.me/${c.whatsapp.replace(/^0/, "62")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline"
                              >
                                💬 {c.whatsapp}
                              </a>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {c.planType}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono text-yellow-300">
                              {c.dueDate}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold ${displayStatus ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}
                              >
                                {displayStatus
                                  ? "LUNAS / AKTIF"
                                  : "DITANGGUHKAN"}
                              </span>
                            </td>
                            <td className="p-3.5 text-center">
                              <label
                                className={`relative inline-flex items-center ${!statusQr ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={displayStatus}
                                  disabled={!statusQr} // Kunci saklar jika master mati
                                  onChange={() => toggleClientStatus(c.id)}
                                  className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                              </label>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {clients.length === 0 && (
                    <div className="text-center py-5 text-gray-400 text-xs">
                      Belum ada pesanan masuk.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH KLIEN MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0f172a]/95 border border-white/20 text-white shadow-2xl">
            <h3 className="text-lg font-bold mb-4">➕ Input Data Manual</h3>
            <form onSubmit={handleAddClient} className="space-y-3.5 text-xs">
              <input
                type="text"
                required
                placeholder="Perusahaan"
                value={newClient.companyName}
                onChange={(e) =>
                  setNewClient({ ...newClient, companyName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20"
              />
              <input
                type="text"
                required
                placeholder="Nama PIC"
                value={newClient.picName}
                onChange={(e) =>
                  setNewClient({ ...newClient, picName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20"
              />
              <input
                type="tel"
                required
                placeholder="08xxxxxxxx"
                value={newClient.whatsapp}
                onChange={(e) =>
                  setNewClient({ ...newClient, whatsapp: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20"
              />
              <select
                value={newClient.planType}
                onChange={(e) =>
                  setNewClient({
                    ...newClient,
                    planType: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-white/20 text-white"
              >
                <option value="Bulanan">SaaS Bulanan</option>
                <option value="Permanen">Lisensi Permanen</option>
              </select>
              {newClient.planType === "Bulanan" && (
                <input
                  type="date"
                  value={newClient.dueDate}
                  onChange={(e) =>
                    setNewClient({ ...newClient, dueDate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20"
                />
              )}
              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl bg-white/10 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-emerald-500 font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
