'use strict';

// ══════════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════════
const STATE = {
  role: 'student',
  loggedIn: false,
  currentUser: null,
  activeView: 'feed',
  activeFilter: 'all',
  theme: localStorage.getItem('cw-theme') || 'dark',
  posts: [],
  polls: [],
  qaItems: [],
  myPostIds: new Set(),
  myPollIds: new Set(),
  notifications: [],
  commentTarget: null,
  revealTarget: null,
  reportTarget: null,
  answerTarget: null,
  imageDataUrl: null,
};

// ══════════════════════════════════════════════════════════
//  SEED DATA
// ══════════════════════════════════════════════════════════
const AVATARS = ['🎭','👻','🌙','🦊','🐼','🦋','🌸','🎪','🦄','🎵','🌈','🔮'];
const ANON_NAMES = [
  'Anonymous Fox','Mystery Owl','Silent Star','Wandering Soul',
  'Hidden Bloom','Quiet Storm','Shadow Whisper','Unnamed Voice',
  'Faceless Friend','Secret Keeper','Unknown Heart','Ghost Writer',
];

const SEED_POSTS = [
  { id: 1, emoji: '🎭', tag: 'deep', text: 'I secretly love the library at 3AM more than any party this semester. The silence is my therapy.', likes: 234, dislikes: 12, comments: [{ avi: '🌸', name: 'Anonymous', text: 'Same! The library at night hits different 💜' }, { avi: '🦊', name: 'Unknown', text: 'You\'re not alone in this.' }], time: '2h ago', timestamp: Date.now() - 7200000, flagged: false, removed: false, status: 'active', realUser: { name: 'Priya Sharma', email: 'priya.s@college.edu' } },
  { id: 2, emoji: '😂', tag: 'funny', text: 'I answered a question in lecture that was so wrong the professor stared at me for 10 seconds. I still think about it at night.', likes: 412, dislikes: 5, comments: [{ avi: '🎪', name: 'Anonymous', text: 'lmaooo this is so real 💀' }], time: '3h ago', timestamp: Date.now() - 10800000, flagged: false, removed: false, status: 'active', realUser: { name: 'Arjun Mehta', email: 'arjun.m@college.edu' } },
  { id: 3, emoji: '❤️', tag: 'love', text: 'To the person who always saves me a seat in Chem 201 — you make my toughest day bearable. I wish I could tell you.', likes: 567, dislikes: 3, comments: [], time: '4h ago', timestamp: Date.now() - 14400000, flagged: false, removed: false, status: 'active', realUser: { name: 'Ananya Roy', email: 'ananya.r@college.edu' } },
  { id: 4, emoji: '🔥', tag: 'rant', text: 'Can we talk about how the dining hall charges ₹350 for a salad that\'s 90% iceberg lettuce? I\'m a student, not a rabbit 🐰', likes: 891, dislikes: 22, comments: [{ avi: '👻', name: 'Anonymous', text: 'FACTS. The food situation is a tragedy.' }], time: '5h ago', timestamp: Date.now() - 18000000, flagged: true, removed: false, status: 'flagged', reportReason: 'spam', realUser: { name: 'Rohan Kapoor', email: 'rohan.k@college.edu' } },
  { id: 5, emoji: '💡', tag: 'advice', text: 'If you\'re struggling with imposter syndrome — everyone else is also pretending they know what they\'re doing. You belong here.', likes: 1023, dislikes: 2, comments: [{ avi: '🦋', name: 'Anonymous', text: 'I needed this today. Thank you 🙏' }, { avi: '🔮', name: 'Anonymous', text: 'Saving this forever.' }], time: '6h ago', timestamp: Date.now() - 21600000, flagged: false, removed: false, status: 'active', realUser: { name: 'Kavya Iyer', email: 'kavya.i@college.edu' } },
  { id: 6, emoji: '🌙', tag: 'deep', text: 'Sometimes I walk around campus at night just to feel the weight of the world lift. The sky here is different.', likes: 345, dislikes: 8, comments: [], time: '7h ago', timestamp: Date.now() - 25200000, flagged: false, removed: false, status: 'active', realUser: { name: 'Nikhil Das', email: 'nikhil.d@college.edu' } },
  { id: 7, emoji: '😂', tag: 'funny', text: 'My roommate talks in sleep and said "submit the assignment" at 3AM. Even their subconscious is stressed.', likes: 654, dislikes: 7, comments: [{ avi: '🎵', name: 'Anonymous', text: 'This broke me 💀💀' }], time: '8h ago', timestamp: Date.now() - 28800000, flagged: false, removed: false, status: 'active', realUser: { name: 'Sneha Pillai', email: 'sneha.p@college.edu' } },
  { id: 8, emoji: '❤️', tag: 'love', text: 'I fell in love with my study partner. But what if I\'m wrong and lose the best friend I\'ve made here?', likes: 789, dislikes: 4, comments: [{ avi: '🌸', name: 'Anonymous', text: 'Go for it. The regret of not trying is worse.' }], time: '9h ago', timestamp: Date.now() - 32400000, flagged: false, removed: false, status: 'active', realUser: { name: 'Vivek Nair', email: 'vivek.n@college.edu' } },
  { id: 9, emoji: '😤', tag: 'rant', text: 'Group projects should be illegal. I am carrying this team and it shows in my mental health every single week.', likes: 567, dislikes: 31, comments: [], time: '10h ago', timestamp: Date.now() - 36000000, flagged: true, removed: false, status: 'flagged', reportReason: 'inappropriate', realUser: { name: 'Ishaan Saxena', email: 'ishaan.s@college.edu' } },
  { id: 10, emoji: '💡', tag: 'advice', text: 'Start attending office hours. Professors are 10x nicer one-on-one and it literally saved my GPA twice.', likes: 432, dislikes: 5, comments: [{ avi: '🦄', name: 'Anonymous', text: 'Can confirm. Changed my academic life.' }], time: '11h ago', timestamp: Date.now() - 39600000, flagged: false, removed: false, status: 'active', realUser: { name: 'Meera Joshi', email: 'meera.j@college.edu' } },
  { id: 11, emoji: '🌊', tag: 'deep', text: 'I changed my major 3 times in 2 years and still don\'t know what I want. But honestly? That\'s okay.', likes: 278, dislikes: 9, comments: [], time: '12h ago', timestamp: Date.now() - 43200000, flagged: false, removed: false, status: 'active', realUser: { name: 'Tara Singh', email: 'tara.s@college.edu' } },
  { id: 12, emoji: '😂', tag: 'funny', text: 'I accidentally called my professor "mom" in front of 180 people. I am now considering studying abroad. Far, far abroad.', likes: 943, dislikes: 2, comments: [{ avi: '🎪', name: 'Anonymous', text: 'The audacity of this post 😭😭' }], time: '14h ago', timestamp: Date.now() - 50400000, flagged: false, removed: false, status: 'active', realUser: { name: 'Aditya Kumar', email: 'aditya.k@college.edu' } },
];

