import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const R2_CONFIGURED = !!(
  process.env.CLOUDFLARE_R2_ENDPOINT &&
  process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
  process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    if (R2_CONFIGURED) {
      const { uploadToR2 } = await import("@/lib/r2");
      const url = await uploadToR2(file, `profile-photos/${user.id}`);
      return NextResponse.json({ url });
    }

    const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
    const path = `${user.id}/photo.${ext}`;
    const { error } = await supabase.storage
      .from("profile-photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
