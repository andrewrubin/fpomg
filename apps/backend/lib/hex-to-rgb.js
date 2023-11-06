/**
 * Converts a hex color to RGB.
 *
 * @param {String} hex - A hexadecimal color code
 * @returns {Array} values for R, G, and B
 */
const hexToRGB = (hex) => {
  const hexError = new Error(
    `💩 Invalid color <code>#${hex}</code>. Color must be a valid six-digit hex value.`
  );

  if (!hex.match(/^[0-9a-zA-Z]{6}$/i)) throw hexError;

  const rgb = hex.match(/.{1,2}/g).map((value) => parseInt(value, 16));

  if (rgb.some((value) => isNaN(value))) throw hexError;

  return rgb;
};

module.exports = hexToRGB;
