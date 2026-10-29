import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Ambil daftar klien untuk ditampilkan di tabel Admin
export async function GET() {
  try {
    const clients = (await kv.get("clients_list")) || [];
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error("Error get clients:", error);
    return NextResponse.json({ success: false, clients: [] });
  }
}

// POST: Toggle Status ON/OFF dan Tambah Klien Manual
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const clients: any[] = (await kv.get("clients_list")) || [];

    if (body.action === "toggle") {
      // Update status isActive
      const updatedClients = clients.map((c) =>
        c.id === body.id ? { ...c, isActive: body.isActive } : c,
      );
      await kv.set("clients_list", updatedClients);
      return NextResponse.json({ success: true, clients: updatedClients });
    } else if (body.action === "add") {
      // Tambah klien baru secara manual dari Admin
      const newClients = [body.client, ...clients];
      await kv.set("clients_list", newClients);
      return NextResponse.json({ success: true, clients: newClients });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error update client:", error);
    return NextResponse.json(
      { success: false, error: "Gagal update status" },
      { status: 500 },
    );
  }
}
