import React, { useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Award,
  Calendar,
  Clock,
  ShieldCheck,
  FileCheck,
  Printer,
  Home,
  Users,
  Fingerprint,
  Sparkles
} from 'lucide-react';

export default function SubmissionResultPage({ onReturnHome }) {
  const { submissionResult, participant } = useQuiz();

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const receiptHash = "TH2-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto flex flex-col justify-center select-none">
      
      <div className="bg-navy-850/95 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-500/10 backdrop-blur-md text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6 text-emerald-400 shadow-lg shadow-emerald-500/20">
          <CheckCircle className="w-10 h-10 animate-bounce" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>ATTEMPT RECORDED & ENCRYPTED</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">
          Quiz Submitted Successfully!
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed mb-8">
          Your answers for TECH HABBA 2.0 IT Quiz – Round 1 have been recorded into the official evaluation ledger.
        </p>

        {/* Official Receipt Card */}
        <div className="bg-navy-900 border border-navy-750 rounded-2xl p-5 sm:p-6 text-left max-w-lg mx-auto mb-8 space-y-3 shadow-inner">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Examination Receipt
            </span>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              Receipt #{receiptHash}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Team Name:</span>
              <strong className="text-white text-sm">{participant?.team_name || submissionResult?.teamName || 'ByteForce'}</strong>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Registration ID:</span>
              <strong className="text-cyan-300 font-mono text-sm">{participant?.registration_id || submissionResult?.registrationId || 'TH2-IT-101'}</strong>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Submission Time:</span>
              <span className="text-slate-200 font-mono">{submissionResult?.submittedAt || new Date().toLocaleTimeString()}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Total Answered:</span>
              <span className="text-emerald-400 font-mono font-bold">{submissionResult?.totalAnswered ?? 25} / 25 Questions</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Time Taken:</span>
              <span className="text-cyan-300 font-mono font-bold">{submissionResult?.timeTakenFormatted || `${Math.floor((submissionResult?.timeTakenSeconds || 0) / 60)}m ${(submissionResult?.timeTakenSeconds || 0) % 60}s`}</span>
            </div>
          </div>
        </div>

        {/* Official Announcement Statement (As requested) */}
        <div className="bg-navy-900/60 border border-electric-500/20 rounded-2xl p-5 mb-8 max-w-xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p className="font-medium text-slate-200">
            "Thank you for participating in <strong className="text-cyan-400">TECH HABBA 2.0 IT QUIZ – ROUND 1</strong>. Results and qualification details will be announced by the organizing committee."
          </p>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            — The Big O Technical Club, Acharya Institutes
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-200 text-xs font-semibold tracking-wide transition flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric-600 to-cyan-500 hover:from-electric-500 hover:to-cyan-400 text-white text-xs font-bold tracking-wide transition shadow-lg shadow-electric-600/30 flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Event Portal</span>
          </button>
        </div>

      </div>

    </div>
  );
}

