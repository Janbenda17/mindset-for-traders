-- Add onboarding fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  onboarding_completed boolean default false;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  trader_type text;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  experience_level text;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  main_problems jsonb default '[]'::jsonb;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  main_goal text;
