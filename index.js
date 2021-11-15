const express = require("express");
const path = require("path");
const createImage = require("./lib/create-image.js");

const isProd = process.env.NODE_ENV === "production" ? true : false;
const port = process.env.PORT || 5000;
const app = express();

app.get("/:width/:height/:color?", async (req, res) => {
  try {
    const image = await createImage({ ...req.params, ...req.query });
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(image);
  } catch (err) {
    if (!isProd) console.log(err);
    res.send(err.message);
  }
});

app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/dist/index.html"))
);

app.listen(port, () => console.log(`server running on port ${port}`));
