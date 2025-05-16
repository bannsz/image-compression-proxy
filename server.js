const express = require("express");
const sharp = require("sharp");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send("Missing 'url' parameter");
  }

  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(response.data);

    // Kompres ke WebP (bisa ganti ke .jpeg juga kalau mau)
    const compressedImage = await sharp(imageBuffer)
      .webp({ quality: 50 }) // Ganti kualitas di sini sesuai keinginan
      .toBuffer();

    res.set("Content-Type", "image/webp");
    res.send(compressedImage);
  } catch (error) {
    console.error("Compression error:", error.message);
    res.status(500).send("Image compression failed");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
