-- Consolidated MySQL Schema for Event Management System (EMS)
-- This file contains all tables, constraints, and initial setup data.
-- Generated for completion and deployment.

-- ============================================
-- INITIAL SETUP
-- ============================================
CREATE DATABASE IF NOT EXISTS `event_management`;
USE `event_management`;

-- ============================================
-- DROP EXISTING TABLES (Reverse Dependency Order)
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;
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
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. AUTHENTICATION & USERS
-- ============================================
CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `encrypted_password` VARCHAR(255) NOT NULL,
  `email_confirmed_at` DATETIME DEFAULT NULL,
  `is_onboarded` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_sign_in_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. MASTER DATA (Clubs, Departments, Societies, Venues)
-- ============================================
CREATE TABLE `clubs` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `departments` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `degree` VARCHAR(50) NOT NULL COMMENT 'UG, PG, etc.',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `professional_societies` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `venues` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `name` VARCHAR(255) NOT NULL,
  `capacity` INT DEFAULT NULL,
  `location` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. USER PROFILES
-- ============================================
CREATE TABLE `profiles` (
  `id` CHAR(36) NOT NULL,
  `first_name` VARCHAR(255) DEFAULT NULL,
  `last_name` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('coordinator', 'hod', 'dean', 'principal', 'admin') NOT NULL,
  `department` VARCHAR(255) DEFAULT NULL,
  `club` VARCHAR(255) DEFAULT NULL,
  `professional_society` VARCHAR(255) DEFAULT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `profiles_id_fkey` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. EVENTS
-- ============================================
CREATE TABLE `events` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `unique_code` VARCHAR(50) UNIQUE DEFAULT NULL,
  `status` ENUM(
    'draft',
    'pending_hod', 'pending_dean', 'pending_principal', 
    'approved', 'rejected', 'cancelled', 
    'returned_to_coordinator', 'returned_to_hod', 'returned_to_dean', 
    'resubmitted'
  ) NOT NULL DEFAULT 'pending_hod',
  
  -- Timing
  `event_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `activity_duration_hours` INT DEFAULT NULL,
  
  -- Location
  `venue_id` CHAR(36) DEFAULT NULL,
  `other_venue_details` TEXT DEFAULT NULL,
  
  -- Metadata
  `academic_year` VARCHAR(50) DEFAULT NULL,
  `quarter` VARCHAR(20) DEFAULT NULL,
  `program_driven_by` VARCHAR(255) DEFAULT NULL,
  `program_type` VARCHAR(255) DEFAULT NULL,
  `program_theme` VARCHAR(255) DEFAULT NULL,
  `activity_lead_by` VARCHAR(255) DEFAULT NULL,
  
  -- Audience & Content
  `expected_audience` INT DEFAULT NULL,
  `target_audience` JSON DEFAULT NULL COMMENT 'Array of strings',
  `objective` TEXT DEFAULT NULL,
  `proposed_outcomes` TEXT DEFAULT NULL,
  `sdg_alignment` JSON DEFAULT NULL COMMENT 'Array of strings',
  `category` JSON DEFAULT NULL COMMENT 'Array of strings',
  
  -- Coordinators & Internal info
  `department_club` VARCHAR(255) DEFAULT NULL,
  `coordinator_name` JSON DEFAULT NULL COMMENT 'Array of strings',
  `coordinator_contact` JSON DEFAULT NULL COMMENT 'Array of strings',
  
  -- Speakers
  `speakers` JSON DEFAULT NULL COMMENT 'Array of strings',
  `speaker_details` JSON DEFAULT NULL COMMENT 'Array of descriptions',
  `speaker_contacts` JSON DEFAULT NULL COMMENT 'Array of strings',
  
  -- Logistics
  `budget_estimate` DECIMAL(10, 2) DEFAULT NULL,
  `funding_source` JSON DEFAULT NULL COMMENT 'Array of strings',
  `promotion_strategy` JSON DEFAULT NULL COMMENT 'Array of strings',
  `poster_url` TEXT DEFAULT NULL,
  `mode_of_event` VARCHAR(50) DEFAULT NULL,
  
  -- Approvals & Feedback
  `remarks` TEXT DEFAULT NULL,
  `coordinator_resubmission_reason` TEXT DEFAULT NULL,
  `hod_approval_at` DATETIME DEFAULT NULL,
  `dean_approval_at` DATETIME DEFAULT NULL,
  `principal_approval_at` DATETIME DEFAULT NULL,
  
  -- System
  `submitted_by` CHAR(36) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  CONSTRAINT `events_venue_id_fkey` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE SET NULL,
  CONSTRAINT `events_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  INDEX `idx_events_status` (`status`),
  INDEX `idx_events_event_date` (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. EVENT HISTORY
-- ============================================
CREATE TABLE `event_history` (
  `id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `event_id` CHAR(36) NOT NULL,
  `changed_by` CHAR(36) DEFAULT NULL,
  `old_status` VARCHAR(50) DEFAULT NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `remarks` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `event_history_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `event_history_changed_by_fkey` FOREIGN KEY (`changed_by`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. EVENT REPORTS
-- ============================================
CREATE TABLE `event_reports` (
  `event_id` CHAR(36) NOT NULL,
  `final_report_remarks` TEXT NOT NULL,
  `student_participants` INT DEFAULT 0,
  `faculty_participants` INT DEFAULT 0,
  `external_participants` INT DEFAULT 0,
  `social_media_links` JSON DEFAULT NULL,
  `report_photo_urls` JSON DEFAULT NULL,
  `activity_lead_by` VARCHAR(255) DEFAULT NULL,
  `report_password` VARCHAR(255) DEFAULT NULL,
  `regeneration_count` INT DEFAULT 0,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `event_reports_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. NOTIFICATIONS
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
-- INITIAL DATA: ADMINISTRATIVE USER
-- ============================================
-- Password: password123
INSERT INTO `users` (`id`, `email`, `encrypted_password`, `email_confirmed_at`, `is_onboarded`) 
VALUES (
  '30f8a964-6df4-411a-821f-82bb31a28a31', 
  'admin@gmail.com', 
  '$2b$10$BGzV.gxH5pCX/kG/2DCQ0uggtLkj4gLnI8oaG4R92B8EYq5GB0JZC', 
  NOW(),
  FALSE
);

INSERT INTO `profiles` (`id`, `first_name`, `last_name`, `role`, `department`) 
VALUES (
  '30f8a964-6df4-411a-821f-82bb31a28a31', 
  'System', 
  'Administrator', 
  'admin', 
  'Administration'
);

-- ============================================
-- INITIAL DATA: VENUES
-- ============================================
-- INSERT INTO `venues` (`id`, `name`, `capacity`, `location`) VALUES
-- (UUID(), 'Main Auditorium', 500, 'Block A, Ground Floor'),
-- (UUID(), 'Seminar Hall 1', 100, 'Block B, 1st Floor'),
-- (UUID(), 'Conference Room', 50, 'Administrative Block'),
-- (UUID(), 'Outdoor Plaza', 1000, 'Central Campus');

-- ============================================
-- INITIAL DATA: DEPARTMENTS
-- ============================================
-- INSERT INTO `departments` (`id`, `name`, `degree`) VALUES
-- (UUID(), 'Computer Science and Engineering', 'UG'),
-- (UUID(), 'Information Technology', 'UG'),
-- (UUID(), 'Mechanical Engineering', 'UG'),
-- (UUID(), 'Electronics and Communication Engineering', 'UG');
