import React, { useState } from 'react';
import { useQuiz } from '../context/QuizContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Maximize2,
  Lock,
  ArrowRight,
  User,
  Users,
  Eye,
  CheckSquare,
  Square
} from 'lucide-react';

export default function InstructionsPage({ participant, onStartQuiz }) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [launching, setLaunching] = useState(false);
  const { requestFullscreen } = useQuiz();

  const rules = [
    {
      num: 1,
      text: "The examination consists of 25 multiple-choice questions (MCQs)."
    },
    {
      num: 2,
      text: "Total duration: 30 minutes (1800 seconds) countdown."
    },
    {
      num: 3,
      text: "Each question carries exactly 1 mark."
    },
    {
      num: 4,
      text: "There is NO negative marking for incorrect answers."
    },
    {
      num: 5,
      text: "Each question has only one correct answer."
    },
    {
      num: 6,
      text: "Questions and options appear in randomized order for each participant session."
    },
    {
      num: 7,
      text: "Answer submission is mandatory before the countdown timer expires; unsubmitted attempts auto-submit at 00:00."
    },
    {
      num: 8,
      text: "Tab switching, minimizing the browser, and leaving full-screen mode are monitored and logged with exact timestamps."
    },
    {
      num: 9,
      text: "Copying, pasting, cutting, drag-and-drop, and right-click context menu actions are strictly restricted."
    },
    {
      num: 10,
      text: "Repeated suspicious activity (3 or more violations) will be permanently recorded and flagged for committee review."
    }
  ];

  const handleStartExam = async () => {
    if (!hasAccepted) return;
    setLaunching(true);

    try {
      // Trigger fullscreen enforcement
      await requestFullscreen();
    } catch (e) {
      console.warn("Fullscreen permission error:", e);
    }

    // Launch examination
    onStartQuiz();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-center">
      
      {/* Top Banner */}
      <div className="bg-navy-850 border border-navy-750 rounded-2xl p-6 sm:p-8 shadow-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded text-xs font-mono bg-electric-500/10 text-cyan-400 border border-electric-500/20 mb-2">
              <span>EXAMINATION CANDIDATE VERIFIED</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Rules & Instructions for IT Quiz – Round 1
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              TECH HABBA 2.0 • The Big O Technical Club • Acharya Institutes
            </p>
          </div>

          <div className="bg-navy-900 border border-navy-750 p-3.5 rounded-xl text-xs space-y-1 sm:text-right shrink-0">
            <div className="text-slate-400">Team: <span className="text-white font-bold">{participant?.team_name}</span></div>
            <div className="text-slate-400">Leader: <span className="text-slate-200">{participant?.team_leader}</span></div>
            <div className="text-slate-400 font-mono">Reg ID: <span className="text-cyan-400">{participant?.registration_id}</span></div>
          </div>
        </div>

        {/* Key Examination Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-3 bg-navy-900/80 border border-navy-800 rounded-xl text-center">
            <div className="text-xs text-slate-400 mb-1">Questions</div>
            <div className="text-lg font-bold text-white font-mono">25 MCQs</div>
          </div>
          <div className="p-3 bg-navy-900/80 border border-navy-800 rounded-xl text-center">
            <div className="text-xs text-slate-400 mb-1">Duration</div>
            <div className="text-lg font-bold text-electric-400 font-mono">30 Minutes</div>
          </div>
          <div className="p-3 bg-navy-900/80 border border-navy-800 rounded-xl text-center">
            <div className="text-xs text-slate-400 mb-1">Marking</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">+1 / 0 (No Neg)</div>
          </div>
          <div className="p-3 bg-navy-900/80 border border-navy-800 rounded-xl text-center">
            <div className="text-xs text-slate-400 mb-1">Mode</div>
            <div className="text-lg font-bold text-cyan-400 font-mono">Fullscreen AI-Proctored</div>
          </div>
        </div>

        {/* 10 Numbered Rules */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <FileText className="w-4 h-4 text-electric-400" />
            <span>Official Examination Directives</span>
          </h2>

          <div className="bg-navy-900/60 border border-navy-800 rounded-xl p-4 divide-y divide-navy-800">
            {rules.map((rule) => (
              <div key={rule.num} className="py-2.5 first:pt-0 last:pb-0 flex items-start space-x-3 text-xs sm:text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-navy-800 border border-navy-700 text-cyan-400 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  {rule.num}
                </span>
                <span className="leading-relaxed">{rule.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-Cheating & Security Notice Box */}
        <div className="bg-amber-950/20 border border-amber-500/40 rounded-xl p-4 mb-6 flex items-start space-x-3 text-xs text-amber-300/90 leading-relaxed">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-200 font-semibold mb-1">
              Important Proctored Environment Notice:
            </strong>
            The test window will automatically enter full-screen mode upon starting. Do not press Alt+Tab, do not switch tabs, and do not minimize the window. A violation counter will be maintained in real time; after 3 violations your session will be marked as FLAGGED for administrator review.
          </div>
        </div>

        {/* Acceptance Checkbox */}
        <div className="bg-navy-900 border border-navy-750 p-4 rounded-xl flex items-center space-x-3 cursor-pointer select-none mb-6 hover:border-electric-500/40 transition"
             onClick={() => setHasAccepted(!hasAccepted)}>
          <button
            type="button"
            className="text-cyan-400 focus:outline-none shrink-0"
          >
            {hasAccepted ? (
              <CheckSquare className="w-5 h-5 text-cyan-400" />
            ) : (
              <Square className="w-5 h-5 text-slate-500" />
            )}
          </button>
          <span className="text-xs sm:text-sm text-slate-200 font-medium">
            I confirm that I have read, understood, and agree to abide by all the examination rules and anti-cheating regulations of TECH HABBA 2.0 IT Quiz Round 1.
          </span>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartExam}
          disabled={!hasAccepted || launching}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-electric-600 via-cyan-500 to-cyber-purple hover:from-electric-500 hover:to-cyan-400 text-white font-bold text-sm sm:text-base tracking-wide transition shadow-xl shadow-electric-500/25 flex items-center justify-center space-x-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {launching ? (
            <span>Entering Fullscreen Proctored Environment...</span>
          ) : (
            <>
              <Maximize2 className="w-5 h-5" />
              <span>Enter Fullscreen & Begin Examination</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </div>

    </div>
  );
}

