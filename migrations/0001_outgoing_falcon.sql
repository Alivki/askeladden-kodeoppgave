PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`car_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`estimated_time_minutes` integer,
	`suggestion_id` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`suggestion_id`) REFERENCES `task_suggestions`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_tasks`("id", "car_id", "title", "description", "estimated_time_minutes", "suggestion_id", "status", "completed", "created_at") SELECT "id", "car_id", "title", "description", "estimated_time_minutes", "suggestion_id", "status", "completed", "created_at" FROM `tasks`;--> statement-breakpoint
DROP TABLE `tasks`;--> statement-breakpoint
ALTER TABLE `__new_tasks` RENAME TO `tasks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;