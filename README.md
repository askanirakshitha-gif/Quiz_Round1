# TECH HABBA 2.0 – IT QUIZ ROUND 1 EXAMINATION PLATFORM

> **National Level Technical Fest**  
> Organized by **The Big O – Technical Club**, Acharya Institutes  
> *"Think Fast. Code Smart. Compete Beyond Limits."*

A modern, responsive, high-performance online examination portal built specifically for the National Level Technical Fest **TECH HABBA 2.0 - IT QUIZ (Round 1)**.

---

## 🌟 Features & Highlights

### 1. Modern Technical Competition UI/UX
- **Theme:** Dark navy (`#0a0f1d`), cyber cyan (`#00f0ff`), electric blue, and purple accents.
- **Typography:** Clean sans-serif typography with monospace support for code snippets.
- **Responsive Layout:** Compact single-page dashboard with zero unnecessary scrolling.

### 2. Full Examination Lifecycle
- **Official MCQs:** 25 multi-choice questions spanning Computer Networks, Operating Systems, C/Python/Java, DBMS, Git, Data Structures, and Cloud Computing.
- **Timer Management:** 30-minute countdown with urgent pulse warnings when under 5 minutes, persistent across page refreshes.
- **Real-Time Palette:** Visual question status badges: Answered, Not Answered, Marked for Review, Not Visited, Current.
- **Submission Receipts:** Digital confirmation modal with registration ID, team name, timestamp, and verification hash.

### 3. Comprehensive Anti-Cheating & Browser Monitoring
- **Tab Switching Detection:** Catches `visibilitychange` events, increments violation counter, and notifies participant.
- **Fullscreen Enforcement:** Enforces fullscreen mode before exam entry; logs exits and prompts re-entry.
- **Clipboard & Context Menu Lock:** Disables right-click, cut, copy, paste, and drag interactions.
- **Developer Tools Blocking:** Intercepts common shortcuts (`F12`, `Ctrl+Shift+I/J/C`, `Ctrl+U`, `Ctrl+S`, `Ctrl+P`, `PrintScreen`).
- **Telemetry Logger:** Real-time violation records with timestamps and session flagging after 3 violations.

### 4. Admin Dashboard & Rank-Wise Leaderboard
- **Secure Access:** Administrator portal with passkey protection (`TECHHABBA2026`).
- **Rankings Engine:**
  1. Score (DESC - 1 mark per question)
  2. Time Taken to complete (ASC - fastest completion breaks ties)
  3. Violations Count (ASC - fewest violations)
  4. Submission Time (ASC)
- **Live Auditing:** View right answers count, wrong answers count, unanswered count, accuracy %, and full violation logs.
- **Export:** 1-click CSV export of all participant attempts and scores.

### 5. Backend Architecture
- **Node.js + Express.js API:** Server-side score validation, session state management, and anti-cheat event collection.
- **Supabase PostgreSQL Database:** Fully integrated with tables (`participants`, `questions`, `quiz_sessions`, `violations`) and SQL leaderboard view.
- **Offline / Local Fallback:** Self-contained in-memory and `localStorage` storage so the portal works seamlessly offline or without a database.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or later recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/askanirakshitha-gif/Quiz_Round1.git
cd Quiz_Round1

# Install dependencies
npm install
```

### Environment Setup
Create a `.env` file in the project root:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret_key

# Backend Port
PORT=5000
```
*(Reference `.env.example` for details)*

### Running the Application

**Option A: Run Frontend & Backend together**
```bash
# Terminal 1: Run Express Backend
npm run server

# Terminal 2: Run Frontend UI (Vite)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🗄️ Database Setup (Supabase)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and open the **SQL Editor**.
2. Run the provided [`supabase-schema.sql`](file:///supabase-schema.sql) file.
3. This creates:
   - `participants` table
   - `questions` table
   - `quiz_sessions` table
   - `violations` table
   - `leaderboard_rankings` SQL View (rank-wise calculation)
   - Inserts all 25 official competition questions and default sample teams.

---

## 👥 Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend:** Node.js, Express.js, CORS, Dotenv
- **Database:** Supabase (PostgreSQL)

---

## 🛡️ License
Organized for TECH HABBA 2.0 by The Big O Technical Club, Acharya Institutes.

