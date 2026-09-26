import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Fungsi Generator OTP (Berdasarkan Waktu - Valid 3 Menit)
async function generateTimeBasedOTP(secret: string) {
  const timeBlock = Math.floor(Date.now() / 180000);
  const data = new TextEncoder().encode(secret + timeBlock);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const number =
    (hashArray[0] << 24) |
    (hashArray[1] << 16) |
    (hashArray[2] << 8) |
    hashArray[3];
  const otp = Math.abs(number) % 1000000;
  return otp.toString().padStart(6, "0");
}

// 2. WAJIB ADA KATA "export" DI SINI
export async function middleware(req: NextRequest) {
  const secret = process.env.OTP_SECRET || "RahasiaSuperKomandan123";
  const expectedOTP = await generateTimeBasedOTP(secret);

  const basicAuth = req.headers.get("authorization");

  // Jika user sudah masukin sesuatu di popup browser
  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const decodedValue = atob(authValue);
    const [user, pwd] = decodedValue.split(":");

    // Validasi: Password harus sama dengan OTP
    if (pwd === expectedOTP) {
      return NextResponse.next(); // Lolos, izinkan masuk
    }
  }

  // 3. JIKA BELUM LOGIN ATAU OTP SALAH
  if (!basicAuth) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Tembak pesan ke Telegram
    if (botToken && chatId) {
      const message = `🔐 *Akses Central Command Terdeteksi*\n\nKode OTP Anda: \`${expectedOTP}\`\n\n_Gunakan kode ini di kolom password. Valid selama 3 menit._`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      }).catch((err) => console.error("Gagal kirim tele:", err));
    }
  }

  // Tahan pengunjung dengan popup login
  return new NextResponse("Akses Ditolak: OTP salah atau kedaluwarsa.", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="Masukkan username sembarang, dan OTP Telegram di kolom password"',
    },
  });
}

// 4. Konfigurasi file/halaman yang dikunci
export const config = {
  matcher: ["/", "/api/toggle"],
};
