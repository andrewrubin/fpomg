import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";
import fontData from "../src/fonts/Montserrat-Bold.ttf";
import { beforeAll, describe, expect, it } from "vitest";
import { createFontMetrics } from "../src/font-metrics.js";
import {
  layoutText,
  LINE_HEIGHT,
  PADDING_X,
  PADDING_Y,
} from "../src/layout-text.js";

const font = new Uint8Array(fontData);
const { measure, hasGlyph } = createFontMetrics(font);

describe("font metrics", () => {
  beforeAll(() => initWasm(resvgWasm).catch(() => {})); // may already be initialized

  // Compare against resvg's own layout of the same text. Ignoring kerning
  // overestimates for these samples (kerning tightens pairs like "AV"), so
  // wrapping is a little early rather than overflowing into the padding.
  it.each([
    "600 x 400",
    "coming soon",
    "The quick brown fox jumps over the lazy dog",
    "WAVY AVATAR",
  ])("measures %j at or slightly above the rendered width", (text) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="200"><text x="0" y="100" font-family="Montserrat" font-weight="700" font-size="100">${text}</text></svg>`;
    const resvg = new Resvg(svg, {
      font: { fontBuffers: [font], loadSystemFonts: false },
    });
    const rendered = resvg.getBBox().width;
    resvg.free();
    const measured = measure(text, 100);
    expect(measured).toBeGreaterThanOrEqual(rendered);
    expect((measured - rendered) / rendered).toBeLessThan(0.05);
  });

  it("returns zero width for empty text", () => {
    expect(measure("", 50)).toBe(0);
  });

  it("is additive and linear in font size", () => {
    expect(measure("ab", 30)).toBeCloseTo(measure("a", 30) + measure("b", 30));
    expect(measure("hello", 40)).toBeCloseTo(measure("hello", 1) * 40);
  });

  it("knows which characters the font covers", () => {
    for (const ch of "Aaé€ж ") expect(hasGlyph(ch.codePointAt(0))).toBe(true);
    for (const ch of ["你", "🎅"])
      expect(hasGlyph(ch.codePointAt(0))).toBe(false);
  });
});

describe("layoutText", () => {
  const fitsInside = ({ fontSize, lines }, w, h) => {
    for (const line of lines)
      expect(measure(line, fontSize)).toBeLessThanOrEqual(
        w * (1 - 2 * PADDING_X),
      );
    expect(lines.length * fontSize * LINE_HEIGHT).toBeLessThanOrEqual(
      h * (1 - 2 * PADDING_Y),
    );
  };

  it("keeps short text on one line at the width-based size", () => {
    expect(layoutText("600 x 400", 600, 400, measure)).toEqual({
      fontSize: 48,
      lines: ["600 x 400"],
    });
  });

  it("wraps long text onto multiple lines without shrinking when it fits", () => {
    const text =
      "this placeholder has a lot of words that cannot fit on one line";
    const layout = layoutText(text, 600, 400, measure);
    expect(layout.fontSize).toBe(48);
    expect(layout.lines.length).toBeGreaterThan(1);
    expect(layout.lines.join(" ")).toBe(text);
    fitsInside(layout, 600, 400);
  });

  it("shrinks text to fit short, wide images", () => {
    const layout = layoutText("2000 x 40", 2000, 40, measure);
    expect(layout.lines).toEqual(["2000 x 40"]);
    fitsInside(layout, 2000, 40);
  });

  it("shrinks a word that's too wide instead of breaking it", () => {
    const word = "supercalifragilisticexpialidocious";
    const layout = layoutText(word, 600, 400, measure);
    expect(layout.lines).toEqual([word]);
    expect(layout.fontSize).toBeLessThan(48); // base size is 600 * 0.08
    expect(layout.fontSize).toBeGreaterThan(8);
    fitsInside(layout, 600, 400);
  });

  it("breaks a word mid-word only when it can't fit at the minimum size", () => {
    const word = "supercalifragilisticexpialidocious";
    const layout = layoutText(word, 150, 600, measure);
    expect(layout.fontSize).toBe(8);
    expect(layout.lines.length).toBeGreaterThan(1);
    expect(layout.lines.join("")).toBe(word);
  });

  it("collapses whitespace and handles empty text", () => {
    expect(layoutText("  a \n\t b  ", 600, 400, measure).lines).toEqual([
      "a b",
    ]);
    expect(layoutText("   ", 600, 400, measure).lines).toEqual([]);
  });

  it("never drops below 1px on tiny images", () => {
    expect(layoutText("5 x 5", 5, 5, measure).fontSize).toBeGreaterThanOrEqual(
      1,
    );
  });
});
