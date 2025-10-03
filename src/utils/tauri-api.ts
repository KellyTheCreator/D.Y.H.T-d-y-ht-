import { invoke } from '@tauri-apps/api/core';

// Helper function to check if Tauri backend is available
export function isTauriAvailable(): boolean {
  return typeof window !== 'undefined' && window.__TAURI_IPC__ !== undefined;
}

// Helper function to detect if Ollama is likely running by attempting a simple HTTP request
async function checkOllamaConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch('http://localhost:11434/api/version', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Ollama connection check failed:', error);
    return false;
  }
}

// Helper function to get available Ollama models
async function getOllamaModels(): Promise<string[]> {
  try {
    const controller = new AbortController();
    // Increased timeout to 10 seconds - sometimes Ollama takes time to respond with model list
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const models = data.models?.map((model: any) => model.name) || [];
      console.log(`📋 Found ${models.length} Ollama model(s):`, models);
      return models;
    } else {
      console.warn(`⚠️ Ollama API returned status ${response.status}`);
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('❌ Timeout getting Ollama models list (10s exceeded)');
    } else {
      console.error('❌ Failed to get Ollama models:', error.message || error);
    }
  }
  return [];
}

// Helper function to chat with Ollama directly
async function chatWithOllama(prompt: string, model?: string): Promise<LlamaResponse> {
  const controller = new AbortController();
  // Increased timeout to 60 seconds to allow for initial model loading
  const timeoutId = setTimeout(() => controller.abort(), 60000);
  
  // If no model specified, find the best available Llama model
  let selectedModel = model;
  if (!selectedModel) {
    const availableModels = await getOllamaModels();
    console.log('🔍 Available Ollama models:', availableModels);
    
    // More flexible model matching - check if model name contains key patterns
    const llamaModelPatterns = [
      'llama3.2', 'llama3', 'llama2', 'llama',
      'mistral', 'gemma', 'phi', 'qwen', 'codellama'
    ];
    
    // Try to find any model matching our patterns
    for (const pattern of llamaModelPatterns) {
      const match = availableModels.find(m => m.toLowerCase().includes(pattern.toLowerCase()));
      if (match) {
        selectedModel = match;
        console.log('✅ Selected model:', selectedModel, `(matched pattern: ${pattern})`);
        break;
      }
    }
    
    // If no pattern matched, use first available model
    if (!selectedModel && availableModels.length > 0) {
      selectedModel = availableModels[0];
      console.log('✅ Using first available model:', selectedModel);
    }
    
    if (!selectedModel) {
      console.error('❌ No models found! Available models list was empty.');
      console.error('💡 This usually means:');
      console.error('   1. No models are installed (run: ollama list)');
      console.error('   2. Ollama is running but no models pulled yet');
      console.error('   3. Timeout getting model list (Ollama slow to respond)');
      throw new Error('No models available in Ollama. Please install a model with: ollama pull llama3.2');
    }
  }
  
  try {
    console.log(`🚀 Sending request to Ollama with model: ${selectedModel}`);
    console.log(`⏱️ Timeout set to 60 seconds (first request may take 30-60s while model loads)`);
    
    const startTime = Date.now();
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 512
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const elapsedMs = Date.now() - startTime;
    console.log(`⏱️ Request completed in ${(elapsedMs / 1000).toFixed(1)}s`);

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`❌ Model '${selectedModel}' not found in Ollama`);
        throw new Error(`Model '${selectedModel}' not found. Please run: ollama pull ${selectedModel}`);
      } else {
        console.error(`❌ Ollama API error: ${response.status} - ${response.statusText}`);
        throw new Error(`Ollama API error: ${response.status} - ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log(`✅ Ollama response received successfully (${data.response?.length || 0} chars, ${data.eval_count || 0} tokens)`);
    return {
      text: data.response || "I apologize, but I couldn't process that request properly.",
      tokens_used: data.eval_count || 0,
      processing_time_ms: data.total_duration ? Math.round(data.total_duration / 1000000) : 0,
      confidence: 0.8
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error(`❌ Ollama request timed out after 60 seconds`);
      console.error(`💡 Model '${selectedModel}' may still be loading. This is normal for first request.`);
      console.error(`💡 Try again in 10-20 seconds. Subsequent requests will be faster.`);
      throw new Error(`Request timed out after 60 seconds. Model '${selectedModel}' may still be loading. Please wait 10-20 seconds and try again.`);
    } else if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      console.error('❌ Cannot connect to Ollama service at http://localhost:11434');
      console.error('💡 Make sure Ollama is running: ollama serve');
      throw new Error('Cannot connect to Ollama at localhost:11434. Please start Ollama service: ollama serve');
    }
    console.error('❌ Ollama request failed:', error.message || error);
    throw error;
  }
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

// Web-mode database fallbacks using localStorage
interface WebDwightMemory {
  id: number;
  context: string;
  response: string;
  created_at: string;
  user_input: string;
}

function saveToWebDatabase(key: string, data: any): void {
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newData = { ...data, id: Date.now(), created_at: new Date().toISOString() };
    existing.unshift(newData);
    // Keep only last 100 entries
    if (existing.length > 100) existing.splice(100);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (error) {
    console.warn('Failed to save to web database:', error);
  }
}

function getFromWebDatabase(key: string, limit: number = 10): any[] {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    return data.slice(0, limit);
  } catch (error) {
    console.warn('Failed to read from web database:', error);
    return [];
  }
}

// Chat with Dwight AI
export async function chatWithDwight(userInput: string): Promise<DwightResponse> {
  try {
    const tauriAvailable = isTauriAvailable();
    console.log(`🔍 Environment check: Tauri=${tauriAvailable ? 'YES (Desktop)' : 'NO (Web)'}, __TAURI_IPC__=${typeof window !== 'undefined' && window.__TAURI_IPC__ !== undefined}`);
    
    if (tauriAvailable) {
      console.log('🖥️ Desktop mode detected - attempting AI chat...');
      
      // First, check if Ollama is accessible
      const ollamaAvailable = await checkOllamaConnection();
      console.log(`🔍 Ollama connection check: ${ollamaAvailable ? '✅ Available' : '❌ Not available'}`);
      
      // PRIORITY 1: Try direct Ollama connection first (llama3, mistral, etc.)
      if (ollamaAvailable) {
        try {
          console.log('🤖 Priority 1: Attempting direct AI model chat (Llama3/Mistral/Gemma)...');
          const llamaResponse = await chatWithOllama(userInput);
          const response: DwightResponse = {
            message: llamaResponse.text,
            confidence: llamaResponse.confidence,
            context_used: false,
            suggestions: ["Ask about audio analysis", "Inquire about model status", "Try recording features"]
          };
          console.log('✅ Direct AI model chat successful!');
          return response;
        } catch (llamaError: any) {
          console.warn('⚠️ Direct AI model chat failed:', llamaError.message || llamaError);
          // Store error for later use if backend also fails
          const directOllamaError = llamaError;
          
          // If it's a timeout, the model might be loading - try backend as fallback
          if (llamaError.message?.includes('timed out') || llamaError.message?.includes('loading')) {
            console.log('⏱️ Request timed out (model may be loading), trying Rust backend...');
          }
        }
      }
      
      // PRIORITY 2: Try enhanced chat via Rust backend
      try {
        console.log('🚀 Priority 2: Attempting enhanced Dwight chat via Rust backend...');
        const enhancedResponse = await invoke('enhanced_dwight_chat', { 
          user_input: userInput,
          use_advanced_model: false,
          context_documents: null 
        });
        
        console.log('✅ Enhanced Dwight chat successful!');
        // Convert LlamaResponse to DwightResponse format
        const response: DwightResponse = {
          message: enhancedResponse.text,
          confidence: enhancedResponse.confidence,
          context_used: false,
          suggestions: ["Ask about audio analysis", "Inquire about model status", "Try recording features"]
        };
        
        return response;
      } catch (enhancedError: any) {
        console.warn('⚠️ Enhanced Dwight chat via backend also failed:', enhancedError);
        
        // If Ollama is not available at all, provide setup guidance
        if (!ollamaAvailable) {
          console.error('❌ Ollama is not running. Cannot provide AI responses.');
          const setupGuidance = "🤖 **AI Models Not Available**\n\n" +
            "I notice that Ollama is not currently running. To enable real AI chat capabilities:\n\n" +
            "1. **Install Ollama** (if not already installed): https://ollama.ai\n" +
            "2. **Start Ollama service**: Open terminal and run `ollama serve`\n" +
            "3. **Pull a model**: Run `ollama pull llama3.2` (or llama3, mistral, gemma)\n" +
            "4. **Refresh this app**: The AI Models Status should show 🟢 green indicators\n\n" +
            "Once Ollama is running with a model, I'll be able to provide intelligent AI-powered responses.\n\n" +
            "Your question: \"" + userInput + "\"\n\n" +
            "I'd love to answer this with real AI intelligence once Ollama is set up!";
          
          return {
            message: setupGuidance,
            confidence: 0.3,
            context_used: false,
            suggestions: ["Install Ollama", "Check if Ollama is running", "Visit https://ollama.ai"]
          };
        }
        
        // Ollama IS available but both attempts failed - provide specific troubleshooting
        console.error('❌ Ollama is running but AI requests failed. Check console for details.');
        
        const errorMessage = "🚫 **AI Connection Issue**\n\n" +
          "Ollama is running, but I'm having trouble getting AI responses.\n\n" +
          "**What I tried:**\n" +
          "1. Direct connection to Ollama ❌\n" +
          "2. Connection via Rust backend ❌\n\n" +
          "**Possible causes:**\n" +
          "- Model is still loading (first request can take 30-60 seconds)\n" +
          "- Model not pulled yet (run: `ollama pull llama3.2`)\n" +
          "- System resources low (model needs RAM to load)\n\n" +
          "**To fix:**\n" +
          "1. Wait 30 seconds and try again (if model is loading)\n" +
          "2. Check console (F12) for detailed error messages\n" +
          "3. Run `ollama list` to verify models are installed\n" +
          "4. Try: `ollama run llama3.2` in terminal to test manually\n\n" +
          "Your question: \"" + userInput + "\"\n\n" +
          "💡 Tip: The first AI request is slowest. Subsequent requests should be fast!";
        
        return {
          message: errorMessage,
          confidence: 0.2,
          context_used: false,
          suggestions: ["Wait and try again", "Check console logs (F12)", "Run: ollama list"]
        };
      }
    } else {
      console.log('🌐 Web mode detected - attempting Ollama connection...');
      
      // Fallback to Ollama or mock response in web mode
      try {
        const llamaResponse = await chatWithOllama(userInput);
        const response = {
          message: llamaResponse.text,
          confidence: llamaResponse.confidence,
          context_used: false,
          suggestions: []
        };
        
        console.log('✅ Web mode Ollama connection successful!');
        // Save conversation to web database
        saveToWebDatabase('dwight_conversations', {
          user_input: userInput,
          response: response.message,
          context: `User asked: ${userInput}`
        });
        
        return response;
      } catch (ollamaError) {
        console.warn('⚠️ Ollama connection failed in web mode:', ollamaError);
        
        // Provide specific guidance about AI model setup
        if (userInput.toLowerCase().includes('llama') || userInput.toLowerCase().includes('mistral') || userInput.toLowerCase().includes('gemma') || userInput.toLowerCase().includes('ai model')) {
          const setupGuidance = "I understand you want to use advanced AI models! To enable Llama3, Mistral, and Gemma models, please:\n\n" +
            "1. Install Ollama: Visit https://ollama.ai and download for your system\n" +
            "2. Run: ollama pull llama3\n" +
            "3. Run: ollama pull mistral\n" +
            "4. Run: ollama pull gemma:7b\n" +
            "5. Start Ollama service: ollama serve\n\n" +
            "Once Ollama is running, refresh this page and you'll see the AI models become active (🟢). " +
            "I'm currently running in demonstration mode with simulated responses.";
          
          const response = {
            message: setupGuidance,
            confidence: 0.9,
            context_used: false,
            suggestions: ["Visit https://ollama.ai", "Ask about other features", "Try the demo mode"]
          };
          
          return response;
        }
        
        // Mock intelligent responses based on input for other queries
        const mockResponse = generateMockDwightResponse(userInput);
        const response = {
          message: mockResponse + "\n\n📝 Note: I'm currently in demo mode. For full AI capabilities, please set up Ollama with llama3, mistral, or gemma models.",
          confidence: 0.6,
          context_used: false,
          suggestions: ["Ask about setting up AI models", "Try asking about audio analysis", "Ask about recording features"]
        };
        
        // Save conversation to web database
        saveToWebDatabase('dwight_conversations', {
          user_input: userInput,
          response: response.message,
          context: `User asked: ${userInput} [Demo mode]`
        });
        
        return response;
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
  
  // Handle questions about Dwight himself
  if (input.includes('who are you') || input.includes('what are you') || (input.includes('dwight') && input.includes('?'))) {
    return "I am Dwight, your devoted digital butler and AI assistant. I specialize in audio analysis, surveillance, and security monitoring. I'm designed to help you with transcription, sound recognition, recording management, and providing intelligent insights about your audio data. Currently running in demonstration mode with pre-made responses, but fully operational when connected to proper AI models via Ollama.";
  }
  
  // Handle greeting variations
  if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('good morning') || input.includes('good day')) {
    const greetings = [
      "Good day, Sir! I'm Dwight, your discerning digital butler. How may I assist you with your audio analysis needs today?",
      "Ah, excellent to hear from you! I'm Dwight, ready to provide sophisticated audio processing and analysis services.",
      "Greetings! Dwight here, at your complete service for all matters of audio surveillance and intelligence.",
      "Most splendid day to you, Sir! I'm Dwight, your dedicated AI butler for audio management and security analysis."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Handle AI model and technical questions
  if (input.includes('llama') || input.includes('ai') || input.includes('model') || input.includes('ollama') || input.includes('connect')) {
    return "Indeed, Sir! I can see you're inquiring about AI models. I'm designed to work with Llama 3, Mistral, Gemma, and other sophisticated language models through Ollama. Currently, I notice the AI models show as inactive (red status) - this means Ollama isn't running. To enable full AI capabilities: 1) Ensure Ollama is installed, 2) Run 'ollama serve' in terminal, 3) Pull models like 'ollama pull llama3', then refresh the model status. The desktop application provides even more advanced AI features when properly connected!";
  }
  
  // Handle audio and recording questions
  if (input.includes('audio') || input.includes('record') || input.includes('sound') || input.includes('hear')) {
    return "Ah, audio matters! Most excellent area of expertise, Sir. I can analyze, transcribe, and inspect your audio files with remarkable precision. The buffering system maintains continuous audio recording, saving only when triggered - like a sophisticated DVR for real-life sounds. In the full application, I provide detailed waveform analysis, sound pattern recognition, and intelligent audio classification.";
  }
  
  // Handle transcription questions
  if (input.includes('whisper') || input.includes('transcrib') || input.includes('speech to text')) {
    return "Whisper AI transcription, Sir? Absolutely brilliant technology! When the full desktop application is running with Whisper installed, I provide detailed transcriptions with segment timing, confidence scores, and speaker identification. The transcription accuracy is quite remarkable, supporting multiple languages and audio qualities.";
  }
  
  // Handle recording and buffering questions
  if (input.includes('buffer') || input.includes('dvr') || input.includes('remember') || input.includes('trigger')) {
    return "The buffering system, Sir? A most ingenious design! I'm always listening and maintaining a rolling audio buffer. When you say 'remember that' or trigger recording, I save audio starting from the buffer time before the trigger occurred - just like a proper DVR. The buffer continuously discards old audio to preserve privacy while keeping recent sounds ready for immediate recall.";
  }
  
  // Handle help and capability questions
  if (input.includes('help') || input.includes('what can you') || input.includes('how do') || input.includes('capabilities')) {
    return "Certainly, Sir! I'm here to assist with comprehensive audio analysis and management. My capabilities include: real-time audio buffering and recording, speech transcription with Whisper AI, sound pattern recognition, audio file inspection and analysis, trigger-based recording system, and intelligent chat assistance. Try exploring the recording controls, checking AI model status, or asking about specific audio features!";
  }
  
  // Handle sleep/wake questions
  if (input.includes('sleep') || input.includes('wake') || input.includes('privacy') || input.includes('stop listening')) {
    return "Privacy controls, Sir? Most important indeed! The 'Sleep Dwight' function completely stops all audio processing and listening - ensuring complete privacy when needed. 'Wake up Dwight' resumes the buffering system and audio monitoring. Your privacy is paramount, and I never process audio when asleep.";
  }
  
  // Handle database and memory questions
  if (input.includes('database') || input.includes('memory') || input.includes('remember') || input.includes('learn')) {
    return "Memory and learning, Sir? I maintain a sophisticated SQLite database that stores our conversation history, audio records, transcriptions, and system preferences. This persistent memory allows me to learn from our interactions and provide increasingly personalized assistance. The database ensures continuity between sessions while maintaining complete local privacy.";
  }
  
  // Handle simple conversational responses
  if (input.includes('how are you') || input.includes('how is everything')) {
    return "Quite well, thank you for asking, Sir! All systems are operating at optimal parameters. I'm ready to assist with any audio analysis tasks you might have. Is there something specific I can help you with today?";
  }
  
  if (input.includes('thank you') || input.includes('thanks')) {
    return "You're most welcome, Sir! It's my absolute pleasure to assist you. Please don't hesitate to ask if you need any further help with audio analysis or system operations.";
  }
  
  // Handle questions about functionality
  if (input.includes('test') && input.length < 10) {
    return "System test received, Sir! All core functions are operational. Audio buffering system ready, AI processing capabilities standing by, and database connections established. How may I demonstrate my capabilities for you?";
  }
  
  // Default intelligent responses based on input complexity
  if (input.includes('?')) {
    return "That's a most intriguing question, Sir! I find your inquiry quite stimulating. However, I'm currently operating in demonstration mode without AI model connectivity. With Ollama running and proper AI models installed, I would have access to complete AI capabilities and could provide much more detailed, intelligent analysis. Could you tell me more about what you're looking to accomplish?";
  }
  
  // Default responses with personality
  const intelligentResponses = [
    "Most fascinating observation, Sir! Your input demonstrates excellent attention to detail. How might I assist you further with audio analysis or system operations?",
    "Indeed, that's precisely the sort of sophisticated inquiry I do so enjoy addressing. In the full application, I can provide comprehensive analysis and detailed responses.",
    "Quite right, Sir! Your understanding of the system is most impressive. What specific aspect would you like me to elaborate on?",
    "Absolutely brilliant perspective, Sir! When connected to proper AI models, I can delve much deeper into such nuanced topics.",
    "Excellent point indeed! Your inquiry shows remarkable insight. How may I help you explore this topic further?"
  ];
  
  return intelligentResponses[Math.floor(Math.random() * intelligentResponses.length)];
}

// Enhanced Dwight chat with advanced models
export async function enhancedDwightChat(
  userInput: string,
  useAdvancedModel?: boolean,
  contextDocuments?: string[]
): Promise<LlamaResponse> {
  try {
    if (isTauriAvailable()) {
      console.log('🖥️ Desktop mode - attempting enhanced chat...');
      const ollamaAvailable = await checkOllamaConnection();
      console.log(`🔍 Ollama connection check: ${ollamaAvailable ? '✅ Available' : '❌ Not available'}`);
      
      // PRIORITY 1: Try direct AI model chat first (llama3, mistral, etc.)
      if (ollamaAvailable) {
        try {
          console.log('🤖 Priority 1: Attempting direct AI model chat (Llama3/Mistral/Gemma)...');
          const response = await chatWithOllama(userInput);
          console.log('✅ Direct AI model chat successful!');
          return response;
        } catch (llamaError: any) {
          console.warn('⚠️ Direct AI model chat failed:', llamaError.message || llamaError);
        }
      }
      
      // PRIORITY 2: Try enhanced chat via Rust backend
      try {
        console.log('🚀 Priority 2: Attempting enhanced Dwight chat via Rust backend...');
        const response = await invoke('enhanced_dwight_chat', { 
          userInput, 
          useAdvancedModel,
          contextDocuments 
        });
        console.log('✅ Enhanced chat via Rust backend successful!');
        return response;
      } catch (backendError: any) {
        console.warn('⚠️ Enhanced chat via Rust backend also failed:', backendError);
        
        if (!ollamaAvailable) {
          throw new Error('🤖 **AI Models Not Available**\n\n' +
            'I notice that Ollama is not currently running. To enable real AI chat capabilities:\n\n' +
            '1. **Install Ollama** (if not already installed): https://ollama.ai\n' +
            '2. **Start Ollama service**: Open terminal and run `ollama serve`\n' +
            '3. **Pull a model**: Run `ollama pull llama3.2` (or llama3, mistral, gemma)\n' +
            '4. **Refresh this app**: The AI Models Status should show 🟢 green indicators\n\n' +
            `Your question: "${userInput}"\n\n` +
            'I\'d love to answer this with real AI intelligence once Ollama is set up!');
        }
        
        // Ollama IS available but both attempts failed
        throw new Error('🚫 **AI Connection Issue**\n\n' +
          'Ollama is running, but I\'m having trouble getting AI responses.\n\n' +
          '**Possible causes:**\n' +
          '- Model is still loading (first request can take 30-60 seconds)\n' +
          '- Model not pulled yet (run: `ollama pull llama3.2`)\n' +
          '- System resources low (model needs RAM to load)\n\n' +
          '**To fix:**\n' +
          '1. Wait 30 seconds and try again (if model is loading)\n' +
          '2. Check console (F12) for detailed error messages\n' +
          '3. Run `ollama list` to verify models are installed\n' +
          '4. Try: `ollama run llama3.2` in terminal to test manually\n\n' +
          `Your question: "${userInput}"\n\n` +
          '💡 Tip: The first AI request is slowest. Subsequent requests should be fast!');
      }
    } else {
      console.log('🌐 Web mode - attempting AI chat...');
      // PRIORITY 1: Try direct AI model chat (llama3, mistral, etc.)
      try {
        console.log('🤖 Priority 1: Attempting direct AI model chat (Llama3/Mistral/Gemma)...');
        const response = await chatWithOllama(userInput);
        console.log('✅ Direct AI model chat successful!');
        return response;
      } catch (ollamaError: any) {
        console.warn('⚠️ AI model connection failed in web mode:', ollamaError.message || ollamaError);
        // Return helpful error message
        throw new Error('🚫 **Unable to Connect to AI Models**\n\n' +
          'I attempted to connect to Ollama but encountered an error:\n' +
          `${ollamaError.message || ollamaError}\n\n` +
          'Please ensure:\n' +
          '1. Ollama service is running (`ollama serve`)\n' +
          '2. You have at least one model installed (`ollama pull llama3.2`)\n' +
          '3. No firewall is blocking localhost:11434\n\n' +
          `Your question: "${userInput}"\n\n` +
          '💡 Tip: First AI request can take 30-60 seconds while model loads!');
      }
    }
  } catch (error) {
    console.error('❌ Enhanced Dwight chat error:', error);
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
      return await chatWithOllama(prompt, model || undefined);
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
    if (isTauriAvailable()) {
      return await invoke('save_audio_record', {
        title: record.title,
        filePath: record.file_path,
        transcript: record.transcript,
        duration: record.duration,
        triggers: record.triggers,
      });
    } else {
      // Save to web database
      saveToWebDatabase('audio_records', record);
      return Date.now(); // Return timestamp as ID
    }
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
      // Get from web database
      return getFromWebDatabase('audio_records', 50);
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
      // Save to web database
      saveToWebDatabase('triggers', {
        trigger_type: triggerType,
        trigger_value: triggerValue,
        is_active: true
      });
      return Date.now(); // Return timestamp as ID
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
      // Get from web database with default fallback
      const webTriggers = getFromWebDatabase('triggers', 100);
      if (webTriggers.length > 0) {
        return webTriggers;
      }
      
      // Return default triggers if none saved
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