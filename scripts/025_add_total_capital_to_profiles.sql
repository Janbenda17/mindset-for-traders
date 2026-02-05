-- Add total_capital field to profiles table for tracking funded account capitalization
alter table public.profiles
add column if not exists total_capital numeric(15,2) default 50000;

-- Update any existing profiles to have default capital if null
update public.profiles
set total_capital = 50000
where total_capital is null;

-- Add not null constraint after populating
alter table public.profiles
alter column total_capital set not null;
