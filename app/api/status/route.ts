import { NextResponse } from "next/server";

// Opsi nuklir untuk mematikan semua jenis cache di Next.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const url = `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Menangkap detail error dari Vercel kalau token/ID salah
      const errText = await response.text();
      console.error("❌ Vercel API Error:", errText);
      throw new Error("Gagal fetch dari Vercel");
    }

    const data = await response.json();

    // Ini bakal muncul di terminal VS Code lu, bukan di browser!
    console.log("✅ Data Vercel API:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Backend Error:", error);
    // Kita kirim response error ke UI, BUKAN ngembaliin nilai false
    return NextResponse.json(
      { success: false, error: "Gagal memuat data" },
      { status: 500 },
    );
  }
}
