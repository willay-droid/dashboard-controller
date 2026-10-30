import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

// 1. GET: Ambil semua data klien
export async function GET() {
  try {
    const clients = (await kv.get("clients_list")) || [];
    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error("Gagal mengambil data klien:", error);
    return NextResponse.json(
      { success: false, clients: [], error: "Gagal mengambil data" },
      { status: 500 },
    );
  }
}

// 2. POST: Tambah klien manual dari dashboard
export async function POST(req: Request) {
  try {
    const newClient = await req.json();
    const existingClients: any[] = (await kv.get("clients_list")) || [];

    const clientWithDate = {
      ...newClient,
      createdAt: newClient.createdAt || new Date().toISOString(),
    };

    await kv.set("clients_list", [clientWithDate, ...existingClients]);
    return NextResponse.json({ success: true, client: clientWithDate });
  } catch (error) {
    console.error("Gagal menambah klien:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah klien" },
      { status: 500 },
    );
  }
}

// 3. PATCH: Saklar Akses On/Off per pelanggan (Ini yang bikin error tadi kalau hilang)
export async function PATCH(req: Request) {
  try {
    const { id, isActive } = await req.json();
    const existingClients: any[] = (await kv.get("clients_list")) || [];

    const updatedClients = existingClients.map((client) =>
      client.id === id ? { ...client, isActive } : client,
    );

    await kv.set("clients_list", updatedClients);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gagal mengubah status saklar klien:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengubah status klien" },
      { status: 500 },
    );
  }
}

// 4. PUT: Edit / Update data lengkap pelanggan
export async function PUT(req: Request) {
  try {
    const updatedClient = await req.json();
    const existingClients: any[] = (await kv.get("clients_list")) || [];

    const updatedList = existingClients.map((client) =>
      client.id === updatedClient.id ? { ...client, ...updatedClient } : client,
    );

    await kv.set("clients_list", updatedList);
    return NextResponse.json({
      success: true,
      message: "Data klien berhasil diupdate!",
    });
  } catch (error) {
    console.error("Gagal update klien:", error);
    return NextResponse.json(
      { success: false, error: "Kesalahan Server" },
      { status: 500 },
    );
  }
}

// 5. DELETE: Hapus data pelanggan permanen
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID klien wajib dikirim." },
        { status: 400 },
      );
    }

    const existingClients: any[] = (await kv.get("clients_list")) || [];
    const updatedList = existingClients.filter((client) => client.id !== id);

    await kv.set("clients_list", updatedList);
    return NextResponse.json({
      success: true,
      message: "Klien berhasil dihapus permanen!",
    });
  } catch (error) {
    console.error("Gagal hapus klien:", error);
    return NextResponse.json(
      { success: false, error: "Kesalahan Server" },
      { status: 500 },
    );
  }
}
