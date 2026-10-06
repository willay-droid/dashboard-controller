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
    <div className="min-h-screen p-8 transition-colors duration-200 bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Central Command</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Dashboard Kontrol Aplikasi Terpusat
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isMounted && (
            <div className="font-mono text-lg font-semibold tracking-wider bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {time.toLocaleTimeString("en-GB")}
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Amira */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">🍞 Toko Roti Amira</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${statusAmira ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}
              >
                {statusAmira ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Aplikasi e-commerce dan profil toko roti.
            </p>
            <div className="mb-6">
              <a
                href="https://amira-breadshop.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium"
              >
                Buka Website &#8599;
              </a>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
            <span className="text-sm font-medium">
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>

        {/* Card 2: QR Absensi */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">📷 QR Absensi</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${statusQr ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}
              >
                {statusQr ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Sistem absensi pegawai menggunakan QR Code.
            </p>
            <div className="mb-6">
              <a
                href="https://qr-absen-altop.vercel.app/admin-qr.html"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium"
              >
                Buka Panel Admin QR &#8599;
              </a>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
            <span className="text-sm font-medium">
              {loadingApp === "QR Absensi" ? "Menyimpan..." : "Status Aplikasi"}
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={statusQr}
                disabled={loadingApp === "QR Absensi"}
                onChange={(e) => handleToggleApp("QR Absensi", statusQr, e)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>

        {/* Card 3: Monitoring Alker */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">📈 Monitoring Alker</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${statusAlker ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}
              >
                {statusAlker ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Sistem monitoring alat kerja.
            </p>
            <div className="mb-6 flex flex-col gap-1.5">
              <a
                href="https://monitoring-alker.vercel.app/admin-login"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium"
              >
                Buka Login Admin &#8599;
              </a>
              <a
                href="https://monitoring-alker.vercel.app/loker/loker-001"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium"
              >
                Buka Akses Teknisi &#8599;
              </a>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
            <span className="text-sm font-medium">
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>

        {/* Card 4: Willy Portfolio */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">💼 Willy Portfolio</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${statusPortfolio ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"}`}
              >
                {statusPortfolio ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Website portofolio personal.
            </p>
            <div className="mb-6">
              <a
                href="https://willy-portfolio-three.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 dark:text-blue-400 hover:underline font-medium"
              >
                Buka Portfolio &#8599;
              </a>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-4">
            <span className="text-sm font-medium">
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 dark:peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