const SEED_POLLS = [
  {
    id: 'p1', question: 'Which study spot is the GOAT on campus?',
    options: [
      { text: '📚 Main Library', votes: 142 },
      { text: '☕ Campus Café', votes: 87 },
      { text: '🌳 Outdoor Garden', votes: 56 },
      { text: '🏠 My Room (in chaos)', votes: 203 },
    ],
    duration: '24h', timeLeft: '11h left', totalVotes: 488,
    votedIndex: null, myVote: false,
    time: '1h ago', emoji: '🗳️',
  },
  {
    id: 'p2', question: 'Honestly, how many hours of sleep did you get last night?',
    options: [
      { text: '😇 8+ hours (you\'re lying)', votes: 23 },
      { text: '😴 6-7 hours', votes: 98 },
      { text: '😰 4-5 hours', votes: 176 },
      { text: '💀 Less than 3 hours', votes: 234 },
    ],
    duration: '6h', timeLeft: '2h left', totalVotes: 531,
    votedIndex: null, myVote: false,
    time: '3h ago', emoji: '😴',
  },
  {
    id: 'p3', question: 'What\'s the hardest part of campus life?',
    options: [
      { text: '📖 Academic pressure', votes: 312 },
      { text: '💸 Financial stress', votes: 189 },
      { text: '😔 Loneliness', votes: 201 },
      { text: '🎯 Finding purpose', votes: 98 },
    ],
    duration: '3d', timeLeft: '2d left', totalVotes: 800,
    votedIndex: null, myVote: false,
    time: '5h ago', emoji: '🤔',
  },
];

const SEED_QA = [
  {
    id: 'q1', question: 'Is it normal to have no idea what career you want even in 3rd year?',
    category: 'career', emoji: '💼',
    answers: [
      { avi: '🌸', text: 'Completely normal. Most people figure it out after graduation honestly.' },
      { avi: '🦊', text: 'Yes! 3rd year me also had zero clue. Now I\'m working at a startup I love. Give it time.' },
      { avi: '🎭', text: 'Not just normal — it might actually be a sign of good self-awareness.' },
    ],
    time: '30m ago', upvotes: 34, upvoted: false,
  },
  {
    id: 'q2', question: 'How do you handle a professor who clearly doesn\'t like you? Any tips?',
    category: 'academics', emoji: '📚',
    answers: [
      { avi: '👻', text: 'Go to office hours consistently. It changes their perception 100%.' },
      { avi: '🌈', text: 'Focus on your work, not the relationship. Let your grades speak.' },
    ],
    time: '2h ago', upvotes: 57, upvoted: false,
  },
  {
    id: 'q3', question: 'Best places to make friends on campus as a shy introvert?',
    category: 'social', emoji: '🎉',
    answers: [
      { avi: '🦋', text: 'Join one club that genuinely interests you. Quality > quantity.' },
      { avi: '🔮', text: 'Library study groups! Low pressure and you bond over shared struggle.' },
      { avi: '🎵', text: 'Night owl here — met all my friends at late-night canteen runs.' },
    ],
    time: '4h ago', upvotes: 89, upvoted: false,
  },
  {
    id: 'q4', question: 'Anyone else feel like they\'re watching everyone else succeed while you\'re stuck?',
    category: 'misc', emoji: '🌀',
    answers: [
      { avi: '🌙', text: 'Social media is a highlight reel. Everyone is struggling behind the scenes.' },
    ],
    time: '6h ago', upvotes: 112, upvoted: false,
  },
];

const SEED_NOTIFICATIONS = [
  { id: 1, icon: '❤️', iconClass: 'purple', title: 'Your whisper got 50+ likes!', desc: 'Your post about the library is trending.', time: '10m ago', unread: true },
  { id: 2, icon: '⚠️', iconClass: 'red', title: 'Admin Message', desc: 'One of your posts has been reviewed by admin.', time: '1h ago', unread: true },
  { id: 3, icon: '💬', iconClass: 'green', title: 'New comment on your whisper', desc: '"You\'re not alone in this" — someone replied.', time: '2h ago', unread: true },
  { id: 4, icon: '📊', iconClass: 'amber', title: 'Your poll is trending!', desc: '200+ people voted on your campus poll.', time: '3h ago', unread: false },
  { id: 5, icon: '🔒', iconClass: 'amber', title: 'Privacy Reminder', desc: 'Your identity is always protected unless you violate guidelines.', time: '1d ago', unread: false },
];

const SEED_USERS = [
  { id: 1, email: 'priya.s@college.edu', name: 'Priya Sharma', posts: 3, joined: '2026-01-12', status: 'active' },
  { id: 2, email: 'arjun.m@college.edu', name: 'Arjun Mehta', posts: 2, joined: '2026-02-03', status: 'active' },
  { id: 3, email: 'ananya.r@college.edu', name: 'Ananya Roy', posts: 1, joined: '2026-01-25', status: 'active' },
  { id: 4, email: 'rohan.k@college.edu', name: 'Rohan Kapoor', posts: 2, joined: '2026-03-01', status: 'flagged' },
  { id: 5, email: 'kavya.i@college.edu', name: 'Kavya Iyer', posts: 4, joined: '2026-01-08', status: 'active' },
  { id: 6, email: 'nikhil.d@college.edu', name: 'Nikhil Das', posts: 1, joined: '2026-02-14', status: 'active' },
  { id: 7, email: 'sneha.p@college.edu', name: 'Sneha Pillai', posts: 3, joined: '2026-03-10', status: 'active' },
  { id: 8, email: 'ishaan.s@college.edu', name: 'Ishaan Saxena', posts: 2, joined: '2026-02-20', status: 'flagged' },
];

