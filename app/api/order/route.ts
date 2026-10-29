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
    } = body;

    // 1. Simpan Data Klien ke Vercel KV
    const newClientData = {
      id: invoiceId, // Pakai No. Invoice dari URL sebagai ID Klien
      companyName: companyName !== "-" ? companyName : clientName,
      picName: clientName,
      whatsapp: whatsapp,
      planType: planType,
      dueDate: planType === "Permanen" ? "Lifetime" : "Menunggu Pembayaran",
      isActive: false, // Ditangguhkan sampai Admin klik ON setelah dibayar
      createdAt: new Date().toISOString(),
    };

    // Ambil data array klien lama, tambahkan yang baru, lalu simpan kembali
    const existingClients: any[] = (await kv.get("clients_list")) || [];

    // Cek agar tidak duplikat (kalau user refresh cepat)
    const isDuplicate = existingClients.some((c) => c.id === invoiceId);
    if (!isDuplicate) {
      await kv.set("clients_list", [newClientData, ...existingClients]);
    }

    // 2. Notifikasi ke Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId && !isDuplicate) {
      const message = `🧾 *PESANAN BARU + INVOICE DIBUKA!* 🧾
━━━━━━━━━━━━━━━━━━
📄 *No. Invoice:* \`${invoiceId}\`
👤 *Nama PIC:* ${clientName}
🏢 *Perusahaan:* ${companyName}
📧 *Gmail:* \`${gmail}\`
📱 *WhatsApp:* https://wa.me/${whatsapp.replace(/^0/, "62")} (${whatsapp})
📦 *Layanan:* ${category}
💰 *Total Tagihan:* ${price}
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
