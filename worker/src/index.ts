export interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  CACHE_TTL: string;
  R2_BUCKET: R2Bucket;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Profile photos → R2
    if (path.startsWith("/photos/")) {
      return this.handlePhoto(request, env, path);
    }

    // API cache proxy
    if (path.startsWith("/api/")) {
      return this.handleAPI(request, env, path);
    }

    return new Response("Karmic Cache Worker", { headers: CORS_HEADERS });
  },

  async handlePhoto(request: Request, env: Env, path: string): Promise<Response> {
    const key = path.replace("/photos/", "");
    const object = await env.R2_BUCKET.get(key);

    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers(CORS_HEADERS);
    headers.set("Content-Type", object.httpMetadata?.contentType || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    headers.set("ETag", object.httpEtag);

    return new Response(object.body, { headers });
  },

  async handleAPI(request: Request, env: Env, path: string): Promise<Response> {
    const cacheKey = new URL(request.url).searchParams.toString()
      ? `${path}?${new URL(request.url).searchParams}`
      : path;

    // Check cache
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) {
      const response = new Response(cached.body, cached);
      response.headers.set("X-Cache", "HIT");
      return response;
    }

    // Fetch from Supabase
    const supabaseUrl = `${env.SUPABASE_URL}/rest/v1${path.replace("/api", "")}`;
    const res = await fetch(supabaseUrl, {
      headers: {
        "apikey": env.SUPABASE_ANON_KEY || "",
        "Authorization": request.headers.get("Authorization") || "",
        "Content-Type": "application/json",
      },
    });

    const response = new Response(res.body, {
      status: res.status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${env.CACHE_TTL || "120"}`,
        "X-Cache": "MISS",
      },
    });

    // Cache the response
    const ttl = parseInt(env.CACHE_TTL || "120");
    if (ttl > 0 && res.status === 200) {
      const responseToCache = new Response(response.body, response);
      responseToCache.headers.set("Cache-Control", `public, max-age=${ttl}`);
      await cache.put(cacheKey, responseToCache);
    }

    return response;
  },
};
