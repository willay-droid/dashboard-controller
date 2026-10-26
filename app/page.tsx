"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingApp, setLoadingApp] = useState<string | null>(null);

  // State untuk 4 aplikasi
  const [statusAmira, setStatusAmira] = useState(true);
  const [statusQr, setStatusQr] = useState(true);
  const [statusAlker, setStatusAlker] = useState(true);
  const [statusPortfolio, setStatusPortfolio] = useState(true);

  const [time, setTime] = useState(new Date());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
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
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
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

  return (
    <div className="relative min-h-screen p-8 bg-[url('/vibrant_neon_interpretation_of_venus.jpg')] bg-cover bg-center bg-fixed bg-no-repeat bg-black/50 bg-blend-overlay text-gray-100 overflow-hidden font-sans">
      {/* KONTEN UTAMA */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 drop-shadow-sm">
              Central Command
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isMounted && (
              <div className="font-mono text-lg font-semibold tracking-widest bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/60 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                {time.toLocaleTimeString("en-GB")}
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="p-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/60 dark:border-gray-700/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white/60 dark:hover:bg-gray-700/50 transition-all duration-300"
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Amira */}
          <div className="group relative bg-white/50 dark:bg-[#111827]/40 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-[#111827]/50 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  🍞 Toko Roti Amira
                </h2>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border ${statusAmira ? "bg-green-400/20 text-green-700 dark:text-green-300 border-green-400/30" : "bg-red-400/20 text-red-700 dark:text-red-300 border-red-400/30"}`}
                >
                  {statusAmira ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                Aplikasi e-commerce dan profil toko roti.
              </p>
              <div className="mb-6">
                <a
                  href="https://amira-breadshop.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Buka Website <span className="ml-1 text-[10px]">&#8599;</span>
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200/50 dark:border-gray-700/50 pt-5">
              <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300">
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
                <div className="w-12 h-6 bg-gray-300/80 peer-focus:outline-none rounded-full peer dark:bg-gray-800/80 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Card 2: QR Absensi */}
          <div className="group relative bg-white/50 dark:bg-[#111827]/40 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-[#111827]/50 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  📷 QR Absensi
                </h2>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border ${statusQr ? "bg-green-400/20 text-green-700 dark:text-green-300 border-green-400/30" : "bg-red-400/20 text-red-700 dark:text-red-300 border-red-400/30"}`}
                >
                  {statusQr ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                Sistem absensi pegawai menggunakan QR Code.
              </p>
              <div className="mb-6">
                <a
                  href="https://qr-absen-altop.vercel.app/admin-qr.html"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Buka Panel Admin QR{" "}
                  <span className="ml-1 text-[10px]">&#8599;</span>
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200/50 dark:border-gray-700/50 pt-5">
              <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300">
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
                  onChange={(e) => handleToggleApp("QR Absensi", statusQr, e)}
                />
                <div className="w-12 h-6 bg-gray-300/80 peer-focus:outline-none rounded-full peer dark:bg-gray-800/80 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Card 3: Monitoring Alker */}
          <div className="group relative bg-white/50 dark:bg-[#111827]/40 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-[#111827]/50 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  📈 Monitoring Alker
                </h2>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border ${statusAlker ? "bg-green-400/20 text-green-700 dark:text-green-300 border-green-400/30" : "bg-red-400/20 text-red-700 dark:text-red-300 border-red-400/30"}`}
                >
                  {statusAlker ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                Sistem monitoring alat kerja.
              </p>
              <div className="mb-6 flex flex-col gap-2">
                <a
                  href="https://monitoring-alker.vercel.app/admin-login"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Buka Login Admin{" "}
                  <span className="ml-1 text-[10px]">&#8599;</span>
                </a>
                <a
                  href="https://monitoring-alker.vercel.app/loker/loker-001"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Buka Akses Teknisi{" "}
                  <span className="ml-1 text-[10px]">&#8599;</span>
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200/50 dark:border-gray-700/50 pt-5">
              <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300">
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
                <div className="w-12 h-6 bg-gray-300/80 peer-focus:outline-none rounded-full peer dark:bg-gray-800/80 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          {/* Card 4: Willy Portfolio */}
          <div className="group relative bg-white/50 dark:bg-[#111827]/40 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:bg-[#111827]/50 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  💼 Willy Portfolio
                </h2>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider border ${statusPortfolio ? "bg-green-400/20 text-green-700 dark:text-green-300 border-green-400/30" : "bg-red-400/20 text-red-700 dark:text-red-300 border-red-400/30"}`}
                >
                  {statusPortfolio ? "ONLINE" : "OFFLINE"}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                Website portofolio personal.
              </p>
              <div className="mb-6">
                <a
                  href="https://willy-portfolio-three.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Buka Portfolio{" "}
                  <span className="ml-1 text-[10px]">&#8599;</span>
                </a>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200/50 dark:border-gray-700/50 pt-5">
              <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300">
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
                <div className="w-12 h-6 bg-gray-300/80 peer-focus:outline-none rounded-full peer dark:bg-gray-800/80 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-emerald-500 dark:peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
