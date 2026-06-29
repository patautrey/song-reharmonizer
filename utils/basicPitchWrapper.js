const ort = require("onnxruntime-node");
const wav = require("wav-decoder");
const fs = require("fs");
const path = require("path");

const MODEL_PATH = path.join(__dirname, "../models/basic_pitch.onnx");
const PREPROCESS_PATH = path.join(__dirname, "../models/basic_pitch_preprocess.onnx");

let modelSession = null;
let preprocessSession = null;

async function loadModels() {
  if (!modelSession) {
    modelSession = await ort.InferenceSession.create(MODEL_PATH);
  }
  if (!preprocessSession) {
    preprocessSession = await ort.InferenceSession.create(PREPROCESS_PATH);
  }
}

async function decodeWav(buffer) {
  const decoded = await wav.decode(buffer);
  return decoded.channelData[0];
}

async function basicPitch(audioBuffer) {
  await loadModels();

  const audioData = await decodeWav(audioBuffer);
  const audioTensor = new ort.Tensor("float32", audioData, [1, audioData.length]);

  const pre = await preprocessSession.run({ audio: audioTensor });
  const mel = pre.mel;

  const out = await modelSession.run({ mel });

  return {
    onset: out.onset.data,
    frame: out.frame.data,
    note: out.note.data,
    velocity: out.velocity.data
  };
}

module.exports = { basicPitch };
