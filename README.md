<p align="center">
  <img src="logo.png" alt="Campus Whisper Logo" width="120" />
</p>

<h1 align="center">🎓 Campus Whisper</h1>

<p align="center">
  <strong>An anonymous social platform built for college communities.</strong><br/>
  Share whispers, run polls, ask questions — all fully anonymous, all in real-time.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/badge/HTML5-Markup-E34F26?logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-Styles-1572B6?logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue" />
</p>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Database Setup](#-database-setup)
- [Environment Variables](#-environment-variables)
- [Content Moderation](#-content-moderation)
- [Admin Dashboard](#-admin-dashboard)
- [Security](#-security)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 About

**Campus Whisper** is a fully anonymous social platform designed for college students. It lets users share confessions, opinions, polls, and questions without revealing their identity — while keeping the community safe through automated content moderation and admin oversight.

---

## ✨ Features

- 🤫 **Anonymous Posts** — Share whispers tagged by category (funny, rant, advice, etc.)
- 📊 **Polls** — Create time-limited polls with multiple options
- ❓ **Q&A** — Post questions and receive anonymous answers
- 🔐 **Email OTP Auth** — Passwordless login via college email
- 🛡️ **Content Filtering** — Automatic bad word detection & blocking
- 🚨 **Report System** — Manual reporting + auto-blocking pipeline
- 👤 **Admin Dashboard** — Full moderation panel with identity reveal
- 🗄️ **Real-time Backend** — Powered by Supabase with Row-Level Security
- 🚫 **Ban System** — Temporary and permanent user bans
- 📋 **Audit Logging** — Track all admin actions

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Auth** | Email OTP (Supabase Auth) |
| **Database** | PostgreSQL via Supabase |
| **Content Filter** | Custom JS bad word filter |
| **Hosting** | Vercel / Any static host |

---

## 📁 Project Structure

```
campus-whisper/
├── index.html                   # Main app shell
├── script.js                    # Core frontend logic
├── styles.css                   # App styles
├── supabaseBackend.js           # Supabase API integration
├── badWordFilter.js             # Auto-report content filter
├── contentFilter.js             # Client-side content validation
│
├── docs/
│   ├── BACKEND_SETUP.js         # Backend integration guide
│   ├── BAD_WORD_FILTER_README.js
│   ├── BAD_WORD_FILTER_INTEGRATION.js
│   ├── FILTER_INTEGRATION.js
│   └── INTEGRATION_GUIDE.js
│
├── sql/
│   ├── supabase.sql             # Full database schema
│   └── MIGRATION_AUTO_BLOCK.sql # Auto-block migration
│
├── .env.example                 # Environment variable template
└── logo.png                     # App logo
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/campus-whisper.git
cd campus-whisper
```

### 2. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials (see [Environment Variables](#-environment-variables) below).

### 4. Set Up the Database

Run the SQL schema in your Supabase project (see [Database Setup](#-database-setup) below).

### 5. Start the App

```bash
npm run dev
# or open index.html directly in your browser
```

---

## 🗄 Database Setup

### Step 1 — Run the Main Schema

1. Go to your **Supabase Dashboard → SQL Editor**
2. Copy the contents of `sql/supabase.sql`
3. Paste and execute

This creates the following tables:

| Table | Purpose |
|---|---|
| `posts` | All user posts |
| `reports` | Manual + auto-blocked content reports |
| `admin_users` | Admin role management |
| `banned_users` | Banned/suspended users |
| `audit_log` | Admin action history |

### Step 2 — Run the Auto-Block Migration

In the same SQL Editor, run `sql/MIGRATION_AUTO_BLOCK.sql` to add auto-blocking support to the reports table.

### Step 3 — Add Your First Admin

Run this in the SQL Editor, replacing the values with your admin user's UUID and email:

```sql
INSERT INTO public.admin_users (id, email, role)
VALUES ('your-user-uuid', 'admin@yourcollege.edu', 'admin')
ON CONFLICT (id) DO NOTHING;
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```env
# Supabase Project URL (Settings → API)
VITE_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon/Public Key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (server-side only — never expose to client)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App environment
VITE_ENV=development

# App URL (for OTP email redirects)
VITE_APP_URL=http://localhost:5173

# Storage bucket for image uploads
VITE_STORAGE_BUCKET=campus-whisper-images
```

> ⚠️ **Never commit `.env.local` to Git.** Add it to `.gitignore`.

---

## 🛡 Content Moderation

Campus Whisper has a two-layer content filtering system:

### Layer 1 — Client-Side Validation (`contentFilter.js`)

Validates content before it's ever sent to the server:
- Empty content check
- 500-character limit
- Bad word detection with user-friendly error messages

```js
import { validatePostContent } from './contentFilter.js';

const { valid, error } = validatePostContent(userInput);
if (!valid) toast(error, 'error');
```

### Layer 2 — Auto-Report Filter (`badWordFilter.js`)

If bad words are detected, the post is **automatically blocked and logged** to the `reports` table for admin review — it is never inserted into `posts`.

```
User submits post
       ↓
checkBadWords(content)
       ↓
   Bad words?
   ├── YES → Insert into reports (reason: 'auto_block') → Block user
   └── NO  → Insert into posts → Show success
```

Admins can then review auto-blocked posts and choose to **Allow** or **Keep Blocked**.

---

## 👮 Admin Dashboard

The admin panel provides full moderation control:

- **View all reported posts** (manual + auto-blocked)
- **Reveal user identity** behind any anonymous post
- **Remove posts** from the feed
- **Ban users** (temporary or permanent)
- **Review auto-blocked content**
- **Moderation stats** via `admin_stats` and `moderation_stats` views

To access the admin dashboard, the logged-in user must exist in the `admin_users` table.

---

## 🔒 Security

- **Row-Level Security (RLS)** is enabled on all tables
- Posts are returned **without** `user_id` — fully anonymous to regular users
- Only admins can reveal user identity
- OTP-based auth — no passwords stored
- `SUPABASE_SERVICE_KEY` must **never** be used in frontend code
- Input validation on both client and server
- All admin actions can be tracked via the `audit_log` table

---

## 🌐 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### General Checklist

- [ ] Use separate Supabase projects for `dev` and `production`
- [ ] Set `VITE_APP_URL` to your production domain
- [ ] Enable automated database backups in Supabase
- [ ] Configure rate limiting for OTP requests
- [ ] Set up monitoring/alerts for errors

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| CORS error | Add your app URL to allowed origins in Supabase → API settings |
| OTP not received | Check spam, verify email config in Supabase Auth settings |
| RLS policy error | Ensure user is authenticated before performing operations |
| Cannot reveal user | Verify the user exists in `admin_users` table |
| Posts not loading | Check network tab, verify RLS SELECT policy on `posts` |
| Slow queries | Ensure indexes from `supabase.sql` were created |

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

Please make sure your code follows the existing style and doesn't break content moderation functionality.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for college communities
</p>
