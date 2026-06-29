const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({ dest: "uploads/" });

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
    console.error("Python error:", data.toString());
  });

  python.on("close", () => {
    fs.unlinkSync(audioPath);
    res.json({ notes: output });
  });
});

app.post("/reharmonize", (req, res) => {
  const { notes } = req.body;

  if (!notes) {
    return res.status(400).json({ error: "No notes provided" });
  }

  const reharmonized = `Reharmonized progression:\n${notes}`;
  res.json({ reharmonized });
});

app.listen(PORT, () => {
  console.log(`Transcription server running on port 5000`);
});