// ══════════════════════════════════════════════════════════
//  UTILS
// ══════════════════════════════════════════════════════════
function el(id) { return document.getElementById(id); }
function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function toast(msg, type = 'success', duration = 3000) {
  const icons = { success: '✓', error: '✕', info: '→' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  el('toast-container').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, duration);
}

function openModal(id) { el(id).classList.add('active'); }
function closeModal(id) { el(id).classList.remove('active'); }

// ══════════════════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════════════════
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  STATE.theme = t;
  localStorage.setItem('cw-theme', t);
}
applyTheme(STATE.theme);

// ══════════════════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════════════════
function initLogin() {
  const pwGroup = el('password-group');

  qsa('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.role = btn.dataset.role;
      if (STATE.role === 'admin') {
        el('role-slider').classList.add('right');
        pwGroup.style.display = 'block';
        el('btn-login-text').textContent = 'Login as Admin';
      } else {
        el('role-slider').classList.remove('right');
        pwGroup.style.display = 'none';
        el('btn-login-text').textContent = 'Continue';
      }
    });
  });

  el('eye-toggle').addEventListener('click', () => {
    const pw = el('login-password');
    pw.type = pw.type === 'password' ? 'text' : 'password';
  });

  el('btn-send-otp').addEventListener('click', () => {
    const email = el('login-email').value.trim();
    const pw    = el('login-password').value.trim();
    if (!email || !email.includes('@')) { toast('Please enter a valid email', 'error'); return; }

    if (STATE.role === 'admin') {
      if (email !== 'admin@campus.edu' || pw !== 'admin123') { toast('Invalid admin credentials', 'error'); return; }
      el('btn-send-otp').classList.add('loading');
      setTimeout(() => { el('btn-send-otp').classList.remove('loading'); loginAs('admin', email); }, 900);
      return;
    }

    el('btn-send-otp').classList.add('loading');
    setTimeout(() => {
      el('btn-send-otp').classList.remove('loading');
      el('otp-email-display').textContent = email;
      el('step-email').classList.remove('active');
      el('step-otp').classList.add('active');
      setupOTP();
      toast('OTP sent! Use 123456 for demo', 'info');
    }, 900);
  });

  el('login-email').addEventListener('keydown', e => { if (e.key === 'Enter') el('btn-send-otp').click(); });
  el('btn-back-email').addEventListener('click', () => {
    el('step-otp').classList.remove('active');
    el('step-email').classList.add('active');
  });
  el('btn-verify-otp').addEventListener('click', () => {
    const code = qsa('.otp-box').map(b => b.value).join('');
    if (code.length < 6) { shakeOTP(); toast('Enter the full 6-digit code', 'error'); return; }
    if (code !== '123456') { shakeOTP(); toast('Incorrect OTP. Use 123456', 'error'); return; }
    loginAs('student', el('login-email').value.trim());
  });
  el('btn-resend').addEventListener('click', () => {
    qsa('.otp-box').forEach(b => { b.value = ''; b.classList.remove('filled'); });
    el('otp-inputs').querySelector('.otp-box').focus();
    toast('OTP resent! Use 123456', 'info');
  });
}

function shakeOTP() { qsa('.otp-box').forEach(b => { b.classList.add('error'); setTimeout(() => b.classList.remove('error'), 500); }); }

function setupOTP() {
  const boxes = qsa('.otp-box');
  boxes.forEach((box, i) => {
    box.value = '';
    box.classList.remove('filled', 'error');
    box.oninput = () => {
      box.value = box.value.replace(/\D/, '');
      if (box.value) { box.classList.add('filled'); if (i < boxes.length - 1) boxes[i + 1].focus(); }
      else box.classList.remove('filled');
    };
    box.onkeydown = e => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
      if (e.key === 'Enter') el('btn-verify-otp').click();
    };
    box.onpaste = e => {
      e.preventDefault();
      const p = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      p.split('').forEach((ch, idx) => { if (boxes[idx]) { boxes[idx].value = ch; boxes[idx].classList.add('filled'); } });
      boxes[Math.min(p.length, 5)].focus();
    };
  });
  setTimeout(() => boxes[0].focus(), 100);
}

function loginAs(role, email) {
  STATE.role       = role;
  STATE.loggedIn   = true;
  STATE.currentUser = { role, email };
  STATE.posts      = JSON.parse(JSON.stringify(SEED_POSTS));
  STATE.polls      = JSON.parse(JSON.stringify(SEED_POLLS));
  STATE.qaItems    = JSON.parse(JSON.stringify(SEED_QA));
  STATE.notifications = JSON.parse(JSON.stringify(SEED_NOTIFICATIONS));

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
    renderAdminDash();
    renderAdminPostsTable();
    renderFlaggedPosts();
    renderUsersTable();
    switchView('admin-dash');
  } else {
    el('student-nav').style.display = 'flex';
    el('admin-nav').style.display = 'none';
    el('sb-avatar').textContent = randomFrom(AVATARS);
    el('sb-username').textContent = 'Anonymous Whisperer';
    el('sb-role-tag').textContent = 'Student';
    el('sb-role-tag').classList.remove('admin');
    setTimeout(() => { renderFeed(); renderPolls(); renderQA(); }, 800);
    switchView('feed');
  }

  renderNotifications();
  toast(role === 'admin' ? '🛡️ Logged in as Admin' : '👋 Welcome, Anon!', 'success');
}

// ══════════════════════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════════════════════
function switchView(viewId) {
  qsa('.view').forEach(v => v.classList.remove('active'));
  const target = el(`view-${viewId}`);
  if (target) target.classList.add('active');

  qsa('.sb-link').forEach(l => l.classList.remove('active'));
  const activeLink = qs(`[data-view="${viewId}"]`);
  if (activeLink) activeLink.classList.add('active');

  const titles = {
    feed: 'Feed', create: 'New Post', polls: 'Polls', qa: 'Q&A',
    notifs: 'Notifications', profile: 'My Posts',
    'admin-dash': 'Dashboard', 'admin-posts': 'All Posts',
    'admin-flagged': 'Flagged Posts', 'admin-users': 'Users', 'admin-settings': 'Settings',
  };
  el('topbar-title').textContent = titles[viewId] || viewId;
  STATE.activeView = viewId;

  if (window.innerWidth < 768) closeSidebar();
  if (viewId === 'profile') renderMyPosts();
}

