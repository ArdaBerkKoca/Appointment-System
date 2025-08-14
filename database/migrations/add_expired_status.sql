-- Add 'expired' status to appointments table
-- This migration adds the 'expired' status option to the appointments table

-- First, drop the existing check constraint
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add the new check constraint with 'expired' status
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'expired'));

-- Update existing expired appointments (end_time < now and status = 'pending')
UPDATE appointments 
SET status = 'expired' 
WHERE end_time < datetime('now') AND status = 'pending';

-- Log the migration
INSERT INTO sqlite_master (type, name, sql) VALUES ('migration', 'add_expired_status', 'Added expired status to appointments table');
