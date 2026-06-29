// ===============================
// SERVER.JS — FULL WORKING VERSION
// ===============================

const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');
const fs = require('fs');

// -------------------------------
// 1. STATIC HOSTING FOR YOUR UI
// -------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// -------------------------------
// 2. FILE UPLOAD HANDLING
// -------------------------------
const upload = multer({ dest: 'uploads/' });

// -------------------------------
// 3. TRANSCRIBE AUDIO (Basic Pitch)
// -------------------------------
app.post('/transcribe', upload.single('audio'), (req, res) => {
  const audioPath = req.file.path;

  // Call your Python transcription script
  const py = spawn('python3', ['basic_pitch_transcribe.py', audioPath]);

  let output = '';

  py.stdout.on('data', data => {
    output += data.toString();
  });

  py.stderr.on('data', data => {
    console.error('Python error:', data.toString());
  });

  py.on('close', () => {
    // Delete uploaded file after processing
    fs.unlinkSync(audioPath);

    res.json({ notes: output });
  });
});

// -------------------------------
// 4. REHARMONIZE MIDI FILE
// -------------------------------
app.post('/reharm-midi', upload.single('midi'), async (req, res) => {
  try {
    const buffer = fs.readFileSync(req.file.path);
    const style = req.body.style || 'jazz';

    // Load your MIDI parser
    const { Midi } = require('@tonejs/midi');
    const midi = new Midi(buffer);

    // Convert MIDI → note objects
    const track = midi.tracks[0];
    const parsed = track.notes.map(n => ({
      start: n.time,
      end: n.time + n.duration,
      midi: n.midi,
      velocity: n.velocity
    }));

    // Load your reharm functions
    const { groupNotes } = require('./utils/groupNotes');
    const { reharmByStyle } = require('./utils/reharmRouter');

    const groups = groupNotes(parsed, 0.5);
    const reharm = reharmByStyle(style, groups);

    fs.unlinkSync(req.file.path);
    res.json({ chords: reharm });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'MIDI reharm failed' });
  }
});

// -------------------------------
// 5. START SERVER
// -------------------------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`The server is running on port ${PORT}.`);
});
