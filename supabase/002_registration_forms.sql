-- Run once in the Supabase SQL Editor after 001_initial.sql.
-- Separate tables for volunteer, guest registration, and sponsor forms.
BEGIN;

CREATE TABLE public.volunteers (
  id uuid PRIMARY KEY,
  first_name text NOT NULL CHECK (length(btrim(first_name)) BETWEEN 1 AND 80),
  last_name text NOT NULL CHECK (length(btrim(last_name)) BETWEEN 1 AND 80),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  phone text NOT NULL CHECK (length(btrim(phone)) BETWEEN 1 AND 40),
  volunteer_areas text NOT NULL CHECK (length(btrim(volunteer_areas)) BETWEEN 1 AND 2000),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  dedupe_key text NOT NULL UNIQUE CHECK (length(dedupe_key) = 64),
  request_hash text NOT NULL CHECK (length(request_hash) = 64)
);

CREATE TABLE public.guest_registrations (
  id uuid PRIMARY KEY,
  first_name text NOT NULL CHECK (length(btrim(first_name)) BETWEEN 1 AND 80),
  last_name text NOT NULL CHECK (length(btrim(last_name)) BETWEEN 1 AND 80),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  phone text NOT NULL CHECK (length(btrim(phone)) BETWEEN 1 AND 40),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  dedupe_key text NOT NULL UNIQUE CHECK (length(dedupe_key) = 64),
  request_hash text NOT NULL CHECK (length(request_hash) = 64)
);

CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY,
  first_name text NOT NULL CHECK (length(btrim(first_name)) BETWEEN 1 AND 80),
  last_name text NOT NULL CHECK (length(btrim(last_name)) BETWEEN 1 AND 80),
  phone text NOT NULL CHECK (length(btrim(phone)) BETWEEN 1 AND 40),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 254),
  organization text NOT NULL DEFAULT '' CHECK (length(organization) <= 160),
  organization_details text NOT NULL DEFAULT '' CHECK (length(organization_details) <= 2000),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  dedupe_key text NOT NULL UNIQUE CHECK (length(dedupe_key) = 64),
  request_hash text NOT NULL CHECK (length(request_hash) = 64)
);

CREATE INDEX idx_volunteers_submitted_at ON public.volunteers (submitted_at DESC, id DESC);
CREATE INDEX idx_guest_registrations_submitted_at ON public.guest_registrations (submitted_at DESC, id DESC);
CREATE INDEX idx_sponsors_submitted_at ON public.sponsors (submitted_at DESC, id DESC);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.volunteers, public.guest_registrations, public.sponsors FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteers, public.guest_registrations, public.sponsors TO service_role;

COMMIT;
