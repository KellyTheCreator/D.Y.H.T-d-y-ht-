// Utility functions for audio buffer management and microphone access

export async function getMicrophoneStream(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (err) {
    console.error("Microphone access error:", err);
    return null;
  }
}

// Example: Convert Float32Array audio buffer to WAV (stub)
export function bufferToWav(buffer: Float32Array): Blob {
  // Placeholder implementation
  // TODO: Implement actual WAV formatting
  return new Blob([buffer], { type: "audio/wav" });
}