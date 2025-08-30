import React, { useRef, useState } from "react";
import { getMicrophoneStream, bufferToWav } from "../utils/audio";

export default function AudioInputPanel() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    const stream = await getMicrophoneStream();
    if (!stream) return;
    setRecording(true);

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    };

    mediaRecorder.start();
  };

  const handleStopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  return (
    <div>
      <h2>Audio Input Panel</h2>
      {!recording ? (
        <button onClick={handleStartRecording}>Start Recording</button>
      ) : (
        <button onClick={handleStopRecording}>Stop Recording</button>
      )}
      {audioUrl && (
        <div style={{ marginTop: "1em" }}>
          <audio controls src={audioUrl} />
          <p>
            <a href={audioUrl} download="recording.wav">
              Download Recording
            </a>
          </p>
        </div>
      )}
    </div>
  );
}