function initNavigation() {
  qsa('.sb-link').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); switchView(link.dataset.view); });
  });

  el('hamburger').addEventListener('click', toggleSidebar);
  el('sidebar-close').addEventListener('click', closeSidebar);
  el('sidebar-overlay').addEventListener('click', closeSidebar);

  el('fab-post').addEventListener('click', () => switchView('create'));
  el('tb-notif-btn').addEventListener('click', () => switchView('notifs'));

  el('tb-search-btn').addEventListener('click', () => {
    if (STATE.activeView !== 'feed') { switchView('feed'); setTimeout(openSearch, 200); } else openSearch();
  });
  el('search-close-btn').addEventListener('click', closeSearch);
  el('feed-search').addEventListener('input', () => renderFeed());

  qsa('.view-all-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  el('btn-create-poll') && el('btn-create-poll').addEventListener('click', () => {
    switchView('create');
    setTimeout(() => setPostType('poll'), 200);
  });
  el('btn-ask-question') && el('btn-ask-question').addEventListener('click', () => {
    switchView('create');
    setTimeout(() => setPostType('question'), 200);
  });

  el('theme-toggle').addEventListener('click', () => {
    applyTheme(STATE.theme === 'dark' ? 'light' : 'dark');
    toast(`Switched to ${STATE.theme} mode`, 'info');
  });
  el('btn-logout').addEventListener('click', logout);
}

function toggleSidebar() { el('sidebar').classList.toggle('open'); el('sidebar-overlay').classList.toggle('active'); }
function closeSidebar() { el('sidebar').classList.remove('open'); el('sidebar-overlay').classList.remove('active'); }
function openSearch() { el('feed-search-wrap').classList.add('open'); el('feed-search').focus(); }
function closeSearch() { el('feed-search-wrap').classList.remove('open'); el('feed-search').value = ''; renderFeed(); }

function logout() {
  STATE.loggedIn = false;
  STATE.currentUser = null;
  STATE.myPostIds.clear();
  STATE.myPollIds.clear();
  STATE.imageDataUrl = null;
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

// ══════════════════════════════════════════════════════════
//  FEED
// ══════════════════════════════════════════════════════════
function initFeedFilters() {
  qsa('.feed-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('.feed-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      STATE.activeFilter = btn.dataset.filter;
      renderFeed();
    });
  });
}

function getFilteredPosts() {
  const search = (el('feed-search').value || '').toLowerCase();
  let posts = STATE.posts.filter(p => !p.removed);

  switch (STATE.activeFilter) {
    case 'trending':
      posts = posts.filter(p => p.likes > 300).sort((a, b) => (b.likes + b.comments.length * 5) - (a.likes + a.comments.length * 5));
      break;
    case 'recent':
      posts = posts.sort((a, b) => b.timestamp - a.timestamp);
      break;
    case 'top':
      posts = posts.sort((a, b) => b.likes - a.likes);
      break;
    case 'rant':
      posts = posts.filter(p => p.tag === 'rant');
      break;
    case 'love':
      posts = posts.filter(p => p.tag === 'love');
      break;
    case 'funny':
      posts = posts.filter(p => p.tag === 'funny');
      break;
    case 'advice':
      posts = posts.filter(p => p.tag === 'advice');
      break;
    case 'deep':
      posts = posts.filter(p => p.tag === 'deep');
      break;
    default:
      posts = posts.sort((a, b) => b.timestamp - a.timestamp);
  }

  if (search) posts = posts.filter(p => p.text.toLowerCase().includes(search));
  return posts;
}

