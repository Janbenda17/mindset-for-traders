-- Add daily_summary_completed column to daily_stages table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'daily_stages' 
        AND column_name = 'daily_summary_completed'
    ) THEN
        ALTER TABLE public.daily_stages 
        ADD COLUMN daily_summary_completed boolean DEFAULT false;
    END IF;
END $$;

-- Add daily_summary_completed_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'daily_stages' 
        AND column_name = 'daily_summary_completed_at'
    ) THEN
        ALTER TABLE public.daily_stages 
        ADD COLUMN daily_summary_completed_at timestamp with time zone;
    END IF;
END $$;
