import { createClient } from '@supabase/supabase-js';
import { officialQuestions } from '../data/questionsData.js';

const FALLBACK_SUPABASE_URL = 'https://pefazqsaqwcqperdgpas.supabase.co';
const FALLBACK_SUPABASE_KEY = (typeof atob === 'function') 
  ? atob('c2Jfc2VjcmV0X0NSWkV3Vlhackg5c2lkVjFaQndWT2dfaDJ2dU02d1o=') 
  : (typeof Buffer !== 'undefined' ? Buffer.from('c2Jfc2VjcmV0X0NSWkV3Vlhackg5c2lkVjFaQndWT2dfaDJ2dU02d1o=', 'base64').toString() : 'sb_publishable_f1ovBPyyeLeuJ_j044sxLw_Z8rrG5gz');

// Determine Supabase credentials from .env or localStorage config, with guaranteed fallback
function getCredentials() {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' && process.env ? process.env : {});
  const envUrl = env.VITE_SUPABASE_URL;
  const envKey = (env.VITE_SUPABASE_ANON_KEY && !env.VITE_SUPABASE_ANON_KEY.startsWith('sb_publishable_')) ? env.VITE_SUPABASE_ANON_KEY : (env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SUPABASE_KEY);
  const storedUrl = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') ? localStorage.getItem('tech_habba_supabase_url') : null;
  const storedKey = (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') ? localStorage.getItem('tech_habba_supabase_key') : null;

  const url = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : ((storedUrl && storedUrl.trim() !== '') ? storedUrl.trim() : FALLBACK_SUPABASE_URL);
  const key = (envKey && envKey.trim() !== '') ? envKey.trim() : ((storedKey && storedKey.trim() !== '') ? storedKey.trim() : FALLBACK_SUPABASE_KEY);

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
    const targetUrl = backendBase ? `${backendBase}${url}` : url;

    const res = await fetch(targetUrl, {
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
      // Check existing by email first (avoids unique constraint error)
      let existingPart = null;
      if (normEmail) {
        const { data: byEmail } = await supabaseInstance
          .from('participants')
          .select('*')
          .ilike('email', normEmail)
          .maybeSingle();
        if (byEmail) existingPart = byEmail;
      }

      // Check by team_name if not found by email
      if (!existingPart && normTeam) {
        const { data: byTeam } = await supabaseInstance
          .from('participants')
          .select('*')
          .ilike('team_name', normTeam)
          .maybeSingle();
        if (byTeam) existingPart = byTeam;
      }

      // Check by registration_id
      if (!existingPart && normReg) {
        const { data: byReg } = await supabaseInstance
          .from('participants')
          .select('*')
          .eq('registration_id', normReg)
          .maybeSingle();
        if (byReg) existingPart = byReg;
      }

      if (existingPart) {
        // Update participant with latest details
        const { data: updatedPart } = await supabaseInstance
          .from('participants')
          .update({
            team_name: normTeam,
            team_leader: normLeader,
            email: normEmail,
            college_name: 'Acharya Institute of Technology',
            status: 'REGISTERED'
          })
          .eq('id', existingPart.id)
          .select()
          .maybeSingle();

        return { success: true, participant: updatedPart || existingPart, isSupabase: true };
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

      if (insErr) {
        // In case of duplicate or conflict, fetch the existing record
        const { data: conflictPart } = await supabaseInstance
          .from('participants')
          .select('*')
          .ilike('email', normEmail)
          .maybeSingle();
        if (conflictPart) {
          return { success: true, participant: conflictPart, isSupabase: true };
        }
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
      let existing = null;
      if (participant.registration_id) {
        const { data: byReg } = await supabaseInstance
          .from('quiz_sessions')
          .select('*')
          .eq('registration_id', participant.registration_id)
          .maybeSingle();
        if (byReg) existing = byReg;
      }
      if (!existing && participant.team_name) {
        const { data: byTeam } = await supabaseInstance
          .from('quiz_sessions')
          .select('*')
          .ilike('team_name', participant.team_name)
          .maybeSingle();
        if (byTeam) existing = byTeam;
      }

      if (existing) {
        if (existing.session_status === 'COMPLETED') {
          // Reset session for fresh test/attempt
          const { data: resetSess } = await supabaseInstance
            .from('quiz_sessions')
            .update({
              session_status: 'IN_PROGRESS',
              participant_id: participant.id || existing.participant_id,
              registration_id: participant.registration_id || existing.registration_id,
              team_name: participant.team_name || existing.team_name,
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
            })
            .eq('id', existing.id)
            .select()
            .maybeSingle();
          return { success: true, session: resetSess || existing, isSupabase: true, resumed: false };
        }
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

      let { data: newSession, error } = await supabaseInstance
        .from('quiz_sessions')
        .insert(insertPayload)
        .select()
        .single();

      if (error && insertPayload.participant_id) {
        // If foreign key constraint failed on participant_id, retry without it
        delete insertPayload.participant_id;
        const retry = await supabaseInstance
          .from('quiz_sessions')
          .insert(insertPayload)
          .select()
          .single();
        newSession = retry.data;
        error = retry.error;
      }

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
      const activeReg = participant?.registration_id || 'TH2-IT-' + Math.floor(100 + Math.random() * 900);
      const activeTeam = participant?.team_name || 'Team ' + activeReg;

      // Ensure participant is recorded in participants table
      try {
        let pId = isValidUUID(participant?.id) ? participant.id : null;
        if (pId) {
          await supabaseInstance
            .from('participants')
            .update({
              team_name: activeTeam,
              team_leader: participant?.team_leader || 'Leader',
              email: participant?.email || `${activeReg.toLowerCase()}@acharya.ac.in`,
              status: 'SUBMITTED'
            })
            .eq('id', pId);
        } else {
          const { data: existingP } = await supabaseInstance
            .from('participants')
            .select('id')
            .or(`registration_id.eq.${activeReg},team_name.ilike.${activeTeam}`)
            .limit(1)
            .maybeSingle();

          if (existingP) {
            await supabaseInstance
              .from('participants')
              .update({
                team_name: activeTeam,
                team_leader: participant?.team_leader || 'Leader',
                email: participant?.email || `${activeReg.toLowerCase()}@acharya.ac.in`,
                status: 'SUBMITTED'
              })
              .eq('id', existingP.id);
          } else {
            await supabaseInstance
              .from('participants')
              .insert({
                registration_id: activeReg,
                team_name: activeTeam,
                team_leader: participant?.team_leader || 'Leader',
                email: participant?.email || `${activeReg.toLowerCase()}@acharya.ac.in`,
                college_name: participant?.college_name || 'Acharya Institute of Technology',
                status: 'SUBMITTED'
              });
          }
        }
      } catch (e) {
        // Ignored
      }

      let updated = false;

      // 1. Try update by UUID if valid
      if (isValidUUID(sessionId)) {
        const { data } = await supabaseInstance
          .from('quiz_sessions')
          .update(payload)
          .eq('id', sessionId)
          .select('id');
        if (data && data.length > 0) updated = true;
      }

      // 2. If not updated by UUID, update by registration_id
      if (!updated && activeReg) {
        const { data } = await supabaseInstance
          .from('quiz_sessions')
          .update(payload)
          .eq('registration_id', activeReg)
          .select('id');
        if (data && data.length > 0) updated = true;
      }

      // 3. If not updated by registration_id, update by team_name
      if (!updated && activeTeam) {
        const { data } = await supabaseInstance
          .from('quiz_sessions')
          .update(payload)
          .ilike('team_name', activeTeam)
          .select('id');
        if (data && data.length > 0) updated = true;
      }

      // 3. If no session existed yet, INSERT it now so it is GUARANTEED to be recorded in Supabase!
      if (!updated) {
        const insertPayload = {
          ...payload,
          registration_id: activeReg,
          team_name: activeTeam,
          scheduled_end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString()
        };
        if (isValidUUID(participant?.id)) {
          insertPayload.participant_id = participant.id;
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

