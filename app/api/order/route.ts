import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      invoiceId,
      clientName,
      companyName,
      gmail,
      whatsapp,
      category,
      description,
      price,
      planType,
      paymentMethod,
    } = body;

    // 1. Ambil data klien yang sudah ada (untuk mengecek duplikasi)
    const existingClients: any[] = (await kv.get("clients_list")) || [];

    // SATPAM ANTI-DOBEL: Cek apakah invoiceId ini sudah pernah masuk sebelumnya
    const isDuplicate = existingClients.some((c) => c.id === invoiceId);

    // JIKA INVOICE SUDAH ADA, LANGSUNG HENTIKAN PROSES DI SINI (Jangan kirim Telegram lagi)
    if (isDuplicate) {
      return NextResponse.json({
        success: true,
        message: "Pesanan sudah tercatat sebelumnya.",
        invoiceId,
      });
    }

    // 2. Jika aman (belum ada), Simpan Data Klien Baru ke Vercel KV
    const newClientData = {
      id: invoiceId,
      companyName: companyName !== "-" ? companyName : clientName,
      picName: clientName,
      whatsapp: whatsapp,
      planType: planType,
      category: category, // <-- TAMBAHAN: Menyimpan nama layanan/aplikasi yang diorder
      dueDate: planType === "Permanen" ? "Lifetime" : "Menunggu Pembayaran",
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    // Masukkan data baru ke urutan paling atas
    await kv.set("clients_list", [newClientData, ...existingClients]);

    // 3. Notifikasi ke Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const message = `🧾 *PESANAN BARU + INVOICE DIBUKA!* 🧾
━━━━━━━━━━━━━━━━━━
📄 *No. Invoice:* \`${invoiceId}\`
👤 *Nama PIC:* ${clientName}
🏢 *Perusahaan:* ${companyName}
📧 *Gmail:* \`${gmail}\`
📱 *WhatsApp:* https://wa.me/${whatsapp.replace(/^0/, "62")} (${whatsapp})
📦 *Layanan:* ${category}
💰 *Total Tagihan:* ${price}
💳 *Metode Pembayaran:* ${paymentMethod || "Tidak Dipilih"}
📝 *Catatan:* ${description}
━━━━━━━━━━━━━━━━━━
⏰ *Waktu:* ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }).catch((err) => console.error("Gagal kirim Telegram:", err));
    }

    return NextResponse.json({ success: true, invoiceId });
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}

// Cari bagian penyusunan data klien untuk Vercel KV di app/api/order/route.ts
const newClientEntry = {
  id: invoiceId,
  companyName: companyName && companyName !== "-" ? companyName : clientName,
  picName: clientName,
  whatsapp: whatsapp,
  planType: planType || "Bulanan",
  category: category || service || "QR Absensi", // <-- WAJIB TAMBAHKAN BARIS INI
  dueDate: "Menunggu Pembayaran",
  isActive: false,
  createdAt: new Date().toISOString(),
};
