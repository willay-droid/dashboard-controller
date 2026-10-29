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

// 2. Middleware Proteksi /admin & /api/toggle
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewatkan request jika membuka halaman landing, API order, file static, atau aset gambar
  if (
    pathname === "/" ||
    pathname.startsWith("/api/order") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const secret = process.env.OTP_SECRET || "RahasiaSuperKomandan123";
  const expectedOTP = await generateTimeBasedOTP(secret);

  const basicAuth = req.headers.get("authorization");

  // Jika user memasukkan kredensial di popup browser
  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const decodedValue = atob(authValue);
    const [, pwd] = decodedValue.split(":");

    // Validasi: Password harus sama persis dengan OTP
    if (pwd === expectedOTP) {
      return NextResponse.next(); // Lolos, izinkan masuk ke /admin
    }
  }

  // 3. JIKA BELUM LOGIN ATAU OTP SALAH
  if (!basicAuth) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Tembak OTP ke Telegram saat /admin diakses
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

  // Tahan akses dengan pop-up login browser
  return new NextResponse("Akses Ditolak: OTP salah atau kedaluwarsa.", {
    status: 401,
    headers: {
      "WWW-Authenticate":
        'Basic realm="Masukkan username sembarang, dan OTP Telegram di kolom password"',
    },
  });
}

// 4. HANYA KUNCI /admin DAN /api/toggle
export const config = {
  matcher: ["/admin/:path*", "/api/toggle"],
};
