/**
 * Campus Whisper — Quick Start Integration Guide
 *
 * This guide shows how to integrate the Supabase backend with your frontend
 */

// ═══════════════════════════════════════════════════════════
// STEP 1: Install Dependencies
// ═══════════════════════════════════════════════════════════

// In your project root, run:
// npm install @supabase/supabase-js

// ═══════════════════════════════════════════════════════════
// STEP 2: Set Up Environment Variables
// ═══════════════════════════════════════════════════════════

// 1. Copy .env.example to .env.local
// 2. Go to Supabase Dashboard → Settings → API
// 3. Copy your Project URL and Anon Key
// 4. Paste into .env.local

// .env.local:
/*
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=http://localhost:5173
*/

// ═══════════════════════════════════════════════════════════
// STEP 3: Create Database in Supabase
// ═══════════════════════════════════════════════════════════

// 1. In Supabase Dashboard, go to SQL Editor
// 2. Create new query
// 3. Copy entire contents of supabase.sql
// 4. Execute query
// 5. All tables will be created automatically

// ═══════════════════════════════════════════════════════════
// STEP 4: Update script.js with Backend Integration
// ═══════════════════════════════════════════════════════════

// Add this at the top of script.js (line 1):

/*
import {
  sendOTP,
  verifyOTP,
  checkAuth,
  logout,
  createPost,
  getPosts,
  getPost,
  deletePost,
  reportPost,
  getReportedPosts,
  revealUser,
  getUserPosts,
  likePost,
  incrementComments
} from './supabaseBackend.js';
*/

// ═══════════════════════════════════════════════════════════
// STEP 5: Update Authentication (in script.js)
// ═══════════════════════════════════════════════════════════

// Replace the loginAs() function:

/*
async function loginAs(role, email) {
  // Verify user is authenticated before logging in
  const { loggedIn, user } = await checkAuth();

  if (!loggedIn) {
    toast('Authentication failed', 'error');
    el('step-otp').classList.remove('active');
    el('step-email').classList.add('active');
    return;
  }

  // Continue with login
  STATE.role       = role;
  STATE.loggedIn   = true;
  STATE.currentUser = {
    id: user.id,
    role: role,
    email: user.email
  };

  // Load data from Supabase
  if (role === 'student') {
    const postsResult = await getPosts(50, 0);
    if (postsResult.success) {
      STATE.posts = postsResult.posts;
    }
  }

  STATE.notifications = [];

  el('page-login').classList.remove('active');
  el('page-app').classList.add('active');
  el('page-app').style.display = 'flex';

  if (role === 'admin') {
    el('student-nav').style.display = 'none';
    el('admin-nav').style.display = 'flex';
    el('sb-avatar').textContent = '🛡️';
    el('sb-username').textContent = 'Admin';
    el('sb-role-tag').textContent = 'Administrator';
    el('sb-role-tag').classList.add('admin');
    switchView('admin-dash');
  } else {
    el('student-nav').style.display = 'flex';
    el('admin-nav').style.display = 'none';
    el('sb-avatar').textContent = randomFrom(AVATARS);
    el('sb-username').textContent = 'Anonymous Whisperer';
    el('sb-role-tag').textContent = 'Student';
    el('sb-role-tag').classList.remove('admin');
    setTimeout(() => { renderFeed(); }, 800);
    switchView('feed');
  }

  toast(role === 'admin' ? '🛡️ Logged in as Admin' : '👋 Welcome, Anon!', 'success');
}
*/

// Replace OTP send handler around line 207:

/*
el('btn-send-otp').addEventListener('click', async () => {
  const email = el('login-email').value.trim();
  const pw    = el('login-password').value.trim();

  if (!email || !email.includes('@')) {
    toast('Please enter a valid email', 'error');
    return;
  }

  if (STATE.role === 'admin') {
    // Admin login (server-side only in production)
    if (email !== 'admin@campus.edu' || pw !== 'admin123') {
      toast('Invalid admin credentials', 'error');
      return;
    }
    el('btn-send-otp').classList.add('loading');
    setTimeout(() => {
      el('btn-send-otp').classList.remove('loading');
      loginAs('admin', email);
    }, 900);
    return;
  }

  // Student: Send OTP
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
*/

// Replace OTP verify handler around line 235:

/*
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

  // Success!
  loginAs('student', result.user);
});
*/

// Replace logout handler around line 382:

/*
async function logout() {
  const result = await window.logout();

  STATE.loggedIn = false;
  STATE.currentUser = null;
  STATE.myPostIds.clear();
  STATE.myPollIds.clear();
  STATE.imageDataUrl = null;
  STATE.posts = [];

  el('page-app').classList.remove('active');
  el('page-app').style.display = 'none';
  el('page-login').classList.add('active');
  el('step-email').classList.add('active');
  el('step-otp').classList.remove('active');
  el('login-email').value = '';
  el('login-password').value = '';
  el('btn-login-text').textContent = 'Continue';
  el('role-slider').classList.remove('right');
  el('password-group').style.display = 'none';
  qsa('.role-btn').forEach(b => b.classList.remove('active'));
  el('btn-student-role').classList.add('active');
  STATE.role = 'student';

  toast('Logged out successfully', 'info');
}
*/

// ═══════════════════════════════════════════════════════════
// STEP 6: Update Feed (in script.js)
// ═══════════════════════════════════════════════════════════

// Replace renderFeed() around line 455:

