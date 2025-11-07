use tauri_plugin_sql::{Migration, MigrationKind, Builder};
use tauri::Manager;
use std::fs;
use base64::{Engine as _, engine::general_purpose};

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
    display_index: Option<u32>,
    width: u32,
    height: u32,
) -> Result<(), String> {
    let game_id = game.clone().unwrap_or_else(|| "default".to_string());
    let display_idx = display_index.unwrap_or(0);
    let window_label = format!("display-{}-{}", game_id, display_idx);
    
    // Build URL with game and displayIndex parameters
    let url = match (game, display_index) {
        (Some(g), Some(idx)) => format!("viewer.html?mode=display&game={}&displayIndex={}", g, idx),
        (Some(g), None) => format!("viewer.html?mode=display&game={}", g),
        (None, Some(idx)) => format!("viewer.html?mode=display&displayIndex={}", idx),
        (None, None) => "viewer.html?mode=display".to_string(),
    };
    
    println!("Creating display window with URL: {}", url);
    println!("Game parameter: {:?}, Display Index: {:?}", game_id, display_idx);
    
    let window_title = format!("Blumbotron Display - {} ({})", game_id, display_idx + 1);
    let window = tauri::WebviewWindowBuilder::new(
        &app_handle,
        window_label.clone(),
        tauri::WebviewUrl::App(url.parse().unwrap())
    )
    .title(&window_title)
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
    println!("Generated data URL with length: {}", data_url.len());
    
    Ok(data_url)
}

// Nokhwa camera integration commands  
use nokhwa::pixel_format::RgbFormat;
use nokhwa::utils::{CameraIndex, RequestedFormat, RequestedFormatType};
use nokhwa::Camera;
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::sync::atomic::AtomicBool;
use image::GenericImageView;

// Global storage for active camera streams
lazy_static::lazy_static! {
    static ref ACTIVE_STREAMS: Arc<Mutex<HashMap<String, Arc<AtomicBool>>>> = Arc::new(Mutex::new(HashMap::new()));
}

#[tauri::command]
async fn initialize_camera_system() -> Result<(), String> {
    println!("Nokhwa camera system initialized");
    Ok(())
}

#[tauri::command]
async fn get_available_cameras() -> Result<Vec<String>, String> {
    match nokhwa::query(nokhwa::utils::ApiBackend::Auto) {
        Ok(cameras) => {
            let camera_names: Vec<String> = cameras
                .iter()
                .map(|info| format!("{} ({})", info.human_name(), info.index().to_string()))
                .collect();
            
            if camera_names.is_empty() {
                Ok(vec!["No cameras detected".to_string()])
            } else {
                Ok(camera_names)
            }
        }
        Err(e) => {
            eprintln!("Error querying cameras: {}", e);
            Ok(vec!["Error detecting cameras".to_string()])
        }
    }
}

#[tauri::command]
async fn start_camera_preview(camera_id: String) -> Result<String, String> {
    println!("Starting camera preview for: {}", camera_id);
    
    // Parse camera index from the ID
    let camera_index = if camera_id.contains("No cameras") || camera_id.contains("Error") {
        return Err("No valid camera available".to_string());
    } else if let Some(idx_str) = camera_id.split('(').nth(1).and_then(|s| s.split(')').next()) {
        idx_str.parse::<u32>().unwrap_or(0)
    } else {
        0
    };

    // Test camera access by creating and immediately releasing it
    let format = RequestedFormat::new::<RgbFormat>(RequestedFormatType::AbsoluteHighestFrameRate);
    
    match Camera::new(CameraIndex::Index(camera_index), format) {
        Ok(mut camera) => {
            // Test that we can open the camera stream
            match camera.open_stream() {
                Ok(()) => {
                    let stream_id = format!("camera_{}_{}", camera_index, std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs());
                    
                    // Stop the test stream - nokhwa doesn't support persistent video streams
                    // Each photo capture will create a new camera instance
                    let _ = camera.stop_stream();
                    
                    println!("Camera preview ready - stream ID: {}", stream_id);
                    Ok(stream_id)
                }
                Err(e) => {
                    let error_msg = if e.to_string().contains("lockForConfiguration") {
                        "Camera busy! Make sure no other Blumbotron instances or camera apps are running.".to_string()
                    } else {
                        format!("Failed to access camera: {}", e)
                    };
                    Err(error_msg)
                }
            }
        }
        Err(e) => Err(format!("Failed to initialize camera: {}", e))
    }
}

