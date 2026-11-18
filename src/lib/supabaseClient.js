import { createClient } from '@supabase/supabase-js';
import { officialQuestions } from '../data/questionsData.js';

// Determine Supabase credentials from .env or localStorage config
function getCredentials() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
  const envUrl = env.VITE_SUPABASE_URL;
  const envKey = env.VITE_SUPABASE_ANON_KEY;
  const storedUrl = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') ? localStorage.getItem('tech_habba_supabase_url') : null;
  const storedKey = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') ? localStorage.getItem('tech_habba_supabase_key') : null;

  const url = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : (storedUrl || '');
  const key = (envKey && envKey.trim() !== '') ? envKey.trim() : (storedKey || '');

  const isConfigured = Boolean(url && key && url.startsWith('http') && key.length > 20);
  return { url, key, isConfigured };
}

let supabaseInstance = null;
const { url, key, isConfigured } = getCredentials();

if (isConfigured) {
  try {
    supabaseInstance = createClient(url, key);
  } catch (err) {
    console.warn("Failed to initialize Supabase client:", err);
  }
}

export function getSupabase() {
  return supabaseInstance;
}

export function isSupabaseConnected() {
  const creds = getCredentials();
  return creds.isConfigured && supabaseInstance !== null;
}

export async function checkSupabaseHealth() {
  if (!supabaseInstance) return { connected: false, tablesReady: false };
  try {
    const { error } = await supabaseInstance.from('participants').select('id', { head: true, count: 'exact' });
    if (error) {
      if (error.code === 'PGRST205') {
        return { connected: true, tablesReady: false, error: 'Tables not created in Supabase yet.' };
      }
      return { connected: true, tablesReady: false, error: error.message };
    }
    return { connected: true, tablesReady: true };
  } catch (err) {
    return { connected: false, tablesReady: false, error: err.message };
  }
}

export function saveCustomSupabaseConfig(newUrl, newKey) {
  if (newUrl) localStorage.setItem('tech_habba_supabase_url', newUrl.trim());
  if (newKey) localStorage.setItem('tech_habba_supabase_key', newKey.trim());
  window.location.reload();
}

export function clearCustomSupabaseConfig() {
  localStorage.removeItem('tech_habba_supabase_url');
  localStorage.removeItem('tech_habba_supabase_key');
  window.location.reload();
}

// -----------------------------------------------------------------------------
// LOCAL FALLBACK STORE (Active when Supabase is not connected or offline)
// -----------------------------------------------------------------------------
const DEFAULT_PARTICIPANTS = [
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
];

function getLocalData(key, defaultVal) {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.getItem !== 'function') return defaultVal;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocalData(key, val) {
  try {
    if (typeof localStorage === 'undefined' || typeof localStorage.setItem !== 'function') return;
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// Initialize participants in local fallback if empty
if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function' && !localStorage.getItem('tech_habba_participants')) {
  setLocalData('tech_habba_participants', DEFAULT_PARTICIPANTS);
}

// Helper to call Node.js / Express.js Backend when available
async function tryApiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Express backend not running or unreachable, seamlessly fall through to direct Supabase / local
  }
  return null;
}

function isValidUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// -----------------------------------------------------------------------------
// BACKEND API SERVICES (Trio: Express Backend + Supabase + Local Fallback)
// -----------------------------------------------------------------------------

/**
 * 1. Participant Login Verification (Accepts ANY details for testing)
 */
