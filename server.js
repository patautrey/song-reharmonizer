// server.js — FULL REPLACEMENT FILE

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = 5000;

// Allow front-end to reach backend
app.use(cors());
app.use(express.json());

// Serve static front-end
app.use(express.static(path.join(__dirname, "public")));

// Multer storage for uploaded audio
const upload = multer({
  dest: "uploads/"
});

// -----------------------------
// TRANSCRIBE ENDPOINT
// -----------------------------
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file received" });
    }

    const audioPath = req.file.path;

    // Call Basic Pitch Python script
    const python = spawn("python3", ["basic_pitch_transcribe.py", audioPath]);

    let output = "";
    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error("Python error:", data.toString());
    });

    python.on("close", () => {
      fs.unlinkSync(audioPath); // cleanup
      res.json({ notes: output });
    });

  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// -----------------------------
// REHARMONIZE ENDPOINT
// -----------------------------
app.post("/reharmonize", (req, res) => {
  const { notes } = req.body;

  if (!notes) {
    return res.status(400).json({ error: "No notes provided" });
  }

  // Simple placeholder reharmonizer
  const reharmonized = `Reharmonized progression:\n${notes}\n\n(placeholder engine)`;

  res.json({ reharmonized });
});

// -----------------------------
// START SERVER
// -----------------------------
app.listen(PORT, () => {
  console.log(`Transcription server running on port ${PORT}`);
});
