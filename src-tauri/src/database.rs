use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct AudioRecord {
    pub id: Option<i32>,
    pub title: String,
    pub file_path: String,
    pub transcript: Option<String>,
    pub duration: f64,
    pub created_at: String,
    pub triggers: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DwightMemory {
    pub id: Option<i32>,
    pub context: String,
    pub response: String,
    pub created_at: String,
    pub user_input: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SoundTrigger {
    pub id: Option<i32>,
    pub trigger_type: String, // "sound" or "speech"
    pub trigger_value: String,
    pub is_active: bool,
    pub created_at: String,
}

pub struct Database {
    connection: Connection,
}

impl Database {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self> {
        let app_data_path = app_handle.path().app_data_dir()
            .map_err(|e| rusqlite::Error::SqliteFailure(
                rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN),
                Some(format!("Failed to get app data directory: {}", e))
            ))?;
        
        std::fs::create_dir_all(&app_data_path).map_err(|e| rusqlite::Error::SqliteFailure(
            rusqlite::ffi::Error::new(rusqlite::ffi::SQLITE_CANTOPEN),
            Some(format!("Failed to create app data directory: {}", e))
        ))?;
        
        let db_path = app_data_path.join("dwight.db");
        let connection = Connection::open(db_path)?;
        
        let db = Database { connection };
        db.initialize_tables()?;
        Ok(db)
    }

    fn initialize_tables(&self) -> Result<()> {
        // Audio records table
        self.connection.execute(
            "CREATE TABLE IF NOT EXISTS audio_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                file_path TEXT NOT NULL,
                transcript TEXT,
                duration REAL NOT NULL,
                created_at TEXT NOT NULL,
                triggers TEXT
            )",
            [],
        )?;

        // Dwight's memory/conversation history
        self.connection.execute(
            "CREATE TABLE IF NOT EXISTS dwight_memory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                context TEXT NOT NULL,
                response TEXT NOT NULL,
                created_at TEXT NOT NULL,
                user_input TEXT NOT NULL
            )",
            [],
        )?;

        // Sound and speech triggers
        self.connection.execute(
            "CREATE TABLE IF NOT EXISTS sound_triggers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trigger_type TEXT NOT NULL,
                trigger_value TEXT NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            )",
            [],
        )?;

        Ok(())
    }

    pub fn save_audio_record(&self, record: &AudioRecord) -> Result<i64> {
        let now = chrono::Utc::now().to_rfc3339();
        self.connection.execute(
            "INSERT INTO audio_records (title, file_path, transcript, duration, created_at, triggers)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                &record.title,
                &record.file_path,
                record.transcript.as_deref().unwrap_or(""),
                &record.duration.to_string(),
                &now,
                record.triggers.as_deref().unwrap_or(""),
            ],
        )?;
        Ok(self.connection.last_insert_rowid())
    }

    pub fn save_dwight_memory(&self, memory: &DwightMemory) -> Result<i64> {
        let now = chrono::Utc::now().to_rfc3339();
        self.connection.execute(
            "INSERT INTO dwight_memory (context, response, created_at, user_input)
             VALUES (?1, ?2, ?3, ?4)",
            [&memory.context, &memory.response, &now, &memory.user_input],
        )?;
        Ok(self.connection.last_insert_rowid())
    }

    pub fn save_trigger(&self, trigger: &SoundTrigger) -> Result<i64> {
        let now = chrono::Utc::now().to_rfc3339();
        self.connection.execute(
            "INSERT INTO sound_triggers (trigger_type, trigger_value, is_active, created_at)
             VALUES (?1, ?2, ?3, ?4)",
            [&trigger.trigger_type, &trigger.trigger_value, &trigger.is_active.to_string(), &now],
        )?;
        Ok(self.connection.last_insert_rowid())
    }

    pub fn get_all_audio_records(&self) -> Result<Vec<AudioRecord>> {
        let mut stmt = self.connection.prepare(
            "SELECT id, title, file_path, transcript, duration, created_at, triggers FROM audio_records ORDER BY created_at DESC"
        )?;
        
        let record_iter = stmt.query_map([], |row| {
            Ok(AudioRecord {
                id: Some(row.get(0)?),
                title: row.get(1)?,
                file_path: row.get(2)?,
                transcript: row.get::<_, Option<String>>(3)?,
                duration: row.get(4)?,
                created_at: row.get(5)?,
                triggers: row.get::<_, Option<String>>(6)?,
            })
        })?;

        let mut records = Vec::new();
        for record in record_iter {
            records.push(record?);
        }
        Ok(records)
    }

    pub fn get_dwight_memory_context(&self, limit: usize) -> Result<Vec<DwightMemory>> {
        let mut stmt = self.connection.prepare(
            "SELECT id, context, response, created_at, user_input FROM dwight_memory ORDER BY created_at DESC LIMIT ?1"
        )?;
        
        let memory_iter = stmt.query_map([limit], |row| {
            Ok(DwightMemory {
                id: Some(row.get(0)?),
                context: row.get(1)?,
                response: row.get(2)?,
                created_at: row.get(3)?,
                user_input: row.get(4)?,
            })
        })?;

        let mut memories = Vec::new();
        for memory in memory_iter {
            memories.push(memory?);
        }
        Ok(memories)
    }

    pub fn get_active_triggers(&self) -> Result<Vec<SoundTrigger>> {
        let mut stmt = self.connection.prepare(
            "SELECT id, trigger_type, trigger_value, is_active, created_at FROM sound_triggers WHERE is_active = 1"
        )?;
        
        let trigger_iter = stmt.query_map([], |row| {
            Ok(SoundTrigger {
                id: Some(row.get(0)?),
                trigger_type: row.get(1)?,
                trigger_value: row.get(2)?,
                is_active: row.get(3)?,
                created_at: row.get(4)?,
            })
        })?;

        let mut triggers = Vec::new();
        for trigger in trigger_iter {
            triggers.push(trigger?);
        }
        Ok(triggers)
    }
}