const { createCanvas } = require("canvas");

const createImage = ({
  width = 640,
  height = 480,
  color = "ff00b3",
  text = "FPO",
}) => {
  const scale = 2;
  const w = width * scale;
  const h = height * scale;
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");

  ctx.fillStyle = `#${color}`;
  ctx.fillRect(0, 0, w, h);

  ctx.font = `bold ${Math.round(w * 0.08)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "black";
  ctx.fillText(text, w * 0.5, h * 0.5);

  return c.toBuffer("image/png");
};

module.exports = createImage;
