import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { officialQuestions } from './src/data/questionsData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Supabase Client on the server side
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://pefazqsaqwcqperdgpas.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_f1ovBPyyeLeuJ_j044sxLw_Z8rrG5gz';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    console.log(`[Express Backend] Supabase client initialized for: ${supabaseUrl}`);
  } catch (err) {
    console.warn('[Express Backend] Supabase init warning:', err.message);
  }
}

// In-Memory fallback store if tables are not initialized
const memoryStore = {
  participants: [
    {
      id: "p101",
      registration_id: "TH2-IT-101",
      team_name: "ByteForce",
      team_leader: "Aryan Sharma",
      email: "aryan.sharma@acharya.ac.in",
      college_name: "Acharya Institute of Technology",
      status: "REGISTERED"
    },
    {
      id: "p102",
      registration_id: "TH2-IT-102",
      team_name: "CyberKnights",
      team_leader: "Sneha Patil",
      email: "sneha.patil@acharya.ac.in",
      college_name: "Acharya Institutes",
      status: "REGISTERED"
    },
    {
      id: "p103",
      registration_id: "TH2-IT-103",
      team_name: "BinaryBrains",
      team_leader: "Rohan Verma",
      email: "rohan.verma@acharya.ac.in",
      college_name: "Acharya Institute of Technology",
      status: "REGISTERED"
    },
    {
      id: "p104",
      registration_id: "TH2-IT-104",
      team_name: "NullPointers",
      team_leader: "Ananya Hegde",
      email: "ananya.hegde@acharya.ac.in",
      college_name: "Acharya Institutes",
      status: "REGISTERED"
    },
    {
      id: "p105",
      registration_id: "TH2-IT-105",
      team_name: "CodeWarriors",
      team_leader: "Karthik Rao",
      email: "karthik.rao@acharya.ac.in",
      college_name: "Acharya Institute of Technology",
      status: "REGISTERED"
    }
  ],
  sessions: {},
  violations: []
};

// -----------------------------------------------------------------------------
// 1. Health & Status Endpoint
// -----------------------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  let dbStatus = 'DISCONNECTED';
  let tablesReady = false;

  if (supabase) {
    try {
      const { error } = await supabase.from('participants').select('id', { head: true, count: 'exact' });
      if (!error) {
        dbStatus = 'CONNECTED_TABLES_READY';
        tablesReady = true;
      } else if (error.code === 'PGRST205') {
        dbStatus = 'CONNECTED_SCHEMA_PENDING';
      } else {
        dbStatus = `CONNECTED_ERROR: ${error.message}`;
      }
    } catch (e) {
      dbStatus = `ERROR: ${e.message}`;
    }
  }

  res.json({
    status: 'ONLINE',
    server: 'Node.js Express Backend',
    event: 'TECH HABBA 2.0 - IT QUIZ ROUND 1',
    port: PORT,
    timestamp: new Date().toISOString(),
    database: {
      url: supabaseUrl,
      status: dbStatus,
      tablesReady
    }
  });
});

// -----------------------------------------------------------------------------
// 2. Questions Endpoint (Hides Correct Answers for Exam Security)
// -----------------------------------------------------------------------------
app.get('/api/questions', (req, res) => {
  // Return questions without exposing correctAnswer or explanation to client
  const clientQuestions = officialQuestions.map(q => ({
    id: q.id,
    questionNumber: q.questionNumber,
    category: q.category,
    question: q.question,
    code: q.code,
    options: q.options
  }));

  // Shuffle order if requested
  const shuffle = req.query.shuffle === 'true';
  if (shuffle) {
    for (let i = clientQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clientQuestions[i], clientQuestions[j]] = [clientQuestions[j], clientQuestions[i]];
    }
  }

  res.json({ success: true, count: clientQuestions.length, questions: clientQuestions });
});

// -----------------------------------------------------------------------------
// 3. Participant Authentication Endpoint (Accepts ANY details for testing)
// -----------------------------------------------------------------------------
function isValidUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

