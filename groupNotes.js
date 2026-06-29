// ===============================
// utils/groupNotes.js
// ===============================

/**
 * Group notes into harmonic events based on a time threshold.
 * @param {Array} notes - Array of note objects {start, end, midi, velocity}
 * @param {Number} threshold - Time difference to group notes (seconds)
 * @returns {Array} Array of grouped notes (chords)
 */
function groupNotes(notes, threshold = 0.5) {
  if (!Array.isArray(notes)) return [];

  const groups = [];
  let currentGroup = [];

  notes.sort((a, b) => a.start - b.start);

  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];

    if (currentGroup.length === 0) {
      currentGroup.push(note);
      continue;
    }

    const lastNote = currentGroup[currentGroup.length - 1];

    if (Math.abs(note.start - lastNote.start) <= threshold) {
      currentGroup.push(note);
    } else {
      groups.push(currentGroup);
      currentGroup = [note];
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

module.exports = { groupNotes };
