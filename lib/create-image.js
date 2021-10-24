const { createCanvas } = require("canvas");

const createImage = ({ width = 640, height = 480, text = "FPO" }) => {
  const scale = 2;
  const w = width * scale;
  const h = height * scale;
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");

  ctx.fillStyle = "#ff00b3";
  ctx.fillRect(0, 0, w, h);

  return c.toBuffer("image/png");
};

module.exports = createImage;
