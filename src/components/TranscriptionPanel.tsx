import React, { useState } from "react";
import { addTranscript } from "../db";

export default function TranscriptionPanel() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAudioFile(file);
  };

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setLoading(true);

    // In a real app, you'd call the Tauri backend here.
    // For now, mock transcription:
    setTimeout(() => {
      const mockTranscript = `(Mock transcript) Audio file: ${audioFile.name}`;
      setTranscript(mockTranscript);
      addTranscript(mockTranscript);
      setLoading(false);
    }, 1200);
  };

  return (
    <div>
      <h2>Transcription Panel</h2>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <button
        onClick={handleTranscribe}
        disabled={!audioFile || loading}
        style={{ marginLeft: "1em" }}
      >
        {loading ? "Transcribing..." : "Transcribe"}
      </button>
      {transcript && (
        <div style={{ marginTop: "1em" }}>
          <h3>Transcript:</h3>
          <pre style={{ background: "#f5f5f5", padding: "0.5em" }}>
            {transcript}
          </pre>
        </div>
      )}
    </div>
  );
}