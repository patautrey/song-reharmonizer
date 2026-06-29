const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");

const { basicPitch } = require("./utils/basicPitchWrapper");
const { extractNotes } = require("./utils/postprocess");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    const filePath = req.file.path;
    const audioData = await fs.promises.readFile(filePath);

    const rawOutput = await basicPitch(audioData);
    const notesArray = extractNotes(rawOutput);

    const notesText = notesArray
      .map(n => `${n.pitch} (${n.start_time.toFixed(2)}s → ${n.end_time.toFixed(2)}s) vel=${n.velocity}`)
      .join("\n");

    fs.unlinkSync(filePath);

    res.json({ notes: notesText });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

app.listen(5000, () => {
  console.log("Transcription server running on port 5000");
});
