const fs = require("fs");
const wav = require("wav-decoder");

async function loadWavFile(filePath) {
  const buffer = await fs.promises.readFile(filePath);
  return wav.decode(buffer);
}

module.exports = { loadWavFile };
