import { useState, useRef, useCallback, useEffect } from 'react';

export interface AudioBufferState {
  isBuffering: boolean;
  bufferSize: number; // in seconds (30-3000)
  currentBuffer: Blob[];
  bufferStartTime: number;
  isTriggered: boolean;
  triggerTime: number;
}

export const useAudioBuffer = (bufferSize: number = 30) => {
  const [state, setState] = useState<AudioBufferState>({
    isBuffering: false,
    bufferSize,
    currentBuffer: [],
    bufferStartTime: 0,
    isTriggered: false,
    triggerTime: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bufferRef = useRef<{ blob: Blob; timestamp: number }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Start continuous buffering
  const startBuffering = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      // Record in 1-second chunks for continuous buffering
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const timestamp = Date.now();
          bufferRef.current.push({ blob: event.data, timestamp });
          
          // Remove old chunks beyond buffer size
          const cutoffTime = timestamp - (state.bufferSize * 1000);
          bufferRef.current = bufferRef.current.filter(chunk => chunk.timestamp > cutoffTime);
          
          setState(prev => ({
            ...prev,
            currentBuffer: bufferRef.current.map(chunk => chunk.blob)
          }));
        }
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
      throw error;
    }
  }, [state.bufferSize]);

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
    updateBufferSize,
    getBufferDuration,
    getBufferFill,
  };
};
