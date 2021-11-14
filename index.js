const express = require("express");
const createImage = require("./lib/create-image.js");

const isProd = process.env.NODE_ENV === "production" ? true : false;
const port = process.env.PORT;
const app = express();

app.get("/:width?/:height?/:color?", async (req, res) => {
  try {
    const image = await createImage({ ...req.params, ...req.query });
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(image);
  } catch (err) {
    if (!isProd) console.log(err);
    res.send(err.message);
  }
});

app.listen(port, () => console.log(`server running on port ${port}`));
