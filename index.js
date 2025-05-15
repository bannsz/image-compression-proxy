const express = require('express');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const MAX_SIZE_KB = 50; // Target maksimal 50KB

app.get('/compress', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing URL');

  try {
    // Step 1: Download gambar asli
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    let buffer = Buffer.from(response.data);

    // Step 2: Kompresi 3 tahap dengan pengaturan agresif
    const compressionSettings = [
      { quality: 70, width: 1200 },  // Coba kompresi ringan
      { quality: 40, width: 800 },   // Kompresi medium
      { quality: 20, width: 600 }    // Kompresi ekstrem
    ];

    let outputBuffer;
    
    for (const setting of compressionSettings) {
      outputBuffer = await sharp(buffer)
        .resize(setting.width)
        .jpeg({ 
          quality: setting.quality,
          mozjpeg: true,
          force: true // Paksa konversi ke JPEG
        })
        .toBuffer();

      if (outputBuffer.length <= MAX_SIZE_KB * 1024) break;
    }

    // Step 3: Jika masih >50KB, lakukan kompresi maksimal
    if (outputBuffer.length > MAX_SIZE_KB * 1024) {
      outputBuffer = await sharp(buffer)
        .resize(500)
        .jpeg({ quality: 15, mozjpeg: true })
        .toBuffer();
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(outputBuffer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Compression failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));