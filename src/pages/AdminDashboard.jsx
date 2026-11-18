import React, { useState, useEffect } from 'react';
import {
  getAdminDashboardData,
  toggleSessionFlag,
  isSupabaseConnected
} from '../lib/supabaseClient';
import { officialQuestions } from '../data/questionsData';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Search,
  Lock,
  Unlock,
  Flag,
  Eye,
  RefreshCw,
  FileSpreadsheet,
  Database,
  X,
  Award,
  ChevronRight,
  BookOpen
} from 'lucide-react';

const ADMIN_PASSCODE = "TECHHABBA2026"; // Default passkey

export default function AdminDashboard({ isOpen, onClose, onOpenSupabaseModal }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'violations' | 'leaderboard' | 'questions'
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [participants, setParticipants] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [violations, setViolations] = useState([]);
  const [selectedViolationLog, setSelectedViolationLog] = useState(null);

  const isConnected = isSupabaseConnected();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getAdminDashboardData();
      setParticipants(data.participants || []);
      setSessions(data.sessions || []);
      setViolations(data.violations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadDashboardData();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim().toUpperCase() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Toggle flag status on participant session
  const handleToggleFlag = async (session) => {
    const newStatus = !session.flagged;
    const reason = newStatus ? "Manually flagged by Administrator for audit." : "";
    await toggleSessionFlag(session.id, newStatus, reason);
    loadDashboardData();
  };

  // Export results to CSV
  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "Registration ID",
      "Team Name",
      "Team Leader",
      "Email",
      "Status",
      "Score (/25)",
      "Right Answers",
      "Wrong Answers",
      "Unanswered",
      "Time Taken (Seconds)",
      "Time Taken (Formatted)",
      "Accuracy (%)",
      "Violations",
      "Flagged",
      "Submission Time"
    ];

    const rows = sessions.map((s, idx) => [
      s.rank || idx + 1,
      `"${s.registration_id}"`,
      `"${s.team_name}"`,
      `"${s.team_leader || ''}"`,
      `"${s.email || ''}"`,
      `"${s.session_status}"`,
      s.score ?? 0,
      s.correct_answers_count ?? s.score ?? 0,
      s.wrong_answers_count ?? ((s.total_answered ?? 0) - (s.score ?? 0)),
      s.unanswered_count ?? (25 - (s.total_answered ?? 0)),
      s.time_taken_seconds ?? 0,
      `"${s.time_taken_formatted || `${Math.floor((s.time_taken_seconds || 0) / 60)}m ${(s.time_taken_seconds || 0) % 60}s`}"`,
      s.accuracy_percentage ?? (s.total_answered ? Math.round(((s.score || 0) / s.total_answered) * 100) : 0),
      s.violation_count ?? 0,
      s.flagged ? "YES" : "NO",
      `"${s.submission_time || s.updated_at || 'In Progress'}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TechHabba2_ITQuiz_RankWise_Results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalRegistered = participants.length;
  const submittedCount = sessions.filter(s => s.session_status === 'COMPLETED').length;
  const activeSessionsCount = sessions.filter(s => s.session_status === 'IN_PROGRESS').length;
  const flaggedCount = sessions.filter(s => s.flagged || (s.violation_count >= 3)).length;

  // Filtered lists
  const filteredSessions = sessions.filter(s =>
    (s.team_name && s.team_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.registration_id && s.registration_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-navy-900 border border-navy-750 rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl shadow-black overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-navy-850 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-purple/20 to-electric-500/20 border border-cyber-purple/40 flex items-center justify-center text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  TECH HABBA 2.0 • Administrator Console
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-purple/20 text-purple-300 border border-cyber-purple/40">
                  Organizing Committee
                </span>
              </div>
              <p className="text-xs text-slate-400">
                IT Quiz Round 1 Real-time Security & Evaluation Command
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-lg border text-xs font-mono ${
                isConnected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-navy-800 border-navy-700 text-slate-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span>{isConnected ? 'Database Live' : 'Local Fallback'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isAuthenticated ? (
          /* Authentication Screen */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-navy-850 border border-navy-750 p-8 rounded-2xl max-w-md w-full text-center shadow-card">
              <div className="w-14 h-14 bg-cyber-purple/10 border border-cyber-purple/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-400">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Admin Authentication Required
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Enter committee passkey to monitor attempts and rankings.
              </p>

              {authError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs font-medium">
                  Invalid Passkey. Please verify your credentials.
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter Admin Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-4 py-2.5 text-sm text-center tracking-widest text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-purple to-electric-600 hover:from-purple-500 hover:to-electric-500 text-white font-bold text-xs tracking-wider transition shadow-lg shadow-purple-600/30"
                >
                  Verify & Enter Console
                </button>
              </form>

              <p className="mt-4 text-[11px] text-slate-500">
                Default Demo Passkey: <code className="text-cyan-400 font-mono">TECHHABBA2026</code>
              </p>
            </div>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* KPI Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 border-b border-navy-800 bg-navy-900/50 shrink-0">
              <div className="bg-navy-850 border border-navy-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Registered Teams</span>
                  <Users className="w-4 h-4 text-electric-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white">{totalRegistered}</div>
              </div>

              <div className="bg-navy-850 border border-navy-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Active Live Sessions</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-xl font-bold font-mono text-cyan-300">{activeSessionsCount}</div>
              </div>

              <div className="bg-navy-850 border border-navy-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Completed Attempts</span>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400">{submittedCount}</div>
              </div>

              <div className="bg-navy-850 border border-navy-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Flagged Suspicious</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-bold font-mono text-rose-400">{flaggedCount}</div>
              </div>
            </div>

            {/* Sub-navigation & Search Toolbar */}
            <div className="px-5 py-3 border-b border-navy-800 bg-navy-850 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setActiveTab('sessions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'sessions'
                      ? 'bg-electric-500 text-navy-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  Sessions ({sessions.length})
                </button>
                <button
                  onClick={() => setActiveTab('violations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'violations'
                      ? 'bg-rose-500 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  Violations Log ({violations.length})
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'leaderboard'
                      ? 'bg-cyan-500 text-navy-950 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  Scores & Rankings
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'questions'
                      ? 'bg-purple-500 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  Question Bank (25)
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search team or Reg ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-navy-950 border border-navy-750 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 w-44 sm:w-56"
                  />
                </div>

                <button
                  onClick={loadDashboardData}
                  className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
                  title="Export results to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Tab Views */}
            <div className="flex-1 overflow-y-auto p-5">
              
              {/* TAB 1: SESSIONS */}
              {activeTab === 'sessions' && (
                <div className="bg-navy-850 border border-navy-800 rounded-xl overflow-hidden shadow-card">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-navy-950 text-slate-400 uppercase font-mono text-[11px] border-b border-navy-800">
                      <tr>
                        <th className="py-3 px-4">Registration ID</th>
                        <th className="py-3 px-4">Team Name</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Score</th>
                        <th className="py-3 px-4 text-center">Right (✅)</th>
                        <th className="py-3 px-4 text-center">Wrong (❌)</th>
                        <th className="py-3 px-4 text-center">Time Taken (⏱️)</th>
                        <th className="py-3 px-4 text-center">Violations</th>
                        <th className="py-3 px-4">Flagged</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800">
                      {filteredSessions.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="py-8 text-center text-slate-500">
                            No matching sessions found. Start a quiz attempt to view live telemetry.
                          </td>
                        </tr>
                      ) : (
                        filteredSessions.map((s) => (
                          <tr key={s.id} className="hover:bg-navy-800/40 transition">
                            <td className="py-3 px-4 font-mono font-bold text-cyan-300">
                              {s.registration_id}
                            </td>
                            <td className="py-3 px-4 font-semibold text-white">
                              {s.team_name}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                  s.session_status === 'COMPLETED'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                }`}
                              >
                                {s.session_status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                              {s.score ?? 0}/25
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-400">
                              {s.correct_answers_count ?? s.score ?? 0}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-semibold text-rose-400">
                              {s.wrong_answers_count ?? ((s.total_answered ?? 0) - (s.score ?? 0))}
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-cyan-300">
                              {s.time_taken_formatted || (s.time_taken_seconds ? `${Math.floor(s.time_taken_seconds / 60)}m ${s.time_taken_seconds % 60}s` : '--')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                  (s.violation_count ?? 0) >= 3
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    : (s.violation_count ?? 0) > 0
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'text-slate-400'
                                }`}
                              >
                                {s.violation_count ?? 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {s.flagged ? (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] bg-rose-950/80 text-rose-300 border border-rose-500/50 font-bold">
                                  <Flag className="w-3 h-3 fill-rose-400 text-rose-400" />
                                  <span>FLAGGED</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs">Clean</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleFlag(s)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                                  s.flagged
                                    ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300'
                                    : 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300'
                                }`}
                              >
                                {s.flagged ? 'Clear Flag' : 'Flag Session'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 2: VIOLATIONS LOG */}
              {activeTab === 'violations' && (
                <div className="bg-navy-850 border border-navy-800 rounded-xl overflow-hidden shadow-card">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-navy-950 text-slate-400 uppercase font-mono text-[11px] border-b border-navy-800">
                      <tr>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Team</th>
                        <th className="py-3 px-4">Reg ID</th>
                        <th className="py-3 px-4">Violation Type</th>
                        <th className="py-3 px-4">Violation #</th>
                        <th className="py-3 px-4">Audit Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800 font-mono">
                      {violations.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-500">
                            No violations recorded yet. All participants are adhering to proctored regulations.
                          </td>
                        </tr>
                      ) : (
                        violations.map((v) => (
                          <tr key={v.id} className="hover:bg-navy-800/40 transition">
                            <td className="py-3 px-4 text-slate-400">
                              {new Date(v.occurred_at || Date.now()).toLocaleTimeString()}
                            </td>
                            <td className="py-3 px-4 font-semibold text-white font-sans">
                              {v.team_name}
                            </td>
                            <td className="py-3 px-4 text-cyan-300">
                              {v.registration_id}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded text-[11px] bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold">
                                {v.violation_type}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-bold text-center text-amber-400">
                              #{v.violation_number}
                            </td>
                            <td className="py-3 px-4 font-sans text-slate-300 text-[11px]">
                              {v.violation_details}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: LEADERBOARD & RANKINGS */}
              {activeTab === 'leaderboard' && (
                <div className="bg-navy-850 border border-navy-800 rounded-xl overflow-hidden shadow-card">
                  <div className="p-4 bg-navy-950 border-b border-navy-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                        <Award className="w-4 h-4 text-cyan-400" />
                        <span>Round 1 Official Standings (Rank-Wise)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Sorted by Score (Highest First) &rarr; Fastest Time Taken &rarr; Fewest Violations
                      </p>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 bg-navy-900 border border-navy-750 px-2.5 py-1 rounded-lg">
                      {sessions.filter(s => s.session_status === 'COMPLETED').length} Ranked Submissions
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-navy-900/80 text-slate-400 uppercase font-mono text-[11px] border-b border-navy-800">
                        <tr>
                          <th className="py-3 px-4 text-center">Rank</th>
                          <th className="py-3 px-4">Team Name & Leader</th>
                          <th className="py-3 px-4">Reg ID</th>
                          <th className="py-3 px-4 text-center">Score (/25)</th>
                          <th className="py-3 px-4 text-center text-emerald-400">Right (✅)</th>
                          <th className="py-3 px-4 text-center text-rose-400">Wrong (❌)</th>
                          <th className="py-3 px-4 text-center text-slate-400">Skipped (⚪)</th>
                          <th className="py-3 px-4 text-center text-cyan-300">Time Taken (⏱️)</th>
                          <th className="py-3 px-4 text-center">Accuracy</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-800">
                        {sessions.length === 0 ? (
                          <tr>
                            <td colSpan="10" className="py-8 text-center text-slate-500">
                              No submissions evaluated yet. Completed participant attempts will rank automatically here.
                            </td>
                          </tr>
                        ) : (
                          sessions.map((s, idx) => {
                            const rank = s.rank || idx + 1;
                            const rightCount = s.correct_answers_count ?? s.score ?? 0;
                            const wrongCount = s.wrong_answers_count ?? Math.max(0, (s.total_answered ?? 0) - (s.score ?? 0));
                            const unanswered = s.unanswered_count ?? Math.max(0, 25 - (s.total_answered ?? 0));
                            const timeFormatted = s.time_taken_formatted || (s.time_taken_seconds ? `${Math.floor(s.time_taken_seconds / 60)}m ${s.time_taken_seconds % 60}s` : '--');
                            const accuracy = s.accuracy_percentage ?? (s.total_answered ? Math.round(((s.score || 0) / s.total_answered) * 100) : 0);

                            return (
                              <tr key={s.id || idx} className="hover:bg-navy-800/40 transition">
                                <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                                  {rank === 1 ? '🥇 1' : rank === 2 ? '🥈 2' : rank === 3 ? '🥉 3' : `#${rank}`}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-bold text-white text-sm">{s.team_name}</div>
                                  <div className="text-[11px] text-slate-400">{s.team_leader || 'Candidate'}</div>
                                </td>
                                <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                                  {s.registration_id}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400 text-sm">
                                  {s.score ?? 0}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">
                                  {rightCount}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-rose-400">
                                  {wrongCount}
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-slate-400">
                                  {unanswered}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-semibold text-cyan-300">
                                  {timeFormatted}
                                </td>
                                <td className="py-3 px-4 text-center font-mono font-medium">
                                  {accuracy}%
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                    s.flagged ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  }`}>
                                    {s.flagged ? 'Flagged' : 'Verified'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: OFFICIAL QUESTIONS BANK */}
              {activeTab === 'questions' && (
                <div className="space-y-4">
                  <div className="bg-navy-850 border border-navy-800 rounded-xl p-4 text-xs text-slate-300 flex items-center justify-between">
                    <div>
                      <strong className="text-white block text-sm mb-1">
                        TECH HABBA 2.0 Official Question Set (25 Questions)
                      </strong>
                      All questions match the official syllabus extracted from the OneDrive source. Correct answers are verified on the backend.
                    </div>
                  </div>

                  <div className="space-y-3">
                    {officialQuestions.map((q) => (
                      <div key={q.id} className="bg-navy-850 border border-navy-800 rounded-xl p-4 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-cyan-400">
                            Q{q.questionNumber}. [{q.category}]
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
                            Correct: Option {q.correctAnswer}
                          </span>
                        </div>
                        <div className="text-slate-200 font-medium">{q.question}</div>
                        {q.code && (
                          <pre className="bg-navy-950 p-2.5 rounded-lg border border-navy-800 font-mono text-[11px] text-cyan-300">
                            {q.code}
                          </pre>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                          {q.options.map((opt) => (
                            <div key={opt.key} className={opt.key === q.correctAnswer ? 'text-emerald-300 font-semibold' : ''}>
                              <strong className="font-mono mr-1">{opt.key})</strong> {opt.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

