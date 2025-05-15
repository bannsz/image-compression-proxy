cxxonst express = require('express');
const axios = require('axios');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/proxy', async (req, res) => {
  const { url, quality = 40, width = 400 } = req.query;

  if (!url) {
    return res.status(400).send('Missing image URL')  }

  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer',
    });

    const buffer = await sharp(response.data)
      .resize({ width: parseInt(width) })
      .jpeg({ quality: parseInt(quality) })
      .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing image');
K});

app.listen(PORT, () => {
  console.log(`Image compression proxy running on port ${PORT}`);
});
