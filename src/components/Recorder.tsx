import React, { useState, useRef, useCallback } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import Waveform from "./Waveform";

interface RecorderProps {
  onRecordingComplete?: (audioUrl: string, audioBlob: Blob) => void;
  onRecordingStart?: () => void;
  onRecordingStop?: () => void;
}

export default function Recorder({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop 
}: RecorderProps) {
  const audioRecorder = useAudioRecorder();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startRecording = useCallback(async () => {
    try {
      await audioRecorder.startRecording();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Update duration every second
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      onRecordingStart?.();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  }, [audioRecorder, onRecordingStart]);

  const stopRecording = useCallback(async () => {
    try {
      const audioBlob = await audioRecorder.stopRecording();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        onRecordingComplete?.(audioUrl, audioBlob);
      }
      
      onRecordingStop?.();
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, [audioRecorder, onRecordingComplete, onRecordingStop]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ 
      padding: "20px",
      border: "2px solid #4FC3F7",
      borderRadius: "12px",
      background: "rgba(79, 195, 247, 0.05)",
      marginBottom: "16px"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px"
      }}>
        <h3 style={{ 
          color: "#4FC3F7", 
          margin: 0,
          fontSize: "1.2rem",
          fontWeight: "600"
        }}>
          Audio Recorder
        </h3>
        
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          {isRecording && (
            <div style={{
              color: "#FF4444",
              fontSize: "1rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{
                width: "10px",
                height: "10px",
                backgroundColor: "#FF4444",
                borderRadius: "50%",
                animation: "pulse 1s infinite"
              }} />
              REC {formatTime(recordingDuration)}
            </div>
          )}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: isRecording ? "#FF4444" : "#4FC3F7",
              color: "white",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              minWidth: "120px"
            }}
          >
            {isRecording ? "⏹️ Stop" : "🎤 Record"}
          </button>
        </div>
      </div>

      {/* Waveform visualization */}
      <Waveform
        audioData={audioRecorder.waveformData}
        isPlaying={audioRecorder.isPlaying}
        isRecording={isRecording}
        currentTime={audioRecorder.currentTime}
        duration={audioRecorder.duration}
        onSeek={audioRecorder.seek}
        height={120}
        width={800}
      />

      {/* Playback controls */}
      {audioRecorder.audioUrl && !isRecording && (
        <div style={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: "center"
        }}>
          <button
            onClick={audioRecorder.togglePlayback}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #4FC3F7",
              backgroundColor: audioRecorder.isPlaying ? "#4FC3F7" : "transparent",
              color: audioRecorder.isPlaying ? "white" : "#4FC3F7",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {audioRecorder.isPlaying ? "⏸️ Pause" : "▶️ Play"}
          </button>
          
          <span style={{ color: "#4FC3F7", fontSize: "0.9rem" }}>
            {formatTime(Math.floor(audioRecorder.currentTime))} / {formatTime(Math.floor(audioRecorder.duration))}
          </span>
          
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = audioRecorder.audioUrl;
              link.download = `recording-${new Date().toISOString()}.webm`;
              link.click();
            }}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #4FC3F7",
              backgroundColor: "transparent",
              color: "#4FC3F7",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            💾 Download
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}