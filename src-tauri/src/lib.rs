use tauri_plugin_sql::{Migration, MigrationKind, Builder};

const MIGRATION_SQL: &str = include_str!("../../drizzle/0000_neat_wong.sql");
const DB_PATH: &str = "sqlite:blumbo.db";

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Blumbotron!", name)
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
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


    