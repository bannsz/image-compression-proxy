const express = require('express');
const fetch = require('node-fetch');
const sharp = require('sharp');

const app = express();

app.get('/proxy', async (req, res) => {
  const imageUrl = req.query.url;
  const mode = req.query.mode || 'default'; // tambahkan mode
  if (!imageUrl) {
    return res.status(400).send('Missing image URL');
  }

  try {
    const response = await fetch(imageUrl);
    const imageBuffer = await response.buffer();

    let transformer = sharp(imageBuffer);

    if (mode === 'low') {
      // preset untuk gambar <50KB
      transformer = transformer
        .resize({ width: 300 })
        .jpeg({ quality: 20 });
    } else if (mode === 'medium') {
      // preset biasa (jika ingin dipakai juga)
      transformer = transformer
        .resize({ width: 600 })
        .jpeg({ quality: 35 });
    } else {
      // default: hanya ubah ke jpeg tanpa resize
      transformer = transformer
        .jpeg({ quality: 70 });
    }

    const compressedBuffer = await transformer.toBuffer();
    res.set('Content-Type', 'image/jpeg');
    res.send(compressedBuffer);
  } catch (error) {
    res.status(500).send('Error processing image: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Image proxy running on port ${PORT}`);
});
