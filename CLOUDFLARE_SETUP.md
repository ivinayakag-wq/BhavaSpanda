# Cloudflare Setup Guide

## Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Create free account

## Step 2: Create R2 Bucket (for images)

1. Go to **R2 Object Storage** in Cloudflare dashboard
2. Click **Create bucket**
3. Name: `karmic-photos`
4. Location: Auto
5. Click **Create bucket**

### Configure Public Access

1. Go to **Settings** → **Public Access**
2. Enable **r2.dev** subdomain (free)
3. Copy the public URL (e.g., `https://pub-xxx.r2.dev`)

### Generate API Tokens

1. Go to **Manage R2 API Tokens**
2. Click **Create API Token**
3. Permissions: **Object Read & Write**
4. Scope: **Specific bucket** → `karmic-photos`
5. Click **Create API Token**
6. Copy:
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

## Step 3: Create Worker (for API caching)

1. Go to **Workers & Pages** in Cloudflare dashboard
2. Click **Create application** → **Create Worker**
3. Name: `karmic-cache`
4. Click **Deploy**
5. Go to **Settings** → **Variables**
6. Add environment variables:
   - `SUPABASE_URL` = `https://nnmoiqupracpyrsyxqxf.supabase.co`
   - `SUPABASE_ANON_KEY` = your anon key
   - `CACHE_TTL` = `120`

### Deploy Worker Code

```bash
cd worker
npm install
npx wrangler deploy
```

## Step 4: Update Environment Variables

Update `.env.local`:

```env
# Cloudflare R2
CLOUDFLARE_R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=<your_access_key>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<your_secret_key>
CLOUDFLARE_R2_BUCKET=karmic-photos
CLOUDFLARE_R2_PUBLIC_URL=https://pub-<HASH>.r2.dev

# Cloudflare Worker
NEXT_PUBLIC_CF_WORKER_URL=https://karmic-cache.<YOUR_SUBDOMAIN>.workers.dev
```

## Step 5: Restart Dev Server

```bash
npm run dev
```

## Verify

1. Upload a photo in profile edit
2. Check Cloudflare R2 dashboard → file should appear
3. Check photo URL → should be `r2.dev` domain
