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
      service,
      appName,
      description,
      price,
      planType,
      paymentMethod,
    } = body;

    // 1. Selaraskan nama produk/aplikasi dari parameter mana pun yang dikirim form/URL
    const productCategory = category || service || appName || "QR Absensi";

    // 2. Ambil data klien yang sudah ada di Vercel KV
    const existingClients: any[] = (await kv.get("clients_list")) || [];

    // 3. Cek apakah invoiceId ini sudah pernah masuk sebelumnya
    const existingIndex = existingClients.findIndex((c) => c.id === invoiceId);

    if (existingIndex !== -1) {
      // Jika sudah ada tapi nama produknya masih kosong atau masih default "QR Absensi",
      // perbarui nama produknya sesuai yang diorder tanpa mengirim ulang notif Telegram
      if (
        productCategory &&
        existingClients[existingIndex].category !== productCategory
      ) {
        existingClients[existingIndex].category = productCategory;
        await kv.set("clients_list", existingClients);
      }

      return NextResponse.json({
        success: true,
        message: "Pesanan sudah tercatat dan diselaraskan.",
        invoiceId,
      });
    }

    // 4. Jika belum ada, simpan data klien baru lengkap dengan nama produknya
    const newClientData = {
      id: invoiceId,
      companyName:
        companyName && companyName !== "-" ? companyName : clientName,
      picName: clientName,
      whatsapp: whatsapp,
      planType: planType || "Bulanan",
      category: productCategory, // <-- Menyimpan "E-Commerce & Smart POS Kasir" dll.
      dueDate: planType === "Permanen" ? "Lifetime" : "Menunggu Pembayaran",
      isActive: false,
      createdAt: new Date().toISOString(),
    };

    // Masukkan data baru ke urutan paling atas
    await kv.set("clients_list", [newClientData, ...existingClients]);

    // 5. Notifikasi ke Telegram
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
📦 *Layanan:* ${productCategory}
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
