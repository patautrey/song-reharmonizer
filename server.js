const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// FIXED: serve the public folder correctly
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// File uploads
const upload = multer({ dest: "uploads/" });

// TRANSCRIBE ENDPOINT
app.post("/transcribe", upload.single("audio"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file received" });
  }

  const audioPath = req.file.path;
  const python = spawn("python3", ["basic_pitch_transcribe.py", audioPath]);
  let output = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("PYTHON ERROR:", data.toString());
  });

  python.on("close", () => {
    fs.unlinkSync(audioPath);
    res.json({ notes: output });
  });
});

// REHARMONIZE ENDPOINT
app.post("/reharmonize", (req, res) => {
  const { notes } = req.body;

  if (!notes) {
    return res.status(400).json({ error: "No notes provided" });
  }

  const reharmonized = `Reharmonized progression:\n${notes}`;
  res.json({ reharmonized });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Transcription server running on port ${PORT}`);
});
