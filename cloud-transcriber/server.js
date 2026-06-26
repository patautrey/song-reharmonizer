// -------------------------
// FINAL WORKING SERVER.JS
// -------------------------

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Import transcription engine
const { basicPitch } = require("./utils/basicPitchWrapper");
const { extractNotes } = require("./utils/postprocess");

const app = express();
app.use(cors());
app.use(express.json());

// Multer upload directory
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
    const rawOutput = await basicPitch(audioData);

    // Convert raw model output to readable notes
    const notesArray = extractNotes(rawOutput);

    const notesText = notesArray
      .map(n => `${n.pitch} (${n.start_time.toFixed(2)}s → ${n.end_time.toFixed(2)}s) vel=${n.velocity}`)
      .join("\n");

    // Clean up temp file
    fs.unlinkSync(filePath);

    res.json({ notes: notesText });

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
