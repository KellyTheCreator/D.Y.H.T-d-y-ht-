use tauri::command;
use serde::{Deserialize, Serialize};
use reqwest;
use anyhow::Result;
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    pub name: String,
    pub model_type: String,
    pub api_endpoint: Option<String>,
    pub local_path: Option<String>,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LlamaResponse {
    pub text: String,
    pub tokens_used: usize,
    pub processing_time_ms: u64,
    pub confidence: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RAGContext {
    pub query: String,
    pub documents: Vec<String>,
    pub embeddings: Vec<Vec<f32>>,
    pub similarity_scores: Vec<f32>,
}

pub struct AdvancedAI {
    models: HashMap<String, ModelConfig>,
    client: reqwest::Client,
}

impl AdvancedAI {
    pub fn new() -> Self {
        let mut models = HashMap::new();
        
        // Configure Llama 3 models
        models.insert("llama3-8b".to_string(), ModelConfig {
            name: "Llama 3 8B".to_string(),
            model_type: "llama".to_string(),
            api_endpoint: Some("http://localhost:11434/api/generate".to_string()), // Ollama endpoint
            local_path: None,
            enabled: true,
        });
        
        models.insert("llama3-70b".to_string(), ModelConfig {
            name: "Llama 3 70B".to_string(),
            model_type: "llama".to_string(),
            api_endpoint: Some("http://localhost:11434/api/generate".to_string()),
            local_path: None,
            enabled: false, // Disabled by default due to resource requirements
        });
        
        // Configure Mixtral models
        models.insert("mixtral-8x7b".to_string(), ModelConfig {
            name: "Mixtral 8x7B".to_string(),
            model_type: "mixtral".to_string(),
            api_endpoint: Some("http://localhost:11434/api/generate".to_string()),
            local_path: None,
            enabled: true,
        });
        
        // Configure Mistral models
        models.insert("mistral-7b".to_string(), ModelConfig {
            name: "Mistral 7B".to_string(),
            model_type: "mistral".to_string(),
            api_endpoint: Some("http://localhost:11434/api/generate".to_string()),
            local_path: None,
            enabled: true,
        });
        
        let client = reqwest::Client::new();
        
        AdvancedAI { models, client }
    }
    
    pub async fn query_llama(&self, prompt: &str, model: &str) -> Result<LlamaResponse> {
        let start_time = std::time::Instant::now();
        
        if let Some(config) = self.models.get(model) {
            if let Some(endpoint) = &config.api_endpoint {
                let payload = serde_json::json!({
                    "model": model,
                    "prompt": prompt,
                    "stream": false,
                    "options": {
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "max_tokens": 512,
                    }
                });
                
                // Add timeout to prevent hanging
                let response = self.client
                    .post(endpoint)
                    .json(&payload)
                    .timeout(std::time::Duration::from_secs(30))
                    .send()
                    .await
                    .map_err(|e| anyhow::anyhow!("Failed to connect to Ollama at {}: {}. Make sure Ollama is running with 'ollama serve'", endpoint, e))?;
                
                if response.status().is_success() {
                    let result: serde_json::Value = response.json().await?;
                    let text = result["response"].as_str().unwrap_or("No response").to_string();
                    
                    return Ok(LlamaResponse {
                        text,
                        tokens_used: prompt.split_whitespace().count(),
                        processing_time_ms: start_time.elapsed().as_millis() as u64,
                        confidence: 0.85,
                    });
                } else {
                    return Err(anyhow::anyhow!("Ollama returned error status: {}. Model '{}' may not be available. Try 'ollama pull {}'", response.status(), model, model));
                }
            }
        }
        
        // If no config found for model, return error instead of fallback
        Err(anyhow::anyhow!("Model '{}' not configured. Available models can be checked with 'ollama list'", model))
    }
    
    pub async fn rag_query(&self, query: &str, context_docs: Vec<String>) -> Result<LlamaResponse> {
        // Simplified RAG implementation
        let mut enriched_prompt = format!("Context documents:\n");
        
        for (i, doc) in context_docs.iter().enumerate() {
            enriched_prompt.push_str(&format!("Document {}: {}\n", i + 1, doc));
        }
        
        enriched_prompt.push_str(&format!("\nQuery: {}\n\nPlease answer the query based on the provided context.", query));
        
        // Use the best available model for RAG
        self.query_llama(&enriched_prompt, "llama3-8b").await
    }
    
    pub fn _get_available_models(&self) -> Vec<&ModelConfig> {
        self.models.values().filter(|config| config.enabled).collect()
    }
    
    // Check what models are actually available in Ollama
    pub async fn get_ollama_models(&self) -> Result<Vec<String>> {
        // Try to connect to Ollama and get list of available models
        let response = self.client
            .get("http://localhost:11434/api/tags")
            .timeout(std::time::Duration::from_secs(5))
            .send()
            .await
            .map_err(|e| anyhow::anyhow!("Ollama connection failed: {}. Ensure Ollama is running with 'ollama serve'", e))?;
            
        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Ollama returned status: {}", response.status()));
        }
        
        let data: serde_json::Value = response.json().await
            .map_err(|e| anyhow::anyhow!("Failed to parse Ollama response: {}", e))?;
            
        let models = data["models"]
            .as_array()
            .ok_or_else(|| anyhow::anyhow!("Invalid Ollama response format"))?
            .iter()
            .filter_map(|model| {
                model["name"].as_str().map(|s| s.to_string())
            })
            .collect();
            
        Ok(models)
    }
}

