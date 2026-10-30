"use client";

import { useSearchParams, useParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";

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
  const plan = searchParams.get("plan") || "Bulanan";
  const price = searchParams.get("price") || "Menyesuaikan";
  const desc = searchParams.get("desc") || "-";
  const paymentMethod = searchParams.get("payment") || "BCA";
  const isNewOrder = searchParams.get("action") === "new-order";

  const [status, setStatus] = useState("MENUNGGU PEMBAYARAN");
  const [date, setDate] = useState("");

  // State untuk mengontrol kemunculan Modal Pop-up QRIS Besar
  const [showQrisModal, setShowQrisModal] = useState(false);

  useEffect(() => {
    setDate(new Date().toLocaleDateString("id-ID", { dateStyle: "long" }));
  }, []);

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
              paymentMethod,
            }),
          });
          window.history.replaceState(
            null,
            "",
            `/invoice/${invoiceId}?client=${encodeURIComponent(clientName)}&company=${encodeURIComponent(companyName)}&gmail=${encodeURIComponent(gmail)}&wa=${encodeURIComponent(whatsapp)}&service=${encodeURIComponent(service)}&plan=${encodeURIComponent(plan)}&price=${encodeURIComponent(price)}&payment=${encodeURIComponent(paymentMethod)}`,
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
    paymentMethod,
  ]);

  // URL WhatsApp untuk konfirmasi otomatis
  const waAdmin = "082218937297"; // Nomor WA Admin Lu
  const waMessage = `Halo Admin, saya ingin mengonfirmasi pembayaran untuk:\n\n📄 *No. Invoice:* ${invoiceId}\n🏢 *Atas Nama:* ${clientName} (${companyName})\n📦 *Layanan:* ${service}\n💳 *Paket:* ${plan}\n🏦 *Via:* ${paymentMethod}\n💰 *Total:* ${price}\n\nBerikut saya lampirkan bukti transfernya. Terima kasih.`;
  const waLink = `https://wa.me/${waAdmin.replace(/^0/, "62")}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center text-gray-800 font-sans print:p-0 print:bg-white relative">
      {/* ------------------------------------------------------------- */}
      {/* MODAL POP-UP QRIS BESAR (Hanya tampil jika showQrisModal = true) */}
      {/* ------------------------------------------------------------- */}
      {showQrisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="bg-emerald-500 p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Scan QRIS</h3>
              <button
                onClick={() => setShowQrisModal(false)}
                className="text-white hover:text-emerald-200 text-2xl leading-none font-bold transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Body Modal - Gambar Besar */}
            <div className="p-6 flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-4 text-center">
                Gunakan aplikasi E-Wallet atau M-Banking Anda untuk melakukan
                scan barcode di bawah ini.
              </p>

              <div className="relative w-full max-w-[300px] aspect-square rounded-xl overflow-hidden border-2 border-emerald-100 shadow-inner p-2 bg-gray-50">
                <Image
                  src="/qris-image.jpg"
                  alt="QRIS Pembayaran Besar"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="mt-5 text-center">
                <p className="text-xs text-gray-500 font-medium">
                  Terdaftar atas nama:
                </p>
                <p className="text-lg font-black text-emerald-700">
                  Anysale - Art
                </p>
                <p className="text-xs text-gray-500 font-bold mt-2">
                  NMID: ID1026541959148
                </p>
              </div>

              <button
                onClick={() => setShowQrisModal(false)}
                className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
              >
                Tutup QRIS
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------- */}

      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200 print:shadow-none print:border-none print:rounded-none">
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
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col h-full">
            <h3 className="font-bold text-gray-900 mb-3 uppercase tracking-wider text-[11px] text-gray-400 border-b border-gray-200 pb-2">
              Ditagihkan Kepada:
            </h3>
            <div className="space-y-1 flex-grow">
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

          {/* Box Kanan: Instruksi Pembayaran ATAU Tombol Modal QRIS */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -z-0"></div>

            <div className="relative z-10 flex-grow flex flex-col justify-center">
              <h3 className="font-bold text-emerald-900 mb-3 uppercase tracking-wider text-[11px] border-b border-emerald-200 pb-2">
                💳 Instruksi Pembayaran:
              </h3>

              {paymentMethod === "QRIS" ? (
                // TAMPILAN KHUSUS UNTUK METODE QRIS (TOMBOL MUNCULKAN POP-UP BESAR)
                <div className="flex flex-col justify-center pt-2 h-full">
                  <p className="text-[11px] text-emerald-800 font-medium mb-3">
                    Metode terpilih:{" "}
                    <span className="font-black">QRIS Nasional</span>
                  </p>

                  {/* Tombol Klik untuk memunculkan Modal */}
                  <button
                    onClick={() => setShowQrisModal(true)}
                    className="w-full bg-white hover:bg-emerald-50 text-emerald-700 p-4 rounded-xl border-2 border-emerald-300 border-dashed shadow-sm transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      📱
                    </span>
                    <span className="font-bold text-sm">
                      Klik untuk menampilkan QR Code
                    </span>
                    <span className="text-[10px] text-emerald-500">
                      Popup akan muncul di tengah layar
                    </span>
                  </button>
                </div>
              ) : (
                // TAMPILAN UNTUK TRANSFER BANK ATAU E-WALLET (TEKS SAJA)
                <div className="space-y-2.5 text-gray-700 font-medium mt-2">
                  {/* TRANSFER BANK */}
                  {paymentMethod === "BCA" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-blue-800">BCA</span>
                      <span className="font-mono font-black text-sm">
                        4110946908
                      </span>
                    </div>
                  )}
                  {paymentMethod === "BNI" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-orange-600">BNI</span>
                      <span className="font-mono font-black text-sm">
                        0526399697
                      </span>
                    </div>
                  )}
                  {paymentMethod === "Jago" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-yellow-600">
                        Bank Jago
                      </span>
                      <span className="font-mono font-black text-sm">
                        108150428438
                      </span>
                    </div>
                  )}
                  {paymentMethod === "Seabank" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-orange-500">Seabank</span>
                      <span className="font-mono font-black text-sm">
                        901064926534
                      </span>
                    </div>
                  )}

                  {/* E-WALLET */}
                  {paymentMethod === "DANA" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-blue-500">DANA</span>
                      <span className="font-mono font-black text-sm">
                        082218937297
                      </span>
                    </div>
                  )}
                  {paymentMethod === "ShopeePay" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-orange-500">
                        ShopeePay
                      </span>
                      <span className="font-mono font-black text-sm">
                        082218937297
                      </span>
                    </div>
                  )}
                  {paymentMethod === "GoPay" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-sky-500">GoPay</span>
                      <span className="font-mono font-black text-sm">
                        082218937297
                      </span>
                    </div>
                  )}
                  {paymentMethod === "OVO" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-purple-600">OVO</span>
                      <span className="font-mono font-black text-sm">
                        082218937297
                      </span>
                    </div>
                  )}
                  {paymentMethod === "LinkAja" && (
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-emerald-100 shadow-sm">
                      <span className="font-bold text-red-600">LinkAja</span>
                      <span className="font-mono font-black text-sm">
                        082218937297
                      </span>
                    </div>
                  )}

                  <p className="text-[10px] text-emerald-700 mt-3 font-bold flex items-start gap-1">
                    <span>⚠️</span> Atas Nama: Admin / Sesuai Nomor. Harap
                    transfer sesuai tagihan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABEL ITEM / LAYANAN */}
        <div className="my-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider bg-gray-50">
                <th className="py-3 px-3 rounded-tl-lg w-1/2">
                  Deskripsi Layanan / Produk
                </th>
                <th className="py-3 px-3">Skema Lisensi & Aplikasi</th>
                <th className="py-3 px-3 text-right rounded-tr-lg">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-3">
                  <div className="font-bold text-gray-900 text-sm">
                    {service}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed">
                    Setup server, aktivasi sistem, dan layanan cloud sesuai
                    paket berlangganan.
                  </div>
                </td>
                <td className="py-4 px-3">
                  <span className="bg-gray-100 px-2.5 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 block text-center shadow-sm">
                    {plan} <span className="text-gray-400 mx-1">|</span>{" "}
                    <span className="text-emerald-600">{service}</span>
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
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-gray-900 hover:bg-black text-white shadow-lg transition flex items-center justify-center gap-2"
            >
              🖨️ Cetak / Simpan PDF
            </button>

            {/* DIKEMBALIKAN KE TOMBOL KONFIRMASI WA */}
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