export async function verifyParticipantLogin({ regId, email, teamName, leaderName }) {
  const normReg = (regId && regId.trim()) ? regId.trim().toUpperCase() : `TH2-IT-${Math.floor(100 + Math.random() * 900)}`;
  const normEmail = (email && email.trim()) ? email.trim().toLowerCase() : `test.${normReg.toLowerCase()}@acharya.ac.in`;
  const normTeam = (teamName && teamName.trim()) ? teamName.trim() : `Team ${normReg}`;
  const normLeader = (leaderName && leaderName.trim()) ? leaderName.trim() : 'Test Candidate';

  // 1. Try Express.js Backend first
  const apiRes = await tryApiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ regId: normReg, email: normEmail, teamName: normTeam, leaderName: normLeader })
  });
  if (apiRes && apiRes.success) {
    return apiRes;
  }

  // 2. Direct Supabase fallback
  if (supabaseInstance) {
    try {
      const { data, error } = await supabaseInstance
        .from('participants')
        .select('*')
        .eq('registration_id', normReg)
        .maybeSingle();

      if (!error && data) {
        return { success: true, participant: data, isSupabase: true };
      }

      // If not yet in Supabase, create it on-the-fly for testing
      const { data: newPart, error: insErr } = await supabaseInstance
        .from('participants')
        .insert({
          registration_id: normReg,
          team_name: normTeam,
          team_leader: normLeader,
          email: normEmail,
          college_name: 'Acharya Institute of Technology',
          status: 'REGISTERED'
        })
        .select()
        .maybeSingle();

      if (!insErr && newPart) {
        return { success: true, participant: newPart, isSupabase: true, isNew: true };
      }
    } catch (err) {
      console.warn("Supabase login query error, falling back to local verification:", err);
    }
  }

  // 3. Local fallback (Accepts all details)
  const participants = getLocalData('tech_habba_participants', DEFAULT_PARTICIPANTS);
  let participant = participants.find(p => p.registration_id.toUpperCase() === normReg);

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
    participants.push(participant);
    setLocalData('tech_habba_participants', participants);
  } else {
    participant.team_name = normTeam;
    participant.team_leader = normLeader;
    participant.email = normEmail;
  }

  return { success: true, participant, isSupabase: false };
}

/**
 * 2. Create or Resume Quiz Session
 */
export async function initializeQuizSession(participant) {
  // 1. Try Express.js Backend first
  const apiRes = await tryApiFetch('/api/session/start', {
    method: 'POST',
    body: JSON.stringify({ participant })
  });
  if (apiRes && apiRes.success) {
    return apiRes;
  }

  const sessionId = "sess_" + participant.registration_id.replace(/[^A-Za-z0-9]/g, '_');
  const now = new Date();
  const scheduledEndTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins

  // Supabase
  if (supabaseInstance) {
    try {
      // Check if session exists
      const { data: existing } = await supabaseInstance
        .from('quiz_sessions')
        .select('*')
        .eq('registration_id', participant.registration_id)
        .maybeSingle();

      if (existing) {
        return { success: true, session: existing, isSupabase: true, resumed: true };
      }

      // Create new session
      const insertPayload = {
        registration_id: participant.registration_id,
        team_name: participant.team_name,
        session_status: 'IN_PROGRESS',
        start_time: now.toISOString(),
        scheduled_end_time: scheduledEndTime.toISOString(),
        answers_data: {}
      };
      if (isValidUUID(participant.id)) {
        insertPayload.participant_id = participant.id;
      }

      const { data: newSession, error } = await supabaseInstance
        .from('quiz_sessions')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, session: newSession, isSupabase: true, resumed: false };
    } catch (err) {
      console.warn("Supabase session init failed, falling back to local:", err);
    }
  }

  // Local fallback
  const sessions = getLocalData('tech_habba_sessions', {});
  if (sessions[sessionId]) {
    return { success: true, session: sessions[sessionId], isSupabase: false, resumed: true };
  }

  const localSession = {
    id: sessionId,
    participant_id: participant.id,
    registration_id: participant.registration_id,
    team_name: participant.team_name,
    team_leader: participant.team_leader,
    email: participant.email,
    session_status: 'IN_PROGRESS',
    start_time: now.toISOString(),
    scheduled_end_time: scheduledEndTime.toISOString(),
    score: 0,
    total_answered: 0,
    violation_count: 0,
    flagged: false,
    answers_data: {}
  };

  sessions[sessionId] = localSession;
  setLocalData('tech_habba_sessions', sessions);
  return { success: true, session: localSession, isSupabase: false, resumed: false };
}

/**
 * 3. Save Answers Periodically
 */
