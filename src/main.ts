import { invoke } from "@tauri-apps/api/core";

export async function transcribeAudio(filePath: string): Promise<string> {
  return await invoke("transcribe_audio", { filePath });
}