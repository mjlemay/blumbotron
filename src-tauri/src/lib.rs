use std::fs;
use std::path::PathBuf;
use tauri::{App, Manager};

const MIGRATION_SQL: &str = include_str!("../../drizzle/0000_glorious_starbolt.sql");

fn get_db_path(app: &App) -> PathBuf {
    let app_dir = app
        .path()
        .app_local_data_dir()
        .expect("Failed to get app data directory");
    fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    app_dir.join("blumbo.db")
}

fn run_migrations(db_path: &PathBuf) -> Result<(), Box<dyn std::error::Error>> {
    let conn = rusqlite::Connection::open(db_path)?;
    
    // Check if the games table exists
    let table_exists: bool = conn.query_row(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='games'",
        [],
        |_| Ok(true)
    ).unwrap_or(false);

    // Only run migrations if the table doesn't exist
    if !table_exists {
        conn.execute_batch(MIGRATION_SQL)?;
    }
    
    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new()
            .build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            let db_path = get_db_path(app);
            run_migrations(&db_path).expect("Failed to run migrations");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


    