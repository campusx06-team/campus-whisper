/**
 * Campus Whisper — Content Filter Integration Guide
 * How to add bad word filter to script.js
 */

// ═══════════════════════════════════════════════════════════
// STEP 1: Import the filter at the top of script.js
// ═══════════════════════════════════════════════════════════

// Add this line at the very top of script.js (after other imports):
/*
import {
  checkBadWords,
  validatePostContent,
  getBadWordsMessage,
} from './contentFilter.js';
*/

// ═══════════════════════════════════════════════════════════
// STEP 2: Update TEXT POST form submission (around line 613)
// ═══════════════════════════════════════════════════════════

// Find this code in script.js:
/*
el('create-form-text').addEventListener('submit', e => {
  e.preventDefault();
  const tagEl = qs('input[name="post-tag"]:checked', el('create-form-text'));
  const text = textarea.value.trim();
  if (!tagEl) { toast('Please select a category', 'error'); return; }
  if (!text)  { toast('Please write your whisper', 'error'); return; }
  ...
});
*/

// Replace it with:
/*
el('create-form-text').addEventListener('submit', e => {
  e.preventDefault();

  const tagEl = qs('input[name="post-tag"]:checked', el('create-form-text'));
  const text = textarea.value.trim();

  // Category validation
  if (!tagEl) {
    toast('Please select a category', 'error');
    return;
  }

  // Content validation (includes bad words filter)
  const validation = validatePostContent(text);
  if (!validation.valid) {
    toast(validation.error, 'error');
    return;
  }

  // If we reach here, content is clean and valid!
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
*/

// ═══════════════════════════════════════════════════════════
// STEP 3: Update POLL form submission (around line 651)
// ═══════════════════════════════════════════════════════════

// Find this code:
/*
el('create-form-poll').addEventListener('submit', e => {
  e.preventDefault();
  const question = el('poll-question').value.trim();
  ...
});
*/

// Update it to:
/*
el('create-form-poll').addEventListener('submit', e => {
  e.preventDefault();

  const question = el('poll-question').value.trim();
  const optInputs = qsa('.poll-opt-input');
  const opts = optInputs.map(i => i.value.trim()).filter(v => v);
  const durEl = qs('input[name="poll-duration"]:checked');

  // Validate poll question content
  const validation = validatePostContent(question);
  if (!validation.valid) {
    toast(validation.error, 'error');
    return;
  }

  // Validate poll options
  for (let opt of opts) {
    const optValidation = validatePostContent(opt);
    if (!optValidation.valid) {
      toast(`Poll option contains inappropriate content. Please revise.`, 'error');
      return;
    }
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
// STEP 4: Update Q&A form submission (around line 687)
// ═══════════════════════════════════════════════════════════

// Find this code:
/*
el('create-form-question').addEventListener('submit', e => {
  e.preventDefault();
  const question = qaTextarea.value.trim();
  ...
});
*/

// Update it to:
/*
el('create-form-question').addEventListener('submit', e => {
  e.preventDefault();

  const question = qaTextarea.value.trim();
  const catEl = qs('input[name="qa-tag"]:checked', el('create-form-question'));

  // Validate question content
  const validation = validatePostContent(question);
  if (!validation.valid) {
    toast(validation.error, 'error');
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
// STEP 5: Optional - Also filter comments and answers
// ═══════════════════════════════════════════════════════════

// In the comment submission function (around line 954):
/*
const submitComment = () => {
  const text = el('comment-input').value.trim();

  // Add validation
  const validation = validatePostContent(text);
  if (!validation.valid) {
    toast(validation.error, 'error');
    return;
  }

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

// Same for answers (around line 1003)
/*
const submitAnswer = () => {
  const text = el('answer-input').value.trim();

  // Add validation
  const validation = validatePostContent(text);
  if (!validation.valid) {
    toast(validation.error, 'error');
    return;
  }

  const qa = STATE.qaItems.find(q => q.id === STATE.answerTarget);
  if (!qa) return;
  qa.answers.push({ avi: randomFrom(AVATARS), text });
  el('answer-input').value = '';
  renderAnswersList(qa.answers, el('answers-list'));
  renderQA();
  toast('Answer posted anonymously', 'success');
};
*/

// ═══════════════════════════════════════════════════════════
// TESTING THE FILTER
// ═══════════════════════════════════════════════════════════

/*
Test cases:

1. Clean post:
   "I love studying in the library at night"
   ✓ Posts successfully

2. Post with banned word:
   "This class is damn hard"
   ✗ Shows error: "Your post contains inappropriate language ("damn"). Please revise and try again."

3. Post with multiple banned words:
   "I hate this bullshit class"
   ✗ Shows error: "Your post contains inappropriate content. Please revise and try again."

4. Post with threat:
   "I will kill that assignment"
   ✗ Shows error with detection of "kill"

5. Empty post:
   ""
   ✗ Shows error: "Please write your whisper"

6. Too long:
   "[500+ characters]"
   ✗ Shows error: "Post content exceeds 500 characters"
*/

// ═══════════════════════════════════════════════════════════
// CUSTOMIZING THE FILTER
// ═══════════════════════════════════════════════════════════

/*
To add or remove banned words:

1. Open contentFilter.js
2. Find the BANNED_WORDS array
3. Add words: BANNED_WORDS.push('newword')
4. Remove words: Delete from array
5. Restart dev server

Example - Add more words:
const BANNED_WORDS = [
  ...existing words...,
  'newbadword',
  'anotherbadword',
];

The filter is case-insensitive and uses word boundaries,
so it won't catch words within other words.

Example:
- "ass" will match "asshole" but NOT "class"
- "damn" will match "damn" but NOT "damned" (unless added)
*/

// ═══════════════════════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════════════════════

/*
1. User types content into post/comment/answer field

2. User clicks "Post" button

3. validatePostContent() is called:
   - Checks if empty ✓
   - Checks if too long ✓
   - Checks for banned words ✓

4. If any validation fails:
   - Toast error message shown ✓
   - Post NOT sent to database ✓
   - User can revise content ✓

5. If validation passes:
   - Post created normally ✓
   - Sent to Supabase ✓
   - Shows success message ✓

The filter is simple, efficient, and works instantly!
*/

export default {
  // Integration guide - see script.js modifications above
};
