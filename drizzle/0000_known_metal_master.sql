CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`subject` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`owner` text NOT NULL,
	`court` text NOT NULL,
	`date` text NOT NULL,
	`start` integer NOT NULL,
	`duration` integer NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`total` integer NOT NULL,
	`status` text NOT NULL,
	`payment` text NOT NULL,
	`kind` text NOT NULL,
	`note` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_code_unique` ON `bookings` (`code`);--> statement-breakpoint
CREATE TABLE `occupancy` (
	`court` text NOT NULL,
	`date` text NOT NULL,
	`slot` integer NOT NULL,
	`booking` text NOT NULL,
	PRIMARY KEY(`court`, `date`, `slot`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`key` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_user_unique` ON `staff` (`user`);