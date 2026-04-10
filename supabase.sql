-- Campus Whisper Database Schema
-- Supabase SQL Migration

-- ═══════════════════════════════════════════════════════════
-- POSTS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag VARCHAR(50),
  imageUrl TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_tag_idx ON public.posts(tag);

-- ═══════════════════════════════════════════════════════════
-- REPORTS TABLE
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('hate', 'spam', 'personal', 'inappropriate', 'other')),
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  reviewed BOOLEAN DEFAULT FALSE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_taken VARCHAR(50) DEFAULT 'pending' CHECK (action_taken IN ('pending', 'approved', 'removed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS reports_post_id_idx ON public.reports(post_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_action_idx ON public.reports(action_taken);
CREATE INDEX IF NOT EXISTS reports_reviewed_idx ON public.reports(reviewed);

-- ═══════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════

-- POSTS RLS Policies

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all public posts
CREATE POLICY "Allow anonymous read access to posts"
  ON public.posts
  FOR SELECT
  USING (true);

-- Policy: Users can only create posts if authenticated
CREATE POLICY "Allow authenticated users to create posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update/delete their own posts
CREATE POLICY "Allow users to update own posts"
  ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own posts"
  ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- REPORTS RLS Policies

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view reports only if admin (function check required server-side)
-- All report access should be restricted to admin via backend validation

CREATE POLICY "Allow authenticated users to create reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow admins to read all reports"
  ON public.reports
  FOR SELECT
  USING (
    -- This checks if user is admin (requires is_admin claim in JWT)
    -- Backend must validate this with admin token
    auth.jwt() ->> 'role' = 'admin' OR false
  );

CREATE POLICY "Allow admins to update reports"
  ON public.reports
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ═══════════════════════════════════════════════════════════
-- ADMIN USERS TABLE (Optional)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'moderator', 'superadmin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_users_email_idx ON public.admin_users(email);

-- ═══════════════════════════════════════════════════════════
-- BANNED USERS TABLE (Optional)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.banned_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS banned_users_expires_idx ON public.banned_users(expires_at);

-- ═══════════════════════════════════════════════════════════
-- AUDIT LOG TABLE (Optional)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  performed_by UUID REFERENCES auth.users(id),
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_performed_by_idx ON public.audit_log(performed_by);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log(created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- HELPFUL VIEWS
-- ═══════════════════════════════════════════════════════════

-- View: Posts with report counts
CREATE OR REPLACE VIEW public.posts_with_stats AS
SELECT
  p.id,
  p.content,
  p.user_id,
  p.tag,
  p.likes,
  p.comments,
  p.created_at,
  COUNT(r.id) as report_count,
  COUNT(r.id) FILTER (WHERE r.action_taken = 'pending') as pending_reports
FROM public.posts p
LEFT JOIN public.reports r ON p.id = r.post_id
GROUP BY p.id, p.content, p.user_id, p.tag, p.likes, p.comments, p.created_at;

-- View: Admin dashboard stats
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  (SELECT COUNT(*) FROM public.posts) as total_posts,
  (SELECT COUNT(*) FROM public.reports WHERE action_taken = 'pending') as pending_reports,
  (SELECT COUNT(*) FROM public.reports WHERE action_taken = 'approved') as approved_reports,
  (SELECT COUNT(*) FROM public.reports WHERE action_taken = 'removed') as removed_posts,
  (SELECT COUNT(DISTINCT user_id) FROM public.posts) as active_users,
  NOW() as generated_at;

-- ═══════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is banned
CREATE OR REPLACE FUNCTION public.is_banned(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.banned_users
    WHERE id = user_id
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update posts.updated_at
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- INITIAL INSERT (Optional seed data for testing)
-- ═══════════════════════════════════════════════════════════

-- Insert test admin user (requires admin auth token)
-- INSERT INTO public.admin_users (id, email, role)
-- VALUES ('admin-uuid-here', 'admin@campus.edu', 'admin')
-- ON CONFLICT DO NOTHING;
