import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { appName, isMaintenance } = await req.json();

    // Cocokkan key dengan yang ada di Vercel Edge Config
    const key =
      appName === "Toko Roti Amira" ? "maintenance_amira" : "maintenance_qr";

    // Update data di Vercel Edge Config via API
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              operation: "update",
              key: key,
              value: isMaintenance,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(errorData);
      throw new Error("Gagal update Vercel Edge Config");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
