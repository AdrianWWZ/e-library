import { supabase } from "../config/supabaseClient";

/*
  Works out how much storage the user's books take up, without needing a
  new database column:

  1. Ask for each file's size with a HEAD request on its public URL
     (no file data is downloaded).
  2. If that fails for some files, fall back to listing the storage bucket.

  Uploaded files never change (each has a unique timestamped name), so sizes
  are cached in localStorage and only looked up once per file.
*/

const CACHE_KEY = "elibrary-file-sizes";

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
};

const writeCache = (cache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore - cache is only an optimisation
  }
};

// Called after an upload, when we already know the size
export const rememberFileSize = (url, size) => {
  if (!url || !Number.isFinite(size)) return;
  const cache = readCache();
  cache[url] = size;
  writeCache(cache);
};

const headSize = async (url) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return null;
    const len = Number(res.headers.get("content-length"));
    return Number.isFinite(len) && len > 0 ? len : null;
  } catch {
    return null;
  }
};

// ".../storage/v1/object/public/Books/123-file.pdf" -> { bucket, name }
const parseStorageUrl = (url) => {
  const match = url
    .split("?")[0]
    .match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/,
    );
  if (!match) return null;
  return {
    bucket: decodeURIComponent(match[1]),
    name: decodeURIComponent(match[2]),
  };
};

const listBucketSizes = async (bucket) => {
  const sizes = {};
  const limit = 1000;
  for (let offset = 0; ; offset += limit) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list("", { limit, offset });
    if (error || !data) break;
    data.forEach((obj) => {
      if (obj.metadata?.size != null) sizes[obj.name] = obj.metadata.size;
    });
    if (data.length < limit) break;
  }
  return sizes;
};

// Run async jobs a few at a time so we don't fire 200 requests at once
const runLimited = async (items, worker, concurrency = 6) => {
  const queue = [...items];
  const runners = Array.from(
    { length: Math.min(concurrency, queue.length) },
    async () => {
      while (queue.length) await worker(queue.shift());
    },
  );
  await Promise.all(runners);
};

/**
 * @param {string[]} urls  file + cover URLs belonging to the user
 * @returns {Promise<{ used: number, unknown: number }>}
 */
export const getTotalStorageSize = async (urls) => {
  const cache = readCache();
  const unique = [...new Set(urls.filter(Boolean))];

  // 1. HEAD requests for anything we haven't measured yet
  const missing = unique.filter((u) => cache[u] == null);
  await runLimited(missing, async (url) => {
    const size = await headSize(url);
    if (size != null) cache[url] = size;
  });

  // 2. Fallback: list the bucket(s) for anything still unknown
  const stillMissing = unique.filter((u) => cache[u] == null);
  if (stillMissing.length) {
    const byBucket = {};
    stillMissing.forEach((url) => {
      const parsed = parseStorageUrl(url);
      if (parsed) (byBucket[parsed.bucket] ||= []).push({ url, ...parsed });
    });
    for (const [bucket, entries] of Object.entries(byBucket)) {
      const sizes = await listBucketSizes(bucket);
      entries.forEach(({ url, name }) => {
        if (sizes[name] != null) cache[url] = sizes[name];
      });
    }
  }

  // Keep the cache tidy: only remember files that still exist
  const pruned = {};
  unique.forEach((u) => {
    if (cache[u] != null) pruned[u] = cache[u];
  });
  writeCache(pruned);

  return {
    used: Object.values(pruned).reduce((sum, n) => sum + n, 0),
    unknown: unique.length - Object.keys(pruned).length,
  };
};
