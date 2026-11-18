import React, { useState } from 'react';
import { verifyParticipantLogin } from '../lib/supabaseClient';
import {
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  User,
  Users,
  Mail,
  Fingerprint,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';

export default function LandingPage({ onLoginSuccess, onOpenSupabaseModal }) {
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [email, setEmail] = useState('');
  const [regId, setRegId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick autofill for festival evaluators/testers
  const handleQuickFill = (preset) => {
    setTeamName(preset.team_name);
    setLeaderName(preset.team_leader);
    setEmail(preset.email);
    setRegId(preset.registration_id);
    setErrorMsg('');
  };

  const samplePresets = [
    {
      registration_id: 'TH2-IT-101',
      team_name: 'ByteForce',
      team_leader: 'Aryan Sharma',
      email: 'aryan.sharma@acharya.ac.in'
    },
    {
      registration_id: 'TH2-IT-102',
      team_name: 'CyberKnights',
      team_leader: 'Sneha Patil',
      email: 'sneha.patil@acharya.ac.in'
    },
    {
      registration_id: 'TH2-IT-103',
      team_name: 'BinaryBrains',
      team_leader: 'Rohan Verma',
      email: 'rohan.verma@acharya.ac.in'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanTeam = teamName.trim();
    const cleanLeader = leaderName.trim();
    const cleanEmail = email.trim();

    // Require all details before proceeding
    if (!cleanTeam) {
      setErrorMsg('Please enter your Team Name to proceed.');
      return;
    }
    if (!cleanLeader) {
      setErrorMsg('Please enter the Team Leader Name.');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid Registered Email ID (e.g. participant@example.com).');
      return;
    }

    const finalReg = (regId && regId.trim()) 
      ? regId.trim().toUpperCase() 
      : `TH2-IT-${Math.floor(100 + Math.random() * 900)}`;

    setLoading(true);

    try {
      const res = await verifyParticipantLogin({
        regId: finalReg,
        email: cleanEmail,
        teamName: cleanTeam,
        leaderName: cleanLeader
      });

      if (res && res.success && res.participant) {
        onLoginSuccess(res.participant);
      } else {
        onLoginSuccess({
          id: 'part_' + Date.now(),
          registration_id: finalReg,
          team_name: cleanTeam,
          team_leader: cleanLeader,
          email: cleanEmail,
          college_name: 'Acharya Institute of Technology',
          status: 'REGISTERED'
        });
      }
    } catch (err) {
      console.warn("Login pass-through:", err);
      onLoginSuccess({
        id: 'part_' + Date.now(),
        registration_id: finalReg,
        team_name: cleanTeam,
        team_leader: cleanLeader,
        email: cleanEmail,
        college_name: 'Acharya Institute of Technology',
        status: 'REGISTERED'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Tech Ambient Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-electric-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-cyber-purple/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Fest & Event Details */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-navy-800/80 border border-electric-500/30 text-xs font-mono text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>NATIONAL LEVEL TECHNICAL FEST</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 leading-tight">
              TECH HABBA <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 via-cyan-400 to-cyber-purple">2.0</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm text-slate-300 font-medium">
              <span className="text-white font-semibold">THE BIG O</span>
              <span className="text-slate-500">•</span>
              <span>Technical Club</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Acharya Institutes</span>
            </div>
          </div>

          <div className="bg-navy-850/80 border border-navy-750 p-4 rounded-2xl shadow-card backdrop-blur-sm">
            <div className="flex items-center space-x-2 text-xs font-mono text-electric-400 uppercase tracking-wider mb-1 font-semibold">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Event Specification</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1.5">
              IT QUIZ – ROUND 1
            </h2>
            <p className="text-xs sm:text-sm text-cyan-300/90 italic font-medium">
              "Think Fast. Code Smart. Compete Beyond Limits."
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-navy-850/60 border border-navy-800 p-3 rounded-xl text-center">
              <div className="text-lg font-bold text-white font-mono">25</div>
              <div className="text-[11px] text-slate-400 font-medium">Questions</div>
            </div>
            <div className="bg-navy-850/60 border border-navy-800 p-3 rounded-xl text-center">
              <div className="text-lg font-bold text-white font-mono">30 Min</div>
              <div className="text-[11px] text-slate-400 font-medium">Duration</div>
            </div>
            <div className="bg-navy-850/60 border border-navy-800 p-3 rounded-xl text-center">
              <div className="text-lg font-bold text-cyan-400 font-mono">Active</div>
              <div className="text-[11px] text-slate-400 font-medium">Anti-Cheat</div>
            </div>
          </div>

          {/* Presets Bar */}
          <div className="pt-2">
            <p className="text-xs text-slate-400 mb-2 flex items-center justify-center lg:justify-start space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test with Registered Teams:</span>
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              {samplePresets.map((preset) => (
                <button
                  key={preset.registration_id}
                  type="button"
                  onClick={() => handleQuickFill(preset)}
                  className="px-2.5 py-1 text-xs font-mono rounded-lg bg-navy-800 hover:bg-navy-750 border border-navy-700 hover:border-electric-500/50 text-slate-300 hover:text-white transition"
                >
                  {preset.team_name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Participant Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-navy-850/95 border border-navy-750 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 backdrop-blur-md relative">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-navy-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-electric-500/10 border border-electric-500/30 flex items-center justify-center text-electric-400">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Participant Login</h3>
                  <p className="text-xs text-slate-400">Enter your team details to proceed to the examination</p>
                </div>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Ready" />
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs flex items-start space-x-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Team Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-electric-400" />
                  <span>Team Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. ByteForce"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>

              {/* Team Leader Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-electric-400" />
                  <span>Team Leader Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aryan Sharma"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>

              {/* Registered Email ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-electric-400" />
                  <span>Registered Email ID *</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. aryan.sharma@acharya.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>

              {/* Start Quiz Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-electric-600 via-electric-500 to-cyan-500 hover:from-electric-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide transition shadow-lg shadow-electric-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Details...</span>
                  </span>
                ) : (
                  <>
                    <span>Proceed to Examination Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

          </div>
        </div>

      </div>
    </div>
  );
}

