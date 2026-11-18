import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { isSupabaseConnected, checkSupabaseHealth } from '../lib/supabaseClient';
import {
  Shield,
  Clock,
  AlertTriangle,
  Database,
  User,
  Users,
  Award,
  Lock,
  Cpu
} from 'lucide-react';

export default function Header({ onOpenSupabaseModal, onOpenAdminModal, isExamMode = false }) {
  const {
    participant,
    remainingSeconds,
    violationsCount,
    isExamActive,
    isSubmitted
  } = useQuiz();

  const isConnected = isSupabaseConnected();
  const [dbHealth, setDbHealth] = useState({ connected: false, tablesReady: false });

  useEffect(() => {
    checkSupabaseHealth().then(setDbHealth);
  }, []);

  // Format timer into MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = remainingSeconds < 300 && remainingSeconds > 0; // Less than 5 mins
  const isCritical = remainingSeconds < 60 && remainingSeconds > 0; // Less than 1 min

  return (
    <header className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-navy-800 transition-all select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-600 via-cyber-purple to-cyan-400 p-[1.5px] shadow-glow-blue flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                TECH HABBA 2.0
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-electric-500/15 border border-electric-500/30 text-electric-300">
                Round 1
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium tracking-wide">
              The Big O – Technical Club • Acharya Institutes
            </p>
          </div>
        </div>

        {/* Center: Live Timer (Only during active exam) */}
        {isExamMode && isExamActive && !isSubmitted && (
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-all ${
                isCritical
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-lg shadow-rose-950/60'
                  : isUrgent
                  ? 'bg-amber-950/70 border-amber-500 text-amber-300 animate-pulse'
                  : 'bg-navy-850 border-electric-500/40 text-electric-300 shadow-glow-blue'
              }`}
            >
              <Clock className={`w-4 h-4 ${isUrgent ? 'animate-spin' : ''}`} />
              <span>{formatTime(remainingSeconds)}</span>
            </div>
            {isUrgent && (
              <span className="hidden md:inline-flex text-[11px] text-amber-400 font-semibold uppercase tracking-wider animate-pulse">
                &lt; 5m Left!
              </span>
            )}
          </div>
        )}

        {/* Right: Participant Info & Admin / DB Pill */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {participant && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-navy-850 border border-navy-750 rounded-xl text-xs">
              <Users className="w-3.5 h-3.5 text-electric-400" />
              <span className="text-slate-200 font-semibold">{participant.team_name}</span>
              <span className="text-slate-500 font-mono">({participant.registration_id})</span>
            </div>
          )}

          {/* Violations Badge during exam */}
          {isExamMode && isExamActive && (
            <div
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold ${
                violationsCount >= 3
                  ? 'bg-rose-950/70 border-rose-500/70 text-rose-300'
                  : violationsCount > 0
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                  : 'bg-navy-850 border-navy-750 text-emerald-400'
              }`}
              title="Violation Counter (Max 2 warnings before flagging)"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{violationsCount}/3</span>
            </div>
          )}

          {/* Database Connection Pill */}
          <button
            onClick={onOpenSupabaseModal}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition ${
              dbHealth.tablesReady
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                : isConnected
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/50 animate-pulse'
                : 'bg-navy-850 hover:bg-navy-750 border-navy-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Configure Supabase API Keys"
          >
            <Database className="w-3 h-3 text-cyan-400" />
            <span>{dbHealth.tablesReady ? 'Supabase: Live' : isConnected ? 'Supabase: Run SQL' : 'Database Setup'}</span>
          </button>

          {/* Admin Dashboard Trigger */}
          <button
            onClick={onOpenAdminModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-700 hover:border-navy-600 text-slate-300 hover:text-white text-xs font-semibold tracking-wide transition"
            title="Open Admin Portal"
          >
            <Lock className="w-3.5 h-3.5 text-cyber-purple" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>

      </div>
    </header>
  );
}

