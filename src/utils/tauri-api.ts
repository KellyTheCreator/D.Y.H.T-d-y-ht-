import { invoke } from '@tauri-apps/api/tauri';

export interface AudioRecord {
  id?: number;
  title: string;
  file_path: string;
  transcript?: string;
  duration: number;
  created_at: string;
  triggers?: string;
}

export interface DwightResponse {
  message: string;
  confidence: number;
  context_used: boolean;
  suggestions: string[];
}

export interface SoundTrigger {
  id?: number;
  trigger_type: string;
  trigger_value: string;
  is_active: boolean;
  created_at: string;
}

// Enhanced AI interfaces
export interface LlamaResponse {
  text: string;
  tokens_used: number;
  processing_time_ms: number;
  confidence: number;
}

export interface ModelConfig {
  name: string;
  model_type: string;
  api_endpoint?: string;
  local_path?: string;
  enabled: boolean;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  processing_time_ms: number;
  confidence: number;
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface PythonResult {
  success: boolean;
  result: any;
  error?: string;
  execution_time_ms: number;
}

export interface PythonScript {
  name: string;
  code: string;
  description: string;
  input_schema: any;
  output_schema: any;
}

// Audio transcription
export async function transcribeAudio(filePath: string): Promise<string> {
  try {
    return await invoke('transcribe_audio', { filePath });
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

// Enhanced transcription with segments
export async function transcribeAudioDetailed(filePath: string): Promise<TranscriptionResult> {
  try {
    return await invoke('transcribe_audio_detailed', { filePath });
  } catch (error) {
    console.error('Detailed transcription error:', error);
    throw error;
  }
}

// Advanced audio analysis
export async function analyzeAudioFeatures(filePath: string): Promise<any> {
  try {
    return await invoke('analyze_audio_features', { filePath });
  } catch (error) {
    console.error('Audio analysis error:', error);
    throw error;
  }
}

// Chat with Dwight AI
export async function chatWithDwight(userInput: string): Promise<DwightResponse> {
  try {
    return await invoke('chat_with_dwight', { userInput });
  } catch (error) {
    console.error('Dwight chat error:', error);
    throw error;
  }
}

// Enhanced Dwight chat with advanced models
export async function enhancedDwightChat(
  userInput: string,
  useAdvancedModel?: boolean,
  contextDocuments?: string[]
): Promise<LlamaResponse> {
  try {
    return await invoke('enhanced_dwight_chat', { 
      userInput, 
      useAdvancedModel,
      contextDocuments 
    });
  } catch (error) {
    console.error('Enhanced Dwight chat error:', error);
    throw error;
  }
}

// Chat with Llama models
export async function chatWithLlama(
  prompt: string,
  model?: string
): Promise<LlamaResponse> {
  try {
    return await invoke('chat_with_llama', { prompt, model });
  } catch (error) {
    console.error('Llama chat error:', error);
    throw error;
  }
}

// RAG search
export async function ragSearch(
  query: string,
  contextDocuments: string[]
): Promise<LlamaResponse> {
  try {
    return await invoke('rag_search', { query, contextDocuments });
  } catch (error) {
    console.error('RAG search error:', error);
    throw error;
  }
}

// Get available AI models
export async function getAiModels(): Promise<ModelConfig[]> {
  try {
    return await invoke('get_ai_models');
  } catch (error) {
    console.error('Get AI models error:', error);
    throw error;
  }
}

// AI audio analysis
export async function aiAudioAnalysis(
  audioFeatures: number[],
  audioMetadata: any
): Promise<any> {
  try {
    return await invoke('ai_audio_analysis', { audioFeatures, audioMetadata });
  } catch (error) {
    console.error('AI audio analysis error:', error);
    throw error;
  }
}

// Python integration
export async function executePythonScript(
  scriptName: string,
  inputData: any
): Promise<PythonResult> {
  try {
    return await invoke('execute_python_script', { scriptName, inputData });
  } catch (error) {
    console.error('Python script execution error:', error);
    throw error;
  }
}

export async function getPythonScripts(): Promise<PythonScript[]> {
  try {
    return await invoke('get_python_scripts');
  } catch (error) {
    console.error('Get Python scripts error:', error);
    throw error;
  }
}

export async function pythonAudioPreprocessing(
  filePath: string,
  sampleRate?: number
): Promise<PythonResult> {
  try {
    return await invoke('python_audio_preprocessing', { filePath, sampleRate });
  } catch (error) {
    console.error('Python audio preprocessing error:', error);
    throw error;
  }
}

export async function pythonMlClassification(
  audioFeatures: any
): Promise<PythonResult> {
  try {
    return await invoke('python_ml_classification', { audioFeatures });
  } catch (error) {
    console.error('Python ML classification error:', error);
    throw error;
  }
}

// Whisper configuration
export async function configureWhisper(
  modelSize: string,
  language?: string,
  useCpp?: boolean,
  useGpu?: boolean
): Promise<string> {
  try {
    return await invoke('configure_whisper', { 
      modelSize, 
      language, 
      useCpp, 
      useGpu 
    });
  } catch (error) {
    console.error('Whisper configuration error:', error);
    throw error;
  }
}

export async function getWhisperStatus(): Promise<any> {
  try {
    return await invoke('get_whisper_status');
  } catch (error) {
    console.error('Get Whisper status error:', error);
    throw error;
  }
}

// AI-powered audio intelligence
export async function analyzeAudioIntelligence(audioFilePath: string): Promise<string[]> {
  try {
    return await invoke('analyze_audio_intelligence', { audioFilePath });
  } catch (error) {
    console.error('Audio intelligence error:', error);
    throw error;
  }
}

// Database operations
export async function saveAudioRecord(record: Omit<AudioRecord, 'id' | 'created_at'>): Promise<number> {
  try {
    return await invoke('save_audio_record', {
      title: record.title,
      filePath: record.file_path,
      transcript: record.transcript,
      duration: record.duration,
      triggers: record.triggers,
    });
  } catch (error) {
    console.error('Save audio record error:', error);
    throw error;
  }
}

export async function getAudioRecords(): Promise<AudioRecord[]> {
  try {
    return await invoke('get_audio_records');
  } catch (error) {
    console.error('Get audio records error:', error);
    throw error;
  }
}

export async function saveTrigger(triggerType: string, triggerValue: string): Promise<number> {
  try {
    return await invoke('save_trigger', { triggerType, triggerValue });
  } catch (error) {
    console.error('Save trigger error:', error);
    throw error;
  }
}

export async function getTriggers(): Promise<SoundTrigger[]> {
  try {
    return await invoke('get_triggers');
  } catch (error) {
    console.error('Get triggers error:', error);
    throw error;
  }
}

// File operations
export async function saveAudioFile(audioBlob: Blob, filename: string): Promise<string> {
  try {
    // Convert blob to Uint8Array for Tauri
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioData = Array.from(new Uint8Array(arrayBuffer));
    
    return await invoke('save_audio_file', { 
      audioData,
      filename 
    });
  } catch (error) {
    console.error('Save audio file error:', error);
    throw error;
  }
}