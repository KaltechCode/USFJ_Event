-- Run once in the Supabase SQL Editor on projects that ran an older 001_initial.sql.
-- Permanently deletes all invitation and RSVP records. Safe to rerun.
BEGIN;

DROP TABLE IF EXISTS public.rsvps;
DROP TABLE IF EXISTS public.invitations;
DROP FUNCTION IF EXISTS public.touch_rsvp_updated_at();

COMMIT;
