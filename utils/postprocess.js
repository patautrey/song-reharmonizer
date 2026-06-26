// utils/postprocess.js

function extractNotes(modelOutput) {
  const notes = [];

  const onset = modelOutput.onset;
  const frame = modelOutput.frame;
  const velocity = modelOutput.velocity;

  const numFrames = frame.length / 88;

  for (let f = 0; f < numFrames; f++) {
    for (let n = 0; n < 88; n++) {
      const idx = f * 88 + n;

      if (onset[idx] > 0.5) {
        notes.push({
          pitch: n + 21,
          start_time: f * 0.01,
          end_time: (f + 1) * 0.01,
          velocity: Math.round(velocity[idx] * 127)
        });
      }
    }
  }

  return notes;
}

module.exports = { extractNotes };