app.post('/api/auth/login', async (req, res) => {
  const { regId, email, teamName, leaderName } = req.body || {};

  const normReg = (regId && regId.trim()) ? regId.trim().toUpperCase() : `TH2-IT-${Math.floor(100 + Math.random() * 900)}`;
  const normEmail = (email && email.trim()) ? email.trim().toLowerCase() : `test.${normReg.toLowerCase()}@acharya.ac.in`;
  const normTeam = (teamName && teamName.trim()) ? teamName.trim() : `Team ${normReg}`;
  const normLeader = (leaderName && leaderName.trim()) ? leaderName.trim() : 'Test Candidate';

  // 1. Try Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('registration_id', normReg)
        .maybeSingle();

      if (!error && data) {
        return res.json({ success: true, participant: data, source: 'supabase' });
      }

      // If not in Supabase yet, insert it on the fly for testing
      const { data: newPart, error: insErr } = await supabase
        .from('participants')
        .insert({
          registration_id: normReg,
          team_name: normTeam,
          team_leader: normLeader,
          email: normEmail,
          college_name: "Acharya Institute of Technology",
          status: "REGISTERED"
        })
        .select()
        .maybeSingle();

      if (!insErr && newPart) {
        return res.json({ success: true, participant: newPart, source: 'supabase_created' });
      }
    } catch (e) {
      console.warn('[Express] Supabase query/insert error in login (allowed in testing):', e.message);
    }
  }

  // 2. Fallback to memory store (Always succeeds for testing)
  let participant = memoryStore.participants.find(p => p.registration_id.toUpperCase() === normReg);
  if (!participant) {
    participant = {
      id: "part_" + Date.now(),
      registration_id: normReg,
      team_name: normTeam,
      team_leader: normLeader,
      email: normEmail,
      college_name: "Acharya Institute of Technology",
      status: "REGISTERED"
    };
    memoryStore.participants.push(participant);
  } else {
    participant.team_name = normTeam;
    participant.team_leader = normLeader;
    participant.email = normEmail;
  }

  return res.json({ success: true, participant, source: 'memory_testing' });
});

// -----------------------------------------------------------------------------
// 4. Session Start / Resume Endpoint
// -----------------------------------------------------------------------------
app.post('/api/session/start', async (req, res) => {
  const { participant } = req.body || {};
  const validParticipant = participant || {
    id: "part_" + Date.now(),
    registration_id: "TH2-IT-101",
    team_name: "ByteForce",
    team_leader: "Aryan Sharma",
    email: "test@acharya.ac.in"
  };

  const sessionId = "sess_" + (validParticipant.registration_id || "TEST").replace(/[^A-Za-z0-9]/g, '_');
  const now = new Date();
  const scheduledEndTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins

  // Supabase
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('registration_id', validParticipant.registration_id)
        .maybeSingle();

      if (existing) {
        return res.json({ success: true, session: existing, resumed: true, source: 'supabase' });
      }

      const insertPayload = {
        registration_id: validParticipant.registration_id,
        team_name: validParticipant.team_name,
        session_status: 'IN_PROGRESS',
        start_time: now.toISOString(),
        scheduled_end_time: scheduledEndTime.toISOString(),
        answers_data: {}
      };
      if (isValidUUID(validParticipant.id)) {
        insertPayload.participant_id = validParticipant.id;
      }

      const { data: newSess, error } = await supabase
        .from('quiz_sessions')
        .insert(insertPayload)
        .select()
        .single();

      if (!error && newSess) {
        return res.json({ success: true, session: newSess, resumed: false, source: 'supabase' });
      }
    } catch (e) {
      console.warn('[Express] Supabase session start error:', e.message);
    }
  }

  // Memory fallback
  if (memoryStore.sessions[sessionId]) {
    return res.json({ success: true, session: memoryStore.sessions[sessionId], resumed: true, source: 'memory' });
  }

  const localSession = {
    id: sessionId,
    participant_id: validParticipant.id,
    registration_id: validParticipant.registration_id,
    team_name: validParticipant.team_name,
    team_leader: validParticipant.team_leader,
    email: validParticipant.email,
    session_status: 'IN_PROGRESS',
    start_time: now.toISOString(),
    scheduled_end_time: scheduledEndTime.toISOString(),
    score: 0,
    total_answered: 0,
    violation_count: 0,
    flagged: false,
    answers_data: {}
  };

  memoryStore.sessions[sessionId] = localSession;
  res.json({ success: true, session: localSession, resumed: false, source: 'memory' });
});

