import { invoke } from '@tauri-apps/api/tauri';

// Helper function to check if Tauri backend is available
function isTauriAvailable(): boolean {
  return typeof window !== 'undefined' && window.__TAURI_IPC__ !== undefined;
}

// Helper function to detect if Ollama is likely running by attempting a simple HTTP request
async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/version', {
      method: 'GET',
      signal: AbortSignal.timeout(2000) // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Helper function to get available Ollama models
async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    }
  } catch (error) {
    console.log('Ollama not accessible:', error);
  }
  return [];
}

// Helper function to chat with Ollama directly
async function chatWithOllama(prompt: string, model: string = 'llama3'): Promise<LlamaResponse> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 512
      }
    }),
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    text: data.response || "I apologize, but I couldn't process that request properly.",
    tokens_used: data.eval_count || 0,
    processing_time_ms: data.total_duration ? Math.round(data.total_duration / 1000000) : 0,
    confidence: 0.8
  };
}

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
    if (isTauriAvailable()) {
      return await invoke('chat_with_dwight', { userInput });
    } else {
      // Fallback to Ollama or mock response
      try {
        const llamaResponse = await chatWithOllama(userInput);
        return {
          message: llamaResponse.text,
          confidence: llamaResponse.confidence,
          context_used: false,
          suggestions: []
        };
      } catch (ollamaError) {
        // Mock intelligent responses based on input
        const response = generateMockDwightResponse(userInput);
        return {
          message: response,
          confidence: 0.6,
          context_used: false,
          suggestions: ["Try asking about audio analysis", "Ask about recording features", "Inquire about AI models"]
        };
      }
    }
  } catch (error) {
    console.error('Dwight chat error:', error);
    throw error;
  }
}

