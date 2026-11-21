/**
 * Converts a hex color to RGB.
 *
 * @param {String} hex - A six-digit hexadecimal color code, no hash symbol.
 * @returns {Array} values for R, G, and B
 */
const hexToRGB = (hex) => {
  if (typeof hex !== "string" || !/^[0-9a-f]{6}$/i.test(hex)) {
    throw new Error(
      `Invalid color "#${hex}". Color must be a valid six-digit hex value.`
    );
  }

  return hex.match(/.{2}/g).map((value) => parseInt(value, 16));
};

export default hexToRGB;
