import { useState, useCallback } from "react";
import { transcribeAudio } from "../main";

export function useTranscription() {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const transcribe = useCallback(async (filePath: string) => {
    setLoading(true);
    try {
      const result = await transcribeAudio(filePath);
      setTranscript(result);
    } catch (err) {
      setTranscript("Transcription failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { transcript, loading, transcribe };
}