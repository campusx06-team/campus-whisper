/**
 * Campus Whisper — Bad Word Filter Integration
 * Connect to script.js for POST CREATION
 */

// ═══════════════════════════════════════════════════════════
// STEP 1: Import the filter in script.js
// ═══════════════════════════════════════════════════════════

// Add at the top of script.js (after other imports/requires, if any):
/*
import {
  checkBadWords,
  createPostWithFiltering,
  getAutoReportedPosts,
  getAllReports,
  reviewAutoBlockedPost,
} from './badWordFilter.js';
*/

// ═══════════════════════════════════════════════════════════
// STEP 2: Update TEXT POST submission (find around line 613)
// ═══════════════════════════════════════════════════════════

/*
BEFORE (old code):
el('create-form-text').addEventListener('submit', e => {
  e.preventDefault();
  const tagEl = qs('input[name="post-tag"]:checked', el('create-form-text'));
  const text = textarea.value.trim();
  if (!tagEl) { toast('Please select a category', 'error'); return; }
  if (!text)  { toast('Please write your whisper', 'error'); return; }

  const newPost = {
    id: Date.now(),
    emoji: randomFrom(AVATARS),
    tag: tagEl.value,
    text,
    imageUrl: STATE.imageDataUrl || null,
    likes: 0, dislikes: 0, comments: [],
    time: 'Just now',
    timestamp: Date.now(),
    flagged: false, removed: false, status: 'active',
    realUser: { name: 'Current User', email: STATE.currentUser?.email || 'you@college.edu' },
  };
  STATE.posts.unshift(newPost);
  STATE.myPostIds.add(newPost.id);

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
  renderFeed();
  toast('🎉 Your whisper is live!', 'success');
});

AFTER (with bad word filter):
*/

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

  // Show loading state
  el('btn-submit-text').classList.add('loading');

  // Use the filtering function that checks for bad words
  // If bad words found: auto-reports to database
  // If clean: creates post normally
  const result = await createPostWithFiltering(
    text,
    STATE.currentUser.id,
    {
      tag: tagEl.value,
      imageUrl: STATE.imageDataUrl || null,
    }
  );

  el('btn-submit-text').classList.remove('loading');

  if (!result.success) {
    // Error occurred
    toast(result.error, 'error');
    return;
  }

  if (result.blocked) {
    // Post was blocked due to bad words and auto-reported
    toast('⛔ ' + result.error, 'error');
    // Reset form
    el('create-form-text').reset();
    el('char-bar-fill').style.width = '0%';
    el('post-char-count').textContent = '0';
    clearImagePreview();
    return;
  }

  // Post was created successfully
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

  // Refresh feed from Supabase
  await renderFeed();
  toast('🎉 Your whisper is live!', 'success');
});

// ═══════════════════════════════════════════════════════════
// STEP 3: Update POLL submission (around line 651)
// ═══════════════════════════════════════════════════════════

/*
el('create-form-poll').addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = el('poll-question').value.trim();
  const optInputs = qsa('.poll-opt-input');
  const opts = optInputs.map(i => i.value.trim()).filter(v => v);
  const durEl = qs('input[name="poll-duration"]:checked');

  // Check poll question for bad words
  const { hasBadWords } = checkBadWords(question);
  if (hasBadWords) {
    toast('Poll question contains inappropriate language', 'error');
    return;
  }

  // Check all poll options for bad words
  for (let opt of opts) {
    const { hasBadWords } = checkBadWords(opt);
    if (hasBadWords) {
      toast('One or more poll options contain inappropriate language', 'error');
      return;
    }
  }

  if (!question) {
    toast('Please enter a poll question', 'error');
    return;
  }
  if (opts.length < 2) {
    toast('Add at least 2 options', 'error');
    return;
  }

  const dur = durEl ? durEl.value : '24h';
  const newPoll = {
    id: 'p' + Date.now(),
    question,
    options: opts.map(text => ({ text, votes: 0 })),
    duration: dur,
    timeLeft: dur,
    totalVotes: 0,
    votedIndex: null,
    myVote: true,
    time: 'Just now',
    emoji: '📊',
  };
  STATE.polls.unshift(newPoll);
  STATE.myPollIds.add(newPoll.id);

  el('create-form-poll').reset();
  optInputs.forEach(i => i.value = '');
  el('poll-question').value = '';

  switchView('polls');
  renderPolls();
  toast('📊 Poll launched!', 'success');
});
*/

// ═══════════════════════════════════════════════════════════
// STEP 4: Update Q&A submission (around line 687)
// ═══════════════════════════════════════════════════════════

