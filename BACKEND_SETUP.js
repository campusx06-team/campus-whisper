/**
 * Campus Whisper — Backend Setup & Integration Guide
 * Supabase + JavaScript Backend
 */

// ═══════════════════════════════════════════════════════════
// INSTALLATION
// ═══════════════════════════════════════════════════════════

/*
1. Install Supabase JavaScript client:
   npm install @supabase/supabase-js

2. Create account at https://supabase.com

3. Create a new project in Supabase

4. Copy your project credentials:
   - Project URL (SUPABASE_URL)
   - Anon Key (SUPABASE_ANON_KEY)
*/

// ═══════════════════════════════════════════════════════════
// ENVIRONMENT VARIABLES (.env or .env.local)
// ═══════════════════════════════════════════════════════════

/*
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

For admin operations (server-side only):
SUPABASE_SERVICE_KEY=your-service-key-here
*/

// ═══════════════════════════════════════════════════════════
// DATABASE SETUP
// ═══════════════════════════════════════════════════════════

/*
1. In Supabase dashboard, go to SQL Editor
2. Create a new query
3. Copy entire contents of supabase.sql
4. Execute the query
5. Tables will be created with RLS policies enabled

Tables created:
- posts (main content)
- reports (moderation)
- admin_users (for admin role management)
- banned_users (for bans/suspension)
- audit_log (for monitoring)
*/

// ═══════════════════════════════════════════════════════════
// AUTHENTICATION SETUP
// ═══════════════════════════════════════════════════════════

/*
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Email (OTP method)
3. Configure redirect URL to your app URL
4. Email options (optional):
   - Enable "Confirmations required" if needed
   - Set email templates if desired
*/

// ═══════════════════════════════════════════════════════════
// INTEGRATION WITH EXISTING FRONTEND (script.js)
// ═══════════════════════════════════════════════════════════

/*
At the top of script.js, add:

import {
  sendOTP,
  verifyOTP,
  checkAuth,
  logout,
  createPost,
  getPosts,
  reportPost,
  getReportedPosts,
  revealUser,
  getUserPosts
} from './supabaseBackend.js';

Replace existing login handler:

el('btn-send-otp').addEventListener('click', async () => {
  const email = el('login-email').value.trim();
  if (!email || !email.includes('@')) {
    toast('Please enter a valid email', 'error');
    return;
  }

  el('btn-send-otp').classList.add('loading');
  const result = await sendOTP(email);
  el('btn-send-otp').classList.remove('loading');

  if (!result.success) {
    toast(result.error || 'Failed to send OTP', 'error');
    return;
  }

  el('otp-email-display').textContent = email;
  el('step-email').classList.remove('active');
  el('step-otp').classList.add('active');
  setupOTP();
  toast('OTP sent to your email', 'info');
});

el('btn-verify-otp').addEventListener('click', async () => {
  const code = qsa('.otp-box').map(b => b.value).join('');
  if (code.length < 6) {
    shakeOTP();
    toast('Enter the full 6-digit code', 'error');
    return;
  }

  el('btn-verify-otp').classList.add('loading');
  const email = el('otp-email-display').textContent;
  const result = await verifyOTP(email, code);
  el('btn-verify-otp').classList.remove('loading');

  if (!result.success) {
    shakeOTP();
    toast(result.error || 'Verification failed', 'error');
    return;
  }

  // Login successful
  loginAs('student', result.user);
});

Replace existing post creation:

el('create-form-text').addEventListener('submit', async (e) => {
  e.preventDefault();
  const tagEl = qs('input[name="post-tag"]:checked', el('create-form-text'));
  const text = textarea.value.trim();

  if (!tagEl) {
    toast('Please select a category', 'error');
    return;
  }
  if (!text) {
    toast('Please write your whisper', 'error');
    return;
  }

  const { loggedIn, user } = await checkAuth();
  if (!loggedIn) {
    toast('Please login first', 'error');
    return;
  }

  el('btn-submit-text').classList.add('loading');
  const result = await createPost(text, user.id, {
    tag: tagEl.value,
    imageUrl: STATE.imageDataUrl || null
  });
  el('btn-submit-text').classList.remove('loading');

  if (!result.success) {
    toast(result.error || 'Failed to post', 'error');
    return;
  }

  // Reset form
  el('create-form-text').reset();
  el('char-bar-fill').style.width = '0%';
  el('post-char-count').textContent = '0';
  clearImagePreview();

  switchView('feed');
  STATE.activeFilter = 'recent';
  renderFeed();
  toast('🎉 Your whisper is live!', 'success');
});

Replace feed fetching:

async function renderFeed() {
  const list = el('feed-list');
  const result = await getPosts(50, 0);

  if (!result.success) {
    toast(result.error || 'Failed to load posts', 'error');
    return;
  }

  STATE.posts = result.posts;
  const filtered = getFilteredPosts();

  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:48px;...">
      <div style="font-size:2.5rem;...">🔍</div>
      <p>No whispers found</p>
    </div>`;
    return;
  }

  list.innerHTML = filtered.map((p, i) => buildPostCard(p, i)).join('');
  attachPostCardEvents(list);
}

Replace report submission:

el('report-confirm').addEventListener('click', async () => {
  const reason = qs('input[name="report-reason"]:checked');
  if (!reason) {
    toast('Please select a reason', 'error');
    return;
  }

  const result = await reportPost(STATE.reportTarget, reason.value);
  if (!result.success) {
    toast(result.error || 'Failed to report', 'error');
    return;
  }

  closeModal('report-modal');
  renderFeed();
  toast('Report submitted. Thank you for keeping the community safe.', 'success');
});
*/

