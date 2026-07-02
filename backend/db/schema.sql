-- ============================================================================
-- MedExpert Database Schema
-- MySQL 8.0+
--
-- Usage:
--   mysql -u root -p < db/schema.sql
--
-- Safe to re-run: every statement uses IF NOT EXISTS.
-- ============================================================================

CREATE DATABASE IF NOT EXISTS medexpert_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE medexpert_db;

-- ----------------------------------------------------------------------------
-- users  (regular site users — registration/login)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150)    NOT NULL,
  email           VARCHAR(190)    NOT NULL UNIQUE,
  phone           VARCHAR(30)     NULL,
  password_hash   VARCHAR(255)    NOT NULL,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- admins  (separate table from users — admin login)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150)    NOT NULL,
  email           VARCHAR(190)    NOT NULL UNIQUE,
  password_hash   VARCHAR(255)    NOT NULL,
  role            ENUM('super_admin','admin') NOT NULL DEFAULT 'admin',
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  last_login_at   DATETIME        NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- specialists  (specialty catalogue, e.g. Cardiologist)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS specialists (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(60)     NOT NULL UNIQUE,    -- e.g. 'cardiologist'
  name            VARCHAR(100)    NOT NULL,            -- e.g. 'Cardiologist'
  description     TEXT            NULL,
  icon            VARCHAR(60)     NULL,                -- font-awesome class
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- hospitals  (must exist before doctors, since doctors references it)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospitals (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(80)     NOT NULL UNIQUE,    -- e.g. 'luth'
  name            VARCHAR(200)    NOT NULL,
  state           VARCHAR(100)    NOT NULL,
  address         VARCHAR(255)    NULL,
  phone           VARCHAR(30)     NULL,
  email           VARCHAR(190)    NULL,
  description     TEXT            NULL,
  rating          DECIMAL(2,1)    NULL,
  is_verified     TINYINT(1)      NOT NULL DEFAULT 0,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                   ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- hospital_specialists  (many-to-many: which specialists a hospital offers)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hospital_specialists (
  hospital_id     INT UNSIGNED NOT NULL,
  specialist_id   INT UNSIGNED NOT NULL,
  PRIMARY KEY (hospital_id, specialist_id),
  CONSTRAINT fk_hs_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_hs_specialist
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- doctors
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS doctors (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name         VARCHAR(150)    NOT NULL,
  email             VARCHAR(190)    NULL UNIQUE,
  phone             VARCHAR(30)     NULL,
  specialist_id     INT UNSIGNED    NULL,
  hospital_id       INT UNSIGNED    NULL,
  bio               TEXT            NULL,
  years_experience  SMALLINT UNSIGNED NULL,
  is_active         TINYINT(1)      NOT NULL DEFAULT 1,
  created_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctors_specialist
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_doctors_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- appointments  (from the "Book an Appointment" form)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             INT UNSIGNED    NULL,        -- NULL if booked as guest
  full_name           VARCHAR(150)    NOT NULL,
  phone               VARCHAR(30)     NOT NULL,
  email               VARCHAR(190)    NULL,
  hospital_id         INT UNSIGNED    NULL,
  specialist_id       INT UNSIGNED    NULL,
  preferred_date      DATE            NOT NULL,
  preferred_time_slot ENUM('morning','afternoon','evening') NOT NULL,
  notes               TEXT            NULL,
  status              ENUM('pending','confirmed','cancelled','completed')
                                       NOT NULL DEFAULT 'pending',
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appt_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_appt_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_appt_specialist
    FOREIGN KEY (specialist_id) REFERENCES specialists(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- contact_messages  (generic contact-us submissions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(150)    NOT NULL,
  email           VARCHAR(190)    NOT NULL,
  phone           VARCHAR(30)     NULL,
  subject         VARCHAR(200)    NULL,
  message         TEXT            NOT NULL,
  is_read         TINYINT(1)      NOT NULL DEFAULT 0,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- symptom_checks  (logs of symptom-checker usage, optional analytics)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS symptom_checks (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED    NULL,
  symptoms        JSON            NOT NULL,
  result_summary  JSON            NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_symptom_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Indexes for common lookups
-- (MySQL has no "CREATE INDEX IF NOT EXISTS"; wrapped in a procedure so the
--  whole script stays safely re-runnable.)
-- ----------------------------------------------------------------------------
DELIMITER //
CREATE PROCEDURE medexpert_add_index_if_missing(
  IN tbl VARCHAR(64), IN idx VARCHAR(64), IN cols VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics
    WHERE table_schema = DATABASE() AND table_name = tbl AND index_name = idx
  ) THEN
    SET @sql = CONCAT('CREATE INDEX ', idx, ' ON ', tbl, ' (', cols, ')');
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL medexpert_add_index_if_missing('hospitals', 'idx_hospitals_state', 'state');
CALL medexpert_add_index_if_missing('doctors', 'idx_doctors_specialist', 'specialist_id');
CALL medexpert_add_index_if_missing('doctors', 'idx_doctors_hospital', 'hospital_id');
CALL medexpert_add_index_if_missing('appointments', 'idx_appointments_status', 'status');
CALL medexpert_add_index_if_missing('appointments', 'idx_appointments_date', 'preferred_date');
CALL medexpert_add_index_if_missing('contact_messages', 'idx_contact_is_read', 'is_read');

DROP PROCEDURE IF EXISTS medexpert_add_index_if_missing;
