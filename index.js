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
    const originalBuffer = Buffer.from(response.data);

    // Step 2: Kompresi agresif dengan prioritas ≤50KB
    let quality = 80; // Mulai dari kualitas tinggi
    let width = null;
    let outputBuffer;
    let attempts = 0;

    do {
      const transformer = sharp(originalBuffer)
        .resize(width) // Resize hanya jika width ditentukan
        .jpeg({ 
          quality,
          mozjpeg: true, // Kompresi maksimal
          force: true // Paksa konversi ke JPEG bahkan untuk PNG
        });

      outputBuffer = await transformer.toBuffer();
      
      // Turunkan kualitas/resolusi bertahap jika masih >50KB
      if (outputBuffer.length > MAX_SIZE_KB * 1024) {
        quality -= 15;
        if (quality <= 50) width = 1000; // Resize lebar jadi 1000px jika kualitas ≤50%
      }

      attempts++;
    } while (outputBuffer.length > MAX_SIZE_KB * 1024 && attempts < 5); // Maksimal 5 percobaan

    // Step 3: Jika masih >50KB, kompresi ekstrem (last resort)
    if (outputBuffer.length > MAX_SIZE_KB * 1024) {
      outputBuffer = await sharp(originalBuffer)
        .resize(800) // Paksa resize kecil
        .jpeg({ quality: 30, mozjpeg: true })
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