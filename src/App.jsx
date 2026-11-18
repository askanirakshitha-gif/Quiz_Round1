import React, { useState, useEffect } from 'react';
import { QuizProvider, useQuiz } from './context/QuizContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import InstructionsPage from './pages/InstructionsPage';
import QuizExamPage from './pages/QuizExamPage';
import SubmissionResultPage from './pages/SubmissionResultPage';
import AntiCheatMonitor from './components/AntiCheatMonitor';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import AdminDashboard from './pages/AdminDashboard';

function ExaminationApp() {
  const {
    participant,
    isExamActive,
    isSubmitted,
    startExam,
    setParticipant
  } = useQuiz();

  // Navigation stage: 'landing' | 'instructions' | 'exam' | 'result'
  const [currentStage, setCurrentStage] = useState(() => {
    try {
      if (localStorage.getItem('tech_habba_exam_result')) return 'result';
      const stored = localStorage.getItem('tech_habba_current_participant');
      if (stored) {
        if (localStorage.getItem('tech_habba_exam_endtime')) return 'exam';
        return 'instructions';
      }
    } catch {}
    return 'landing';
  });

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [tempParticipant, setTempParticipant] = useState(participant);

  // Sync stage with quiz state
  useEffect(() => {
    if (isSubmitted) {
      setCurrentStage('result');
    } else if (isExamActive) {
      setCurrentStage('exam');
    }
  }, [isExamActive, isSubmitted]);

  const handleLoginSuccess = (candidate) => {
    setTempParticipant(candidate);
    setCurrentStage('instructions');
  };

  const handleStartQuiz = async () => {
    if (tempParticipant) {
      await startExam(tempParticipant);
      setCurrentStage('exam');
    }
  };

  const handleReturnHome = () => {
    localStorage.removeItem('tech_habba_current_participant');
    localStorage.removeItem('tech_habba_current_session');
    localStorage.removeItem('tech_habba_exam_answers');
    localStorage.removeItem('tech_habba_exam_visited');
    localStorage.removeItem('tech_habba_exam_endtime');
    localStorage.removeItem('tech_habba_exam_questions');
    localStorage.removeItem('tech_habba_violations_count');
    localStorage.removeItem('tech_habba_violations_log');
    localStorage.removeItem('tech_habba_exam_result');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col font-sans selection:bg-electric-500/30 selection:text-white">
      
      {/* Global Header */}
      <Header
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isExamMode={currentStage === 'exam'}
      />

      {/* Main Content by Stage */}
      <main className="flex-1">
        {currentStage === 'landing' && (
          <LandingPage
            onLoginSuccess={handleLoginSuccess}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        )}

        {currentStage === 'instructions' && (
          <InstructionsPage
            participant={tempParticipant || participant}
            onStartQuiz={handleStartQuiz}
          />
        )}

        {currentStage === 'exam' && (
          <QuizExamPage />
        )}

        {currentStage === 'result' && (
          <SubmissionResultPage
            onReturnHome={handleReturnHome}
          />
        )}
      </main>

      {/* Anti-Cheating Monitor (runs during exam) */}
      <AntiCheatMonitor />

      {/* Global Supabase Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Global Administrator Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onOpenSupabaseModal={() => {
          setIsAdminModalOpen(false);
          setIsSupabaseModalOpen(true);
        }}
      />

      {/* Minimal Footer */}
      <footer className="py-4 border-t border-navy-800 text-center text-xs text-slate-500 font-mono select-none">
        <p>© 2026 TECH HABBA 2.0 • The Big O Technical Club • Acharya Institutes. All rights reserved.</p>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <QuizProvider>
      <ExaminationApp />
    </QuizProvider>
  );
}