#[tauri::command]
async fn stop_camera_preview(stream_id: String) -> Result<(), String> {
    println!("Stopping camera preview: {}", stream_id);
    // In a full implementation, you'd look up and stop the stored camera
    // For this simple implementation, just acknowledge the stop request
    Ok(())
}

// Helper function to capture a frame from camera
async fn capture_camera_frame(camera_index: u32) -> Result<String, String> {
    let format = RequestedFormat::new::<RgbFormat>(RequestedFormatType::AbsoluteHighestFrameRate);
    
    match Camera::new(CameraIndex::Index(camera_index), format) {
        Ok(mut camera) => {
            // Open stream and capture frame
            if let Err(e) = camera.open_stream() {
                return Err(format!("Failed to open camera stream: {}", e));
            }
            
            // Capture frame
            match camera.frame() {
                Ok(frame) => {
                    // Convert frame to JPEG and encode as base64
                    let image_buffer = frame.decode_image::<RgbFormat>().map_err(|e| format!("Failed to decode frame: {}", e))?;
                    
                    // Create dynamic image from buffer
                    let mut dynamic_image = image::DynamicImage::ImageRgb8(image_buffer);
                    
                    // Crop to square (center crop)
                    let (width, height) = dynamic_image.dimensions();
                    let size = width.min(height); // Use the smaller dimension for square
                    let x = (width - size) / 2;
                    let y = (height - size) / 2;
                    
                    // Crop to square
                    dynamic_image = dynamic_image.crop_imm(x, y, size, size);
                    
                    // Convert to JPEG using image crate
                    let mut jpeg_data = Vec::new();
                    {
                        use std::io::Cursor;
                        let mut cursor = Cursor::new(&mut jpeg_data);
                        dynamic_image
                            .write_to(&mut cursor, image::ImageFormat::Jpeg)
                            .map_err(|e| format!("Failed to encode JPEG: {}", e))?;
                    }
                    
                    // Encode as base64
                    let base64_data = general_purpose::STANDARD.encode(&jpeg_data);
                    let data_url = format!("data:image/jpeg;base64,{}", base64_data);
                    
                    // Clean up
                    let _ = camera.stop_stream();
                    
                    Ok(data_url)
                }
                Err(e) => {
                    let _ = camera.stop_stream();
                    Err(format!("Failed to capture frame: {}", e))
                }
            }
        }
        Err(e) => Err(format!("Failed to create camera: {}", e))
    }
}

#[tauri::command]
async fn get_camera_frame(camera_id: String) -> Result<String, String> {
    // Parse camera index from the ID
    let camera_index = if camera_id.contains("No cameras") || camera_id.contains("Error") {
        return Err("No valid camera available".to_string());
    } else if let Some(idx_str) = camera_id.split('(').nth(1).and_then(|s| s.split(')').next()) {
        idx_str.parse::<u32>().unwrap_or(0)
    } else {
        0
    };

    capture_camera_frame(camera_index).await
}

#[tauri::command]
async fn capture_photo_from_camera(camera_id: String) -> Result<String, String> {
    println!("Capturing photo from camera: {}", camera_id);
    
    // Parse camera index from the ID
    let camera_index = if camera_id.contains("No cameras") || camera_id.contains("Error") {
        return Err("No valid camera available".to_string());
    } else if let Some(idx_str) = camera_id.split('(').nth(1).and_then(|s| s.split(')').next()) {
        idx_str.parse::<u32>().unwrap_or(0)
    } else {
        0
    };

    capture_camera_frame(camera_index).await
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
        .invoke_handler(tauri::generate_handler![
            greet, 
            create_display_window, 
            save_background_image, 
            delete_background_image, 
            get_background_image_path, 
            get_background_image_data,
            initialize_camera_system,
            get_available_cameras,
            start_camera_preview,
            stop_camera_preview,
            capture_photo_from_camera,
            get_camera_frame
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


    