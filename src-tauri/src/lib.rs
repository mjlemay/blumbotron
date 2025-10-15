use tauri_plugin_sql::{Migration, MigrationKind, Builder};
use tauri::Manager;
use std::fs;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use base64::{Engine as _, engine::general_purpose};
use once_cell::sync::Lazy;

// Global cache for media files (filename -> base64 data)
static MEDIA_CACHE: Lazy<Arc<RwLock<HashMap<String, String>>>> = 
    Lazy::new(|| Arc::new(RwLock::new(HashMap::new())));

const MIGRATION_SQL: &str = include_str!("../../drizzle/0000_neat_wong.sql");
const DB_PATH: &str = "sqlite:blumbo.db";

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Blumbotron!", name)
}

#[tauri::command]
async fn create_display_window(
    app_handle: tauri::AppHandle,
    game: Option<String>,
    width: u32,
    height: u32,
) -> Result<(), String> {
    let window_label = format!("display-{}", game.clone().unwrap_or_else(|| "default".to_string()));
    
    // Build URL with game parameter
    let url = match game {
        Some(ref g) => format!("viewer.html?mode=display&game={}", g),
        None => "viewer.html?mode=display".to_string(),
    };
    
    println!("Creating display window with URL: {}", url);
    println!("Game parameter: {:?}", game);
    
    let window = tauri::WebviewWindowBuilder::new(
        &app_handle,
        window_label.clone(),
        tauri::WebviewUrl::App(url.parse().unwrap())
    )
    .title("Blumbotron Display")
    .inner_size(width as f64, height as f64)
    .center()
    .resizable(true)
    .fullscreen(false)
    .focused(true)
    .build()
    .map_err(|e| e.to_string())?;

    // Add window event handler for close events
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::CloseRequested { .. } = event {
            println!("Display window closed");
        }
    });

    Ok(())
}

#[tauri::command]
async fn save_background_image(
    app_handle: tauri::AppHandle,
    file_name: String,
    image_data: String,
) -> Result<String, String> {
    println!("Saving background image: {}", file_name);
    
    // Get app data directory
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    // Create images subdirectory
    let images_dir = app_data_dir.join("images");
    if !images_dir.exists() {
        fs::create_dir_all(&images_dir)
            .map_err(|e| format!("Failed to create images directory: {}", e))?;
    }
    
    // Decode base64 image data
    let image_bytes = general_purpose::STANDARD
        .decode(&image_data)
        .map_err(|e| format!("Failed to decode base64 image data: {}", e))?;
    
    // Write file
    let file_path = images_dir.join(&file_name);
    fs::write(&file_path, image_bytes)
        .map_err(|e| format!("Failed to write image file: {}", e))?;
    
    println!("Background image saved to: {:?}", file_path);
    
    // Return the full path as string
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn delete_background_image(
    app_handle: tauri::AppHandle,
    file_name: String,
) -> Result<(), String> {
    println!("Deleting background image: {}", file_name);
    
    // Get app data directory
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    // Construct file path
    let file_path = app_data_dir.join("images").join(&file_name);
    
    // Delete file if it exists
    if file_path.exists() {
        fs::remove_file(&file_path)
            .map_err(|e| format!("Failed to delete image file: {}", e))?;
        println!("Background image deleted: {:?}", file_path);
    }
    
    Ok(())
}

#[tauri::command]
async fn get_background_image_path(
    app_handle: tauri::AppHandle,
    file_name: String,
) -> Result<String, String> {
    // Get app data directory
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    // Construct file path
    let file_path = app_data_dir.join("images").join(&file_name);
    
    // Return the full path as string
    Ok(file_path.to_string_lossy().to_string())
}

#[tauri::command]
async fn get_background_image_data(
    app_handle: tauri::AppHandle,
    file_name: String,
) -> Result<String, String> {
    println!("Getting background image data for: {}", file_name);
    
    // Check cache first
    {
        let cache = MEDIA_CACHE.read().await;
        if let Some(cached_data) = cache.get(&file_name) {
            println!("Cache hit for: {}", file_name);
            return Ok(cached_data.clone());
        }
    }
    
    // Get app data directory
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    // Construct file path
    let file_path = app_data_dir.join("images").join(&file_name);
    
    // Check if file exists
    if !file_path.exists() {
        return Err(format!("Image file not found: {:?}", file_path));
    }
    
    // Read file data asynchronously
    let image_data = tokio::fs::read(&file_path).await
        .map_err(|e| format!("Failed to read image file: {}", e))?;
    
    // Encode as base64
    let base64_data = general_purpose::STANDARD.encode(&image_data);
    
    // Determine MIME type based on file extension
    let extension = file_path.extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("png")
        .to_lowercase();
    
    let mime_type = match extension.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        _ => "image/png",
    };
    
    // Return as data URL
    let data_url = format!("data:{};base64,{}", mime_type, base64_data);
    println!("Generated data URL with length: {} (cached)", data_url.len());
    
    // Cache the result
    {
        let mut cache = MEDIA_CACHE.write().await;
        cache.insert(file_name.clone(), data_url.clone());
        
        // Basic cache size management (keep only 50 items)
        if cache.len() > 50 {
            let keys_to_remove: Vec<String> = cache.keys().take(10).cloned().collect();
            for key in keys_to_remove {
                cache.remove(&key);
            }
            println!("Cache cleanup performed");
        }
    }
    
    Ok(data_url)
}

#[tauri::command]
async fn clear_media_cache() -> Result<String, String> {
    let mut cache = MEDIA_CACHE.write().await;
    let count = cache.len();
    cache.clear();
    println!("Cleared {} items from media cache", count);
    Ok(format!("Cleared {} cached items", count))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "Create tables",
        sql: MIGRATION_SQL,
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(
            Builder::new()
                .add_migrations(DB_PATH, migrations)
                .build()
        )
        .invoke_handler(tauri::generate_handler![greet, create_display_window, save_background_image, delete_background_image, get_background_image_path, get_background_image_data, clear_media_cache])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


    