// ═══════════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════

/*
AUTHENTICATION:
==================

// Send OTP
const { success, error } = await sendOTP('user@college.edu');
if (!success) console.error(error);

// Verify OTP
const result = await verifyOTP('user@college.edu', '123456');
if (result.success) {
  console.log('User ID:', result.user.id);
  console.log('Email:', result.user.email);
}

// Check current session
const { loggedIn, user } = await checkAuth();

// Logout
await logout();

POSTS:
==================

// Create post
const post = await createPost(
  'Hello campus!',
  userId,
  { tag: 'funny', imageUrl: null }
);

// Get all posts (paginated)
const postsResult = await getPosts(50, 0); // limit 50, offset 0

// Get single post
const singlePost = await getPost(postId);

// Get user's own posts
const myPosts = await getUserPosts(userId);

// Delete post
await deletePost(postId, userId, isAdmin);

// Like post
await likePost(postId);

REPORTS:
==================

// Report a post
const report = await reportPost(postId, 'spam', userId);

// Get all reported posts (admin only)
const reports = await getReportedPosts(50, 0);

// Get report count for a post
const { count } = await getReportCount(postId);

ADMIN:
==================

// Reveal user identity (admin only)
const reveal = await revealUser(postId);
if (reveal.success) {
  console.log('Email:', reveal.email);
  console.log('Name:', reveal.name);
}
*/

// ═══════════════════════════════════════════════════════════
// SECURITY CONSIDERATIONS
// ═══════════════════════════════════════════════════════════

/*
1. ROW LEVEL SECURITY (RLS):
   - All tables have RLS policies enabled
   - Users can only access their own posts/data
   - Admin access requires proper JWT claims
   - Reports are protected from public access

2. AUTHENTICATION:
   - Email OTP is more secure than passwords
   - User IDs are UUIDs (hard to guess)
   - Session tokens are managed by Supabase Auth
   - Never expose user_id to non-admin users publicly

3. DATA PRIVACY:
   - Posts are returned WITHOUT user_id (anonymous)
   - Only admins can see user identity (via revealUser)
   - Sensitive operations require authentication

4. INPUT VALIDATION:
   - Content length limits (max 500 chars)
   - Report reasons are validated against enum
   - Email validation before OTP
   - User ID checks before operations

5. AUDIT LOGGING:
   - Optional: admin actions logged to audit_log table
   - Can be extended to log all sensitive operations

6. BEST PRACTICES:
   - Never log in as admin from client-side
   - Use server-side functions for admin operations
   - Validate all inputs server-side
   - Use environment variables for secrets
   - Enable email verification if needed
   - Set up rate limiting for OTP requests
   - Monitor for abuse patterns
*/

// ═══════════════════════════════════════════════════════════
// ADMIN MANAGEMENT
// ═══════════════════════════════════════════════════════════

