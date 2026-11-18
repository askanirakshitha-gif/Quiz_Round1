# TECH HABBA 2.0 – SUPABASE DATABASE & RANKINGS SETUP GUIDE

This document details the database schema, tables, and rank-wise leaderboard view created for **TECH HABBA 2.0 IT Quiz Round 1**.

---

## 📊 Database Schema Details

The SQL schema creates tables to record:
1. **Participants**: Registration ID, Team Name, Team Leader, Email, College.
2. **Questions**: All 25 official MCQs, options A-D, code snippets, and verified answer keys.
3. **Quiz Sessions**: Records start time, submission time, **time taken to answer overall questions (in seconds)**, **number of right answers**, **number of wrong answers**, **unanswered questions**, score, and anti-cheat violations.
4. **Violations**: Audit log of tab-switches and fullscreen departures with timestamps.
5. **Leaderboard View (`leaderboard_rankings`)**: An automated SQL view that ranks all participants rank-wise:
   - Ranked by: **Score DESC (highest score first)** &rarr; **Time Taken ASC (fastest speed breaks ties)** &rarr; **Violations ASC**.

---

## 🗄️ SQL Schema (`supabase-schema.sql`)

To create the tables in your Supabase project:
1. Open your Supabase project SQL Editor:
   👉 **[https://supabase.com/dashboard/project/pefazqsaqwcqperdgpas/sql](https://supabase.com/dashboard/project/pefazqsaqwcqperdgpas/sql)**
2. Click **"New Query"**.
3. Copy the complete SQL from `supabase-schema.sql` (or click "Copy SQL" inside the website's Database Setup modal).
4. Paste it into the query editor and click **"Run"**.

---

## 📈 Table Structure & Fields

### 1. `participants` Table
| Column | Type | Description |
|---|---|---|
| `id` | `UUID` (PK) | Unique participant ID |
| `registration_id` | `VARCHAR(50)` (Unique) | e.g. `TH2-IT-101` |
| `team_name` | `VARCHAR(100)` | Name of the participating team |
| `team_leader` | `VARCHAR(100)` | Team leader name |
| `email` | `VARCHAR(150)` (Unique) | Registered email address |
| `status` | `VARCHAR(30)` | `REGISTERED`, `IN_EXAM`, `SUBMITTED`, `FLAGGED` |

### 2. `quiz_sessions` Table
| Column | Type | Description |
|---|---|---|
| `id` | `UUID` (PK) | Session ID |
| `participant_id` | `UUID` (FK) | References `participants(id)` |
| `registration_id` | `VARCHAR(50)` | Participant registration ID |
| `team_name` | `VARCHAR(100)` | Team name |
| `session_status` | `VARCHAR(30)` | `IN_PROGRESS`, `COMPLETED`, `FLAGGED` |
| `start_time` | `TIMESTAMPTZ` | Timestamp when exam started |
| `submission_time` | `TIMESTAMPTZ` | Timestamp when exam submitted |
| `time_taken_seconds` | `INT` | **Total time taken (in seconds) to answer overall questions** |
| `total_questions` | `INT` | Total questions (25) |
| `total_answered` | `INT` | Questions attempted |
| `correct_answers_count` | `INT` | **Number of RIGHT answers (✅)** |
| `wrong_answers_count` | `INT` | **Number of WRONG answers (❌)** |
| `unanswered_count` | `INT` | **Number of UNANSWERED / SKIPPED questions (⚪)** |
| `score` | `INT` | Final Score (1 mark per right answer) |
| `accuracy_percentage` | `NUMERIC(5,2)` | Accuracy percentage |
| `violation_count` | `INT` | Number of security violations (tab switches, exits) |
| `flagged` | `BOOLEAN` | Flagged if &ge; 3 violations or manual review |
| `answers_data` | `JSONB` | Key-value store of participant's selected options |

### 3. `leaderboard_rankings` SQL View (Rank-Wise Output)
```sql
CREATE OR REPLACE VIEW leaderboard_rankings AS
SELECT 
    DENSE_RANK() OVER (
        ORDER BY 
            s.score DESC, 
            s.time_taken_seconds ASC, 
            s.violation_count ASC, 
            s.submission_time ASC
    ) AS rank,
    s.id AS session_id,
    s.registration_id,
    s.team_name,
    p.team_leader,
    p.email,
    s.score,
    s.correct_answers_count,
    s.wrong_answers_count,
    s.unanswered_count,
    s.total_questions,
    s.time_taken_seconds,
    CONCAT(
        FLOOR(s.time_taken_seconds / 60)::TEXT, 'm ', 
        (s.time_taken_seconds % 60)::TEXT, 's'
    ) AS time_taken_formatted,
    CASE 
        WHEN s.total_answered > 0 THEN ROUND((s.correct_answers_count::NUMERIC / s.total_answered::NUMERIC) * 100, 1)
        ELSE 0.0 
    END AS accuracy,
    s.violation_count,
    s.flagged,
    s.session_status,
    s.start_time,
    s.submission_time
FROM quiz_sessions s
LEFT JOIN participants p ON s.participant_id = p.id
WHERE s.session_status = 'COMPLETED'
ORDER BY rank ASC;
```

---

## 🏆 How Ranks Are Calculated

1. **Primary Sort:** **Score (Descending)** &mdash; Most right answers gets highest rank.
2. **Tie-Breaker 1:** **Time Taken (Ascending)** &mdash; Faster teams who finished earlier rank higher.
3. **Tie-Breaker 2:** **Security Violations (Ascending)** &mdash; Clean attempts rank higher than flagged attempts.
4. **Tie-Breaker 3:** **Submission Timestamp (Ascending)**.

---

## 📥 Exporting Rank-Wise Results to CSV / Excel

In the **Administrator Console** (Header &rarr; Admin &rarr; Passkey: `TECHHABBA2026`):
1. Click **"Scores & Rankings"** tab to view the live leaderboard.
2. Click **"Export CSV"** to download an Excel-ready spreadsheet with columns:
   `Rank`, `Registration ID`, `Team Name`, `Team Leader`, `Score`, `Right Answers`, `Wrong Answers`, `Unanswered`, `Time Taken (Seconds)`, `Time Taken (Formatted)`, `Accuracy (%)`, `Violations`, `Flagged`, `Submission Time`.
