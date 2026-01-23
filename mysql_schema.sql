-- MySQL Schema for Event Management System
-- Migrated from Supabase (PostgreSQL) to MySQL
-- Generated: 2026-01-09

-- ============================================
-- Drop tables if they exist (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS `event_reports`;
DROP TABLE IF EXISTS `event_history`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `profiles`;
DROP TABLE IF EXISTS `venues`;
DROP TABLE IF EXISTS `professional_societies`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `clubs`;
DROP TABLE IF EXISTS `users`;

-- ============================================
-- Create auth.users equivalent table
-- ============================================
-- Note: In Supabase, auth.users is managed by Supabase Auth.
-- For MySQL, we need to create our own users table for authentication.
CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `encrypted_password` VARCHAR(255) NOT NULL,
  `email_confirmed_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_sign_in_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create clubs table
-- ============================================
CREATE TABLE `clubs` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clubs_name_unique` (`name`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create departments table
-- ============================================
CREATE TABLE `departments` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `degree` VARCHAR(50) NOT NULL COMMENT 'UG, PG, etc.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create professional_societies table
-- ============================================
CREATE TABLE `professional_societies` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` TEXT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `professional_societies_name_unique` (`name`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create venues table
-- ============================================
CREATE TABLE `venues` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` TEXT NOT NULL,
  `capacity` INT DEFAULT NULL,
  `location` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create profiles table
-- ============================================
CREATE TABLE `profiles` (
  `id` CHAR(36) NOT NULL,
  `first_name` TEXT DEFAULT NULL,
  `last_name` TEXT DEFAULT NULL,
  `role` VARCHAR(50) NOT NULL COMMENT 'coordinator, hod, dean, principal, admin, etc.',
  `department` TEXT DEFAULT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `club` TEXT DEFAULT NULL,
  `professional_society` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `profiles_id_fkey` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create events table
-- ============================================
CREATE TABLE `events` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `title` TEXT NOT NULL,
  `description` TEXT DEFAULT NULL,
  `venue_id` CHAR(36) DEFAULT NULL,
  `event_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `expected_audience` INT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending_hod' COMMENT 'pending_hod, pending_dean, pending_principal, approved, rejected, cancelled, returned_to_coordinator, returned_to_hod, returned_to_dean, resubmitted',
  `remarks` TEXT DEFAULT NULL,
  `submitted_by` CHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `department_club` TEXT DEFAULT NULL,
  `coordinator_name` JSON DEFAULT NULL COMMENT 'Array of coordinator names',
  `coordinator_contact` JSON DEFAULT NULL COMMENT 'Array of coordinator contacts',
  `mode_of_event` TEXT DEFAULT NULL,
  `category` JSON DEFAULT NULL COMMENT 'Array of categories',
  `objective` TEXT DEFAULT NULL,
  `sdg_alignment` JSON DEFAULT NULL COMMENT 'Array of SDG alignments',
  `target_audience` JSON DEFAULT NULL COMMENT 'Array of target audience',
  `proposed_outcomes` TEXT DEFAULT NULL,
  `speakers` JSON DEFAULT NULL COMMENT 'Array of speakers',
  `speaker_details` JSON DEFAULT NULL COMMENT 'Array of speaker details',
  `budget_estimate` DECIMAL(10, 2) DEFAULT NULL,
  `funding_source` JSON DEFAULT NULL COMMENT 'Array of funding sources',
  `promotion_strategy` JSON DEFAULT NULL COMMENT 'Array of promotion strategies',
  `hod_approval_at` DATETIME DEFAULT NULL,
  `dean_approval_at` DATETIME DEFAULT NULL,
  `principal_approval_at` DATETIME DEFAULT NULL,
  `unique_code` TEXT DEFAULT NULL,
  `other_venue_details` TEXT DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `speaker_contacts` JSON DEFAULT NULL COMMENT 'Array of speaker contacts',
  `poster_url` TEXT DEFAULT NULL,
  `academic_year` TEXT DEFAULT NULL,
  `program_driven_by` TEXT DEFAULT NULL,
  `quarter` TEXT DEFAULT NULL,
  `program_type` TEXT DEFAULT NULL,
  `program_theme` TEXT DEFAULT NULL,
  `activity_lead_by` TEXT DEFAULT NULL,
  `activity_duration_hours` INT DEFAULT NULL,
  `coordinator_resubmission_reason` TEXT DEFAULT NULL,
  `budget_remarks` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `events_unique_code_unique` (`unique_code`(255)),
  CONSTRAINT `events_venue_id_fkey` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE SET NULL,
  CONSTRAINT `events_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_submitted_by_profile` FOREIGN KEY (`submitted_by`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT,
  INDEX `idx_events_status` (`status`),
  INDEX `idx_events_event_date` (`event_date`),
  INDEX `idx_events_submitted_by` (`submitted_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create event_history table
-- ============================================
CREATE TABLE `event_history` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `event_id` CHAR(36) NOT NULL,
  `changed_by` CHAR(36) DEFAULT NULL,
  `old_status` VARCHAR(50) DEFAULT NULL COMMENT 'Previous event status',
  `new_status` VARCHAR(50) NOT NULL COMMENT 'New event status',
  `remarks` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `event_history_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_history_changed_by_fkey` FOREIGN KEY (`changed_by`) REFERENCES `profiles` (`id`) ON DELETE SET NULL,
  INDEX `idx_event_history_event_id` (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create event_reports table
-- ============================================
CREATE TABLE `event_reports` (
  `event_id` CHAR(36) NOT NULL,
  `final_report_remarks` TEXT NOT NULL,
  `student_participants` INT DEFAULT 0,
  `faculty_participants` INT DEFAULT 0,
  `external_participants` INT DEFAULT 0,
  `social_media_links` JSON DEFAULT NULL,
  `report_photo_urls` JSON DEFAULT NULL COMMENT 'Array of photo URLs',
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `event_reports_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Create notifications table
-- ============================================
CREATE TABLE `notifications` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id` CHAR(36) NOT NULL,
  `event_id` CHAR(36) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user_id` (`user_id`),
  INDEX `idx_notifications_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Comments and Notes
-- ============================================
-- 1. UUID Data Type: MySQL uses CHAR(36) for UUIDs. MySQL 8.0+ supports UUID() function for auto-generation.
-- 2. ARRAY Data Type: PostgreSQL arrays are converted to JSON in MySQL.
-- 3. JSONB Data Type: PostgreSQL JSONB is converted to JSON in MySQL.
-- 4. TIMESTAMP WITH TIME ZONE: MySQL DATETIME doesn't store timezone info. Consider storing UTC times.
-- 5. USER-DEFINED Types (ENUMs): Converted to VARCHAR with comments describing valid values.
-- 6. Auth System: Supabase auth.users is replaced with a custom users table. You'll need to implement authentication logic.
-- 7. Row Level Security (RLS): MySQL doesn't have native RLS. Implement security in application layer.
-- 8. Functions and Triggers: Any PostgreSQL functions/triggers need manual migration.
-- 9. Indexes: Added indexes on frequently queried columns for performance.
-- 10. Foreign Key Constraints: All foreign keys maintained with appropriate ON DELETE actions.
