# BLUMBOTRON

## Tauri + React + Typescript

This is an app to allow folks to easily create high score tables for their immersive events. It is designed to be "offline-first"; the information is stored locally on your machine and does not require communication with wifi.

- Keeps track of custom players and rosters for all events.
- Shares player rosters across multiple game views.
- Customize what kind og scores you will keep track of per game.
- Customize the display of the high score tables to bit the theme of your event.

## DB Storage

We use Drizzle to generate our SQL via the command `npx drizzle-kit generate` and the file is digested on initialization in the `src-tauri/src/lib.rs` as the `MIGRATION_SQL` value. As the file name is auto generated this will need to be updated on database schema changes. The database is stored in different locations determined by your operating system.

- macOS: ~/Library/Application Support/btron/bumbo.db
- Windows: %APPDATA%\btron\blumbo.db
- Linux: ~/.local/share/btron/blumbo.db

## Development

The normal dev command will not access a database properly but will render ui elements in the browser. To build in a development application run the command:

```bash
npm run tauri dev
```

## Road Map

0.1.1 Player Rosters and Basic Tables
0.1.2 High Score Table Displays
0.1.3 Basic Table Layouts and Themes
0.2 Teams
0.2.1 Game Bracket View
0.3 QR and RFID serial scan-ins
0.3.1 Player Views to view self and add to rosters
0.4 Webhooks

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
