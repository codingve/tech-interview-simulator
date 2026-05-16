CREATE TABLE `interview_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`role` enum('assistant','user') NOT NULL,
	`content` text NOT NULL,
	`messageType` enum('question','answer','feedback','intro','closing') NOT NULL DEFAULT 'question',
	`starScore` float,
	`starBreakdown` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `interview_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interview_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`targetRole` varchar(128) NOT NULL,
	`seniority` enum('junior','mid','senior','staff','principal') NOT NULL,
	`company` varchar(128),
	`interviewType` enum('behavioral','system_design','coding','mixed') NOT NULL,
	`status` enum('active','completed','abandoned') NOT NULL DEFAULT 'active',
	`score` float,
	`feedback` text,
	`questionCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `interview_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`content` text NOT NULL,
	`company` varchar(64),
	`interviewType` enum('behavioral','system_design','coding','mixed') NOT NULL,
	`seniority` enum('junior','mid','senior','staff','principal','all') NOT NULL DEFAULT 'all',
	`theme` varchar(128),
	`tips` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
