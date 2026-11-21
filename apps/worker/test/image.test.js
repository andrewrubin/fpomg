import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";
import {
  createImage as render,
  MAX_DIMENSION,
  MAX_TEXT_LENGTH,
  normalizeOptions,
  RENDER_VERSION,
} from "../src/create-image.js";

// Validates like index.js does, then renders. Async so validation errors reject.
const createImage = async (options) => render(normalizeOptions(options));

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Width and height are big-endian uint32s at bytes 16-23 (inside the IHDR chunk).
const pngSize = (bytes) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};

describe("createImage", () => {
  it("renders a PNG at exactly the requested size", async () => {
    const png = await createImage({ width: "600", height: "400" });
    expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
    expect(pngSize(png)).toEqual({ width: 600, height: 400 });
  });

  it("escapes XML in the text", async () => {
    const png = await createImage({ width: 200, height: 100, text: '<a & "b">' });
    expect(pngSize(png)).toEqual({ width: 200, height: 100 });
  });

  it("strips characters that are illegal in XML instead of failing", async () => {
    const png = await createImage({ width: 200, height: 100, text: "a\u0001b￿\uD800c" });
    expect(pngSize(png)).toEqual({ width: 200, height: 100 });
  });

  it("accepts text at the length limit, counting characters not UTF-16 units", async () => {
    const png = await createImage({ width: 300, height: 300, text: "é".repeat(MAX_TEXT_LENGTH) });
    expect(pngSize(png)).toEqual({ width: 300, height: 300 });
    expect(() => normalizeOptions({ text: "🎅".repeat(MAX_TEXT_LENGTH) })).not.toThrow();
  });

  it("renders text made only of characters the font lacks", async () => {
    const png = await createImage({ width: 300, height: 100, text: "你好 🎅" });
    expect(pngSize(png)).toEqual({ width: 300, height: 100 });
  });

  it("renders wrapped text and tiny images", async () => {
    const long = await createImage({ width: 300, height: 300, text: "a much longer line of text that wraps" });
    expect(pngSize(long)).toEqual({ width: 300, height: 300 });
    expect(pngSize(await createImage({ width: 1, height: 1 }))).toEqual({ width: 1, height: 1 });
  });

  it.each([
    [{ width: 0, height: 100 }, /Invalid width/],
    [{ width: 100, height: MAX_DIMENSION + 1 }, /Invalid height/],
    [{ width: "1.5", height: 100 }, /Invalid width/],
    [{ width: 100, height: 100, color: "nothex" }, /six-digit hex/],
    [{ width: 100, height: 100, text: "x".repeat(MAX_TEXT_LENGTH + 1) }, /too long/],
  ])("rejects %o", async (options, message) => {
    await expect(createImage(options)).rejects.toThrow(message);
  });
});

describe("fetch handler", () => {
  const get = (path, init) => exports.default.fetch(`https://fpomg.test${path}`, init);

  it("serves images with long-lived cache and CORS headers", async () => {
    const res = await get("/600/400/b4d455?text=hello");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=86400, s-maxage=31536000");
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(pngSize(new Uint8Array(await res.arrayBuffer()))).toEqual({ width: 600, height: 400 });
  });

  it("answers HEAD requests without a body and caches the image for later GETs", async () => {
    const head = await get("/321/123/abcdef", { method: "HEAD" });
    expect(head.status).toBe(200);
    expect(head.headers.get("Content-Type")).toBe("image/png");
    expect((await head.arrayBuffer()).byteLength).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 50)); // let the cache write finish
    const cached = await caches.default.match(`https://fpomg.test/321/123/abcdef?v=${RENDER_VERSION}`);
    expect(cached?.status).toBe(200);

    // A HEAD that hits the cache also returns no body.
    const headHit = await get("/321/123/abcdef", { method: "HEAD" });
    expect(headHit.status).toBe(200);
    expect((await headHit.arrayBuffer()).byteLength).toBe(0);
  });

  it("ignores unknown query params and equivalent spellings in the cache key", async () => {
    await (await get("/0400/300/ABCDEF?text=hi&junk=1")).arrayBuffer();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const cached = await caches.default.match(`https://fpomg.test/400/300/abcdef?v=${RENDER_VERSION}&text=hi`);
    expect(cached?.status).toBe(200);
  });

  it("returns 400 with a readable, cross-origin message for bad input", async () => {
    const res = await get("/600/400/zzzzzz");
    expect(res.status).toBe(400);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(await res.text()).toMatch(/six-digit hex/);
  });

  it("rejects sizes above the cap", async () => {
    const res = await get(`/${MAX_DIMENSION + 1}/100`);
    expect(res.status).toBe(400);
    expect(await res.text()).toMatch(/Invalid width/);
  });
});
