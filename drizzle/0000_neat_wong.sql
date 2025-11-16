CREATE TABLE IF NOT EXISTS `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snowflake` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`data` text,
	`roster` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snowflake` text NOT NULL,
	`name` text NOT NULL,
	`data` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `rosters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snowflake` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`allow` text,
	`deny` text,
	`opt_in` text,
	`opt_out` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snowflake` text NOT NULL,
	`player` text NOT NULL,
	`game` text NOT NULL,
	`unit_id` integer NOT NULL,
	`unit_type` text NOT NULL,
	`datum` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
