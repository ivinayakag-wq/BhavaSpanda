import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET!;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

export async function uploadToR2(file: Blob, path: string): Promise<string> {
  const ext = file.type === "image/webp" ? "webp" : file.type === "image/png" ? "png" : "jpg";
  const key = `${path}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await r2.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    CacheControl: "public, max-age=31536000, immutable",
  }));

  return `${PUBLIC_URL}/${key}`;
}
