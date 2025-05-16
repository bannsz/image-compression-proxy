const express = require("express");
const sharp = require("sharp");
const axios = require("axios");
const app = express();

const port = process.env.PORT || 3000;

app.get("/image", async (req, res) => {
  const { url, webp, quality = 60 } = req.query;

  if (!url) {
    return res.status(400).send("Missing 'url' parameter");
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const inputBuffer = Buffer.from(response.data);

    let image = sharp(inputBuffer);
    const format = webp === "true" ? "webp" : "jpeg";

    const outputBuffer = await image[format]({
      quality: parseInt(quality, 10),
    }).toBuffer();

    res.set("Content-Type", `image/${format}`);
    res.send(outputBuffer);
  } catch (err) {
    console.error("Image processing error:", err.message);
    res.status(500).send("Image compression failed");
  }
});

app.listen(port, () => {
  console.log(`Bandwidth Hero-compatible proxy running on port ${port}`);
});
