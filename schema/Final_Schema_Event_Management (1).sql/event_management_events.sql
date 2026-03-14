CREATE DATABASE  IF NOT EXISTS `event_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `event_management`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: event_management
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `venue_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `expected_audience` int DEFAULT NULL,
  `status` enum('draft','pending_hod','pending_dean','pending_principal','approved','rejected','cancelled','returned_to_coordinator','returned_to_hod','returned_to_dean','resubmitted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending_hod',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  `submitted_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `department_club` text COLLATE utf8mb4_unicode_ci,
  `coordinator_name` json DEFAULT NULL COMMENT 'Array of coordinator names',
  `coordinator_contact` json DEFAULT NULL COMMENT 'Array of coordinator contacts',
  `mode_of_event` text COLLATE utf8mb4_unicode_ci,
  `category` json DEFAULT NULL COMMENT 'Array of categories',
  `objective` text COLLATE utf8mb4_unicode_ci,
  `sdg_alignment` json DEFAULT NULL COMMENT 'Array of SDG alignments',
  `target_audience` json DEFAULT NULL COMMENT 'Array of target audience',
  `proposed_outcomes` text COLLATE utf8mb4_unicode_ci,
  `speakers` json DEFAULT NULL COMMENT 'Array of speakers',
  `speaker_details` json DEFAULT NULL COMMENT 'Array of speaker details',
  `budget_estimate` decimal(10,2) DEFAULT NULL,
  `funding_source` json DEFAULT NULL COMMENT 'Array of funding sources',
  `promotion_strategy` json DEFAULT NULL COMMENT 'Array of promotion strategies',
  `hod_approval_at` datetime DEFAULT NULL,
  `dean_approval_at` datetime DEFAULT NULL,
  `principal_approval_at` datetime DEFAULT NULL,
  `unique_code` text COLLATE utf8mb4_unicode_ci,
  `other_venue_details` text COLLATE utf8mb4_unicode_ci,
  `end_date` date DEFAULT NULL,
  `speaker_contacts` json DEFAULT NULL COMMENT 'Array of speaker contacts',
  `poster_url` text COLLATE utf8mb4_unicode_ci,
  `academic_year` text COLLATE utf8mb4_unicode_ci,
  `program_driven_by` text COLLATE utf8mb4_unicode_ci,
  `quarter` text COLLATE utf8mb4_unicode_ci,
  `program_type` text COLLATE utf8mb4_unicode_ci,
  `program_theme` text COLLATE utf8mb4_unicode_ci,
  `activity_lead_by` text COLLATE utf8mb4_unicode_ci,
  `activity_duration_hours` int DEFAULT NULL,
  `coordinator_resubmission_reason` text COLLATE utf8mb4_unicode_ci,
  `budget_remarks` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `events_unique_code_unique` (`unique_code`(255)),
  KEY `events_venue_id_fkey` (`venue_id`),
  KEY `idx_events_status` (`status`),
  KEY `idx_events_event_date` (`event_date`),
  KEY `idx_events_submitted_by` (`submitted_by`),
  CONSTRAINT `events_submitted_by_fkey` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `events_venue_id_fkey` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_submitted_by_profile` FOREIGN KEY (`submitted_by`) REFERENCES `profiles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-14 13:58:52
