import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import fontData from "./fonts/Montserrat-Bold.ttf";
import hexToRGB from "./hex-to-rgb.js";
import getForegroundColor from "./get-foreground-color.js";
import { createFontMetrics } from "./font-metrics.js";
import { layoutText, LINE_HEIGHT } from "./layout-text.js";

// Uncached renders cost ~50ms of CPU at 1920x1080 and grow with pixel count;
// this cap keeps worst-case CPU and memory bounded.
export const MAX_DIMENSION = 2000;
// Bounds layout and rendering work for user-supplied text (counted in characters).
export const MAX_TEXT_LENGTH = 200;
// Bump whenever rendered output changes (font, layout constants, drawing), so
// edge-cached images from the previous version are not served.
export const RENDER_VERSION = 1;
export const DEFAULT_COLOR = "ff00b3";
export const DEFAULT_TEXT = "${width} x ${height}";
const FONT_FAMILY = "Montserrat";
const fontBuffer = new Uint8Array(fontData);
const fontMetrics = createFontMetrics(fontBuffer);

// The resvg WASM module must be initialized before any image is composed (the
// font bytes are bundled, so they're already in memory). This runs once per
// Worker instance; later requests await an already-settled promise.
let ready;
const ensureReady = () =>
  (ready ??= initWasm(resvgWasm).catch((err) => {
    ready = undefined;
    throw err;
  }));

const escapeXML = (str) =>
  str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );

// Characters that are illegal in XML 1.0 (C0 controls other than tab/LF/CR,
// U+FFFE/U+FFFF, and unpaired surrogates). Removed rather than rejected.
const XML_ILLEGAL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]|\p{Cs}/gu;

const parseDimension = (value, name) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > MAX_DIMENSION) {
    throw new Error(
      `Invalid ${name} "${value}". Must be a whole number from 1 to ${MAX_DIMENSION}.`,
    );
  }
  return n;
};

/**
 * Validates and normalizes image options. Equivalent requests (e.g. "0600" vs
 * "600", "B4D455" vs "b4d455") normalize to the same values.
 *
 * @throws {Error} with a user-facing message if an option is invalid.
 */
export const normalizeOptions = ({
  width = 640,
  height = 480,
  color = DEFAULT_COLOR,
  text,
} = {}) => {
  const w = parseDimension(width, "width");
  const h = parseDimension(height, "height");
  hexToRGB(color);
  if (text != null && [...text].length > MAX_TEXT_LENGTH) {
    throw new Error(
      `Text is too long. Must be at most ${MAX_TEXT_LENGTH} characters.`,
    );
  }
  return {
    width: w,
    height: h,
    color: color.toLowerCase(),
    text: text ?? null,
  };
};

// Removes characters the font has no glyph for (e.g. CJK, emoji), which would
// otherwise render as nothing but still take up space in the layout.
// Whitespace is kept because layout uses it to split words.
const dropUnsupported = (str) =>
  Array.from(str)
    .filter((ch) => /\s/.test(ch) || fontMetrics.hasGlyph(ch.codePointAt(0)))
    .join("");

/**
 * Creates a PNG image with the provided dimensions, color, and text. Output
 * is exactly width x height pixels (1:1 with the requested size). Text wraps
 * and shrinks to fit, centered, with padding on every side.
 *
 * @param {Object} options - already validated by `normalizeOptions`.
 * @param {Number} options.width - width of the image.
 * @param {Number} options.height - height of the image.
 * @param {String} options.color - lowercase six-digit hex color, no hash symbol.
 * @param {String|null} options.text - text to display on the image, or null for
 *   the default. `${width}` and `${height}` are replaced with the dimensions.
 *
 * @returns {Promise<Uint8Array>} the PNG bytes.
 */
export const createImage = async ({ width: w, height: h, color, text }) => {
  const fill = getForegroundColor(hexToRGB(color));
  const label = dropUnsupported(
    (text ?? DEFAULT_TEXT)
      .replaceAll("${width}", w)
      .replaceAll("${height}", h)
      .replace(XML_ILLEGAL, ""),
  );

  const { fontSize, lines } = layoutText(label, w, h, fontMetrics.measure);
  const lineHeight = fontSize * LINE_HEIGHT;
  const firstLineY = h / 2 - ((lines.length - 1) * lineHeight) / 2;
  const textElements = lines
    .map(
      (line, i) =>
        `<text x="${w / 2}" y="${firstLineY + i * lineHeight}">${escapeXML(line)}</text>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#${color}"/>
  <g fill="${fill}" font-family="${FONT_FAMILY}" font-weight="700" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${textElements}</g>
</svg>`;

  await ensureReady();

  const resvg = new Resvg(svg, {
    fitTo: { mode: "original" },
    font: {
      fontBuffers: [fontBuffer],
      loadSystemFonts: false,
      defaultFontFamily: FONT_FAMILY,
    },
  });
  try {
    const rendered = resvg.render();
    try {
      return rendered.asPng();
    } finally {
      rendered.free();
    }
  } finally {
    resvg.free();
  }
};
