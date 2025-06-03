CREATE TABLE `games` (
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
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snowflake` text NOT NULL,
	`name` text NOT NULL,
	`data` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `rosters` (
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
	`unit` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text DEFAULT (CURRENT_TIMESTAMP)
);
