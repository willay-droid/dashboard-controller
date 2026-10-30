"use client";

import { useState, useEffect, TouchEvent } from "react";

interface ClientLicense {
  id: string;
  companyName: string;
  picName: string;
  whatsapp: string;
  planType: "Bulanan" | "Permanen" | "Custom" | string;
  dueDate: string;
  isActive: boolean;
  category?: string;
  createdAt?: string; // TAMBAHKAN INI
}

export default function AdminController() {
  const [currentSlide, setCurrentSlide] = useState<0 | 1>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [statusAmira, setStatusAmira] = useState(true);
  const [statusQr, setStatusQr] = useState(true);
  const [statusAlker, setStatusAlker] = useState(true);
  const [statusPortfolio, setStatusPortfolio] = useState(true);
  const [loadingApp, setLoadingApp] = useState<string | null>(null);

  const [time, setTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [clients, setClients] = useState<ClientLicense[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    companyName: "",
    picName: "",
    whatsapp: "",
    planType: "Bulanan",
    dueDate: "",
    category: "", // PERBAIKAN 1: Tambahkan state category
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientLicense | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(4); // Sudah 4 sesuai request
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/status?t=" + Date.now(), {
          cache: "no-store",
        });
        const data = await res.json();

        const amiraItem = data.find(
          (item: any) => item.key === "maintenance_amira",
        );
        const qrItem = data.find((item: any) => item.key === "maintenance_qr");
        const alkerItem = data.find(
          (item: any) => item.key === "maintenance_alker",
        );
        const portfolioItem = data.find(
          (item: any) => item.key === "maintenance_portfolio",
        );

        setStatusAmira(
          !(amiraItem?.value === true || amiraItem?.value === "true"),
        );
        setStatusQr(!(qrItem?.value === true || qrItem?.value === "true"));
        setStatusAlker(
          !(alkerItem?.value === true || alkerItem?.value === "true"),
        );
        setStatusPortfolio(
          !(portfolioItem?.value === true || portfolioItem?.value === "true"),
        );
      } catch (error) {
        console.error("Gagal mengambil status awal:", error);
      }
    };
    fetchStatus();

    const fetchClients = async () => {
      try {
        const res = await fetch("/api/clients?t=" + Date.now(), {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success) {
          setClients(data.clients);
        }
      } catch (error) {
        console.error("Gagal mengambil data klien:", error);
      } finally {
        setIsLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

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

  const handleToggleApp = async (
    appName: string,
    currentActiveStatus: boolean,
    event: any,
  ) => {
    const willBeMaintenance = currentActiveStatus;
    if (currentActiveStatus) {
      const confirmOff = window.confirm(`Yakin ingin mematikan ${appName}?`);
      if (!confirmOff) {
        event.target.checked = true;
        return;
      }
    }
    setLoadingApp(appName);
    try {
      const res = await fetch("/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName, isMaintenance: willBeMaintenance }),
      });
      const data = await res.json();
      if (data.success) {
        if (appName === "Toko Roti Amira") setStatusAmira(!willBeMaintenance);
        if (appName === "QR Absensi") setStatusQr(!willBeMaintenance);
        if (appName === "Monitoring Alker") setStatusAlker(!willBeMaintenance);
        if (appName === "Willy Portfolio")
          setStatusPortfolio(!willBeMaintenance);
      } else {
        alert("Gagal update status.");
        event.target.checked = currentActiveStatus;
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
      event.target.checked = currentActiveStatus;
    } finally {
      setLoadingApp(null);
    }
  };

  const handleTouchStart = (e: TouchEvent) =>
    setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    if (diffX > 50 && currentSlide === 0) setCurrentSlide(1);
    if (diffX < -50 && currentSlide === 1) setCurrentSlide(0);
    setTouchStartX(null);
  };

  const toggleClientStatus = async (id: string, currentStatus: boolean) => {
    const actionText = currentStatus ? "MENANGGUHKAN" : "MENGAKTIFKAN";
    const confirmAction = window.confirm(
      `Apakah Anda yakin ingin ${actionText} akses untuk klien ini?`,
    );
    if (!confirmAction) return;

    const previousClients = [...clients];
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === id ? { ...client, isActive: !currentStatus } : client,
      ),
    );

    try {
      const res = await fetch("/api/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        alert("Gagal mengubah status klien di server.");
        setClients(previousClients);
      }
    } catch (error) {
      console.error("Gagal toggle status:", error);
      alert("Terjadi kesalahan jaringan. Status gagal diubah.");
      setClients(previousClients);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;

    const clientDataToAdd = {
      id: newId,
      companyName: newClient.companyName || newClient.picName,
      picName: newClient.picName,
      whatsapp: newClient.whatsapp,
      planType: newClient.planType,
      category: newClient.category || "Aplikasi Sistem",
      dueDate:
        newClient.planType === "Permanen" ? "Lifetime" : newClient.dueDate,
      isActive: true,
    };

    const previousClients = [...clients];
    setClients([clientDataToAdd as ClientLicense, ...clients]);
    setIsModalOpen(false);
    setNewClient({
      companyName: "",
      picName: "",
      whatsapp: "",
      planType: "Bulanan",
      dueDate: "",
      category: "",
    });

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientDataToAdd),
      });
      const data = await res.json();
      if (!data.success) {
        alert("Gagal menambahkan klien ke database Vercel.");
        setClients(previousClients);
      }
    } catch (error) {
      console.error("Gagal menambah klien:", error);
      alert("Terjadi kesalahan jaringan.");
      setClients(previousClients);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const previousClients = [...clients];
    setClients(
      clients.map((c) => (c.id === editingClient.id ? editingClient : c)),
    );
    setIsEditModalOpen(false);

    try {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingClient),
      });
      const data = await res.json();
      if (!data.success) {
        alert("Gagal mengupdate data klien di server.");
        setClients(previousClients);
      }
    } catch (error) {
      console.error("Gagal edit klien:", error);
      alert("Terjadi kesalahan jaringan.");
      setClients(previousClients);
    }
  };

  const handleDeleteClient = async (id: string, picName: string) => {
    const confirmDelete = window.confirm(
      `⚠️ PERINGATAN BROS!\nApakah lu yakin mau menghapus klien "${picName}" (Invoice: ${id}) secara permanen dari database?`,
    );

    if (!confirmDelete) return;

    // Simpan state lama untuk backup
    const previousClients = [...clients];

    // Optimistic UI: Hapus langsung dari tampilan biar kelihatan instan
    setClients(clients.filter((client) => client.id !== id));

    try {
      const res = await fetch("/api/clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Gagal menghapus data dari Vercel server.");
        setClients(previousClients); // Rollback jika error
      }
    } catch (error) {
      console.error("Gagal hapus klien:", error);
      alert("Terjadi kesalahan jaringan.");
      setClients(previousClients); // Rollback
    }
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.picName?.toLowerCase().includes(searchLower) ||
      client.id?.toLowerCase().includes(searchLower) ||
      client.whatsapp?.includes(searchLower) ||
      client.companyName?.toLowerCase().includes(searchLower) ||
      client.planType?.toLowerCase().includes(searchLower) ||
      client.category?.toLowerCase().includes(searchLower) ||
      (client.isActive ? "aktif" : "ditangguhkan").includes(searchLower)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredClients.length / itemsPerPage),
  );
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="relative min-h-screen p-4 sm:p-8 bg-[url('/vibrant_neon_interpretation_of_venus.jpg')] bg-cover bg-center bg-fixed bg-no-repeat bg-black/50 bg-blend-overlay text-gray-100 overflow-hidden font-sans">
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col h-[calc(100vh-2rem)] sm:h-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 sm:gap-0 mb-8 flex-shrink-0">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-400 dark:from-white dark:to-gray-400 drop-shadow-sm flex items-center gap-3">
              ⚡ Central Command
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-300 dark:text-gray-400 mt-1 sm:mt-2 tracking-wide">
              Panel Manajemen Lisensi Klien (Tersinkron Vercel KV)
            </p>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 sm:gap-4">
            <div className="flex bg-white/10 dark:bg-gray-800/40 p-1 rounded-xl border border-white/20 backdrop-blur-sm">
              <button
                onClick={() => setCurrentSlide(0)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${currentSlide === 0 ? "bg-indigo-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                🎮 Controller
              </button>
              <button
                onClick={() => setCurrentSlide(1)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${currentSlide === 1 ? "bg-emerald-500 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              >
                👥 Klien & Lisensi ({clients.length})
              </button>
            </div>
            {isMounted && (
              <div className="font-mono text-base font-semibold tracking-widest bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 text-gray-200 px-3 py-1.5 rounded-xl shadow-lg">
                {time.toLocaleTimeString("en-GB")}
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 rounded-xl shadow-lg hover:bg-white/20 transition-all flex-shrink-0"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div
          className="relative flex-grow sm:flex-grow-0 overflow-hidden rounded-3xl"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* HALAMAN 1: APP CONTROLLER */}
            <div className="w-full flex-shrink-0 px-1 overflow-y-auto sm:overflow-visible pb-4 pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative bg-[#111827]/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl hover:bg-[#111827]/80 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        🍞 Toko Roti Amira
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${statusAmira ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                      >
                        {statusAmira ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      Aplikasi e-commerce dan profil toko roti.
                    </p>
                    <div className="mb-6">
                      <a
                        href="https://amira-breadshop.vercel.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Buka Website{" "}
                        <span className="ml-1 text-[10px]">&#8599;</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700/50 pt-5">
                    <span className="text-xs font-semibold tracking-wide text-gray-400">
                      {loadingApp === "Toko Roti Amira"
                        ? "Menyimpan..."
                        : "Status Aplikasi"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={statusAmira}
                        disabled={loadingApp === "Toko Roti Amira"}
                        onChange={(e) =>
                          handleToggleApp("Toko Roti Amira", statusAmira, e)
                        }
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                <div className="group relative bg-[#111827]/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl hover:bg-[#111827]/80 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        📷 QR Absensi
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${statusQr ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                      >
                        {statusQr ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      Sistem absensi pegawai menggunakan QR Code.
                    </p>
                    <div className="mb-6">
                      <a
                        href="https://qr-absen-altop.vercel.app/admin-qr.html"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Buka Panel Admin QR{" "}
                        <span className="ml-1 text-[10px]">&#8599;</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700/50 pt-5">
                    <span className="text-xs font-semibold tracking-wide text-gray-400">
                      {loadingApp === "QR Absensi"
                        ? "Menyimpan..."
                        : "Status Aplikasi"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={statusQr}
                        disabled={loadingApp === "QR Absensi"}
                        onChange={(e) =>
                          handleToggleApp("QR Absensi", statusQr, e)
                        }
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                <div className="group relative bg-[#111827]/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl hover:bg-[#111827]/80 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        📈 Monitoring Alker
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${statusAlker ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                      >
                        {statusAlker ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      Sistem monitoring alat kerja teknisi.
                    </p>
                    <div className="mb-6 flex flex-col gap-2">
                      <a
                        href="https://monitoring-alker.vercel.app/admin-login"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Buka Login Admin{" "}
                        <span className="ml-1 text-[10px]">&#8599;</span>
                      </a>
                      <a
                        href="https://monitoring-alker.vercel.app/loker/loker-001"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Buka Akses Teknisi{" "}
                        <span className="ml-1 text-[10px]">&#8599;</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700/50 pt-5">
                    <span className="text-xs font-semibold tracking-wide text-gray-400">
                      {loadingApp === "Monitoring Alker"
                        ? "Menyimpan..."
                        : "Status Aplikasi"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={statusAlker}
                        disabled={loadingApp === "Monitoring Alker"}
                        onChange={(e) =>
                          handleToggleApp("Monitoring Alker", statusAlker, e)
                        }
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>

                <div className="group relative bg-[#111827]/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl hover:bg-[#111827]/80 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        💼 Willy Portfolio
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${statusPortfolio ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                      >
                        {statusPortfolio ? "ONLINE" : "OFFLINE"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                      Website portofolio personal Willy.
                    </p>
                    <div className="mb-6">
                      <a
                        href="https://willy-portfolio-three.vercel.app/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Buka Portfolio{" "}
                        <span className="ml-1 text-[10px]">&#8599;</span>
                      </a>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700/50 pt-5">
                    <span className="text-xs font-semibold tracking-wide text-gray-400">
                      {loadingApp === "Willy Portfolio"
                        ? "Menyimpan..."
                        : "Status Aplikasi"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={statusPortfolio}
                        disabled={loadingApp === "Willy Portfolio"}
                        onChange={(e) =>
                          handleToggleApp("Willy Portfolio", statusPortfolio, e)
                        }
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* HALAMAN 2: MANAJEMEN KLIEN */}
            <div className="w-full flex-shrink-0 px-1 overflow-y-auto pb-8 pr-2 custom-scrollbar">
              <div className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl p-6 sm:p-8 min-h-[60vh]">
                {/* Header Tabel */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      🏢 Manajemen Klien & Lisensi
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30"
                  >
                    Tambah Klien Manual
                  </button>
                </div>

                {!statusQr && (
                  <div className="bg-red-500/20 border border-red-500/30 p-4 rounded-xl mb-6 flex items-start gap-3">
                    <span className="text-red-400 text-lg">⚠️</span>
                    <p className="text-xs text-red-300 font-medium">
                      Master QR Absensi sedang OFFLINE. Semua akses klien
                      otomatis ditangguhkan dari sisi server utama meskipun
                      status lisensi mereka aktif.
                    </p>
                  </div>
                )}

                {/* BARU: BAR PENCARIAN & DROPDOWN JUMLAH DATA */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 mt-2">
                  <input
                    type="text"
                    placeholder="🔍 Cari Invoice / Nama / WA / Paket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-72 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all shadow-inner"
                  />
                  <div className="flex items-center gap-3 text-sm text-gray-400 font-semibold bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-full sm:w-auto justify-between sm:justify-start">
                    <span>Tampilkan:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-transparent border-none text-emerald-400 focus:outline-none cursor-pointer font-bold"
                    >
                      <option value={2} className="bg-gray-800">
                        2
                      </option>
                      <option value={4} className="bg-gray-800">
                        4
                      </option>
                      <option value={10} className="bg-gray-800">
                        10
                      </option>
                      <option value={50} className="bg-gray-800">
                        50
                      </option>
                      <option value={100} className="bg-gray-800">
                        100
                      </option>
                      <option value={1000} className="bg-gray-800">
                        1000
                      </option>
                    </select>
                    <span>data</span>
                  </div>
                </div>

                {/* Tabel Klien */}
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                  {isLoadingClients ? (
                    <div className="p-10 text-center text-gray-400 text-sm font-semibold animate-pulse">
                      Memuat Data Lisensi dari Vercel KV...
                    </div>
                  ) : (
                    <table className="w-full text-left text-sm text-gray-300 min-w-[700px]">
                      <thead className="text-xs uppercase bg-white/5 text-gray-400 border-b border-white/10">
                        <tr>
                          <th className="px-6 py-4 font-bold tracking-wider">
                            Invoice / PIC
                          </th>
                          <th className="px-6 py-4 font-bold tracking-wider">
                            WhatsApp
                          </th>
                          <th className="px-6 py-4 font-bold tracking-wider">
                            Paket
                          </th>
                          <th className="px-6 py-4 font-bold tracking-wider">
                            Jatuh Tempo
                          </th>
                          <th className="px-6 py-4 font-bold tracking-wider">
                            Status Lisensi
                          </th>
                          <th className="px-6 py-4 font-bold tracking-wider text-center">
                            Saklar Akses
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {currentClients.map((client) => (
                          <tr
                            key={client.id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-white text-base">
                                {client.companyName}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-1 font-mono">
                                {client.id} | PIC: {client.picName}
                              </div>
                              {/* Menampilkan Tanggal Order (Jika Ada) */}
                              {client.createdAt && (
                                <div className="text-[9px] text-gray-400 mt-0.5">
                                  {new Date(
                                    client.createdAt,
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  WIB
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-mono text-xs flex items-center gap-1.5 mt-2">
                              <span className="text-green-400 text-[10px]">
                                💬
                              </span>{" "}
                              {client.whatsapp}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-md border whitespace-nowrap ${client.planType === "Permanen" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : client.planType === "Custom" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"}`}
                              >
                                {client.planType}{" "}
                                <span className="mx-1 text-gray-500">|</span>{" "}
                                <span className="text-gray-300">
                                  {client.category || "QR Absensi"}
                                </span>
                              </span>
                            </td>
                            <td
                              className={`px-6 py-4 text-xs font-semibold ${client.dueDate === "Menunggu Pembayaran" ? "text-amber-400" : "text-gray-400"}`}
                            >
                              {client.planType === "Permanen" ? (
                                <span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">
                                  Lifetime / Selamanya
                                </span>
                              ) : (
                                // Jika Bulanan/Custom, tampilkan tanggal dari Vercel
                                client.dueDate
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {client.isActive ? (
                                <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full">
                                  AKTIF
                                </span>
                              ) : (
                                <span className="text-[10px] font-black tracking-widest text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full">
                                  DITANGGUHKAN
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-3">
                                {/* Tombol Delete */}
                                <button
                                  onClick={() =>
                                    handleDeleteClient(
                                      client.id,
                                      client.picName,
                                    )
                                  }
                                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                                  title="Hapus Klien Permanen"
                                >
                                  🗑️
                                </button>

                                {/* Tombol Edit yang sudah ada */}
                                <button
                                  onClick={() => {
                                    setEditingClient(client);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                                  title="Edit Data Pelanggan"
                                >
                                  ✏️
                                </button>

                                {/* Saklar Akses */}
                                <label className="relative inline-flex items-center cursor-pointer ml-1">
                                  {/* (Biarkan saklar bawaan lu persis seperti aslinya) */}
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={client.isActive}
                                    onChange={() =>
                                      toggleClientStatus(
                                        client.id,
                                        client.isActive,
                                      )
                                    }
                                  />
                                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {currentClients.length === 0 && (
                          <tr>
                            <td
                              colSpan={6}
                              className="px-6 py-12 text-center text-gray-500 text-sm"
                            >
                              Belum ada data klien yang terdaftar.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* KONTROL PAGINATION */}
                {!isLoadingClients && filteredClients.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-white/10 gap-4">
                    <span className="text-xs text-gray-400 font-medium">
                      Menampilkan{" "}
                      <span className="text-white font-bold">
                        {startIndex + 1}
                      </span>{" "}
                      -{" "}
                      <span className="text-white font-bold">
                        {Math.min(
                          startIndex + itemsPerPage,
                          filteredClients.length,
                        )}
                      </span>{" "}
                      dari total{" "}
                      <span className="text-emerald-400 font-bold">
                        {filteredClients.length}
                      </span>{" "}
                      data
                    </span>
                    <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        ⬅ Prev
                      </button>
                      <span className="px-4 py-2 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Next ➡
                      </button>
                    </div>
                  </div>
                )}
                {!isLoadingClients &&
                  filteredClients.length === 0 &&
                  clients.length > 0 && (
                    <div className="text-center text-sm text-gray-500 mt-8 font-medium bg-white/5 p-4 rounded-xl border border-white/10">
                      Tidak ada data klien yang cocok dengan pencarian "
                      {searchTerm}"
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TAMBAH KLIEN MANUAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-500/20 border-b border-emerald-500/30 p-5 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                ✨ Tambah Klien Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddClient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Nama Perusahaan / Bisnis *
                </label>
                <input
                  type="text"
                  required
                  value={newClient.companyName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, companyName: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Contoh: PT Sukses Makmur"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Nama PIC (Pemesan) *
                </label>
                <input
                  type="text"
                  required
                  value={newClient.picName}
                  onChange={(e) =>
                    setNewClient({ ...newClient, picName: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Nomor WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={newClient.whatsapp}
                  onChange={(e) =>
                    setNewClient({ ...newClient, whatsapp: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  placeholder="0812xxxxxxxxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                    Tipe Paket
                  </label>
                  <select
                    value={newClient.planType}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        planType: e.target.value as any,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Bulanan" className="bg-gray-800">
                      Bulanan
                    </option>
                    <option value="Permanen" className="bg-gray-800">
                      Lisensi Permanen
                    </option>
                    <option value="Custom" className="bg-gray-800">
                      Custom App
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                    Aplikasi / Layanan
                  </label>
                  <input
                    type="text"
                    value={newClient.category}
                    onChange={(e) =>
                      setNewClient({ ...newClient, category: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    placeholder="QR Absensi"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Jatuh Tempo
                </label>
                <input
                  type="date"
                  disabled={newClient.planType === "Permanen"}
                  value={
                    newClient.planType === "Permanen" ? "" : newClient.dueDate
                  }
                  onChange={(e) =>
                    setNewClient({ ...newClient, dueDate: e.target.value })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl text-sm font-semibold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <span>+</span> Simpan Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT KLIEN */}
      {isEditModalOpen && editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b] w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-blue-500/20 border-b border-blue-500/30 p-5 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                ✏️ Edit Data Pelanggan
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateClient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Nama Perusahaan / Bisnis *
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.companyName}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      companyName: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Nama PIC *
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.picName}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      picName: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Nomor WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  value={editingClient.whatsapp}
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      whatsapp: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                    Tipe Paket
                  </label>
                  <select
                    value={editingClient.planType}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        planType: e.target.value as any,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Bulanan" className="bg-gray-800">
                      Bulanan
                    </option>
                    <option value="Permanen" className="bg-gray-800">
                      Lisensi Permanen
                    </option>
                    <option value="Custom" className="bg-gray-800">
                      Custom App
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                    Aplikasi
                  </label>
                  <input
                    type="text"
                    value={editingClient.category || ""}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        category: e.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">
                  Jatuh Tempo
                </label>
                <input
                  type="date"
                  disabled={editingClient.planType === "Permanen"}
                  value={
                    editingClient.planType === "Permanen"
                      ? ""
                      : editingClient.dueDate
                  }
                  onChange={(e) =>
                    setEditingClient({
                      ...editingClient,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/3 py-3 rounded-xl text-sm font-semibold bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 rounded-xl text-sm font-bold bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                >
                  💾 Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
