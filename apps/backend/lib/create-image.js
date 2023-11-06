const { createCanvas } = require("canvas");
const hexToRGB = require("./hex-to-rgb.js");
const getForegroundColor = require("./get-foreground-color.js");

const VARIABLES = [
  ["${width}", "w"],
  ["${height}", "h"],
];

/**
 * Creates an a canvas with the provided dimensions, color, and text.
 *
 * @param {Object} options
 * @param {String|Number} [options.width] - width of the image.
 * @param {String|Number} [options.height] - height of the image.
 * @param {String} [options.color] - hexadecimal color value, no hash symbol.
 * @param {String} [options.text] - text to display on the image.
 *
 * @returns {Promise} A promise which resolves to the canvas buffer.
 */
const createImage = async ({
  width = 640,
  height = 480,
  color = "ff00b3",
  text = `${width} x ${height}`,
}) => {
  const w = parseInt(width);
  const h = parseInt(height);
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");

  let parsedText = text;
  const vars = { w, h };
  VARIABLES.forEach(([value, replacer]) => {
    parsedText = parsedText.replaceAll(value, vars[replacer]);
  });

  ctx.fillStyle = `#${color}`;
  ctx.fillRect(0, 0, w, h);

  ctx.font = `bold ${Math.round(w * 0.08)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = getForegroundColor(hexToRGB(color));
  ctx.fillText(parsedText, w * 0.5, h * 0.5);

  return c.toBuffer("image/png");
};

module.exports = createImage;
