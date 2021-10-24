const express = require("express");
const createImage = require("./lib/create-image.js");

const app = express();

app.get("/:width?/:height?/:text?", (req, res) => {
  res.send(createImage(req.params));
});

app.listen(3000, () => console.log("server running on port 3000"));