function renderFeed() {
  const list = el('feed-list');
  const filtered = getFilteredPosts();

  if (filtered.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-3);">
      <div style="font-size:2.5rem;margin-bottom:12px;">🔍</div>
      <p style="font-size:.95rem;">No whispers found</p>
    </div>`;
    return;
  }

  list.innerHTML = filtered.map((p, i) => buildPostCard(p, i)).join('');
  attachPostCardEvents(list);
}

function buildPostCard(post, i) {
  const anonName = ANON_NAMES[post.id % ANON_NAMES.length];
  const tagLabels = { love: '❤️ Love', funny: '😂 Funny', rant: '😤 Rant', advice: '💡 Advice', deep: '🌊 Deep' };
  const imgHtml = post.imageUrl ? `<img class="post-image" src="${post.imageUrl}" alt="Post image">` : '';
  const flaggedClass = post.flagged ? ' flagged' : '';

  return `<div class="post-card${flaggedClass}" data-id="${post.id}" style="animation-delay:${Math.min(i,.6) * 0.08}s">
    <div class="post-header">
      <div class="post-anon">
        <div class="anon-icon">${post.emoji}</div>
        <div class="anon-info">
          <span class="anon-name">${anonName}</span>
          <span class="post-time">${post.time}</span>
        </div>
      </div>
      <span class="post-tag tag-${post.tag}">${tagLabels[post.tag] || post.tag}</span>
    </div>
    <p class="post-text">${post.text}</p>
    ${imgHtml}
    <div class="post-actions">
      <button class="post-btn upvote-btn" data-id="${post.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        <span class="vote-count-up">${post.likes}</span>
      </button>
      <button class="post-btn downvote-btn" data-id="${post.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
        <span class="vote-count-down">${post.dislikes}</span>
      </button>
      <button class="post-btn comment-open-btn" data-id="${post.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${post.comments.length}
      </button>
      <button class="post-btn report-btn" data-id="${post.id}" style="margin-left:auto;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
        Report
      </button>
    </div>
  </div>`;
}

function attachPostCardEvents(container) {
  container.querySelectorAll('.upvote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const post = STATE.posts.find(p => p.id === +btn.dataset.id);
      if (!post) return;
      if (btn.classList.contains('voted-up')) { btn.classList.remove('voted-up'); post.likes--; }
      else { btn.classList.add('voted-up'); btn.closest('.post-card')?.querySelector('.downvote-btn')?.classList.remove('voted-down'); post.likes++; }
      btn.querySelector('.vote-count-up').textContent = post.likes;
      btn.style.transform = 'scale(1.3)'; setTimeout(() => btn.style.transform = '', 200);
    });
  });
  container.querySelectorAll('.downvote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const post = STATE.posts.find(p => p.id === +btn.dataset.id);
      if (!post) return;
      if (btn.classList.contains('voted-down')) { btn.classList.remove('voted-down'); post.dislikes--; }
      else { btn.classList.add('voted-down'); btn.closest('.post-card')?.querySelector('.upvote-btn')?.classList.remove('voted-up'); post.dislikes++; }
      btn.querySelector('.vote-count-down').textContent = post.dislikes;
    });
  });
  container.querySelectorAll('.comment-open-btn').forEach(btn => {
    btn.addEventListener('click', () => openCommentModal(+btn.dataset.id));
  });
  container.querySelectorAll('.report-btn').forEach(btn => {
    btn.addEventListener('click', () => openReportModal(+btn.dataset.id));
  });
}

// ══════════════════════════════════════════════════════════
//  CREATE POST — tabs + forms
// ══════════════════════════════════════════════════════════
function setPostType(type) {
  qsa('.post-type-tab').forEach(t => t.classList.remove('active'));
  qsa('.post-form').forEach(f => { f.style.display = 'none'; f.classList.remove('active-form'); });
  const tab = qs(`.post-type-tab[data-type="${type}"]`);
  if (tab) tab.classList.add('active');
  const form = el(`create-form-${type}`);
  if (form) { form.style.display = 'block'; form.classList.add('active-form'); }
}

function initCreatePost() {
  // Type tabs
  qsa('.post-type-tab').forEach(tab => {
    tab.addEventListener('click', () => setPostType(tab.dataset.type));
  });

  // Textarea char counter (text post)
  const textarea = el('post-text');
  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    const pct = (len / 500) * 100;
    el('char-bar-fill').style.width = pct + '%';
    el('char-bar-fill').style.background = pct > 80 ? 'linear-gradient(135deg,var(--rose),var(--red))' : 'var(--grad)';
    el('post-char-count').textContent = len;
  });

  // Q&A textarea char counter
  const qaTextarea = el('qa-question');
  qaTextarea.addEventListener('input', () => {
    const len = qaTextarea.value.length;
    const pct = (len / 300) * 100;
    el('qa-char-bar-fill').style.width = pct + '%';
    el('qa-char-count').textContent = len;
  });

  // Image drop
  const drop     = el('image-drop');
  const imgInput = el('image-input');
  const prevWrap = el('image-preview-wrap');
  const prevImg  = el('image-preview');

  drop.addEventListener('click', () => imgInput.click());
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
  drop.addEventListener('drop', e => {
    e.preventDefault(); drop.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) showImagePreview(file);
  });
  imgInput.addEventListener('change', () => { if (imgInput.files[0]) showImagePreview(imgInput.files[0]); });
  el('remove-image').addEventListener('click', clearImagePreview);

  function showImagePreview(file) {
    const reader = new FileReader();
    reader.onload = e => {
      STATE.imageDataUrl = e.target.result;
      prevImg.src = STATE.imageDataUrl;
      prevWrap.style.display = 'block';
      drop.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function clearImagePreview() {
    STATE.imageDataUrl = null;
    prevImg.src = '';
    prevWrap.style.display = 'none';
    drop.style.display = 'block';
    imgInput.value = '';
  }

  // ── TEXT POST submit ──
  el('create-form-text').addEventListener('submit', e => {
    e.preventDefault();
    const tagEl = qs('input[name="post-tag"]:checked', el('create-form-text'));
    const text  = textarea.value.trim();
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

  // ── POLL submit ──
  el('create-form-poll').addEventListener('submit', e => {
    e.preventDefault();
    const question = el('poll-question').value.trim();
    const optInputs = qsa('.poll-opt-input');
    const opts = optInputs.map(i => i.value.trim()).filter(v => v);
    const durEl = qs('input[name="poll-duration"]:checked');

    if (!question) { toast('Please enter a poll question', 'error'); return; }
    if (opts.length < 2) { toast('Add at least 2 options', 'error'); return; }

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

  // ── QUESTION submit ──
  el('create-form-question').addEventListener('submit', e => {
    e.preventDefault();
    const question = qaTextarea.value.trim();
    const catEl = qs('input[name="qa-tag"]:checked', el('create-form-question'));

    if (!question) { toast('Please write your question', 'error'); return; }
    if (!catEl)    { toast('Please select a category', 'error'); return; }

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
}

// ══════════════════════════════════════════════════════════
//  POLLS
// ══════════════════════════════════════════════════════════
function renderPolls() {
  const list = el('polls-list');
  if (!list) return;

  if (STATE.polls.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-3);">
      <div style="font-size:2.5rem;margin-bottom:12px;">📊</div>
      <p>No polls yet. Create the first one!</p>
    </div>`;
    return;
  }

  list.innerHTML = STATE.polls.map((poll, i) => buildPollCard(poll, i)).join('');

  // Attach vote handlers
  list.querySelectorAll('.poll-option:not(.voted)').forEach(opt => {
    opt.addEventListener('click', () => {
      const pollId = opt.closest('.poll-card').dataset.pollId;
      const optIdx = +opt.dataset.optIdx;
      castVote(pollId, optIdx);
    });
  });
}

