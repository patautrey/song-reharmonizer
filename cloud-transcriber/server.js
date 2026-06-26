// -------------------------
// FINAL WORKING SERVER.JS
// -------------------------

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Basic Pitch
const { basicPitch } = require("./utils/basicPitchWrapper");

const app = express();
app.use(cors());
app.use(express.json());

// Upload folder
const upload = multer({ dest: "uploads/" });

// -------------------------
// TRANSCRIBE ENDPOINT
// -------------------------
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    const filePath = req.file.path;
    const audioData = await fs.promises.readFile(filePath);

    // Run Basic Pitch transcription
    const output = await basicPitch(audioData);

    // Extract notes
    const notes = output?.notes
      ?.map(n => `${n.pitch} (${n.start_time.toFixed(2)}s → ${n.end_time.toFixed(2)}s)`)
      .join("\n") || "No notes detected.";

    // Clean up temp file
    fs.unlinkSync(filePath);

    res.json({ notes });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// -------------------------
// START SERVER
// -------------------------
app.listen(5000, () => {
  console.log("Transcription server running on port 5000");
});