// -----------------------------------------------------------------------------
// 5. Periodic Answers Sync Endpoint
// -----------------------------------------------------------------------------
app.post('/api/session/answers', async (req, res) => {
  const { sessionId, answersData } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'sessionId required.' });
  }

  const answeredCount = answersData ? Object.keys(answersData).length : 0;

  if (supabase) {
    try {
      await supabase
        .from('quiz_sessions')
        .update({
          answers_data: answersData || {},
          total_answered: answeredCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (e) {
      console.warn('[Express] Supabase answers sync error:', e.message);
    }
  }

  if (memoryStore.sessions[sessionId]) {
    memoryStore.sessions[sessionId].answers_data = answersData || {};
    memoryStore.sessions[sessionId].total_answered = answeredCount;
    memoryStore.sessions[sessionId].updated_at = new Date().toISOString();
  }

  res.json({ success: true, saved: answeredCount });
});

// -----------------------------------------------------------------------------
// 6. Anti-Cheat Violation Logger Endpoint
// -----------------------------------------------------------------------------
app.post('/api/violations', async (req, res) => {
  const { sessionId, participant, violationType, details, violationNumber } = req.body;
  const timestamp = new Date().toISOString();

  const record = {
    session_id: sessionId,
    participant_id: participant?.id,
    registration_id: participant?.registration_id,
    team_name: participant?.team_name,
    violation_type: violationType,
    violation_details: details,
    violation_number: violationNumber,
    occurred_at: timestamp
  };

  if (supabase) {
    try {
      await supabase.from('violations').insert(record);
      if (violationNumber >= 3) {
        await supabase
          .from('quiz_sessions')
          .update({
            flagged: true,
            flag_reason: `Security violation threshold reached (${violationNumber}). Last: ${violationType}`,
            violation_count: violationNumber
          })
          .eq('id', sessionId);
      } else {
        await supabase
          .from('quiz_sessions')
          .update({ violation_count: violationNumber })
          .eq('id', sessionId);
      }
    } catch (e) {
      console.warn('[Express] Supabase violation insert error:', e.message);
    }
  }

  memoryStore.violations.push({ id: 'viol_' + Date.now(), ...record });
  if (memoryStore.sessions[sessionId]) {
    memoryStore.sessions[sessionId].violation_count = violationNumber;
    if (violationNumber >= 3) {
      memoryStore.sessions[sessionId].flagged = true;
      memoryStore.sessions[sessionId].flag_reason = `Threshold reached (${violationNumber})`;
    }
  }

  res.json({ success: true, logged: record });
});

// -----------------------------------------------------------------------------
// 7. Exam Submission & Score Calculation Endpoint
// -----------------------------------------------------------------------------
app.post('/api/session/submit', async (req, res) => {
  const { sessionId, participant, answers, violationCount, timeTakenSeconds } = req.body;
  const submissionTime = new Date().toISOString();

  // Validate server-side scoring using authoritative questions
  let correctCount = 0;
  let wrongCount = 0;
  let answeredCount = 0;

  officialQuestions.forEach(q => {
    const selected = answers ? answers[q.id] : null;
    if (selected && selected.option) {
      answeredCount++;
      if (selected.option === q.correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }
  });

  const totalQuestions = officialQuestions.length; // 25
  const unansweredCount = totalQuestions - answeredCount;
  const score = correctCount; // 1 mark each
  const accuracy = answeredCount > 0 ? Number(((correctCount / answeredCount) * 100).toFixed(1)) : 0;
  const isFlagged = (violationCount || 0) >= 3;
  const timeTaken = Math.max(1, Math.min(1800, timeTakenSeconds || 0));

  const resultPayload = {
    session_status: 'COMPLETED',
    submission_time: submissionTime,
    time_taken_seconds: timeTaken,
    total_questions: totalQuestions,
    total_answered: answeredCount,
    correct_answers_count: correctCount,
    wrong_answers_count: wrongCount,
    unanswered_count: unansweredCount,
    score: score,
    accuracy_percentage: accuracy,
    violation_count: violationCount || 0,
    flagged: isFlagged,
    answers_data: answers || {},
    updated_at: submissionTime
  };

  // 1. Supabase
  if (supabase) {
    try {
      await supabase
        .from('quiz_sessions')
        .update(resultPayload)
        .eq('id', sessionId);
    } catch (e) {
      console.warn('[Express] Supabase submission error:', e.message);
    }
  }

  // 2. Memory
  if (memoryStore.sessions[sessionId]) {
    memoryStore.sessions[sessionId] = {
      ...memoryStore.sessions[sessionId],
      ...resultPayload
    };
  }

  res.json({
    success: true,
    score,
    totalQuestions,
    totalAnswered: answeredCount,
    correctAnswersCount: correctCount,
    wrongAnswersCount: wrongCount,
    unansweredCount,
    timeTakenSeconds: timeTaken,
    timeTakenFormatted: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`,
    accuracyPercentage: accuracy,
    submissionTime,
    teamName: participant?.team_name,
    registrationId: participant?.registration_id
  });
});

// -----------------------------------------------------------------------------
// 8. Admin Dashboard & Rank-Wise Leaderboard Endpoint
// -----------------------------------------------------------------------------
app.get('/api/admin/dashboard', async (req, res) => {
  let participants = [];
  let sessions = [];
  let violations = [];

  if (supabase) {
    try {
      const { data: viewData, error: viewError } = await supabase.from('leaderboard_rankings').select('*');
      if (!viewError && viewData) {
        sessions = viewData;
      } else {
        const { data: rawSessions } = await supabase.from('quiz_sessions').select('*');
        if (rawSessions) sessions = rawSessions;
      }

      const [pRes, vRes] = await Promise.all([
        supabase.from('participants').select('*'),
        supabase.from('violations').select('*').order('occurred_at', { ascending: false })
      ]);

      if (pRes.data) participants = pRes.data;
      if (vRes.data) violations = vRes.data;
    } catch (e) {
      console.warn('[Express] Supabase admin fetch error:', e.message);
    }
  }

  // Fallbacks if empty
  if (participants.length === 0) participants = memoryStore.participants;
  if (sessions.length === 0) sessions = Object.values(memoryStore.sessions);
  if (violations.length === 0) violations = memoryStore.violations;

  // Rank-wise calculation: Score DESC -> Time Taken ASC -> Violations ASC -> Time ASC
  const rankedSessions = [...sessions].sort((a, b) => {
    const scoreDiff = (b.score || 0) - (a.score || 0);
    if (scoreDiff !== 0) return scoreDiff;

    const timeA = a.time_taken_seconds != null ? a.time_taken_seconds : 1800;
    const timeB = b.time_taken_seconds != null ? b.time_taken_seconds : 1800;
    const timeDiff = timeA - timeB;
    if (timeDiff !== 0) return timeDiff;

    const violDiff = (a.violation_count || 0) - (b.violation_count || 0);
    if (violDiff !== 0) return violDiff;

    return new Date(a.submission_time || 0) - new Date(b.submission_time || 0);
  }).map((s, idx) => ({
    ...s,
    rank: s.rank || idx + 1,
    time_taken_formatted: s.time_taken_formatted || `${Math.floor((s.time_taken_seconds || 0) / 60)}m ${(s.time_taken_seconds || 0) % 60}s`
  }));

  res.json({
    success: true,
    participants,
    sessions: rankedSessions,
    violations,
    isSupabaseLive: Boolean(supabase)
  });
});

// -----------------------------------------------------------------------------
// 9. Admin Flag Session Endpoint
// -----------------------------------------------------------------------------
app.post('/api/admin/flag', async (req, res) => {
  const { sessionId, flagged, reason } = req.body;

  if (supabase) {
    try {
      await supabase
        .from('quiz_sessions')
        .update({ flagged, flag_reason: reason || '' })
        .eq('id', sessionId);
    } catch (e) {
      console.warn('[Express] Admin flag error:', e.message);
    }
  }

  if (memoryStore.sessions[sessionId]) {
    memoryStore.sessions[sessionId].flagged = flagged;
    memoryStore.sessions[sessionId].flag_reason = reason || '';
  }

  res.json({ success: true, sessionId, flagged });
});

// Start listening
app.listen(PORT, () => {
  console.log(`==================================================================`);
  console.log(`  🚀 TECH HABBA 2.0 - IT QUIZ ROUND 1 BACKEND RUNNING`);
  console.log(`  📡 Server: http://localhost:${PORT}`);
  console.log(`  🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`  🗄️ Database: ${supabaseUrl}`);
  console.log(`==================================================================`);
});

