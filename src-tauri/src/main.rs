#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{WindowEvent, Manager};

mod whisper;
mod database;
mod ai;
mod ai_models;
mod python_integration;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize database on startup
            let app_handle = app.handle();
            match database::Database::new(&app_handle) {
                Ok(_) => println!("Database initialized successfully"),
                Err(e) => eprintln!("Failed to initialize database: {}", e),
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Whisper transcription
            whisper::transcribe_audio,
            whisper::transcribe_audio_detailed,
            whisper::analyze_audio_features,
            whisper::configure_whisper,
            whisper::get_whisper_status,
            
            // Original AI chat
            ai::chat_with_dwight,
            ai::analyze_audio_intelligence,
            
            // Advanced AI models
            ai_models::chat_with_llama,
            ai_models::rag_search,
            ai_models::get_ai_models,
            ai_models::enhanced_dwight_chat,
            ai_models::ai_audio_analysis,
            
            // Python integration
            python_integration::execute_python_script,
            python_integration::get_python_scripts,
            python_integration::python_audio_preprocessing,
            python_integration::python_ml_classification,
            
            // Database operations
            database_commands::save_audio_record,
            database_commands::get_audio_records,
            database_commands::save_trigger,
            database_commands::get_triggers,
            
            // File operations
            file_commands::save_audio_file
        ])
        .on_window_event(|_window, event| {
            if let WindowEvent::CloseRequested { .. } = event {
                // Handle cleanup if needed
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}

mod database_commands {
    use tauri::command;
    use crate::database::{Database, AudioRecord, SoundTrigger};

    #[command]
    pub async fn save_audio_record(
        title: String,
        file_path: String,
        transcript: Option<String>,
        duration: f64,
        triggers: Option<String>,
        app_handle: tauri::AppHandle,
    ) -> Result<i64, String> {
        let db = Database::new(&app_handle).map_err(|e| format!("Database error: {}", e))?;
        
        let record = AudioRecord {
            id: None,
            title,
            file_path,
            transcript,
            duration,
            created_at: String::new(),
            triggers,
        };
        
        db.save_audio_record(&record).map_err(|e| format!("Database error: {}", e))
    }

    #[command]
    pub async fn get_audio_records(app_handle: tauri::AppHandle) -> Result<Vec<AudioRecord>, String> {
        let db = Database::new(&app_handle).map_err(|e| format!("Database error: {}", e))?;
        
        db.get_all_audio_records().map_err(|e| format!("Database error: {}", e))
    }

    #[command]
    pub async fn save_trigger(
        trigger_type: String,
        trigger_value: String,
        app_handle: tauri::AppHandle,
    ) -> Result<i64, String> {
        let db = Database::new(&app_handle).map_err(|e| format!("Database error: {}", e))?;

        let trigger = SoundTrigger {
            id: None,
            trigger_type,
            trigger_value,
            is_active: true,
            created_at: String::new(),
        };
        
        db.save_trigger(&trigger).map_err(|e| format!("Database error: {}", e))
    }

    #[command]
    pub async fn get_triggers(app_handle: tauri::AppHandle) -> Result<Vec<SoundTrigger>, String> {
        let db = Database::new(&app_handle).map_err(|e| format!("Database error: {}", e))?;
        
        db.get_active_triggers().map_err(|e| format!("Database error: {}", e))
    }
}

mod file_commands {
    use tauri::{command, Manager};
    use std::fs;

    #[command]
    pub async fn save_audio_file(
        audio_data: Vec<u8>,
        filename: String,
        app_handle: tauri::AppHandle,
    ) -> Result<String, String> {
        let app_data_path = app_handle.path().app_data_dir()
            .map_err(|e| format!("Failed to get app data directory: {}", e))?;
        
        // Create recordings directory
        let recordings_dir = app_data_path.join("recordings");
        fs::create_dir_all(&recordings_dir)
            .map_err(|e| format!("Failed to create recordings directory: {}", e))?;
        
        // Generate safe filename
        let safe_filename = filename.chars()
            .map(|c| if c.is_alphanumeric() || c == '.' || c == '-' || c == '_' { c } else { '_' })
            .collect::<String>();
        
        let file_path = recordings_dir.join(safe_filename);
        
        // Write audio data to file
        fs::write(&file_path, audio_data)
            .map_err(|e| format!("Failed to write audio file: {}", e))?;
        
        // Return the absolute path as string
<<<<<<< HEAD
        Ok(file_path.to_string_lossy().into_owned())
=======
        Ok(file_path.to_string_lossy().to_string())
>>>>>>> f9c5101a25a326380e0be6f0fa1e7d4a7ebe7fd8
    }
}