function buildPollCard(poll, i) {
  const voted = poll.votedIndex !== null;
  const total = poll.options.reduce((s, o) => s + o.votes, 0) || 1;
  const winVotes = Math.max(...poll.options.map(o => o.votes));

  const optionsHtml = poll.options.map((opt, idx) => {
    const pct = voted ? Math.round((opt.votes / total) * 100) : 0;
    const isWinner = voted && opt.votes === winVotes;
    const isMyVote = voted && poll.votedIndex === idx;
    const letters = ['A','B','C','D'];
    return `<div class="poll-option${voted ? ' voted' : ''}${isWinner ? ' winner' : ''}${isMyVote ? ' my-vote' : ''}" 
                 data-opt-idx="${idx}" style="animation-delay:${idx * 0.08 + 0.1}s">
      <div class="poll-option-bar" style="width:${voted ? pct : 0}%"></div>
      <div class="poll-option-content">
        <span class="poll-opt-label">
          <span style="width:20px;height:20px;border-radius:4px;background:var(--bg-glass);display:inline-flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;flex-shrink:0;">${letters[idx]}</span>
          ${opt.text}
        </span>
        ${voted ? `<span class="poll-opt-pct">${pct}%</span>` : ''}
        ${isMyVote ? `<svg class="poll-opt-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 4 12 14.01l-3-3"/></svg>` : ''}
      </div>
    </div>`;
  }).join('');

  return `<div class="poll-card" data-poll-id="${poll.id}" style="animation-delay:${i * 0.1}s">
    <div class="poll-card-header">
      <span class="poll-badge">📊 ${voted ? 'Results' : 'Active Poll'}</span>
      <span class="poll-timer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${poll.timeLeft}
      </span>
    </div>
    <p class="poll-question">${poll.emoji} ${poll.question}</p>
    <div class="poll-options">${optionsHtml}</div>
    <div class="poll-total-votes">${total} vote${total !== 1 ? 's' : ''}</div>
    ${voted ? '<div class="poll-voted-msg"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 4 12 14.01l-3-3"/></svg> You voted!</div>' : '<p style="font-size:.75rem;color:var(--text-3);margin-top:10px;">Click an option to vote anonymously</p>'}
  </div>`;
}

function castVote(pollId, optIdx) {
  const poll = STATE.polls.find(p => p.id === pollId);
  if (!poll || poll.votedIndex !== null) return;

  poll.votedIndex = optIdx;
  poll.myVote = true;
  poll.options[optIdx].votes++;
  poll.totalVotes = poll.options.reduce((s, o) => s + o.votes, 0);

  renderPolls();
  toast('✓ Vote cast anonymously', 'success');
}

// ══════════════════════════════════════════════════════════
//  Q&A
// ══════════════════════════════════════════════════════════
function renderQA() {
  const list = el('qa-list');
  if (!list) return;

  if (STATE.qaItems.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-3);">
      <div style="font-size:2.5rem;margin-bottom:12px;">❓</div>
      <p>No questions yet. Ask the first one!</p>
    </div>`;
    return;
  }

  list.innerHTML = STATE.qaItems.map((qa, i) => buildQACard(qa, i)).join('');

  list.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => openAnswerModal(btn.dataset.qaId));
  });
  list.querySelectorAll('.qa-upvote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qa = STATE.qaItems.find(q => q.id === btn.dataset.qaId);
      if (!qa) return;
      qa.upvoted = !qa.upvoted;
      qa.upvotes += qa.upvoted ? 1 : -1;
      btn.classList.toggle('voted-up', qa.upvoted);
      btn.querySelector('.qa-upvote-count').textContent = qa.upvotes;
    });
  });
}

function buildQACard(qa, i) {
  const preview = qa.answers.slice(0, 2).map(a =>
    `<div class="qa-answer-item">
      <div class="qa-answer-avi">${a.avi}</div>
      <div>${a.text}</div>
    </div>`
  ).join('');

  const catClass = `qa-cat-${qa.category}`;
  return `<div class="qa-card" data-qa-id="${qa.id}" style="animation-delay:${i * 0.1}s">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
      <span class="qa-badge">❓ Question</span>
      <span class="qa-category-tag ${catClass}">${qa.emoji} ${qa.category}</span>
    </div>
    <p class="qa-question">${qa.question}</p>
    ${qa.answers.length > 0 ? `<div class="qa-answers-preview">${preview}${qa.answers.length > 2 ? `<div style="font-size:.78rem;color:var(--text-3);padding:6px 12px;">+${qa.answers.length - 2} more answers</div>` : ''}</div>` : '<p style="font-size:.85rem;color:var(--text-3);margin-bottom:14px;">No answers yet. Be the first!</p>'}
    <div class="qa-actions">
      <button class="qa-action-btn answer-btn" data-qa-id="${qa.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${qa.answers.length} Answer${qa.answers.length !== 1 ? 's' : ''}
      </button>
      <button class="qa-action-btn qa-upvote-btn${qa.upvoted ? ' voted-up' : ''}" data-qa-id="${qa.id}">
        <svg viewBox="0 0 24 24" fill="${qa.upvoted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
        <span class="qa-upvote-count">${qa.upvotes}</span>
      </button>
      <span style="margin-left:auto;font-size:.75rem;color:var(--text-3);">${qa.time}</span>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ══════════════════════════════════════════════════════════
function renderNotifications() {
  const list = el('notifs-list');
  if (!list) return;

  const unread = STATE.notifications.filter(n => n.unread).length;
  el('notif-badge').textContent = unread || '';
  el('notif-badge').style.display = unread ? '' : 'none';
  el('tb-notif-badge').textContent = unread;
  el('tb-notif-badge').style.display = unread ? '' : 'none';

  list.innerHTML = STATE.notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
      <div class="notif-icon ${n.iconClass}">${n.icon}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
      </div>
      <div class="notif-time">${n.time}</div>
      ${n.unread ? '<div class="unread-dot"></div>' : ''}
    </div>`).join('');

  list.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      const n = STATE.notifications.find(x => x.id === +item.dataset.id);
      if (n) { n.unread = false; renderNotifications(); }
    });
  });
}

function initNotifications() {
  el('mark-all-read').addEventListener('click', () => {
    STATE.notifications.forEach(n => n.unread = false);
    renderNotifications();
    toast('All notifications read', 'success');
  });
}

// ══════════════════════════════════════════════════════════
//  MY POSTS
// ══════════════════════════════════════════════════════════
function renderMyPosts() {
  const myPosts = STATE.posts.filter(p => STATE.myPostIds.has(p.id));
  const myPolls = STATE.polls.filter(p => STATE.myPollIds.has(p.id));
  const totalLikes = myPosts.reduce((s, p) => s + p.likes, 0);

  el('my-post-count').textContent = myPosts.length;
  el('my-like-count').textContent = totalLikes;
  el('my-poll-count').textContent = myPolls.length;

  const listEl = el('my-posts-list');
  if (myPosts.length === 0 && myPolls.length === 0) {
    listEl.innerHTML = `<div style="text-align:center;padding:32px;color:var(--text-3);font-size:.95rem;">
      No posts yet. <button onclick="switchView('create')" style="color:var(--purple);font-weight:600;text-decoration:underline;">Post your first whisper!</button>
    </div>`;
    return;
  }
  listEl.innerHTML = myPosts.map((p, i) => buildPostCard(p, i)).join('');
  attachPostCardEvents(listEl);
}

// ══════════════════════════════════════════════════════════
//  COMMENT MODAL
// ══════════════════════════════════════════════════════════
function openCommentModal(postId) {
  const post = STATE.posts.find(p => p.id === postId);
  if (!post) return;
  STATE.commentTarget = postId;
  el('comment-post-preview').textContent = post.text.slice(0, 100) + (post.text.length > 100 ? '…' : '');
  renderCommentsList(post.comments, el('comments-list'));
  openModal('comment-modal');
}

function renderCommentsList(comments, container) {
  if (comments.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-3);font-size:.85rem;">No comments yet. Be the first!</div>`;
    return;
  }
  container.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-avi">${c.avi}</div>
      <div class="comment-body">
        <div class="comment-body-name">${c.name}</div>
        ${c.text}
      </div>
    </div>`).join('');
  container.scrollTop = container.scrollHeight;
}

function initCommentModal() {
  el('comment-close').addEventListener('click', () => closeModal('comment-modal'));
  el('comment-modal').addEventListener('click', e => { if (e.target === el('comment-modal')) closeModal('comment-modal'); });

  const submitComment = () => {
    const text = el('comment-input').value.trim();
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

  el('comment-submit').addEventListener('click', submitComment);
  el('comment-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitComment(); });
}

// ══════════════════════════════════════════════════════════
//  ANSWER MODAL (Q&A)
// ══════════════════════════════════════════════════════════
function openAnswerModal(qaId) {
  const qa = STATE.qaItems.find(q => q.id === qaId);
  if (!qa) return;
  STATE.answerTarget = qaId;
  el('answer-question-preview').textContent = qa.question;
  renderAnswersList(qa.answers, el('answers-list'));
  openModal('answer-modal');
}

function renderAnswersList(answers, container) {
  if (answers.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-3);font-size:.85rem;">No answers yet. Be the first!</div>`;
    return;
  }
  container.innerHTML = answers.map(a => `
    <div class="comment-item">
      <div class="comment-avi">${a.avi}</div>
      <div class="comment-body">
        <div class="comment-body-name">Anonymous</div>
        ${a.text}
      </div>
    </div>`).join('');
  container.scrollTop = container.scrollHeight;
}

