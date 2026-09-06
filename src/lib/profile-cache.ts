const DB_NAME = "karmic-cache";
const STORE = "profiles";
const TTL = 10 * 60 * 1000; // 10 minutes

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedProfile(id: string): Promise<any | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => {
        const entry = req.result;
        if (entry && Date.now() - entry.ts < TTL) resolve(entry.data);
        else resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

export async function cacheProfile(id: string, data: any): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ data, ts: Date.now() }, id);
  } catch {}
}

export async function cacheProfiles(profiles: any[]): Promise<void> {
  for (const p of profiles) {
    if (p?.id) await cacheProfile(p.id, p);
  }
}
