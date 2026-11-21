// Breathing room on each side, as a fraction of the image width / height.
export const PADDING_X = 0.06;
export const PADDING_Y = 0.06;
export const LINE_HEIGHT = 1.2;
// Font size relative to image width, before shrinking to fit.
const BASE_SCALE = 0.08;
// Below this size, long words are broken mid-word instead of shrinking further.
const MIN_FONT_SIZE = 8;

/**
 * Greedily wraps words into lines no wider than maxWidth. Widths are tracked
 * incrementally from per-word widths measured at 1px, scaled by fontSize
 * (measurement is linear in font size and additive across strings).
 * Returns null if a word doesn't fit on its own line and breakWords is false.
 */
const wrap = (words, maxWidth, fontSize, measure, breakWords) => {
  const limit = maxWidth / fontSize; // compare in 1px units
  const space = measure(" ", 1);
  const lines = [];
  let line = "";
  let lineWidth = 0;

  for (const { text, width } of words) {
    if (line && lineWidth + space + width <= limit) {
      line += ` ${text}`;
      lineWidth += space + width;
      continue;
    }
    if (line) lines.push(line);
    if (width <= limit) {
      line = text;
      lineWidth = width;
      continue;
    }
    if (!breakWords) return null;
    // Break the word into chunks that fit (at least one character per line).
    line = "";
    lineWidth = 0;
    for (const ch of text) {
      const chWidth = measure(ch, 1);
      if (line && lineWidth + chWidth > limit) {
        lines.push(line);
        line = "";
        lineWidth = 0;
      }
      line += ch;
      lineWidth += chWidth;
    }
  }
  if (line) lines.push(line);
  return lines;
};

/**
 * Lays out text to fit centered inside a w x h image with padding: wraps on
 * whitespace and shrinks the font until the block of lines fits.
 *
 * @param {String} text
 * @param {Number} w - image width.
 * @param {Number} h - image height.
 * @param {Function} measure - (text, fontSize) => width in pixels; must be
 *   linear in fontSize and additive across concatenated strings.
 * @returns {{ fontSize: Number, lines: String[] }}
 */
export const layoutText = (text, w, h, measure) => {
  const words = text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ text: word, width: measure(word, 1) }));
  const maxWidth = w * (1 - 2 * PADDING_X);
  const maxHeight = h * (1 - 2 * PADDING_Y);
  const blockHeight = (lines, fontSize) => lines.length * fontSize * LINE_HEIGHT;

  let fontSize = Math.max(1, Math.round(w * BASE_SCALE));
  const minFontSize = Math.min(fontSize, MIN_FONT_SIZE);

  for (;;) {
    const lines = wrap(words, maxWidth, fontSize, measure, false);
    if (lines && blockHeight(lines, fontSize) <= maxHeight) return { fontSize, lines };
    if (fontSize <= minFontSize) break;
    fontSize = Math.max(minFontSize, Math.min(fontSize - 1, Math.floor(fontSize * 0.9)));
  }

  // Doesn't fit even at the minimum size: break long words. The result may still
  // be taller than the image, in which case the overflow is clipped.
  return { fontSize, lines: wrap(words, maxWidth, fontSize, measure, true) };
};