function initAnswerModal() {
  el('answer-close').addEventListener('click', () => closeModal('answer-modal'));
  el('answer-modal').addEventListener('click', e => { if (e.target === el('answer-modal')) closeModal('answer-modal'); });

  const submitAnswer = () => {
    const text = el('answer-input').value.trim();
    if (!text) return;
    const qa = STATE.qaItems.find(q => q.id === STATE.answerTarget);
    if (!qa) return;
    qa.answers.push({ avi: randomFrom(AVATARS), text });
    el('answer-input').value = '';
    renderAnswersList(qa.answers, el('answers-list'));
    renderQA();
    toast('Answer posted anonymously', 'success');
  };

  el('answer-submit').addEventListener('click', submitAnswer);
  el('answer-input').addEventListener('keydown', e => { if (e.key === 'Enter') submitAnswer(); });
}

// ══════════════════════════════════════════════════════════
//  REPORT MODAL
// ══════════════════════════════════════════════════════════
function openReportModal(postId) {
  STATE.reportTarget = postId;
  qsa('input[name="report-reason"]').forEach(r => r.checked = false);
  openModal('report-modal');
}

function initReportModal() {
  el('report-cancel').addEventListener('click', () => closeModal('report-modal'));
  el('report-modal').addEventListener('click', e => { if (e.target === el('report-modal')) closeModal('report-modal'); });

  el('report-confirm').addEventListener('click', () => {
    const reason = qs('input[name="report-reason"]:checked');
    if (!reason) { toast('Please select a reason', 'error'); return; }
    const post = STATE.posts.find(p => p.id === STATE.reportTarget);
    if (post) { post.flagged = true; post.status = 'flagged'; post.reportReason = reason.value; }
    closeModal('report-modal');
    renderFeed();
    toast('Report submitted. Thank you for keeping the community safe.', 'success');
  });
}

// ══════════════════════════════════════════════════════════
//  ADMIN — Dashboard
// ══════════════════════════════════════════════════════════
function renderAdminDash() {
  el('sc-total').textContent   = STATE.posts.filter(p => !p.removed).length;
  el('sc-flagged').textContent = STATE.posts.filter(p => p.flagged && !p.removed).length;
  el('flag-badge').textContent = STATE.posts.filter(p => p.flagged && !p.removed).length;
  el('flagged-count-label').textContent = `${STATE.posts.filter(p => p.flagged && !p.removed).length} need review`;

  const dashFlagged = el('admin-dash-flagged');
  const flaggedPosts = STATE.posts.filter(p => p.flagged && !p.removed).slice(0, 3);
  if (flaggedPosts.length === 0) {
    dashFlagged.innerHTML = `<div style="padding:20px;text-align:center;color:var(--emerald);font-size:.9rem;">✓ No flagged posts right now</div>`;
  } else {
    dashFlagged.innerHTML = flaggedPosts.map(p => buildMiniFlag(p)).join('');
  }

  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const values = [2, 5, 3, 8, 6, 4, 9];
  const max = Math.max(...values);
  el('chart-bars').innerHTML = values.map((v, i) =>
    `<div class="chart-bar" style="height:${(v/max)*100}%;animation-delay:${i*.08}s" title="${days[i]}: ${v} posts"></div>`
  ).join('');
  el('chart-labels').innerHTML = days.map(d => `<div class="chart-label">${d}</div>`).join('');
}

