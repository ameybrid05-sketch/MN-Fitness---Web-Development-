-- ═══════════════════════════════════════════════════════════════
-- MN FITNESS - MySQL Database Setup
-- Run this script in MySQL before starting the application
-- ═══════════════════════════════════════════════════════════════

-- Create database
CREATE DATABASE IF NOT EXISTS mn_fitness
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create application user (optional, recommended for production)
-- CREATE USER IF NOT EXISTS 'mnfitness'@'localhost' IDENTIFIED BY 'mnfitness_pass';
-- GRANT ALL PRIVILEGES ON mn_fitness.* TO 'mnfitness'@'localhost';
-- FLUSH PRIVILEGES;

USE mn_fitness;

-- Verify
SELECT 'mn_fitness database created successfully!' AS status;
