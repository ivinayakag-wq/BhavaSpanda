import { NextRequest, NextResponse } from "next/server";
import { getProfileById } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const profile = await getProfileById(id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ profile }, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
