import React, { useState, useEffect, useRef, useCallback } from "react";

interface WaveformProps {
  audioData?: number[];
  isPlaying?: boolean;
  isRecording?: boolean;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  height?: number;
  width?: number;
  className?: string;
}

export default function Waveform({
  audioData = [],
  isPlaying = false,
  isRecording = false,
  currentTime = 0,
  duration = 0,
  onSeek,
  height = 280,
  width = 1200,
  className = ""
}: WaveformProps) {
  const [peaks, setPeaks] = useState<number[]>(Array(512).fill(0.3));
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const waveformRef = useRef<SVGSVGElement>(null);

  // Animation for live recording or playback
  useEffect(() => {
    if (!isPlaying && !isRecording) return;
    const interval = setInterval(() => {
      setOffset(prev => (prev + 2) % 2000);
    }, 16); // 60fps animation
    return () => clearInterval(interval);
  }, [isPlaying, isRecording]);

  // Update peaks with real audio data
  useEffect(() => {
    if (audioData.length > 0) {
      const newPeaks = Array(512).fill(0);
      const chunkSize = Math.floor(audioData.length / 512);
      
      for (let i = 0; i < 512; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, audioData.length);
        let sum = 0;
        for (let j = start; j < end; j++) {
          sum += Math.abs(audioData[j] || 0);
        }
        newPeaks[i] = Math.min(1, sum / chunkSize);
      }
      
      setPeaks(newPeaks);
    } else if (isRecording || isPlaying) {
      // Generate synthetic data when no real audio data is available
      const syntheticPeaks = Array(512).fill(0).map((_, i) => {
        const baseWave = Math.sin((i + offset) / 30) * 0.4 + 0.3;
        const noise = (Math.random() - 0.5) * 0.2;
        return Math.max(0, Math.min(1, baseWave + noise));
      });
      setPeaks(syntheticPeaks);
    }
  }, [audioData, isRecording, isPlaying, offset]);

  // Update playhead position based on current time
  useEffect(() => {
    if (duration > 0) {
      setPlayheadPosition((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  // Handle waveform interaction for seeking
  const handleWaveformInteraction = useCallback((event: React.MouseEvent) => {
    if (!waveformRef.current) return;
    
    const rect = waveformRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setPlayheadPosition(percentage);
    
    if (onSeek && duration > 0) {
      const seekTime = (percentage / 100) * duration;
      onSeek(seekTime);
    }
  }, [onSeek, duration]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    handleWaveformInteraction(event);
  }, [handleWaveformInteraction]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isDragging) {
      handleWaveformInteraction(event);
    }
  }, [isDragging, handleWaveformInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Generate waveform lines with spectacular visual effects
  const generateWaveformLines = () => {
    const lines = [];
    const centerY = height / 2;
    const lineSpacing = width / peaks.length;
    
    for (let i = 0; i < peaks.length; i++) {
      const x = i * lineSpacing;
      const audioPeak = peaks[i] || 0;
      
      // Create multiple harmonics for visual richness
      const baseAmplitude = audioPeak * (height * 0.4);
      const harmonic1 = Math.sin((x + offset) / 60) * baseAmplitude * 0.3;
      const harmonic2 = Math.sin((x + offset) / 30) * baseAmplitude * 0.2;
      const harmonic3 = Math.sin((x + offset) / 15) * baseAmplitude * 0.1;
      
      const totalAmplitude = baseAmplitude + harmonic1 + harmonic2 + harmonic3;
      
      // Color based on amplitude and recording state
      let color = "#4FC3F7"; // Default blue
      if (isRecording) {
        color = `hsl(${(audioPeak * 120) + 200}, 70%, ${50 + audioPeak * 30}%)`;
      } else if (isPlaying) {
        color = `hsl(${(audioPeak * 60) + 180}, 60%, ${60 + audioPeak * 20}%)`;
      }
      
      const opacity = 0.6 + audioPeak * 0.4;
      
      lines.push({
        x1: x,
        y1: centerY - totalAmplitude,
        x2: x,
        y2: centerY + totalAmplitude,
        color,
        opacity,
        strokeWidth: isRecording ? 2 : 1.5
      });
    }
    
    return lines;
  };

  const lines = generateWaveformLines();

  return (
    <div className={className} style={{ position: 'relative', userSelect: 'none' }}>
      <svg
        ref={waveformRef}
        width={width}
        height={height}
        style={{ 
          cursor: onSeek ? 'pointer' : 'default',
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '8px'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <filter id="waveformGlow">
            <feGaussianBlur stdDeviation={isRecording ? 4 : 2} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="#4FC3F7" stopOpacity="1"/>
            <stop offset="100%" stopColor="#4FC3F7" stopOpacity="0.3"/>
          </linearGradient>
        </defs>
        
        {/* Center line reference */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(79, 195, 247, 0.2)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
        
        {/* Waveform lines */}
        {lines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth={line.strokeWidth}
            opacity={line.opacity}
            filter="url(#waveformGlow)"
            strokeLinecap="round"
          />
        ))}
        
        {/* Playhead */}
        {(isPlaying || isDragging) && (
          <line
            x1={`${playheadPosition}%`}
            y1="0"
            x2={`${playheadPosition}%`}
            y2={height}
            stroke="#FFD700"
            strokeWidth="3"
            opacity="0.8"
            filter="url(#waveformGlow)"
          />
        )}
        
        {/* Recording indicator pulse */}
        {isRecording && (
          <circle
            cx="30"
            cy="30"
            r="8"
            fill="#FF4444"
            opacity={0.7 + Math.sin(offset / 100) * 0.3}
          >
            <animate
              attributeName="r"
              values="8;12;8"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>
      
      {/* Status overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: '#4FC3F7',
        fontSize: '12px',
        fontWeight: 'bold',
        textShadow: '0 0 4px rgba(0,0,0,0.5)'
      }}>
        {isRecording && "🔴 RECORDING"}
        {isPlaying && !isRecording && "▶️ PLAYING"}
        {!isPlaying && !isRecording && "⏸️ READY"}
      </div>
      
      {/* Time display */}
      {duration > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: '#4FC3F7',
          fontSize: '12px',
          fontWeight: 'bold',
          textShadow: '0 0 4px rgba(0,0,0,0.5)'
        }}>
          {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} / {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
        </div>
      )}
    </div>
  );
}