export async function saveExamAnswers(sessionId, participantId, answersData) {
  // 1. Try Express.js Backend first
  const apiRes = await tryApiFetch('/api/session/answers', {
    method: 'POST',
    body: JSON.stringify({ sessionId, participantId, answersData })
  });
  if (apiRes && apiRes.success) {
    return;
  }

  if (supabaseInstance) {
    try {
      await supabaseInstance
        .from('quiz_sessions')
        .update({
          answers_data: answersData,
          total_answered: Object.keys(answersData).length,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (e) {
      console.warn("Error saving answers to Supabase:", e);
    }
  }

  // Update local
  const sessions = getLocalData('tech_habba_sessions', {});
  if (sessions[sessionId]) {
    sessions[sessionId].answers_data = answersData;
    sessions[sessionId].total_answered = Object.keys(answersData).length;
    sessions[sessionId].updated_at = new Date().toISOString();
    setLocalData('tech_habba_sessions', sessions);
  }
}

/**
 * 4. Log Anti-Cheating Violation
 */
export async function recordSecurityViolation({
  sessionId,
  participant,
  violationType,
  details,
  violationNumber
}) {
  // 1. Try Express.js Backend first
  const apiRes = await tryApiFetch('/api/violations', {
    method: 'POST',
    body: JSON.stringify({ sessionId, participant, violationType, details, violationNumber })
  });
  if (apiRes && apiRes.success && apiRes.logged) {
    return apiRes.logged;
  }

  const timestamp = new Date().toISOString();
  const violationRecord = {
    session_id: sessionId,
    participant_id: participant.id,
    registration_id: participant.registration_id,
    team_name: participant.team_name,
    violation_type: violationType,
    violation_details: details,
    violation_number: violationNumber,
    occurred_at: timestamp
  };

  // Supabase
  if (supabaseInstance) {
    try {
      await supabaseInstance.from('violations').insert(violationRecord);

      // If violations >= 3, flag session
      if (violationNumber >= 3) {
        await supabaseInstance
          .from('quiz_sessions')
          .update({
            flagged: true,
            flag_reason: `Multiple violations recorded (${violationNumber}): Last violation: ${violationType}`,
            violation_count: violationNumber
          })
          .eq('id', sessionId);
      } else {
        await supabaseInstance
          .from('quiz_sessions')
          .update({ violation_count: violationNumber })
          .eq('id', sessionId);
      }
    } catch (e) {
      console.warn("Error logging violation to Supabase:", e);
    }
  }

  // Local fallback
  const violationsList = getLocalData('tech_habba_violations', []);
  violationsList.push({ id: "viol_" + Date.now(), ...violationRecord });
  setLocalData('tech_habba_violations', violationsList);

  const sessions = getLocalData('tech_habba_sessions', {});
  if (sessions[sessionId]) {
    sessions[sessionId].violation_count = violationNumber;
    if (violationNumber >= 3) {
      sessions[sessionId].flagged = true;
      sessions[sessionId].flag_reason = `Flagged for multiple security events (${violationNumber}).`;
    }
    setLocalData('tech_habba_sessions', sessions);
  }

  return violationRecord;
}

/**
 * 5. Submit Quiz & Calculate Final Score
 */
export async function submitFinalQuiz({
  sessionId,
  participant,
  answers,
  violationCount,
  timeTakenSeconds = 0
}) {
  // 1. Try Express.js Backend first
  const apiRes = await tryApiFetch('/api/session/submit', {
    method: 'POST',
    body: JSON.stringify({ sessionId, participant, answers, violationCount, timeTakenSeconds })
  });
  if (apiRes && apiRes.success) {
    return apiRes;
  }

  const submissionTime = new Date().toISOString();

  // Compute score, right answers, and wrong answers using verified official questions
  let correctCount = 0;
  let wrongCount = 0;
  let answeredCount = 0;

  officialQuestions.forEach(q => {
    const selected = answers[q.id];
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
  const calculatedScore = correctCount; // 1 mark each
  const accuracyPercentage = answeredCount > 0 ? Number(((correctCount / answeredCount) * 100).toFixed(1)) : 0;
  const isFlagged = violationCount >= 3;
  const timeTaken = Math.max(1, Math.min(1800, timeTakenSeconds));

  const payload = {
    session_status: 'COMPLETED',
    submission_time: submissionTime,
    time_taken_seconds: timeTaken,
    total_questions: totalQuestions,
    total_answered: answeredCount,
    correct_answers_count: correctCount,
    wrong_answers_count: wrongCount,
    unanswered_count: unansweredCount,
    score: calculatedScore,
    accuracy_percentage: accuracyPercentage,
    violation_count: violationCount,
    flagged: isFlagged,
    answers_data: answers,
    updated_at: submissionTime
  };

  // Supabase
  if (supabaseInstance) {
    try {
      const { error } = await supabaseInstance
        .from('quiz_sessions')
        .update(payload)
        .eq('id', sessionId);

      if (error) console.error("Supabase submission error:", error);
    } catch (e) {
      console.warn("Supabase final submit failed:", e);
    }
  }

  // Local
  const sessions = getLocalData('tech_habba_sessions', {});
  if (sessions[sessionId]) {
    sessions[sessionId] = {
      ...sessions[sessionId],
      ...payload
    };
    setLocalData('tech_habba_sessions', sessions);
  }

  return {
    success: true,
    score: calculatedScore,
    totalQuestions,
    totalAnswered: answeredCount,
    correctAnswersCount: correctCount,
    wrongAnswersCount: wrongCount,
    unansweredCount: unansweredCount,
    timeTakenSeconds: timeTaken,
    accuracyPercentage,
    submissionTime,
    teamName: participant.team_name,
    registrationId: participant.registration_id
  };
}

/**
 * 6. Admin Dashboard: Get Overview, Sessions, Violations & Leaderboard
 */
export async function getAdminDashboardData() {
  // 1. Try Express.js Backend first
  const apiRes = await tryApiFetch('/api/admin/dashboard');
  if (apiRes && apiRes.success) {
    return apiRes;
  }

  let participants = [];
  let sessions = [];
  let violations = [];

  if (supabaseInstance) {
    try {
      // First try to fetch leaderboard_rankings view if created
      const { data: viewData, error: viewError } = await supabaseInstance
        .from('leaderboard_rankings')
        .select('*');

      if (!viewError && viewData) {
        sessions = viewData;
      } else {
        // Fallback to quiz_sessions table
        const { data: rawSessions } = await supabaseInstance
          .from('quiz_sessions')
          .select('*');
        if (rawSessions) sessions = rawSessions;
      }

      const [pRes, vRes] = await Promise.all([
        supabaseInstance.from('participants').select('*'),
        supabaseInstance.from('violations').select('*').order('occurred_at', { ascending: false })
      ]);

      if (pRes.data) participants = pRes.data;
      if (vRes.data) violations = vRes.data;
    } catch (e) {
      console.warn("Admin fetch from Supabase error, falling back:", e);
    }
  }

  // Fallback to local if empty
  if (participants.length === 0) {
    participants = getLocalData('tech_habba_participants', DEFAULT_PARTICIPANTS);
  }
  if (sessions.length === 0) {
    const rawSessions = getLocalData('tech_habba_sessions', {});
    sessions = Object.values(rawSessions);
  }
  if (violations.length === 0) {
    violations = getLocalData('tech_habba_violations', []);
  }

  // Sort rank-wise: Higher score first, then lower time taken (speed), then fewer violations
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

  return {
    participants,
    sessions: rankedSessions,
    violations,
    isSupabaseLive: isSupabaseConnected()
  };
}

/**
 * 7. Admin Action: Toggle Flag on Session
 */
export async function toggleSessionFlag(sessionId, flagged, reason = "") {
  // 1. Try Express.js Backend first
  const apiRes = await tryApiFetch('/api/admin/flag', {
    method: 'POST',
    body: JSON.stringify({ sessionId, flagged, reason })
  });
  if (apiRes && apiRes.success) {
    return;
  }

  if (supabaseInstance) {
    try {
      await supabaseInstance
        .from('quiz_sessions')
        .update({ flagged, flag_reason: reason })
        .eq('id', sessionId);
    } catch (e) {
      console.error(e);
    }
  }

  const sessions = getLocalData('tech_habba_sessions', {});
  if (sessions[sessionId]) {
    sessions[sessionId].flagged = flagged;
    sessions[sessionId].flag_reason = reason;
    setLocalData('tech_habba_sessions', sessions);
  }
}

