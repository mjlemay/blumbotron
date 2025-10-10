use tauri_plugin_sql::{Migration, MigrationKind, Builder};

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
        .invoke_handler(tauri::generate_handler![greet, create_display_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


    