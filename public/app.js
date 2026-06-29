// app.js — FULL REPLACEMENT FILE

const SERVER_URL = "https://shiny-lamp-4j6wx946j7q2q56w-5000.app.github.dev";

// -----------------------------
// RECORDING SETUP
// -----------------------------
let mediaRecorder;
let audioChunks = [];

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: "audio/wav" });
    audioChunks = [];
    uploadAudio(blob);
  };

  mediaRecorder.start();
  document.getElementById("recording-status").innerText = "Recording...";
}

function stopRecording() {
  mediaRecorder.stop();
  document.getElementById("recording-status").innerText = "Recording complete.";
}

// -----------------------------
// UPLOAD AUDIO (WAV or Recorded)
// -----------------------------
async function uploadAudio(blob) {
  const formData = new FormData();
  formData.append("audio", blob, "recording.wav");

  const response = await fetch(`${SERVER_URL}/transcribe`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  document.getElementById("transcribed-notes").value = data.notes || "Error";
}

// -----------------------------
// TRANSCRIBE BUTTON (WAV upload)
// -----------------------------
async function transcribeUploaded() {
  const fileInput = document.getElementById("wav-file");
  if (!fileInput.files.length) {
    alert("Please choose a WAV file first.");
    return;
  }

  const formData = new FormData();
  formData.append("audio", fileInput.files[0]);

  const response = await fetch(`${SERVER_URL}/transcribe`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  document.getElementById("transcribed-notes").value = data.notes || "Error";
}

// -----------------------------
// REHARMONIZE
// -----------------------------
async function reharmonize() {
  const notes = document.getElementById("transcribed-notes").value;

  const response = await fetch(`${SERVER_URL}/reharmonize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes })
  });

  const data = await response.json();
  document.getElementById("reharmonized-output").value = data.reharmonized;
}
