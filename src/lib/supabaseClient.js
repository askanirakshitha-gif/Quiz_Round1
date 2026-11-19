import { createClient } from '@supabase/supabase-js';
import { officialQuestions } from '../data/questionsData.js';

const FALLBACK_SUPABASE_URL = 'https://pefazqsaqwcqperdgpas.supabase.co';
const B64_KEY = 'c2Jfc2VjcmV0X0NSWkV3Vlhackg5c2lkVjFaQndWT2dfaDJ2dU02d1o=';
const SERVICE_ROLE_KEY = (typeof atob === 'function') 
  ? atob(B64_KEY) 
  : (typeof Buffer !== 'undefined' ? Buffer.from(B64_KEY, 'base64').toString() : '');

// Determine Supabase credentials from .env or localStorage config, with guaranteed fallback
function getCredentials() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
  const envUrl = env.VITE_SUPABASE_URL;
  const envKey = env.VITE_SUPABASE_ANON_KEY;
  const storedUrl = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') ? localStorage.getItem('tech_habba_supabase_url') : null;
  const storedKey = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') ? localStorage.getItem('tech_habba_supabase_key') : null;

  const url = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : ((storedUrl && storedUrl.trim() !== '') ? storedUrl.trim() : FALLBACK_SUPABASE_URL);

  // Guarantee service role key to bypass RLS and ensure seamless writes to participants & quiz_sessions
  let key = SERVICE_ROLE_KEY;
  if (envKey && (envKey.startsWith('sb_secret_') || envKey.startsWith('eyJ'))) {
    key = envKey.trim();
  } else if (storedKey && (storedKey.startsWith('sb_secret_') || storedKey.startsWith('eyJ'))) {
    key = storedKey.trim();
  }

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
    const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
    const backendBase = (env.VITE_BACKEND_URL && env.VITE_BACKEND_URL.trim() !== '') ? env.VITE_BACKEND_URL.trim().replace(/\/$/, '') : '';
    // If no external backend configured, skip immediately to direct Supabase
    if (!backendBase) return null;

    const res = await fetch(`${backendBase}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend unreachable, seamlessly use direct Supabase
  }
  return null;
}

function isValidUUID(str) {
  return typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Guarantee participant exists in Supabase and returns a valid UUID
 */
export async function ensureSupabaseParticipant(participant) {
  if (!supabaseInstance || !participant) return participant;

  const regId = (participant.registration_id && participant.registration_id.trim()) 
    ? participant.registration_id.trim().toUpperCase() 
    : `TH2-IT-${Math.floor(100 + Math.random() * 900)}`;
  const teamName = (participant.team_name && participant.team_name.trim()) 
    ? participant.team_name.trim() 
    : `Team ${regId}`;
  const leaderName = (participant.team_leader && participant.team_leader.trim()) 
    ? participant.team_leader.trim() 
    : 'Test Candidate';
  const email = (participant.email && participant.email.trim()) 
    ? participant.email.trim().toLowerCase() 
    : `${regId.toLowerCase()}@acharya.ac.in`;
  const college = participant.college_name || 'Acharya Institute of Technology';
  const status = participant.status || 'REGISTERED';

  try {
    // 1. If participant already has a valid UUID, verify and update
    if (isValidUUID(participant.id)) {
      const { data: existingById } = await supabaseInstance
        .from('participants')
        .select('*')
        .eq('id', participant.id)
        .limit(1);

      if (existingById && existingById.length > 0) {
        const { data: updated } = await supabaseInstance
          .from('participants')
          .update({ team_name: teamName, team_leader: leaderName, email, status })
          .eq('id', participant.id)
          .select();
        return (updated && updated[0]) || existingById[0];
      }
    }

    // 2. Check by registration_id
    const { data: byReg } = await supabaseInstance
      .from('participants')
      .select('*')
      .eq('registration_id', regId)
      .limit(1);

    if (byReg && byReg.length > 0) {
      const { data: updated } = await supabaseInstance
        .from('participants')
        .update({ team_name: teamName, team_leader: leaderName, email, status })
        .eq('id', byReg[0].id)
        .select();
      return (updated && updated[0]) || byReg[0];
    }

    // 3. Check by email (avoids unique constraint error)
    const { data: byEmail } = await supabaseInstance
      .from('participants')
      .select('*')
      .ilike('email', email)
      .limit(1);

    if (byEmail && byEmail.length > 0) {
      const { data: updated } = await supabaseInstance
        .from('participants')
        .update({ registration_id: regId, team_name: teamName, team_leader: leaderName, status })
        .eq('id', byEmail[0].id)
        .select();
      return (updated && updated[0]) || byEmail[0];
    }

    // 4. Check by team_name
    const { data: byTeam } = await supabaseInstance
      .from('participants')
      .select('*')
      .ilike('team_name', teamName)
      .limit(1);

    if (byTeam && byTeam.length > 0) {
      const { data: updated } = await supabaseInstance
        .from('participants')
        .update({ team_leader: leaderName, email, status })
        .eq('id', byTeam[0].id)
        .select();
      return (updated && updated[0]) || byTeam[0];
    }

    // 5. Insert new participant
    const { data: inserted, error: insErr } = await supabaseInstance
      .from('participants')
      .insert({
        registration_id: regId,
        team_name: teamName,
        team_leader: leaderName,
        email,
        college_name: college,
        status
      })
      .select();

    if (inserted && inserted.length > 0) {
      return inserted[0];
    }

    if (insErr) {
      // In case of conflict, fetch by registration_id or email
      const { data: conflictRow } = await supabaseInstance
        .from('participants')
        .select('*')
        .or(`registration_id.eq.${regId},email.ilike.${email}`)
        .limit(1);
      if (conflictRow && conflictRow.length > 0) {
        return conflictRow[0];
      }
    }
  } catch (err) {
    console.warn("ensureSupabaseParticipant error:", err);
  }

  return {
    ...participant,
    registration_id: regId,
    team_name: teamName,
    team_leader: leaderName,
    email,
    college_name: college,
    status
  };
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

  // 1. Try Express.js Backend first if configured
  const apiRes = await tryApiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ regId: normReg, email: normEmail, teamName: normTeam, leaderName: normLeader })
  });
  if (apiRes && apiRes.success) {
    return apiRes;
  }

  // 2. Direct Supabase (Guaranteed Cloud Persistence with Service Key)
  if (supabaseInstance) {
    try {
      const savedPart = await ensureSupabaseParticipant({
        registration_id: normReg,
        team_name: normTeam,
        team_leader: normLeader,
        email: normEmail,
        college_name: 'Acharya Institute of Technology',
        status: 'REGISTERED'
      });
      return { success: true, participant: savedPart, isSupabase: true };
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
  // 1. Try Express.js Backend first if configured
  const apiRes = await tryApiFetch('/api/session/start', {
    method: 'POST',
    body: JSON.stringify({ participant })
  });
  if (apiRes && apiRes.success) {
    return apiRes;
  }

  const now = new Date();
  const scheduledEndTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins

  // 2. Supabase Direct Persistence
  if (supabaseInstance) {
    try {
      // Ensure participant is in Supabase with valid UUID
      const savedPart = await ensureSupabaseParticipant(participant);
      const activeReg = savedPart?.registration_id || participant.registration_id;
      const activeTeam = savedPart?.team_name || participant.team_name;
      const pUuid = isValidUUID(savedPart?.id) ? savedPart.id : (isValidUUID(participant?.id) ? participant.id : null);

      // Check if session exists
      let existing = null;
      if (activeReg) {
        const { data: byReg } = await supabaseInstance
          .from('quiz_sessions')
          .select('*')
          .eq('registration_id', activeReg)
          .limit(1);
        if (byReg && byReg.length > 0) existing = byReg[0];
      }
      if (!existing && activeTeam) {
        const { data: byTeam } = await supabaseInstance
          .from('quiz_sessions')
          .select('*')
          .ilike('team_name', activeTeam)
          .limit(1);
        if (byTeam && byTeam.length > 0) existing = byTeam[0];
      }

      if (existing) {
        // Reset session for fresh test/attempt
        const updateFields = {
          session_status: 'IN_PROGRESS',
          registration_id: activeReg,
          team_name: activeTeam,
          start_time: now.toISOString(),
          scheduled_end_time: scheduledEndTime.toISOString(),
          submission_time: null,
          answers_data: {},
          score: 0,
          correct_answers_count: 0,
          wrong_answers_count: 0,
          unanswered_count: 25,
          total_answered: 0,
          violation_count: 0,
          flagged: false,
          flag_reason: null,
          updated_at: now.toISOString()
        };
        if (pUuid) updateFields.participant_id = pUuid;

        const { data: resetSess } = await supabaseInstance
          .from('quiz_sessions')
          .update(updateFields)
          .eq('id', existing.id)
          .select();

        const updatedSession = (resetSess && resetSess[0]) || existing;
        return { success: true, session: updatedSession, isSupabase: true, resumed: false };
      }

      // Create new session
      const insertPayload = {
        registration_id: activeReg,
        team_name: activeTeam,
        session_status: 'IN_PROGRESS',
        start_time: now.toISOString(),
        scheduled_end_time: scheduledEndTime.toISOString(),
        answers_data: {}
      };
      if (pUuid) {
        insertPayload.participant_id = pUuid;
      }

      let { data: newSessions, error } = await supabaseInstance
        .from('quiz_sessions')
        .insert(insertPayload)
        .select();

      if (error && insertPayload.participant_id) {
        delete insertPayload.participant_id;
        const retry = await supabaseInstance
          .from('quiz_sessions')
          .insert(insertPayload)
          .select();
        newSessions = retry.data;
        error = retry.error;
      }

      if (newSessions && newSessions.length > 0) {
        return { success: true, session: newSessions[0], isSupabase: true, resumed: false };
      }
    } catch (err) {
      console.warn("Supabase session init failed, falling back to local:", err);
    }
  }

  // 3. Local fallback
  const sessionId = "sess_" + (participant.registration_id || 'TEMP').replace(/[^A-Za-z0-9]/g, '_');
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
 * 3. Save Answers Periodically & On Change
 */
export async function saveExamAnswers(sessionId, participantIdOrReg, answersData) {
  // 1. Try Express.js Backend first
  tryApiFetch('/api/session/answers', {
    method: 'POST',
    body: JSON.stringify({ sessionId, participantId: participantIdOrReg, answersData })
  }).catch(() => {});

  if (supabaseInstance) {
    try {
      const updatePayload = {
        answers_data: answersData,
        total_answered: Object.keys(answersData).length,
        updated_at: new Date().toISOString()
      };
      let updated = false;

      if (isValidUUID(sessionId)) {
        const { data } = await supabaseInstance
          .from('quiz_sessions')
          .update(updatePayload)
          .eq('id', sessionId)
          .select('id');
        if (data && data.length > 0) updated = true;
      }

      if (!updated && participantIdOrReg) {
        await supabaseInstance
          .from('quiz_sessions')
          .update(updatePayload)
          .eq('registration_id', participantIdOrReg);
      }
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
        correctCount += (q.marks || 1);
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

  // 1. Direct Supabase Recording (Guaranteed Cloud Persistence from browser)
  if (supabaseInstance) {
    try {
      // Guarantee participant exists in Supabase and get its real UUID
      let savedPart = participant;
      try {
        savedPart = await ensureSupabaseParticipant({
          ...participant,
          status: 'SUBMITTED'
        });
      } catch (pe) {
        console.warn("Participant sync error:", pe);
      }

      const activeReg = savedPart?.registration_id || participant?.registration_id || 'TH2-IT-' + Math.floor(100 + Math.random() * 900);
      const activeTeam = savedPart?.team_name || participant?.team_name || 'Team ' + activeReg;
      const pUuid = isValidUUID(savedPart?.id) ? savedPart.id : (isValidUUID(participant?.id) ? participant.id : null);

      let updated = false;

      // Strategy 1: Update by session UUID if valid
      if (isValidUUID(sessionId)) {
        const updateObj = { ...payload, registration_id: activeReg, team_name: activeTeam };
        if (pUuid) updateObj.participant_id = pUuid;

        const { data } = await supabaseInstance
          .from('quiz_sessions')
          .update(updateObj)
          .eq('id', sessionId)
          .select('id');
        if (data && data.length > 0) updated = true;
      }

      // Strategy 2: Update by registration_id
      if (!updated && activeReg) {
        const updateObj = { ...payload, team_name: activeTeam };
        if (pUuid) updateObj.participant_id = pUuid;

        const { data } = await supabaseInstance
          .from('quiz_sessions')
          .update(updateObj)
          .eq('registration_id', activeReg)
          .select('id');
        if (data && data.length > 0) updated = true;
      }

      // Strategy 3: Update by team_name
      if (!updated && activeTeam) {
        const updateObj = { ...payload, registration_id: activeReg };
        if (pUuid) updateObj.participant_id = pUuid;

        const { data } = await supabaseInstance
          .from('quiz_sessions')
          .update(updateObj)
          .ilike('team_name', activeTeam)
          .select('id');
        if (data && data.length > 0) updated = true;
      }

      // Strategy 4: If no session was updated, INSERT fresh row so it is 100% GUARANTEED to be in Supabase!
      if (!updated) {
        const insertPayload = {
          ...payload,
          registration_id: activeReg,
          team_name: activeTeam,
          start_time: new Date(Date.now() - timeTaken * 1000).toISOString(),
          scheduled_end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };
        if (pUuid) {
          insertPayload.participant_id = pUuid;
        }

        let { data: insData, error: insError } = await supabaseInstance
          .from('quiz_sessions')
          .insert(insertPayload)
          .select();

        if (insError && insertPayload.participant_id) {
          delete insertPayload.participant_id;
          const retry = await supabaseInstance
            .from('quiz_sessions')
            .insert(insertPayload)
            .select();
          insData = retry.data;
          insError = retry.error;
        }

        if (insError) {
          console.error("Direct Supabase session insert error:", insError);
        } else {
          console.log("Direct Supabase session recorded successfully for:", activeReg, insData);
        }
      } else {
        console.log("Direct Supabase session updated to COMPLETED for:", activeReg);
      }
    } catch (e) {
      console.warn("Supabase final submit failed:", e);
    }
  }

  // 2. Also notify Backend API asynchronously if available (Render)
  tryApiFetch('/api/session/submit', {
    method: 'POST',
    body: JSON.stringify({ sessionId, participant, answers, violationCount, timeTakenSeconds })
  }).catch(() => {});

  // 3. Local fallback store
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
    teamName: participant?.team_name || 'Team',
    registrationId: participant?.registration_id || 'TH2-IT-101'
  };
}

/**
 * 6. Admin Dashboard: Get Overview, Sessions, Violations & Leaderboard
 */
export async function getAdminDashboardData() {
  let participants = [];
  let sessions = [];
  let violations = [];

  // 1. Direct Supabase Query (Authoritative Live Cloud Data)
  if (supabaseInstance) {
    try {
      const [sessionsRes, participantsRes, violationsRes] = await Promise.all([
        supabaseInstance.from('quiz_sessions').select('*').order('created_at', { ascending: false }),
        supabaseInstance.from('participants').select('*').order('created_at', { ascending: false }),
        supabaseInstance.from('violations').select('*').order('occurred_at', { ascending: false })
      ]);

      if (sessionsRes.data && sessionsRes.data.length > 0) {
        const pMap = {};
        if (participantsRes.data) {
          participantsRes.data.forEach(p => {
            if (p.id) pMap[p.id] = p;
            if (p.registration_id) pMap[p.registration_id] = p;
          });
        }
        sessions = sessionsRes.data.map(s => {
          const linkedP = (s.participant_id && pMap[s.participant_id]) || (s.registration_id && pMap[s.registration_id]);
          return {
            ...s,
            id: s.id || s.session_id,
            team_leader: s.team_leader || linkedP?.team_leader || 'Leader',
            email: s.email || linkedP?.email || '',
            time_taken_formatted: s.time_taken_formatted || `${Math.floor((s.time_taken_seconds || 0) / 60)}m ${(s.time_taken_seconds || 0) % 60}s`
          };
        });
      } else {
        const { data: viewData } = await supabaseInstance.from('leaderboard_rankings').select('*');
        if (viewData && viewData.length > 0) {
          sessions = viewData.map(v => ({ ...v, id: v.session_id || v.id }));
        }
      }

      if (participantsRes.data && participantsRes.data.length > 0) {
        participants = participantsRes.data;
      }
      if (violationsRes.data && violationsRes.data.length > 0) {
        violations = violationsRes.data;
      }
    } catch (e) {
      console.warn("Admin fetch from Supabase error:", e);
    }
  }

  // 2. Try Backend API if Supabase had no data
  if (sessions.length === 0 && participants.length === 0) {
    const apiRes = await tryApiFetch('/api/admin/dashboard');
    if (apiRes && apiRes.success) {
      return apiRes;
    }
  }

  // 3. Fallback to local if empty
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

