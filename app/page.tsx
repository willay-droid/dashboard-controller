"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingApp, setLoadingApp] = useState<string | null>(null);

  // State untuk menyimpan status aktif aplikasi (true = online/nyala, false = offline)
  const [statusAmira, setStatusAmira] = useState(true);
  const [statusQr, setStatusQr] = useState(true);

  // Ambil status dari Vercel Edge Config saat halaman dimuat
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Trik Cache-Buster
        const res = await fetch("/api/status?t=" + Date.now(), {
          cache: "no-store",
        });
        const data = await res.json();

        // PERBAIKAN: Cari data di dalam Array berdasarkan 'key'-nya
        const amiraItem = data.find(
          (item: any) => item.key === "maintenance_amira",
        );
        const qrItem = data.find((item: any) => item.key === "maintenance_qr");

        // Ambil property 'value' dari item yang ditemukan
        const amiraMaintenance =
          amiraItem?.value === true || amiraItem?.value === "true";
        const qrMaintenance =
          qrItem?.value === true || qrItem?.value === "true";

        setStatusAmira(!amiraMaintenance);
        setStatusQr(!qrMaintenance);
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
    // currentActiveStatus adalah status SEKARANG sebelum diklik.
    // Jika true, artinya kita mau mematikan (maintenance = true).
    const willBeMaintenance = currentActiveStatus;

    if (currentActiveStatus) {
      const confirmOff = window.confirm(
        `Yakin ingin mematikan ${appName}? Pengunjung akan melihat halaman Maintenance.`,
      );
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
        // Update state lokal supaya toggle bergeser
        if (appName === "Toko Roti Amira") setStatusAmira(!willBeMaintenance);
        if (appName === "QR Absensi") setStatusQr(!willBeMaintenance);

        alert(
          `Status ${appName} berhasil diubah menjadi: ${!willBeMaintenance ? "ONLINE" : "OFFLINE (Maintenance)"}`,
        );
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
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Central Command</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Dashboard Kontrol Aplikasi Terpusat
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          {isDarkMode ? "☀️" : "🌓"}
        </button>
      </div>

      {/* App Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Amira Breadshop */}
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Aplikasi e-commerce dan profil toko roti.
            </p>
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
                checked={statusAmira} // Gunakan checked, bukan defaultChecked
                disabled={loadingApp === "Toko Roti Amira"}
                onChange={(e) =>
                  handleToggleApp("Toko Roti Amira", statusAmira, e)
                }
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Sistem absensi pegawai menggunakan QR Code.
            </p>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
