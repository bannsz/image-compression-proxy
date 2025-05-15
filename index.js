const express = require('express');
const cors = require('cors');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const MAX_SIZE_KB = 50;

// Konfigurasi CORS middleware
app.use(cors({
  origin: '*',
  methods: 'GET',
  optionsSuccessStatus: 200
}));

app.get('/compress', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing URL');

  try {
    // Step 1: Download gambar asli dengan header tambahan
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'image/*'
      }
    });
    let buffer = Buffer.from(response.data);

    // Step 2: Kompresi 3 tahap
    const compressionSettings = [
      { quality: 70, width: 1200 },
      { quality: 40, width: 800 },
      { quality: 20, width: 600 }
    ];

    let outputBuffer;

    for (const setting of compressionSettings) {
      outputBuffer = await sharp(buffer)
        .resize(setting.width)
        .jpeg({
          quality: setting.quality,
          mozjpeg: true,
          force: true
        })
        .toBuffer();

      if (outputBuffer.length <= MAX_SIZE_KB * 1024) break;
    }

    // Step 3: Kompresi ekstra jika masih besar
    if (outputBuffer.length > MAX_SIZE_KB * 1024) {
      outputBuffer = await sharp(buffer)
        .resize(500)
        .jpeg({ quality: 15, mozjpeg: true })
        .toBuffer();
    }

    // Tambahkan header tambahan untuk CORS
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Content-Type', 'image/jpeg');
    res.send(outputBuffer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Compression failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
