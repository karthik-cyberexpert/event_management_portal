-- Migration: Add 'draft' to events status ENUM
-- Run this SQL on your event_management database

USE `event_management`;

ALTER TABLE `events` MODIFY COLUMN `status` ENUM(
  'draft',
  'pending_hod', 'pending_dean', 'pending_principal',
  'approved', 'rejected', 'cancelled',
  'returned_to_coordinator', 'returned_to_hod', 'returned_to_dean',
  'resubmitted'
) NOT NULL DEFAULT 'pending_hod';
