import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

let _r2: S3Client | null = null;

function getR2(): S3Client {
  if (_r2) return _r2;
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 credentials not configured");
  }
  _r2 = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _r2;
}

export async function uploadToR2(file: Blob, path: string): Promise<string> {
  const r2 = getR2();
  const bucket = process.env.CLOUDFLARE_R2_BUCKET;
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
  if (!bucket || !publicUrl) throw new Error("Cloudflare R2 bucket config not set");

  const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
  const key = `${path}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  return `${publicUrl}/${key}`;
}
