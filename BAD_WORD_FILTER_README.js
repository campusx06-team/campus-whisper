/**
 * Campus Whisper — Bad Word Filter + Auto-Report System
 * Complete Implementation Guide
 */

// ═══════════════════════════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════════════════════════

/*
This system automatically detects and blocks posts containing
inappropriate content, then auto-reports them to the admin dashboard.

FLOW:
Student → Types Post → Bad Words Detected?
                      ├─ YES: Auto-report to "reports" table
                      │       "⛔ Post blocked due to inappropriate content"
                      └─ NO: Insert into "posts" table normally
                            "🎉 Your whisper is live!"

Admin sees all auto-blocked posts in dashboard and can:
- Review the blocked content
- Allow the post if false positive
- Keep it blocked if violation confirmed
*/

// ═══════════════════════════════════════════════════════════
// FILES CREATED
// ═══════════════════════════════════════════════════════════

/*
1. badWordFilter.js
   - Contains bad words list
   - checkBadWords() function
   - createPostWithFiltering() - main function
   - getAutoReportedPosts() - admin fetches blocked posts
   - reviewAutoBlockedPost() - admin reviews decision
   - getAllReports() - combined manual + auto reports

2. BAD_WORD_FILTER_INTEGRATION.js
   - Detailed integration guide for script.js
   - Code examples for post creation
   - Admin dashboard code
   - Testing examples

3. MIGRATION_AUTO_BLOCK.sql
   - SQL to add columns to reports table
   - Create views for admin dashboard
   - Run in Supabase SQL Editor

4. This file (README)
   - Overview and setup instructions
*/

// ═══════════════════════════════════════════════════════════
// SETUP STEPS
// ═══════════════════════════════════════════════════════════

/*
STEP 1: Update Supabase Database Schema
─────────────────────────────────────────
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire contents of MIGRATION_AUTO_BLOCK.sql
3. Run the query
4. Tables will be updated with new columns

Columns added to 'reports' table:
- content (TEXT) - stores the blocked content
- reason (VARCHAR) - 'manual' or 'auto_block'
- tag (VARCHAR) - post category

STEP 2: Import badWordFilter.js in script.js
─────────────────────────────────────────
At the top of script.js, add:

import {
  checkBadWords,
  createPostWithFiltering,
  getAutoReportedPosts,
  getAllReports,
  reviewAutoBlockedPost,
} from './badWordFilter.js';

STEP 3: Update Post Creation Handler
─────────────────────────────────────
Find the "create-form-text" submit handler in script.js
Replace with the code shown in BAD_WORD_FILTER_INTEGRATION.js

Key changes:
- Use createPostWithFiltering() instead of direct insert
- Check result.blocked to show appropriate message
- Use async/await because it calls Supabase

STEP 4: Update Admin Dashboard
──────────────────────────────
Add this function to script.js:

async function renderAdminAutoBlockedPosts() {
  const result = await getAutoReportedPosts(50, 0);
  if (!result.success) {
    console.error('Failed to fetch:', result.error);
    return;
  }

  const container = el('admin-dash-auto-blocked');
  if (!container) return;

  const reports = result.reports;
  if (reports.length === 0) {
    container.innerHTML = '<p style="text-align:center">✓ No blocked posts</p>';
    return;
  }

  container.innerHTML = reports.map(report => `
    <div class="report-card auto-blocked">
      <div class="report-header">
        <span class="badge">🤖 Auto-Blocked</span>
        <span class="time">${new Date(report.created_at).toLocaleDateString()}</span>
      </div>
      <p class="report-content">${report.content || 'Attempted post'}</p>
      <p class="report-reason">Reason: ${report.notes || 'Bad words detected'}</p>
      <div class="report-actions">
        <button onclick="window.allowPost('${report.id}')" class="btn-allow">Allow</button>
        <button onclick="window.blockPost('${report.id}')" class="btn-block">Keep Block</button>
      </div>
    </div>
  `).join('');
}

// Add these global functions
window.allowPost = async (reportId) => {
  const result = await reviewAutoBlockedPost(reportId, 'allow');
  if (result.success) {
    toast('✓ Post allowed', 'success');
    renderAdminAutoBlockedPosts();
  }
};

window.blockPost = async (reportId) => {
  const result = await reviewAutoBlockedPost(reportId, 'approve');
  if (result.success) {
    toast('✓ Post blocked', 'success');
    renderAdminAutoBlockedPosts();
  }
};

STEP 5: Test the System
───────────────────────
Test as Student:
1. Try to create post with bad word: "This damn class sucks"
2. Should show: "⛔ Post blocked due to inappropriate content"
3. Check Supabase → reports table → should have new entry

Test as Admin:
1. Go to Admin Dashboard
2. Should see "Auto-Blocked Posts" section
3. See the blocked post with "damn" highlighted
4. Click "Allow" or "Keep Block"
5. Should update in dashboard

*/

