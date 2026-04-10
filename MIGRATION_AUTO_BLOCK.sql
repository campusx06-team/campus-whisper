-- ═══════════════════════════════════════════════════════════
-- SUPABASE MIGRATION: Add Auto-Block Support
-- Run these ALTER TABLE statements in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Add columns to reports table for storing blocked content
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS reason VARCHAR(50) DEFAULT 'manual'
  CHECK (reason IN ('manual', 'auto_block')),
ADD COLUMN IF NOT EXISTS tag VARCHAR(50);

-- Create index for filtering auto-blocked posts
CREATE INDEX IF NOT EXISTS reports_reason_idx ON public.reports(reason);

-- Update the action_taken constraint to include 'blocked' and 'allowed'
ALTER TABLE public.reports
DROP CONSTRAINT IF EXISTS reports_action_taken_check;

ALTER TABLE public.reports
ADD CONSTRAINT reports_action_taken_check
  CHECK (action_taken IN ('pending', 'approved', 'removed', 'rejected', 'blocked', 'allowed'));

-- ═══════════════════════════════════════════════════════════
-- Optional: Create VIEW for admin dashboard
-- Shows all auto-blocked posts
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.auto_blocked_posts AS
SELECT
  id,
  content,
  tag,
  reason,
  reported_by,
  notes,
  reviewed,
  action_taken,
  created_at
FROM public.reports
WHERE reason = 'auto_block'
ORDER BY created_at DESC;

-- ═══════════════════════════════════════════════════════════
-- Optional: Create stats view for admin dashboard
-- ═══════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.moderation_stats AS
SELECT
  (SELECT COUNT(*) FROM public.reports WHERE reason = 'auto_block') as auto_blocked,
  (SELECT COUNT(*) FROM public.reports WHERE reason = 'manual') as manually_reported,
  (SELECT COUNT(*) FROM public.reports WHERE action_taken = 'blocked') as posts_blocked,
  (SELECT COUNT(*) FROM public.reports WHERE reviewed = false) as pending_review,
  (SELECT COUNT(DISTINCT reported_by) FROM public.reports WHERE reason = 'auto_block') as users_with_violations,
  NOW() as generated_at;

-- ═══════════════════════════════════════════════════════════
-- Notes for implementation:
-- 1. Run these SQL commands in Supabase Dashboard → SQL Editor
-- 2. Reports table will now support auto-blocked posts
-- 3. Use reason='auto_block' to mark posts blocked by filter
-- 4. Views help admin dashboard query data efficiently
-- 5. After running these, the badWordFilter.js will work properly
-- ═══════════════════════════════════════════════════════════
