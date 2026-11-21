import {
  createImage,
  normalizeOptions,
  RENDER_VERSION,
} from "./create-image.js";

const IMAGE_ROUTE = /^\/(\d+)\/(\d+)(?:\/([^/]+))?\/?$/;
const CORS = { "Access-Control-Allow-Origin": "*" };

const textResponse = (message, status) =>
  new Response(message, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", ...CORS },
  });

// Browsers keep images for a day; the edge cache keeps them for a year. Edge
// entries are keyed by RENDER_VERSION, so a deploy that changes rendering
// stops serving old images at the edge, and browsers pick them up within a day.
const CACHE_CONTROL = "public, max-age=86400, s-maxage=31536000";

// Builds the cache key from the normalized options only, so unknown query
// params or equivalent spellings ("0600", "B4D455") can't bypass the cache.
const cacheKeyFor = (origin, { width, height, color, text }) => {
  const key = new URL(`/${width}/${height}/${color}`, origin);
  key.searchParams.set("v", RENDER_VERSION);
  if (text !== null) key.searchParams.set("text", text);
  return new Request(key, { method: "GET" });
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const match = url.pathname.match(IMAGE_ROUTE);

    if (!match || !["GET", "HEAD"].includes(request.method)) {
      return env.ASSETS.fetch(request);
    }

    const [, width, height, color] = match;
    let options;
    try {
      options = normalizeOptions({
        width,
        height,
        color,
        text: url.searchParams.get("text") ?? undefined,
      });
    } catch (err) {
      return textResponse(err.message, 400);
    }

    // The Cache API only stores GET requests, so the key is always a GET.
    // HEAD requests read and write that same entry.
    const cache = caches.default;
    const cacheKey = cacheKeyFor(url.origin, options);
    const cached = await cache.match(cacheKey);
    if (cached) {
      return request.method === "HEAD" ? new Response(null, cached) : cached;
    }

    let image;
    try {
      image = await createImage(options);
    } catch (err) {
      console.error(err);
      return textResponse("Sorry, the image could not be rendered.", 500);
    }

    const headers = {
      "Content-Type": "image/png",
      "Cache-Control": CACHE_CONTROL,
      ...CORS,
    };
    ctx.waitUntil(cache.put(cacheKey, new Response(image, { headers })));
    return new Response(request.method === "HEAD" ? null : image, { headers });
  },
};