/*
el('create-form-question').addEventListener('submit', async (e) => {
  e.preventDefault();

  const question = qaTextarea.value.trim();
  const catEl = qs('input[name="qa-tag"]:checked', el('create-form-question'));

  // Check question for bad words
  const { hasBadWords } = checkBadWords(question);
  if (hasBadWords) {
    toast('Question contains inappropriate language', 'error');
    return;
  }

  if (!question) {
    toast('Please write your question', 'error');
    return;
  }
  if (!catEl) {
    toast('Please select a category', 'error');
    return;
  }

  const newQA = {
    id: 'q' + Date.now(),
    question,
    category: catEl.value,
    emoji: { academics: '📚', social: '🎉', campus: '🏫', career: '💼', misc: '🌀' }[catEl.value] || '❓',
    answers: [],
    time: 'Just now',
    upvotes: 0,
    upvoted: false,
  };
  STATE.qaItems.unshift(newQA);

  el('create-form-question').reset();
  qaTextarea.value = '';
  el('qa-char-bar-fill').style.width = '0%';
  el('qa-char-count').textContent = '0';

  switchView('qa');
  renderQA();
  toast('❓ Question posted!', 'success');
});
*/

// ═══════════════════════════════════════════════════════════
// STEP 5: Filter Comments & Answers (OPTIONAL)
// ═══════════════════════════════════════════════════════════

/*
const submitComment = async () => {
  const text = el('comment-input').value.trim();

  // Optional: Check comment for bad words
  const { hasBadWords } = checkBadWords(text);
  if (hasBadWords) {
    toast('Comment contains inappropriate language', 'error');
    return;
  }

  if (!text) return;

  const post = STATE.posts.find(p => p.id === STATE.commentTarget);
  if (!post) return;
  post.comments.push({ avi: randomFrom(AVATARS), name: 'Anonymous', text });
  el('comment-input').value = '';
  renderCommentsList(post.comments, el('comments-list'));
  const feedBtn = qs(`.comment-open-btn[data-id="${post.id}"]`);
  if (feedBtn) feedBtn.lastChild.textContent = ` ${post.comments.length}`;
  toast('Comment posted anonymously', 'success');
};
*/

// ═══════════════════════════════════════════════════════════
// STEP 6: Admin Dashboard - Show Auto-Blocked Posts
// ═══════════════════════════════════════════════════════════

/*
Add this to your admin dashboard rendering function:

async function renderAdminAutoBlockedPosts() {
  const result = await getAutoReportedPosts(50, 0);

  if (!result.success) {
    console.error('Failed to fetch auto-blocked posts:', result.error);
    return;
  }

  const container = el('admin-dash-auto-blocked'); // Create this element in HTML
  if (!container) return;

  const reports = result.reports;

  if (reports.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--emerald);">✓ No auto-blocked posts</p>';
    return;
  }

  container.innerHTML = reports.map(report => `
    <div class="report-item auto-blocked">
      <div class="report-header">
        <span class="reason-tag">🤖 Auto-Blocked</span>
        <span class="time">${new Date(report.created_at).toLocaleDateString()}</span>
      </div>
      <p class="report-content">${report.content || 'User tried to post'}</p>
      <p class="report-reason">Reason: ${report.notes || 'Bad words detected'}</p>
      <div class="report-actions">
        <button onclick="window.adminReviewPost('${report.id}', 'allow')" class="btn-allow">Allow Post</button>
        <button onclick="window.adminReviewPost('${report.id}', 'approve')" class="btn-block">Keep Blocked</button>
      </div>
    </div>
  `).join('');
}

// Add global function for admin to review
window.adminReviewPost = async function(reportId, action) {
  const result = await reviewAutoBlockedPost(reportId, action);
  if (result.success) {
    toast(result.message, 'success');
    renderAdminAutoBlockedPosts(); // Refresh list
  } else {
    toast(result.error, 'error');
  }
};
*/

// ═══════════════════════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════════════════════

/*
STUDENT CREATES POST:
1. User types content → clicks "Post"
2. createPostWithFiltering() checks for bad words
3. If bad words found:
   - Content is NOT inserted into 'posts' table
   - Instead, auto-inserted into 'reports' table with reason='auto_block'
   - User sees: "⛔ Post blocked due to inappropriate content"
4. If clean:
   - Inserted normally into 'posts' table
   - User sees: "🎉 Your whisper is live!"

ADMIN REVIEWS BLOCKED POSTS:
1. Admin views dashboard → "Auto-Blocked Posts" section
2. Shows all posts blocked due to bad words
3. Admin can:
   - "Allow Post" → Keeps it removed but marks as reviewed
   - "Keep Blocked" → Confirms the block
4. All data synced in Supabase in real-time

SUPABASE TABLES USED:
- 'posts' table: Only clean, approved content
- 'reports' table: All reported posts + auto-blocked content

DATABASE SCHEMA REQUIREMENT:
The 'reports' table should have these columns:
- id (uuid)
- post_id (uuid, nullable) - null for auto-blocked posts
- reason (text) - "auto_block" for bad words
- reported_by (uuid) - user who tried to post
- notes (text) - details about the violation
- content (text) - the blocked content
- tag (text) - post category
- reviewed (boolean) - admin reviewed?
- reviewed_at (timestamp) - when admin reviewed
- action_taken (text) - 'blocked' or 'allowed'
- created_at (timestamp)
*/

export default {
  // Integration guide - see above for code examples
};
