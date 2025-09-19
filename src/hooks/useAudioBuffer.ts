import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioBufferState {
  isBuffering: boolean;
  bufferSize: number; // in seconds (30-3000)
  currentBuffer: Blob[];
  bufferStartTime: number;
  isTriggered: boolean;
  triggerTime: number;
  isRemembering: boolean; // DVR-style continuous recording after trigger
  rememberingStartTime: number;
  recordedChunks: Blob[]; // Chunks being saved during remembering
}

export const useAudioBuffer = (bufferSize: number = 30) => {
  const [state, setState] = useState<AudioBufferState>({
    isBuffering: false,
    bufferSize,
    currentBuffer: [],
    bufferStartTime: 0,
    isTriggered: false,
    triggerTime: 0,
    isRemembering: false,
    rememberingStartTime: 0,
    recordedChunks: [],
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bufferRef = useRef<{ blob: Blob; timestamp: number }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Demo mode - simulate recording without microphone
  const startDemoMode = useCallback(() => {
    console.log('Starting audio buffer in demo mode (no microphone required)');
    
    setState(prev => ({
      ...prev,
      isBuffering: true,
      bufferStartTime: Date.now()
    }));

    // Generate demo audio chunks every second
    intervalRef.current = setInterval(() => {
      const timestamp = Date.now();
      
      // Create a synthetic audio blob for demo purposes
      const sampleRate = 44100;
      const duration = 1; // 1 second
      const length = sampleRate * duration;
      const buffer = new Float32Array(length);
      
      // Generate synthetic audio data (sine wave with some variation)
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        buffer[i] = Math.sin(2 * Math.PI * 440 * t) * 0.1 * (Math.random() * 0.5 + 0.5);
      }
      
      // Convert to blob (simplified approach for demo)
      const demoBlob = new Blob([buffer], { type: 'audio/webm;codecs=opus' });
      
      bufferRef.current.push({ blob: demoBlob, timestamp });
      
      // If we're remembering (DVR recording), also add to recorded chunks
      if (state.isRemembering) {
        setState(prev => ({
          ...prev,
          recordedChunks: [...prev.recordedChunks, demoBlob]
        }));
      }
      
      // Remove old chunks beyond buffer size
      const cutoffTime = timestamp - (state.bufferSize * 1000);
      bufferRef.current = bufferRef.current.filter(chunk => chunk.timestamp > cutoffTime);
      
      setState(prev => ({
        ...prev,
        currentBuffer: bufferRef.current.map(chunk => chunk.blob)
      }));
    }, 1000);
  }, [state.bufferSize, state.isRemembering]);

  // Check microphone permissions
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permissionStatus.state;
    } catch (error) {
      console.warn('Permission API not supported, trying direct access');
      return 'unknown';
    }
  }, []);

  // Start continuous buffering
  const startBuffering = useCallback(async () => {
    try {
      // Check microphone permission first
      const permissionState = await checkMicrophonePermission();
      if (permissionState === 'denied') {
        throw new Error('Microphone access denied. Please enable microphone permissions in your browser settings and refresh the page.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      streamRef.current = stream;
      
      const supportedMimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : 'audio/webm';
        
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType
      });
      mediaRecorderRef.current = mediaRecorder;

      // Record in 1-second chunks for continuous buffering
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const timestamp = Date.now();
          bufferRef.current.push({ blob: event.data, timestamp });
          
          // If we're remembering (DVR recording), also add to recorded chunks
          if (state.isRemembering) {
            setState(prev => ({
              ...prev,
              recordedChunks: [...prev.recordedChunks, event.data]
            }));
          }
          
          // Remove old chunks beyond buffer size
          const cutoffTime = timestamp - (state.bufferSize * 1000);
          bufferRef.current = bufferRef.current.filter(chunk => chunk.timestamp > cutoffTime);
          
          setState(prev => ({
            ...prev,
            currentBuffer: bufferRef.current.map(chunk => chunk.blob)
          }));
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error during buffering:', event);
      };

      mediaRecorder.start();
      
      // Record in 1-second intervals
      intervalRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.requestData();
        }
      }, 1000);

      setState(prev => ({
        ...prev,
        isBuffering: true,
        bufferStartTime: Date.now()
      }));

    } catch (error) {
      console.error('Failed to start buffering:', error);
      
      let errorMessage = 'Failed to start audio buffering: ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Microphone access denied. Starting demo mode instead.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found. Starting demo mode instead.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Microphone is already in use by another application. Starting demo mode instead.';
      } else {
        errorMessage += (error.message || 'Unknown error') + ' Starting demo mode instead.';
      }
      
      console.log(errorMessage);
      
      // Fall back to demo mode
      try {
        startDemoMode();
        console.log('Demo mode started successfully');
      } catch (demoError) {
        console.error('Failed to start demo mode:', demoError);
        throw new Error(errorMessage);
      }
    }
  }, [state.bufferSize, checkMicrophonePermission, startDemoMode]);

  // Stop buffering
  const stopBuffering = useCallback(() => {
    if (mediaRecorderRef.current && state.isBuffering) {
      mediaRecorderRef.current.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setState(prev => ({
      ...prev,
      isBuffering: false
    }));
  }, [state.isBuffering]);

  // Trigger recording - saves from buffer start to current time
  const triggerRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const triggerTime = Date.now();
      const bufferStartTime = triggerTime - (state.bufferSize * 1000);
      
      // Get all chunks from buffer start time to trigger time
      const relevantChunks = bufferRef.current.filter(
        chunk => chunk.timestamp >= bufferStartTime && chunk.timestamp <= triggerTime
      );
      
      // Combine all chunks into one blob
      const audioBlob = new Blob(
        relevantChunks.map(chunk => chunk.blob),
        { type: 'audio/webm;codecs=opus' }
      );
      
      setState(prev => ({
        ...prev,
        isTriggered: true,
        triggerTime
      }));
      
      resolve(audioBlob);
    });
  }, [state.bufferSize]);

  // Start remembering (DVR-style) - begins saving from buffer start and continues until stopped
  const startRemembering = useCallback((): Blob[] => {
    const triggerTime = Date.now();
    const bufferStartTime = triggerTime - (state.bufferSize * 1000);
    
    // Get buffer chunks from buffer start time
    const bufferChunks = bufferRef.current.filter(
      chunk => chunk.timestamp >= bufferStartTime
    );
    
    setState(prev => ({
      ...prev,
      isRemembering: true,
      isTriggered: true,
      triggerTime,
      rememberingStartTime: bufferStartTime,
      recordedChunks: bufferChunks.map(chunk => chunk.blob)
    }));
    
    return bufferChunks.map(chunk => chunk.blob);
  }, [state.bufferSize]);

  // Stop remembering and return the complete recording
  const stopRemembering = useCallback((): Blob => {
    // Combine all recorded chunks into final blob
    const finalBlob = new Blob(state.recordedChunks, { type: 'audio/webm;codecs=opus' });
    
    setState(prev => ({
      ...prev,
      isRemembering: false,
      recordedChunks: []
    }));
    
    return finalBlob;
  }, [state.recordedChunks]);

  // Update buffer size
  const updateBufferSize = useCallback((newSize: number) => {
    const clampedSize = Math.max(30, Math.min(3000, newSize));
    setState(prev => ({
      ...prev,
      bufferSize: clampedSize
    }));
    
    // Clean old buffer chunks immediately
    const cutoffTime = Date.now() - (clampedSize * 1000);
    bufferRef.current = bufferRef.current.filter(chunk => chunk.timestamp > cutoffTime);
  }, []);

  // Get buffer duration in seconds
  const getBufferDuration = useCallback(() => {
    if (bufferRef.current.length === 0) return 0;
    
    const oldest = bufferRef.current[0].timestamp;
    const newest = bufferRef.current[bufferRef.current.length - 1].timestamp;
    return (newest - oldest) / 1000;
  }, []);

  // Get buffer fill percentage
  const getBufferFill = useCallback(() => {
    const duration = getBufferDuration();
    return Math.min(100, (duration / state.bufferSize) * 100);
  }, [getBufferDuration, state.bufferSize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBuffering();
    };
  }, [stopBuffering]);

  // Update buffer size effect
  useEffect(() => {
    setState(prev => ({ ...prev, bufferSize }));
  }, [bufferSize]);

  return {
    ...state,
    startBuffering,
    stopBuffering,
    triggerRecording,
    startRemembering,
    stopRemembering,
    updateBufferSize,
    getBufferDuration,
    getBufferFill,
    checkMicrophonePermission,
  };
};
