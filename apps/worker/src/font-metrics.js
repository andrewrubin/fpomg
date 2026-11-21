/**
 * Minimal TrueType reader for measuring text: maps characters to glyphs (cmap
 * formats 4 and 12) and reads glyph advance widths (hmtx). Kerning is ignored.
 * In practice that overestimates rendered width (by ~1.5-4% in tests), because
 * kerning almost always tightens pairs; a rare widening pair could make a line
 * slightly wider than measured, which the layout padding absorbs.
 *
 * Widths are additive (no kerning), so measure(a + b) === measure(a) + measure(b).
 *
 * @param {Uint8Array} bytes - the raw .ttf file.
 * @returns {{
 *   measure: (text: string, fontSize: number) => number,
 *   hasGlyph: (codePoint: number) => boolean,
 * }}
 */
export const createFontMetrics = (bytes) => {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const u16 = (o) => view.getUint16(o);
  const i16 = (o) => view.getInt16(o);
  const u32 = (o) => view.getUint32(o);

  const tables = {};
  for (let i = 0, n = u16(4); i < n; i++) {
    const rec = 12 + i * 16;
    const tag = String.fromCharCode(...bytes.subarray(rec, rec + 4));
    tables[tag] = u32(rec + 8);
  }
  for (const tag of ["head", "hhea", "hmtx", "cmap"]) {
    if (tables[tag] === undefined) throw new Error(`Font is missing the ${tag} table.`);
  }

  const unitsPerEm = u16(tables.head + 18);
  const numHMetrics = u16(tables.hhea + 34);
  const advanceOf = (glyph) =>
    u16(tables.hmtx + 4 * Math.min(glyph, numHMetrics - 1));

  // Pick the best Unicode cmap subtable: format 12 (full Unicode) over format 4 (BMP).
  const cmap = tables.cmap;
  let format4, format12;
  for (let i = 0, n = u16(cmap + 2); i < n; i++) {
    const rec = cmap + 4 + i * 8;
    const platform = u16(rec);
    const encoding = u16(rec + 2);
    const sub = cmap + u32(rec + 4);
    const isUnicode = platform === 0 || (platform === 3 && (encoding === 1 || encoding === 10));
    if (!isUnicode) continue;
    const format = u16(sub);
    if (format === 12) format12 ??= sub;
    else if (format === 4) format4 ??= sub;
  }

  const glyphFromFormat12 = (sub, cp) => {
    for (let i = 0, n = u32(sub + 12); i < n; i++) {
      const g = sub + 16 + i * 12;
      const start = u32(g);
      if (cp < start) return 0;
      if (cp <= u32(g + 4)) return u32(g + 8) + (cp - start);
    }
    return 0;
  };

  const glyphFromFormat4 = (sub, cp) => {
    if (cp > 0xffff) return 0;
    const segCount = u16(sub + 6) / 2;
    const ends = sub + 14;
    const starts = ends + segCount * 2 + 2;
    const deltas = starts + segCount * 2;
    const rangeOffsets = deltas + segCount * 2;
    for (let i = 0; i < segCount; i++) {
      if (u16(ends + i * 2) < cp) continue;
      const start = u16(starts + i * 2);
      if (cp < start) return 0;
      const delta = i16(deltas + i * 2);
      const rangeOffsetPos = rangeOffsets + i * 2;
      const rangeOffset = u16(rangeOffsetPos);
      if (rangeOffset === 0) return (cp + delta) & 0xffff;
      const glyph = u16(rangeOffsetPos + rangeOffset + 2 * (cp - start));
      return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
    }
    return 0;
  };

  const glyphOf = (cp) =>
    format12 !== undefined
      ? glyphFromFormat12(format12, cp)
      : format4 !== undefined
        ? glyphFromFormat4(format4, cp)
        : 0;

  const advances = new Map();
  const advanceForCodePoint = (cp) => {
    let adv = advances.get(cp);
    if (adv === undefined) {
      adv = advanceOf(glyphOf(cp));
      advances.set(cp, adv);
    }
    return adv;
  };

  return {
    hasGlyph: (codePoint) => glyphOf(codePoint) !== 0,
    measure(text, fontSize) {
      let units = 0;
      for (const ch of text) units += advanceForCodePoint(ch.codePointAt(0));
      return (units * fontSize) / unitsPerEm;
    },
  };
};
