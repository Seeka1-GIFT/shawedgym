-- Add Face ID and Photo Support to Members Table
-- This script adds the necessary fields for face recognition functionality

-- Add face_id and photo_url columns to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS face_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS external_person_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;

-- Create index on face_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_face_id ON members(face_id);

-- Create index on external_person_id for device integration
CREATE INDEX IF NOT EXISTS idx_members_external_person_id ON members(external_person_id);

-- Update existing members with default face_id if they don't have one
UPDATE members 
SET face_id = 'FACE_' || id || '_' || EXTRACT(EPOCH FROM created_at)::bigint
WHERE face_id IS NULL;

-- Add comment to document the new fields
COMMENT ON COLUMN members.face_id IS 'Unique identifier for face recognition system';
COMMENT ON COLUMN members.photo_url IS 'URL to member photo for face recognition';
COMMENT ON COLUMN members.external_person_id IS 'External device person ID for integration';
COMMENT ON COLUMN members.registered_at IS 'Member registration timestamp';
COMMENT ON COLUMN members.plan_expires_at IS 'When the current membership plan expires';

-- Create a function to generate unique face IDs
CREATE OR REPLACE FUNCTION generate_face_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'FACE_' || EXTRACT(EPOCH FROM NOW())::bigint || '_' || substr(md5(random()::text), 1, 9);
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-generate face_id for new members
CREATE OR REPLACE FUNCTION auto_generate_face_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.face_id IS NULL OR NEW.face_id = '' THEN
        NEW.face_id = generate_face_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to members table
DROP TRIGGER IF EXISTS trigger_auto_generate_face_id ON members;
CREATE TRIGGER trigger_auto_generate_face_id
    BEFORE INSERT ON members
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_face_id();

-- Update the updated_at trigger to include new fields
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data update for existing members (optional)
-- UPDATE members SET photo_url = '/uploads/member_' || id || '.jpg' WHERE photo_url IS NULL;

COMMIT;