/*
To add an admin user:

1. Get user's UUID from Supabase Auth
2. Run this SQL in Supabase SQL Editor:

INSERT INTO public.admin_users (id, email, role)
VALUES ('user-uuid', 'admin@campus.edu', 'admin')
ON CONFLICT (id) DO NOTHING;

Then, update the backend to check admin status:

async function revealUser(postId) {
  // First check if current user is admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  const isAdmin = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', session.user.id)
    .single();

  if (!isAdmin) {
    return { success: false, error: 'Admin access required' };
  }

  // Now reveal user...
}
*/

// ═══════════════════════════════════════════════════════════
// TESTING
// ═══════════════════════════════════════════════════════════

/*
Test credentials (for demo):
Email: test@college.edu
OTP: 123456 (manually set up in Supabase email templates)

Test cases:

1. Authentication Flow:
   - sendOTP() → email sent ✓
   - verifyOTP() → user authenticated ✓
   - checkAuth() → session exists ✓
   - logout() → session cleared ✓

2. Post Creation:
   - createPost() with valid data ✓
   - createPost() with empty content (error) ✓
   - createPost() with >500 chars (error) ✓

3. Feed:
   - getPosts() returns posts in order ✓
   - Posts don't include user_id (anonymous) ✓

4. Reporting:
   - reportPost() creates report ✓
   - Duplicate reports are prevented ✓
   - getReportedPosts() returns admin data ✓

5. Admin:
   - revealUser() requires admin ✓
   - Returns correct user email ✓
*/

// ═══════════════════════════════════════════════════════════
// PERFORMANCE TIPS
// ═══════════════════════════════════════════════════════════

/*
1. Pagination:
   - Always fetch posts with limit/offset
   - Default limit: 50 posts per page
   - Load more on scroll

2. Indexes:
   - All created_at columns are indexed
   - user_id foreign keys are indexed
   - post_id foreign keys are indexed
   - Tag filtering is optimized

3. Real-time Updates (optional):
   - Use Supabase realtime subscriptions
   - Subscribe to posts table changes
   - Update feed instantly

Example realtime:
const subscription = supabase
  .from('posts')
  .on('*', payload => {
    console.log('Change received!', payload);
    renderFeed();
  })
  .subscribe();

4. Caching:
   - Cache posts in STATE object
   - Only refetch on specific actions
   - Use local storage for theme/preferences
*/

// ═══════════════════════════════════════════════════════════
// TROUBLESHOOTING
// ═══════════════════════════════════════════════════════════

/*
Problem: "CORS error"
Solution: Check Supabase project settings → API, add your app URL to allowed origins

Problem: "OTP not received"
Solution: Check spam folder, verify email is correct, check Supabase email settings

Problem: "RLS policy error"
Solution: Make sure user is authenticated before operations, check RLS policies in SQL

Problem: "Cannot reveal user identity"
Solution: User must be admin, check admin_users table, verify JWT claims

Problem: "Posts not loading"
Solution: Check network tab, verify Supabase is running, check RLS policies

Problem: "Slow query performance"
Solution: Add pagination, check indexes are created, monitor query performance in Supabase

*/

// ═══════════════════════════════════════════════════════════
// PRODUCTION DEPLOYMENT
// ═══════════════════════════════════════════════════════════

/*
1. Environment Setup:
   - Use Vercel/Render/Firebase for hosting
   - Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in CI/CD
   - Use different Supabase projects for dev/prod

2. Database Backups:
   - Enable automated backups in Supabase
   - Set retention policy (e.g., 30 days)
   - Test restore procedures regularly

3. Monitoring:
   - Set up alerts for errors in browser console
   - Monitor Supabase logs for errors
   - Track API usage and quotas

4. Rate Limiting:
   - Implement rate limiting on Supabase (Postgres)
   - Limit OTP requests (e.g., 3 per hour)
   - Limit post creation (e.g., 5 per minute)

5. Content Moderation:
   - Use automated keyword blocking
   - Manual review of flagged posts
   - Clear community guidelines
   - Regular audit of removed content

6. Database Cleanup:
   - Archive old posts (>1 year)
   - Delete resolved reports
   - Clean up banned users (expired bans)

*/

export default {
  // This file is for documentation only
  // See supabaseBackend.js for actual implementation
};
