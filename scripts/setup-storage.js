require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log("Creating storage bucket: profile-photos ...");

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === "profile-photos");

  if (!exists) {
    const { error } = await supabase.storage.createBucket("profile-photos", {
      public: true,
      fileSizeLimit: 200 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (error) {
      console.error("Failed to create bucket:", error.message);
      process.exit(1);
    }
    console.log("Bucket created successfully.");
  } else {
    console.log("Bucket already exists.");
  }

  console.log("Making bucket public ...");
  const { error: pubErr } = await supabase.storage.updateBucket("profile-photos", { public: true });
  if (pubErr) console.warn("Could not update bucket:", pubErr.message);

  console.log("Done.");
}

main().catch(e => { console.error(e); process.exit(1); });
