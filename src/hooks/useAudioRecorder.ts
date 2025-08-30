import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioRecorderState {
  isRecording: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioUrl: string | null;
  waveformData: number[];
}

export const useAudioRecorder = () => {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioUrl: null,
    waveformData: [],
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();

  // Initialize audio context and analyzer
  const initializeAudio = useCallback(async () => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      await initializeAudio();
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Connect stream to analyser for real-time waveform
      if (audioContextRef.current && analyserRef.current) {
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
      }

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        setState(prev => ({ ...prev, audioUrl, isRecording: false }));
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true }));
      
      // Start waveform animation
      updateWaveform();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [state.isRecording]);

  // Update waveform data for visualization
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Convert to normalized values for waveform display
    const waveformData = Array.from(dataArray).slice(0, 32).map(value => value / 255);
    
    setState(prev => ({ ...prev, waveformData }));
    
    if (state.isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    }
  }, [state.isRecording]);

  // Play recorded audio
  const playAudio = useCallback(() => {
    if (!state.audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(state.audioUrl);
      audioRef.current.addEventListener('loadedmetadata', () => {
        setState(prev => ({ ...prev, duration: audioRef.current?.duration || 0 }));
      });
      audioRef.current.addEventListener('timeupdate', () => {
        setState(prev => ({ ...prev, currentTime: audioRef.current?.currentTime || 0 }));
      });
      audioRef.current.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      });
    }

    if (state.isPlaying) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      audioRef.current.play();
      setState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [state.audioUrl, state.isPlaying]);

  // Seek to position
  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  // Reset recording
  const resetRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState({
      isRecording: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      audioUrl: null,
      waveformData: [],
    });
    chunksRef.current = [];
  }, [state.audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    playAudio,
    seekTo,
    resetRecording,
  };
};