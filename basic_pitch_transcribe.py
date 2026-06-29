import sys
import json
import numpy as np
from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.note_creation import notes_to_midi, output_notes

# Usage:
# python3 basic_pitch_transcribe.py <audio_file_path>

def transcribe(audio_path):
    # Run Basic Pitch model
    model_output, midi_data, note_events = predict(
        audio_path,
        model_or_model_path=ICASSP_2022_MODEL_PATH,
        onset_threshold=0.5,
        frame_threshold=0.3,
        minimum_note_length=11
    )

    # Convert note events to readable text
    notes_text = output_notes(note_events)

    return notes_text


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("No audio file provided")
        sys.exit(1)

    audio_path = sys.argv[1]

    try:
        notes = transcribe(audio_path)
        print(notes)
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