// Generate mock responses for web mode
function generateMockDwightResponse(userInput: string): string {
  const input = userInput.toLowerCase();
  
  if (input.includes('llama') || input.includes('ai') || input.includes('model')) {
    return "Indeed, Sir! I can see you're inquiring about AI models. While I'm currently running in web demonstration mode, I would normally connect to Ollama with Llama 3 when the full desktop application is running. Quite sophisticated technology, if I may say so!";
  }
  
  if (input.includes('audio') || input.includes('record') || input.includes('sound')) {
    return "Ah, audio matters! Most excellent choice, Sir. In the full application, I can analyze, transcribe, and inspect your audio files with remarkable precision. The web version demonstrates the interface beautifully, though the full audio processing requires the desktop application.";
  }
  
  if (input.includes('whisper') || input.includes('transcrib')) {
    return "Whisper AI transcription, Sir? Absolutely brilliant technology! When running the full desktop application with Whisper installed, I can provide detailed transcriptions with segment timing and confidence scores. Quite remarkable, really.";
  }
  
  if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
    return "Good day to you as well, Sir! I'm Dwight, your discerning digital butler. Currently operating in web demonstration mode, but ready to showcase the interface and discuss the full capabilities of our audio analysis system.";
  }
  
  if (input.includes('help') || input.includes('what') || input.includes('how')) {
    return "Certainly, Sir! I'm here to assist with audio analysis and management. Try using the recording controls, explore the AI model status panel, or ask me about specific features. The full desktop application provides complete functionality with local AI models.";
  }
  
  // Default response
  const responses = [
    "Most intriguing observation, Sir! While I'm currently in web demonstration mode, I find your inquiry quite stimulating indeed.",
    "Fascinating point, Sir! In the full desktop application, I would have access to complete AI capabilities and file system operations.",
    "Quite right, Sir! That's precisely the sort of sophisticated inquiry I do so enjoy addressing with my full analytical capabilities.",
    "Absolutely brilliant question, Sir! When connected to the proper AI models, I can provide much more detailed and contextual responses.",
    "Indeed, Sir! Your inquiry demonstrates excellent taste in digital butler interaction. The full application offers comprehensive audio and AI features."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Enhanced Dwight chat with advanced models
export async function enhancedDwightChat(
  userInput: string,
  useAdvancedModel?: boolean,
  contextDocuments?: string[]
): Promise<LlamaResponse> {
  try {
    if (isTauriAvailable()) {
      return await invoke('enhanced_dwight_chat', { 
        userInput, 
        useAdvancedModel,
        contextDocuments 
      });
    } else {
      // Try Ollama first
      try {
        return await chatWithOllama(userInput);
      } catch (ollamaError) {
        // Fallback to mock response
        const mockResponse = generateMockDwightResponse(userInput);
        return {
          text: mockResponse,
          tokens_used: mockResponse.length / 4, // Rough estimate
          processing_time_ms: 500,
          confidence: 0.7
        };
      }
    }
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
    if (isTauriAvailable()) {
      return await invoke('chat_with_llama', { prompt, model });
    } else {
      // Try direct Ollama connection
      return await chatWithOllama(prompt, model || 'llama3');
    }
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
    if (isTauriAvailable()) {
      return await invoke('get_ai_models');
    } else {
      // Check Ollama models directly
      const ollamaModels = await getOllamaModels();
      const modelConfigs: ModelConfig[] = [];
      
      // Convert Ollama model names to our model configs
      for (const modelName of ollamaModels) {
        const name = modelName.toLowerCase();
        if (name.includes('llama')) {
          modelConfigs.push({
            name: `Llama (${modelName})`,
            model_type: 'llama',
            api_endpoint: 'http://localhost:11434/api/generate',
            local_path: null,
            enabled: true
          });
        } else if (name.includes('mistral')) {
          modelConfigs.push({
            name: `Mistral (${modelName})`,
            model_type: 'mistral',
            api_endpoint: 'http://localhost:11434/api/generate',
            local_path: null,
            enabled: true
          });
        } else if (name.includes('gemma')) {
          modelConfigs.push({
            name: `Gemma (${modelName})`,
            model_type: 'gemma',
            api_endpoint: 'http://localhost:11434/api/generate',
            local_path: null,
            enabled: true
          });
        }
      }
      
      return modelConfigs;
    }
  } catch (error) {
    console.error('Get AI models error:', error);
    // Return empty array instead of throwing
    return [];
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
    if (isTauriAvailable()) {
      return await invoke('get_whisper_status');
    } else {
      // Check if Whisper is available locally
      // In web mode, we can't easily check for local Whisper installations
      // but we can provide a meaningful fallback status
      return {
        available: false,
        model_size: 'unknown',
        language: 'en',
        use_cpp: false,
        use_gpu: false,
        status: 'Web mode - Whisper requires desktop application',
        message: 'Whisper transcription is available in the full desktop application'
      };
    }
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
    if (isTauriAvailable()) {
      return await invoke('get_audio_records');
    } else {
      // Return empty array for web mode
      return [];
    }
  } catch (error) {
    console.error('Get audio records error:', error);
    // Return empty array instead of throwing
    return [];
  }
}

export async function saveTrigger(triggerType: string, triggerValue: string): Promise<number> {
  try {
    if (isTauriAvailable()) {
      return await invoke('save_trigger', { triggerType, triggerValue });
    } else {
      // Mock save for web mode
      console.log(`Mock save trigger: ${triggerType} = ${triggerValue}`);
      return Math.floor(Math.random() * 1000);
    }
  } catch (error) {
    console.error('Save trigger error:', error);
    throw error;
  }
}

export async function getTriggers(): Promise<SoundTrigger[]> {
  try {
    if (isTauriAvailable()) {
      return await invoke('get_triggers');
    } else {
      // Return default triggers for web mode
      return [
        {
          id: 1,
          trigger_type: 'sound',
          trigger_value: 'baby crying',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          trigger_type: 'sound',
          trigger_value: 'gunshots',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          trigger_type: 'speech',
          trigger_value: 'help',
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 4,
          trigger_type: 'speech',
          trigger_value: 'emergency',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];
    }
  } catch (error) {
    console.error('Get triggers error:', error);
    // Return default triggers instead of throwing
    return [];
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