/*
async function renderFeed() {
  const list = el('feed-list');
  const search = (el('feed-search').value || '').toLowerCase();

  // Fetch from Supabase
  const result = await getPosts(100, 0);
  if (!result.success) {
    toast('Failed to load posts', 'error');
    list.innerHTML = '<div style="text-align:center;padding:48px;">Error loading posts</div>';
    return;
  }

  let posts = result.posts;

  // Apply filters
  switch (STATE.activeFilter) {
    case 'trending':
      posts = posts.filter(p => p.likes > 10).sort((a, b) => b.likes - a.likes);
      break;
    case 'recent':
      posts = posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'top':
      posts = posts.sort((a, b) => b.likes - a.likes);
      break;
    // Add more filters as needed
  }

  if (search) {
    posts = posts.filter(p => p.content.toLowerCase().includes(search));
  }

  if (posts.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-3);">
      <div style="font-size:2.5rem;margin-bottom:12px;">🔍</div>
      <p style="font-size:.95rem;">No whispers found</p>
    </div>`;
    return;
  }

  list.innerHTML = posts.map((p, i) => buildPostCard(p, i)).join('');
  attachPostCardEvents(list);
}
*/

// ═══════════════════════════════════════════════════════════
// STEP 7: Update Post Creation (in script.js)
// ═══════════════════════════════════════════════════════════

// Replace text post submit around line 613:

/*
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

  if (!STATE.currentUser) {
    toast('Please login first', 'error');
    return;
  }

  el('btn-submit-text').classList.add('loading');

  const result = await createPost(text, STATE.currentUser.id, {
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
  qsa('.feed-filter').forEach(f => f.classList.remove('active'));
  const recentBtn = qs('.feed-filter[data-filter="recent"]');
  if (recentBtn) recentBtn.classList.add('active');

  await renderFeed(); // Re-fetch from database
  toast('🎉 Your whisper is live!', 'success');
});
*/

// ═══════════════════════════════════════════════════════════
// STEP 8: Update Report Submission (in script.js)
// ═══════════════════════════════════════════════════════════

// Replace report confirm around line 1032:

/*
el('report-confirm').addEventListener('click', async () => {
  const reason = qs('input[name="report-reason"]:checked');
  if (!reason) {
    toast('Please select a reason', 'error');
    return;
  }

  const result = await reportPost(
    STATE.reportTarget,
    reason.value,
    STATE.currentUser?.id // Optional: for duplicate prevention
  );

  if (!result.success) {
    toast(result.error || 'Failed to report post', 'error');
    return;
  }

  closeModal('report-modal');
  toast('Report submitted. Thank you for keeping the community safe.', 'success');
});
*/

// ═══════════════════════════════════════════════════════════
// STEP 9: Update Admin Reveal Modal (in script.js)
// ═══════════════════════════════════════════════════════════

// Replace window.openRevealModal around line 1158:

/*
window.openRevealModal = async function(postId) {
  STATE.revealTarget = postId;

  el('btn-reveal-confirm').classList.add('loading');
  const result = await revealUser(postId);
  el('btn-reveal-confirm').classList.remove('loading');

  if (!result.success) {
    toast(result.error || 'Cannot reveal identity', 'error');
    return;
  }

  el('reveal-name').textContent = result.name || 'Unknown';
  el('reveal-email').textContent = result.email || 'Unknown';
  openModal('reveal-modal');
};
*/

// ═══════════════════════════════════════════════════════════
// STEP 10: Test Everything
// ═══════════════════════════════════════════════════════════

// 1. npm install
// 2. Create .env.local with Supabase credentials
// 3. npm run dev
// 4. Test OTP login
// 5. Create a post
// 6. Check if it appears in feed
// 7. Report a post
// 8. Login as admin and check reports

// ═══════════════════════════════════════════════════════════
// COMMON ISSUES & SOLUTIONS
// ═══════════════════════════════════════════════════════════

/*
CORS Error?
- Go to Supabase Dashboard → Settings → API
- Add your app URL to "Allowed Domains"
- Restart dev server

OTP Not Received?
- Check spam folder
- Verify email in .env.local matches test account
- Check Supabase email settings

Posts Not Loading?
- Check browser console for errors
- Verify Supabase credentials in .env.local
- Check RLS policies are set correctly
- Verify SQL script was fully executed

Module Import Error?
- Make sure supabaseBackend.js is in root of project
- Check file path is correct
- Reload page (Ctrl+Shift+R)

RLS Policy Error?
- Make sure user is authenticated before POST/UPDATE
- Check auth is working (try logout, login again)
- Verify RLS policies in SQL

Cannot Reveal User Identity?
- Make sure you're logged in as admin@campus.edu
- Check admin_users table has entry
- Verify admin setup instructions

*/

// ═══════════════════════════════════════════════════════════
// FILE CHECKLIST
// ═══════════════════════════════════════════════════════════

/*
Before deploying, make sure you have:

✓ supabaseBackend.js - Backend functions
✓ supabase.sql - Database schema
✓ .env.example - Environment variables template
✓ .env.local - Your personal credentials (NOT in git)
✓ script.js - Updated with Supabase integration
✓ index.html - Frontend (unchanged)
✓ .gitignore - Contains .env.local

Database setup:
✓ Tables created (posts, reports, admin_users, etc.)
✓ RLS policies enabled
✓ Indexes created
✓ Admin user added (if needed)

Environment:
✓ VITE_SUPABASE_URL set
✓ VITE_SUPABASE_ANON_KEY set
✓ Email OTP enabled in Supabase

Testing:
✓ Login/logout works
✓ Create post works
✓ Feed loads posts
✓ Report post works
✓ Admin reveal works (if admin)

*/

export default {
  // Quick start guide - see above for integration steps
};