#[command]
pub async fn chat_with_llama(
    prompt: String,
    model: Option<String>,
) -> Result<LlamaResponse, String> {
    let ai = AdvancedAI::new();
    
    if let Some(specific_model) = model {
        // If user specified a model, try it directly
        ai.query_llama(&prompt, &specific_model)
            .await
            .map_err(|e| format!("Model '{}' error: {}", specific_model, e))
    } else {
        // Try different model names in order of preference  
        let model_candidates = ["llama3.2:1b", "llama3.2", "llama3:8b", "llama3", "llama3-8b", "llama2:7b", "llama2", "llama"];
        
        let mut last_error = String::new();
        for model_name in model_candidates.iter() {
            match ai.query_llama(&prompt, model_name).await {
                Ok(response) => return Ok(response),
                Err(e) => {
                    last_error = format!("Model '{}' failed: {}", model_name, e);
                    println!("Trying next model after error: {}", last_error);
                }
            }
        }
        
        // If all attempts failed, return a helpful error message
        Err(format!(
            "❌ Ollama AI models not available. Last error: {}\n\n🔧 To fix this:\n1. Install Ollama from https://ollama.ai\n2. Run: ollama serve\n3. Pull models: ollama pull llama3\n4. Restart this application\n\n💡 The chat works in demo mode without AI models.",
            last_error
        ))
    }
}

#[command]
pub async fn rag_search(
    query: String,
    context_documents: Vec<String>,
) -> Result<LlamaResponse, String> {
    let ai = AdvancedAI::new();
    
    ai.rag_query(&query, context_documents)
        .await
        .map_err(|e| format!("RAG error: {}", e))
}

#[command]
pub async fn get_ai_models() -> Result<Vec<ModelConfig>, String> {
    let ai = AdvancedAI::new();
    
    // First, try to get actual models from Ollama
    match ai.get_ollama_models().await {
        Ok(ollama_models) => {
            println!("Successfully connected to Ollama, found {} models", ollama_models.len());
            
            // Create model configs based on what's actually available in Ollama
            let mut available_models = Vec::new();
            
            for model_name in ollama_models {
                let name_lower = model_name.to_lowercase();
                
                if name_lower.contains("llama") {
                    available_models.push(ModelConfig {
                        name: format!("Llama ({})", model_name),
                        model_type: "llama".to_string(),
                        api_endpoint: Some("http://localhost:11434/api/generate".to_string()),
                        local_path: None,
                        enabled: true,
                    });
                } else if name_lower.contains("mistral") || name_lower.contains("mixtral") {
                    available_models.push(ModelConfig {
                        name: format!("Mistral ({})", model_name),
                        model_type: "mistral".to_string(),
                        api_endpoint: Some("http://localhost:11434/api/generate".to_string()),
                        local_path: None,
                        enabled: true,
                    });
                } else if name_lower.contains("gemma") {
                    available_models.push(ModelConfig {
                        name: format!("Gemma ({})", model_name),
                        model_type: "gemma".to_string(),
                        api_endpoint: Some("http://localhost:11434/api/generate".to_string()),
                        local_path: None,
                        enabled: true,
                    });
                } else {
                    // Add other models as generic
                    available_models.push(ModelConfig {
                        name: model_name.clone(),
                        model_type: "other".to_string(),
                        api_endpoint: Some("http://localhost:11434/api/generate".to_string()),
                        local_path: None,
                        enabled: true,
                    });
                }
            }
            
            // Add RAG capability if we have any language models
            if !available_models.is_empty() {
                available_models.push(ModelConfig {
                    name: "RAG Search".to_string(),
                    model_type: "rag".to_string(),
                    api_endpoint: Some("http://localhost:11434/api/generate".to_string()),
                    local_path: None,
                    enabled: true,
                });
            }
            
            Ok(available_models)
        }
        Err(e) => {
            println!("Failed to connect to Ollama: {}", e);
            // Return empty list to indicate no models are available
            Ok(vec![])
        }
    }
}

