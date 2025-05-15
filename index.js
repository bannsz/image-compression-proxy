const express = require('express');
const axios = require('axios');
const sharp = require('sharp');

const app = express();

app.get('/proxy', async (req, res) => {
  const imageUrl = req.query.url;
  const mode = req.query.mode || 'default';
  if (!imageUrl) {
    return res.status(400).send('Missing image URL');
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    let transformer = sharp(imageBuffer);

    if (mode === 'low') {
      transformer = transformer
        .resize({ width: 300 })
        .jpeg({ quality: 20 });
    } else if (mode === 'medium') {
      transformer = transformer
        .resize({ width: 600 })
        .jpeg({ quality: 35 });
    } else {
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
