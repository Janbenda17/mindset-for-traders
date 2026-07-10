-- Tracks whether a user has finished (or skipped) the in-app product tour
-- (components/product-tour.tsx). Kept separate from `onboarding_completed`,
-- which already exists but is tied to the nickname/trader-type funnel
-- (app/api/onboarding/complete/route.ts) - a different step with different
-- semantics, so reusing it here would make that flag mean two things.
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS product_tour_completed BOOLEAN NOT NULL DEFAULT false;