// ═══════════════════════════════════════════════════════════
// BANNED WORDS LIST
// ═══════════════════════════════════════════════════════════

/*
Current list in badWordFilter.js includes:
- Abusive language: ass, bitch, fuck, damn, hell, shit, etc.
- Slurs and hate speech (abbreviated)
- Threats: kill, murder, rape, shoot, stab, bomb, etc.
- Harassment: kys, loser, idiot, moron, etc.
- Sexual: porn, xxx, nude, sex
- Drugs: cocaine, heroin, meth, weed, loda, etc.

To add more words:
1. Open badWordFilter.js
2. Find the BANNED_WORDS array
3. Add word: BANNED_WORDS.push('newword')
4. Restart dev server

To remove words:
1. Open badWordFilter.js
2. Find the word in BANNED_WORDS array
3. Remove it
4. Restart dev server
*/

// ═══════════════════════════════════════════════════════════
// HOW IT WORKS TECHNICALLY
// ═══════════════════════════════════════════════════════════

/*
STUDENT POSTS:
───────────────
1. User fills form with content
2. Clicks "Post" button
3. createPostWithFiltering(content, userId, metadata) is called

4. Function checks:
   - Is content empty? → Error
   - Is content > 500 chars? → Error
   - Does content have bad words? → Continue to step 5

5. If bad words found:
   - Call autoReportPost()
   - Insert into 'reports' table with:
     - post_id: null (no post created)
     - reason: 'auto_block'
     - reported_by: userId
     - notes: "bad word detected: [words]"
     - content: the full text
     - created_at: now
   - Return: { blocked: true, error: "Post blocked..." }
   - UI shows error message

6. If no bad words:
   - Insert into 'posts' table normally
   - Return: { success: true, post: data }
   - UI shows success message

ADMIN REVIEW:
──────────────
1. Admin clicks "Dashboard" or "Flagged Posts"
2. renderAdminAutoBlockedPosts() is called
3. getAutoReportedPosts() queries Supabase
4. Returns all posts where reason = 'auto_block'
5. Admin sees:
   - The blocked content
   - Reason (bad words detected)
   - Date submitted
   - Options: Allow or Keep Blocked

6. Admin clicks "Allow" or "Keep Block"
7. reviewAutoBlockedPost(reportId, action) is called
8. Updates 'reports' table:
   - reviewed: true
   - reviewed_at: now
   - action_taken: 'allowed' or 'blocked'
9. List refreshes showing updated status
*/

// ═══════════════════════════════════════════════════════════
// BOTH SYSTEMS CONNECTED
// ═══════════════════════════════════════════════════════════

/*
STUDENT SIDE:
─────────────
- Uses createPostWithFiltering()
- If clean: post visible in feed immediately
- If blocked: user gets error, post not visible
- User can edit and resubmit

ADMIN SIDE:
────────────
- Uses getAutoReportedPosts() to see blocked posts
- Uses getAllReports() to see all reports (manual + auto)
- Uses reviewAutoBlockedPost() to manage decisions
- Can see stats: how many auto-blocked, how many reviewed

SUPABASE:
──────────
- posts table: only clean, approved posts
- reports table: all reports (manual flag + auto-blocked)
- views: auto_blocked_posts, moderation_stats
- Synced across student and admin in real-time

DATABASE IN SYNC:
─────────────────
Both use same Supabase project:
- Student creates post → checks filter → updates posts/reports
- Admin views dashboard → queries reports/posts → sees updates
- No delays, no sync issues, single source of truth
*/

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════

