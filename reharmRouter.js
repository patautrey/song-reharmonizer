// ===============================
// utils/reharmRouter.js
// ===============================

/**
 * Convert MIDI note numbers to pitch names.
 */
const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F",
  "F#", "G", "G#", "A", "A#", "B"
];

function midiToNoteName(midi) {
  return NOTE_NAMES[midi % 12];
}

/**
 * Identify chord quality from grouped notes.
 */
function detectChord(group) {
  const pitches = group.map(n => midiToNoteName(n.midi));

  const unique = [...new Set(pitches)];

  if (unique.length === 1) return `${unique[0]} (unison)`;
  if (unique.length === 2) return `${unique.join("-")} dyad`;

  // Simple triad detection
  const root = unique[0];
  const third = unique[1];
  const fifth = unique[2];

  return `${root}-${third}-${fifth} triad`;
}

/**
 * Reharmonize grouped notes using a style preset.
 */
function reharmByStyle(style, groups) {
  const chords = groups.map(group => detectChord(group));

  return {
    style,
    chords
  };
}

module.exports = { reharmByStyle };
