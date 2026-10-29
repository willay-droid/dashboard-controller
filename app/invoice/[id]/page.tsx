"use client";

import { useSearchParams, useParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function InvoiceContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Ambil Data dari URL Parameters
  const invoiceId = (params?.id as string) || "INV-SAMPLE";
  const clientName = searchParams.get("client") || "Pelanggan";
  const companyName = searchParams.get("company") || "Perusahaan";
  const gmail = searchParams.get("gmail") || "email@gmail.com";
  const whatsapp = searchParams.get("wa") || "08xxxxxxxxx";
  const service = searchParams.get("service") || "Sistem QR Absensi Perusahaan";
  const plan = searchParams.get("plan") || "Langganan Bulanan";
  const price = searchParams.get("price") || "Menyesuaikan";
  const status = searchParams.get("status") || "MENUNGGU PEMBAYARAN";
  const date =
    searchParams.get("date") ||
    new Date().toLocaleDateString("id-ID", { dateStyle: "long" });
  const desc = searchParams.get("desc") || "-";
  const isNewOrder = searchParams.get("action") === "new-order";

  // Trigger pencatatan ke database & Telegram saat invoice pertama kali dibuka
  useEffect(() => {
    if (isNewOrder && invoiceId !== "INV-SAMPLE") {
      const saveOrder = async () => {
        try {
          await fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              invoiceId,
              clientName,
              companyName,
              gmail,
              whatsapp,
              category: service,
              price,
              planType: plan,
              description: desc,
            }),
          });
          // Ubah URL secara diam-diam agar kalau di-refresh tidak mengirim pesan dobel
          window.history.replaceState(
            null,
            "",
            `/invoice/${invoiceId}?client=${encodeURIComponent(clientName)}&company=${encodeURIComponent(companyName)}&gmail=${encodeURIComponent(gmail)}&wa=${encodeURIComponent(whatsapp)}&service=${encodeURIComponent(service)}&plan=${encodeURIComponent(plan)}&price=${encodeURIComponent(price)}`,
          );
        } catch (err) {
          console.error("Gagal mencatat order:", err);
        }
      };
      saveOrder();
    }
  }, [
    isNewOrder,
    invoiceId,
    clientName,
    companyName,
    gmail,
    whatsapp,
    service,
    plan,
    price,
    desc,
  ]);

  // URL WhatsApp untuk konfirmasi otomatis
  const waAdmin = "082218937297"; // Ganti dengan nomor WhatsApp lu yang aktif
  const waMessage = `Halo Admin, saya ingin mengonfirmasi pembayaran untuk:\n\n📄 *No. Invoice:* ${invoiceId}\n🏢 *Atas Nama:* ${clientName} (${companyName})\n📦 *Layanan:* ${service}\n💰 *Total:* ${price}\n\nBerikut saya lampirkan bukti transfernya. Terima kasih.`;
  const waLink = `https://wa.me/${waAdmin.replace(/^0/, "62")}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center text-gray-800 font-sans print:p-0 print:bg-white">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200 print:shadow-none print:border-none print:rounded-none">
        {/* HEADER INVOICE */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              INVOICE RESMI
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
              CLOUD SAAS & SOFTWARE
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Solusi Aplikasi Bisnis, Otomasi & Sistem Absensi Digital
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              No. Tagihan
            </div>
            <div className="font-mono text-lg font-black text-gray-800">
              {invoiceId}
            </div>
            <div className="text-[11px] font-medium text-gray-500 mt-1">
              Diterbitkan: {date}
            </div>
          </div>
        </div>

        {/* STATUS BADGE */}
        <div className="my-6 flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <span className="text-xs text-gray-500 font-medium block">
              Status Tagihan:
            </span>
            <span
              className={`inline-block mt-1 text-[11px] font-bold px-3 py-1 rounded-full ${
                status === "LUNAS"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-amber-100 text-amber-700 border border-amber-300 animate-pulse"
              }`}
            >
              {status}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 font-medium block">
              Total Dibayar:
            </span>
            <span className="text-2xl font-black text-gray-900">{price}</span>
          </div>
        </div>

        {/* DETAIL DITAGIHKAN & PEMBAYARAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
          {/* Box Kiri: Info Klien */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px] text-gray-400 border-b border-gray-200 pb-2">
              Ditagihkan Kepada:
            </h3>
            <div className="space-y-1">
              <p className="font-bold text-sm text-gray-900">{clientName}</p>
              <p className="font-medium text-gray-600">
                {companyName !== "-" ? companyName : "Pribadi / Bisnis"}
              </p>
              <p className="text-gray-600 flex items-center gap-1.5 mt-2">
                📧 {gmail}
              </p>
              <p className="text-gray-600 flex items-center gap-1.5">
                💬 {whatsapp}
              </p>
            </div>
          </div>

          {/* Box Kanan: Instruksi Pembayaran */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -z-0"></div>

            <h3 className="font-bold text-emerald-900 mb-3 uppercase tracking-wider text-[11px] border-b border-emerald-200 pb-2 relative z-10">
              💳 Instruksi Pembayaran:
            </h3>

            <div className="space-y-2.5 relative z-10 text-gray-700 font-medium">
              <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100 shadow-sm">
                <span className="font-bold text-blue-800">BCA</span>
                <span className="font-mono font-black text-sm">
                  082218937297
                </span>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-100 shadow-sm">
                <span className="font-bold text-orange-600">
                  ShopeePay / DANA
                </span>
                <span className="font-mono font-black text-sm">
                  082218937297
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 mt-2 font-bold flex items-start gap-1">
                <span>⚠️</span> Atas Nama: Admin / Sesuai Nomor Terdaftar.
              </p>
            </div>
          </div>
        </div>

        {/* TABEL ITEM / LAYANAN */}
        <div className="my-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider bg-gray-50">
                <th className="py-3 px-3 rounded-tl-lg">
                  Deskripsi Layanan / Produk
                </th>
                <th className="py-3 px-3">Skema Lisensi</th>
                <th className="py-3 px-3 text-right rounded-tr-lg">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-3">
                  <div className="font-bold text-gray-900 text-sm">
                    {service}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed max-w-xs">
                    Setup server Vercel, optimasi Edge Config, database KV
                    terpusat, dan garansi maintenance sistem.
                  </div>
                </td>
                <td className="py-4 px-3 font-semibold text-gray-700">
                  <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200 text-[10px]">
                    {plan}
                  </span>
                </td>
                <td className="py-4 px-3 text-right font-black text-gray-900 text-sm">
                  {price}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* TOTAL PERHITUNGAN */}
        <div className="border-t-2 border-gray-200 pt-5 flex justify-between items-center text-sm">
          <div className="text-[11px] text-gray-500 font-medium">
            *Harap simpan invoice ini sebagai bukti pemesanan yang sah.
          </div>
          <div className="text-right bg-gray-50 p-3 rounded-xl border border-gray-100">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
              Total Akhir:
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {price}
            </span>
          </div>
        </div>

        {/* TOMBOL AKSI (SEMBUNYI SAAT DICETAK PDF) */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
          <button
            onClick={() => window.history.back()}
            className="text-xs font-bold text-gray-400 hover:text-gray-900 transition flex items-center gap-1 w-full sm:w-auto justify-center"
          >
            ⬅ Kembali
          </button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Tombol Print/Download PDF */}
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-gray-900 hover:bg-black text-white shadow-lg transition flex items-center justify-center gap-2"
            >
              🖨️ Cetak / Simpan PDF
            </button>

            {/* Tombol Konfirmasi WhatsApp */}
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2 animate-bounce"
            >
              💬 Konfirmasi Pembayaran
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-bold text-sm text-gray-500">
          Memuat Invoice Resmi...
        </div>
      }
    >
      <InvoiceContent />
    </Suspense>
  );
}
