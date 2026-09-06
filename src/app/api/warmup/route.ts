import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  await prisma.profile.count();
  return NextResponse.json({ ok: true });
}
