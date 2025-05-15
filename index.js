// Ganti seluruh isi file index.js dengan ini:
const express = require('express');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const MAX_SIZE_KB = 50; // Target maksimal 50KB

app.get('/compress', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send('Missing image URL');
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    let imageBuffer = Buffer.from(response.data);
    let compressedBuffer;
    let quality = 70; // Mulai dari kualitas 70%
    let width = null; // Tidak resize awal

    // Loop hingga ukuran ≤50KB atau kualitas terlalu rendah
    while (quality >= 10) {
      const transformer = sharp(imageBuffer)
        .jpeg({ quality })
        .resize(width); 

      compressedBuffer = await transformer.toBuffer();
      
      if (compressedBuffer.length <= MAX_SIZE_KB * 1024) {
        break; // Berhenti jika sudah ≤50KB
      }

      // Turunkan kualitas 10% dan resize jika perlu
      quality -= 10;
      if (quality <= 30) {
        width = 800; // Resize lebar jadi 800px jika kualitas ≤30%
      }
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(compressedBuffer);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});