import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { appName, isMaintenance } = await req.json();

    // 1. Tentukan kunci Edge Config berdasarkan nama aplikasi yang dikirim dari UI
    let edgeConfigKey = "";

    switch (appName) {
      case "Toko Roti Amira":
        edgeConfigKey = "maintenance_amira";
        break;
      case "QR Absensi":
        edgeConfigKey = "maintenance_qr";
        break;
      case "Monitoring Alker":
        edgeConfigKey = "maintenance_alker";
        break;
      case "Willy Portfolio":
        edgeConfigKey = "maintenance_portfolio";
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Aplikasi tidak dikenali" },
          { status: 400 },
        );
    }

    // 2. Siapkan payload update sesuai format Vercel Edge Config API
    const updatePayload = {
      items: [
        {
          operation: "update",
          key: edgeConfigKey,
          value: isMaintenance,
        },
      ],
    };

    // 3. Tembak API Vercel untuk mengubah status
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Vercel API Error:", errorData);
      throw new Error("Gagal update Edge Config di Vercel");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle API Error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
