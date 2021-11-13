const express = require("express");
const createImage = require("./lib/create-image.js");
const port = process.env.PORT || 8000;
const app = express();

app.get("/:width?/:height?/:color?", (req, res) => {
  const image = createImage({ ...req.params, ...req.query });
  res.writeHead(200, { "Content-Type": "image/png" });
  res.end(image);
});

app.listen(port, () => console.log(`server running on port ${port}`));