/*
createPostWithFiltering() returns:

SUCCESS (clean post):
{
  success: true,
  blocked: false,
  post: { id, content, user_id, created_at, ... }
}

BLOCKED (bad words):
{
  success: true,
  blocked: true,
  error: "Post blocked due to inappropriate content",
  report: { id, reason, notes, ... }
}

ERROR (network/db issue):
{
  success: false,
  blocked: false,
  error: "Failed to create post" or specific error
}

VALIDATION ERRORS:
{
  success: false,
  blocked: false,
  error: "Post content cannot be empty" or other validation error
}

In UI:
- blocked: true → Show red toast "⛔ Post blocked..."
- success: false → Show red toast with error message
- success: true, blocked: false → Show green toast "🎉 Your whisper is live!"
*/

// ═══════════════════════════════════════════════════════════
// SECURITY CONSIDERATIONS
// ═══════════════════════════════════════════════════════════

/*
1. Filter is case-insensitive
   "DAMN", "damn", "DaMn" all match

2. Word boundaries prevent false positives
   "class" won't match "ass"
   "assert" won't match "ass"

3. Multiple bad words detected
   "You're a damn asshole" → reports: "damn, asshole"

4. RLS protects data
   - Only users and admins can insert reports
   - Only admins can review reports
   - Students see only their own posts

5. Auto-reports tracked
   - Each report has reported_by (user who tried to post)
   - Can detect serial violators
   - Admin can take action if needed

6. Content preserved
   - Blocked content stored in reports table
   - Admins can review for false positives
   - Can adjust filter based on patterns
*/

// ═══════════════════════════════════════════════════════════
// MONITORING & ANALYTICS
// ═══════════════════════════════════════════════════════════

/*
Admin can see:

Total auto-blocked posts:
SELECT COUNT(*) FROM reports WHERE reason = 'auto_block'

Users with violations:
SELECT COUNT(DISTINCT reported_by) FROM reports WHERE reason = 'auto_block'

Most common bad words:
SELECT notes FROM reports WHERE reason = 'auto_block'
(Parse the notes field to count word frequency)

Posts reviewed:
SELECT COUNT(*) FROM reports WHERE reviewed = true

Posts allowed on appeal:
SELECT COUNT(*) FROM reports WHERE action_taken = 'allowed'

Recent blocks:
SELECT * FROM reports WHERE reason = 'auto_block'
ORDER BY created_at DESC LIMIT 10
*/

// ═══════════════════════════════════════════════════════════
// TESTING CHECKLIST
// ═══════════════════════════════════════════════════════════

/*
Student Testing:
☐ Clean post creates successfully
☐ Post with 1 bad word is blocked
☐ Post with multiple bad words is blocked
☐ Case insensitive ("DAMN" also blocked)
☐ Empty post shows error
☐ Too long post shows error
☐ Blocked post notifies user
☐ Can edit and resubmit clean version

Admin Testing:
☐ Dashboard shows auto-blocked posts
☐ Shows correct number of blocks
☐ Shows blocked content
☐ Shows reason (bad words)
☐ Can click "Allow" to unblock
☐ Can click "Keep Block" to confirm
☐ List updates after action
☐ Can see manual + auto reports combined
☐ Stats view shows correct numbers

Database Testing:
☐ Blocked posts appear in reports table
☐ reason column = 'auto_block'
☐ content column has correct text
☐ Clean posts in posts table only
☐ No blocked posts in posts table
☐ Supabase live updates work
*/

// ═══════════════════════════════════════════════════════════
// TROUBLESHOOTING
// ═══════════════════════════════════════════════════════════

/*
Problem: Posts not being blocked
Reason: Bad word filter not applied
Fix: Make sure createPostWithFiltering() is being called

Problem: Admin sees no auto-blocked posts
Reason: Reason column might be empty/wrong
Fix: Run MIGRATION_AUTO_BLOCK.sql to update schema

Problem: "content" field undefined
Reason: Supabase schema not updated
Fix: Run MIGRATION_AUTO_BLOCK.sql

Problem: Admin review buttons don't work
Reason: Missing window functions
Fix: Add window.allowPost and window.blockPost functions

Problem: Network errors on post
Reason: Supabase connection issue
Fix: Check .env.local has correct Supabase URL and key

Problem: Too many false positives
Reason: Banned words list too aggressive
Fix: Remove borderline words from BANNED_WORDS array
*/

export default {
  // Complete implementation guide
  // See individual files for actual code
};