function buildMiniFlag(post) {
  return `<div class="flagged-card">
    <div class="flagged-header">
      <div class="flagged-meta">
        <span>${post.emoji}</span>
        <span class="post-tag tag-${post.tag}" style="font-size:.7rem;padding:3px 8px;">${post.tag}</span>
        <span>${post.time}</span>
      </div>
      <span class="flagged-reason">${post.reportReason || 'reported'}</span>
    </div>
    <p class="flagged-text">${post.text.slice(0, 120)}${post.text.length > 120 ? '…' : ''}</p>
    <div class="flagged-actions">
      <button class="flagged-btn reveal" onclick="window.openRevealModal(${post.id})">👁 Reveal Identity</button>
      <button class="flagged-btn approve" onclick="window.adminApprove(${post.id})">✓ Approve</button>
      <button class="flagged-btn remove" onclick="window.adminRemove(${post.id})">✕ Remove</button>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════
//  ADMIN — Posts Table
// ══════════════════════════════════════════════════════════
function renderAdminPostsTable(filter = '') {
  const tbody = el('admin-posts-tbody');
  const statusMap = { active: 'badge-active', flagged: 'badge-flagged', pending: 'badge-pending', removed: 'badge-removed' };
  const posts = filter
    ? STATE.posts.filter(p => p.text.toLowerCase().includes(filter) || p.tag.includes(filter))
    : STATE.posts;

  tbody.innerHTML = posts.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="post-snippet" title="${p.text}">${p.text}</span></td>
      <td>Post</td>
      <td><span class="post-tag tag-${p.tag}" style="font-size:.72rem;padding:3px 9px;">${p.tag}</span></td>
      <td><span class="status-badge ${statusMap[p.status] || 'badge-active'}">${p.status}</span></td>
      <td>${p.likes}</td>
      <td>${p.time}</td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn reveal" onclick="window.openRevealModal(${p.id})">Reveal</button>
          ${p.status !== 'active' ? `<button class="tbl-btn approve" onclick="window.adminApprove(${p.id})">Approve</button>` : ''}
          ${p.status !== 'removed' ? `<button class="tbl-btn reject" onclick="window.adminRemove(${p.id})">Remove</button>` : ''}
        </div>
      </td>
    </tr>`).join('');
}

function renderFlaggedPosts() {
  const list = el('flagged-list');
  const flagged = STATE.posts.filter(p => p.flagged && !p.removed);
  el('flag-badge').textContent = flagged.length;
  el('flagged-count-label') && (el('flagged-count-label').textContent = `${flagged.length} need review`);

  if (flagged.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:40px;color:var(--emerald);"><div style="font-size:2.5rem;margin-bottom:12px;">✓</div><p>All clear! No flagged posts.</p></div>`;
    return;
  }
  list.innerHTML = flagged.map(p => buildMiniFlag(p)).join('');
}

function renderUsersTable() {
  const tbody = el('users-tbody');
  tbody.innerHTML = SEED_USERS.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:6px;background:var(--grad-glow);border:1px solid var(--border-p);display:flex;align-items:center;justify-content:center;font-size:.85rem;">${AVATARS[i % AVATARS.length]}</div>
          <div><div style="font-size:.85rem;font-weight:600;">${u.name}</div><div style="font-size:.75rem;color:var(--text-3);">${u.email}</div></div>
        </div>
      </td>
      <td>${u.posts}</td>
      <td>${u.joined}</td>
      <td><span class="status-badge ${u.status === 'active' ? 'badge-active' : 'badge-flagged'}">${u.status}</span></td>
      <td>
        <div class="tbl-actions">
          <button class="tbl-btn reveal" onclick="toast('${u.name} — ${u.email}','info',5000)">View</button>
          ${u.status === 'active'
            ? `<button class="tbl-btn reject" onclick="this.closest('tr').querySelector('.status-badge').className='status-badge badge-flagged';this.closest('tr').querySelector('.status-badge').textContent='suspended';toast('User suspended','error')">Suspend</button>`
            : `<button class="tbl-btn approve" onclick="this.closest('tr').querySelector('.status-badge').className='status-badge badge-active';this.closest('tr').querySelector('.status-badge').textContent='active';toast('User reinstated','success')">Reinstate</button>`}
        </div>
      </td>
    </tr>`).join('');
}

// ══════════════════════════════════════════════════════════
//  ADMIN — Reveal Modal
// ══════════════════════════════════════════════════════════
window.openRevealModal = function(postId) {
  const post = STATE.posts.find(p => p.id === postId);
  if (!post) return;
  STATE.revealTarget = postId;
  el('reveal-name').textContent  = post.realUser.name;
  el('reveal-email').textContent = post.realUser.email;
  openModal('reveal-modal');
};

function initRevealModal() {
  el('reveal-cancel').addEventListener('click', () => closeModal('reveal-modal'));
  el('reveal-modal').addEventListener('click', e => { if (e.target === el('reveal-modal')) closeModal('reveal-modal'); });
  el('reveal-confirm').addEventListener('click', () => {
    const post = STATE.posts.find(p => p.id === STATE.revealTarget);
    closeModal('reveal-modal');
    if (post) toast(`Identity: ${post.realUser.name} (${post.realUser.email})`, 'info', 5000);
  });
}

window.adminApprove = function(postId) {
  const post = STATE.posts.find(p => p.id === postId);
  if (!post) return;
  post.flagged = false; post.status = 'active';
  refreshAdminViews(); toast('Post approved', 'success');
};

window.adminRemove = function(postId) {
  const post = STATE.posts.find(p => p.id === postId);
  if (!post) return;
  post.removed = true; post.status = 'removed';
  refreshAdminViews(); toast('Post removed', 'error');
};

function refreshAdminViews() {
  renderAdminDash(); renderAdminPostsTable(); renderFlaggedPosts(); renderFeed();
}

// ══════════════════════════════════════════════════════════
//  GLOBAL EXPOSE
// ══════════════════════════════════════════════════════════
window.switchView = switchView;
window.toast      = toast;

// ══════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initNavigation();
  initFeedFilters();
  initCreatePost();
  initNotifications();
  initCommentModal();
  initAnswerModal();
  initReportModal();
  initRevealModal();

  el('admin-search') && el('admin-search').addEventListener('input', function() {
    renderAdminPostsTable(this.value.toLowerCase());
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') qsa('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  });
});
