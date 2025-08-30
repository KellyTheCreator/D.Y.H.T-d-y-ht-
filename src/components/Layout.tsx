import React from "react";
import AudioinputPanel from "./AudioinputPanel";
import Recorder from "./Recorder";
import Transcript from "./Transcript";
import TranscriptHistory from "./TranscriptHistory";
import TranscriptionPanel from "./TranscriptionPanel";
import Waveform from "./Waveform";

export default function Layout() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Dwight Tauri Dashboard</h1>
      <div style={{ display: "flex", gap: 24 }}>
        <AudioinputPanel />
        <Recorder />
        <Waveform />
      </div>
      <div style={{ marginTop: 24, display: "flex", gap: 24 }}>
        <Transcript />
        <TranscriptionPanel />
        <TranscriptHistory />
      </div>
    </div>
  );
}