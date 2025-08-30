let transcripts: string[] = [];

export function addTranscript(transcript: string) {
  transcripts.unshift(transcript);
}

export function getTranscripts() {
  return [...transcripts];
}