#[command]
pub async fn enhanced_dwight_chat(
    user_input: String,
    use_advanced_model: Option<bool>,
    context_documents: Option<Vec<String>>,
) -> Result<LlamaResponse, String> {
    let ai = AdvancedAI::new();
    
    // Enhanced Dwight prompt with personality and capabilities
    let dwight_prompt = format!(
        "You are Dwight, an advanced AI assistant specialized in audio analysis, surveillance, and security systems. \
        You are brilliant, analytical, loyal, and technically proficient. You help users with:\n\
        - Audio transcription and analysis\n\
        - Sound pattern recognition\n\
        - Security monitoring and alerts\n\
        - Forensic audio investigation\n\
        - Real-time audio processing\n\n\
        User input: {}\n\n\
        Respond as Dwight with technical expertise and helpful guidance:",
        user_input
    );
    
    if use_advanced_model.unwrap_or(false) && context_documents.is_some() {
        // Use RAG for context-aware responses
        ai.rag_query(&dwight_prompt, context_documents.unwrap()).await
    } else {
        // Try different model names in order of preference
        let model_candidates = ["llama3.2:1b", "llama3.2", "llama3:8b", "llama3", "llama3-8b", "llama2:7b", "llama2", "llama"];
        
        let mut last_error = String::new();
        for model_name in model_candidates.iter() {
            match ai.query_llama(&dwight_prompt, model_name).await {
                Ok(response) => return Ok(response),
                Err(e) => {
                    last_error = format!("Model '{}' failed: {}", model_name, e);
                    println!("Trying next model after error: {}", last_error);
                }
            }
        }
        
        // If all model attempts failed, return the last error
        Err(anyhow::anyhow!("All Llama models failed. Last error: {}. Please ensure Ollama is running and models are available.", last_error))
    }
    .map_err(|e| format!("Enhanced chat error: {}", e))
}

// Audio-specific AI analysis
#[command]
pub async fn ai_audio_analysis(
    audio_features: Vec<f32>,
    audio_metadata: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let ai = AdvancedAI::new();
    
    // Convert audio features to a descriptive prompt
    let avg_amplitude = audio_features.iter().sum::<f32>() / audio_features.len() as f32;
    let max_amplitude = audio_features.iter().fold(0.0f32, |a, &b| a.max(b));
    let zero_crossings = audio_features.windows(2).filter(|w| (w[0] >= 0.0) != (w[1] >= 0.0)).count();
    
    let analysis_prompt = format!(
        "Analyze this audio data:\n\
        - Average amplitude: {:.3}\n\
        - Peak amplitude: {:.3}\n\
        - Zero crossings: {}\n\
        - Sample count: {}\n\
        - Metadata: {}\n\n\
        Provide a detailed analysis of what this audio might contain, \
        potential sounds or speech patterns, and any security-relevant observations.",
        avg_amplitude, max_amplitude, zero_crossings, audio_features.len(), audio_metadata
    );
    
    let response = ai.query_llama(&analysis_prompt, "mixtral-8x7b").await
        .map_err(|e| format!("Audio analysis error: {}", e))?;
    
    Ok(serde_json::json!({
        "analysis": response.text,
        "confidence": response.confidence,
        "processing_time_ms": response.processing_time_ms,
        "audio_features": {
            "avg_amplitude": avg_amplitude,
            "peak_amplitude": max_amplitude,
            "zero_crossings": zero_crossings,
            "sample_count": audio_features.len()
        },
        "recommendations": [
            "Consider applying noise reduction if background noise is high",
            "Use trigger detection for automated monitoring",
            "Enable continuous recording for security applications"
        ]
    }))
}