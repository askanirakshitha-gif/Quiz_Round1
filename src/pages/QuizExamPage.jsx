import React from 'react';
import { useQuiz } from '../context/QuizContext';
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Clock,
  Send,
  Code,
  Check,
  CheckSquare,
  Sparkles,
  Info
} from 'lucide-react';

export default function QuizExamPage() {
  const {
    participant,
    questions,
    currentQuestion,
    currentIndex,
    answers,
    visited,
    remainingSeconds,
    violationsCount,
    summaryCounts,
    selectOption,
    clearOption,
    toggleMarkForReview,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitExam,
    getQuestionStatus,
    showSubmitConfirmModal,
    setShowSubmitConfirmModal
  } = useQuiz();

  if (!currentQuestion) return null;

  const currentAnswer = answers[currentQuestion.id];
  const isMarked = Boolean(currentAnswer?.markedForReview);
  const selectedOption = currentAnswer?.option;

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isUrgent = remainingSeconds < 300;

  // Color mapper for question navigation pills
  const getNavPillClasses = (status, isCurrent) => {
    let base = "relative flex items-center justify-center rounded-xl text-xs font-mono font-bold transition-all duration-150 h-9 sm:h-10 ";
    
    if (isCurrent) {
      base += "ring-2 ring-cyan-400 ring-offset-2 ring-offset-navy-900 shadow-glow-cyan ";
    }

    switch (status) {
      case 'answered':
        return base + "bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-sm";
      case 'marked':
        return base + "bg-cyber-purple hover:bg-purple-500 text-white shadow-glow-purple";
      case 'not_answered':
        return base + "bg-amber-600/80 hover:bg-amber-500 text-white";
      case 'not_visited':
      default:
        return base + "bg-navy-800 hover:bg-navy-750 text-slate-400 border border-navy-750";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 select-none">
      
      {/* Quiz Top Action Banner */}
      <div className="bg-navy-850/90 border border-navy-750 rounded-2xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-card">
        <div className="flex items-center space-x-3">
          <span className="px-2.5 py-1 rounded-lg bg-electric-500/15 border border-electric-500/30 text-electric-300 font-mono text-xs font-semibold">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="hidden sm:inline-block text-xs text-slate-400 border-l border-navy-750 pl-3">
            Category: <strong className="text-slate-200">{currentQuestion.category}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Score per Question:</span>
            <span className="text-emerald-400 font-mono font-bold">+1 Mark</span>
          </div>

          <button
            onClick={() => setShowSubmitConfirmModal(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs tracking-wider transition shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Navigation (1-25) + Center Question & Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT SECTION: Question Navigation Panel */}
        <div className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1 space-y-4">
          <div className="bg-navy-850/90 border border-navy-750 rounded-2xl p-4 sm:p-5 shadow-card backdrop-blur-sm">
            
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-navy-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Question Palette
              </h3>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                {summaryCounts.answered}/25 Done
              </span>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 pb-3 border-b border-navy-800 text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
                <span>Answered ({summaryCounts.answered})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-cyber-purple shrink-0" />
                <span>Review ({summaryCounts.marked})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-amber-600 shrink-0" />
                <span>Not Answered ({summaryCounts.notAnswered})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-navy-800 border border-navy-750 shrink-0" />
                <span>Not Visited ({summaryCounts.notVisited})</span>
              </div>
            </div>

            {/* 1 to 25 Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q.id, idx);
                const isCurrent = idx === currentIndex;
                const ans = answers[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={getNavPillClasses(status, isCurrent)}
                    title={`Question ${idx + 1}: ${q.category}`}
                  >
                    <span>{idx + 1}</span>
                    {ans?.markedForReview && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    )}
                  </button>
                );
              })}
            </div>

          </div>

          {/* Anti-cheat status mini card */}
          <div className="bg-navy-850/60 border border-navy-800 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fullscreen Monitoring:</span>
            </span>
            <span className="text-emerald-400 font-semibold font-mono">ACTIVE</span>
          </div>
        </div>

        {/* MAIN SECTION: Question & Options Display */}
        <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2 space-y-4">
          <div className="bg-navy-850/95 border border-navy-750 rounded-2xl p-5 sm:p-7 shadow-card backdrop-blur-sm min-h-[460px] flex flex-col justify-between">
            
            {/* Question Header & Body */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    Question #{currentIndex + 1}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{currentQuestion.category}</span>
                </div>

                {/* Mark for Review Toggle Pill */}
                <button
                  type="button"
                  onClick={() => toggleMarkForReview(currentQuestion.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                    isMarked
                      ? 'bg-cyber-purple/20 border-cyber-purple text-purple-300'
                      : 'bg-navy-900 border-navy-750 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isMarked ? 'fill-purple-400 text-purple-400' : ''}`} />
                  <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed mb-4">
                {currentQuestion.question}
              </div>

              {/* Code Snippet Box (if question contains code) */}
              {currentQuestion.code && (
                <div className="mb-6 rounded-xl bg-navy-950 border border-navy-800 p-4 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto shadow-inner">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] mb-2 pb-1 border-b border-navy-800/80">
                    <span className="flex items-center space-x-1.5">
                      <Code className="w-3.5 h-3.5 text-electric-400" />
                      <span>Code Excerpt</span>
                    </span>
                    <span>C / Algorithm</span>
                  </div>
                  <pre className="font-mono leading-relaxed whitespace-pre">{currentQuestion.code}</pre>
                </div>
              )}

              {/* Four Options: A, B, C, D */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOption === opt.key;

                  return (
                    <div
                      key={opt.key}
                      onClick={() => selectOption(currentQuestion.id, opt.key)}
                      className={`group flex items-start space-x-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-electric-600/15 border-cyan-400 text-white shadow-glow-cyan/20 ring-1 ring-cyan-400/40'
                          : 'bg-navy-900/80 hover:bg-navy-900 border-navy-750 hover:border-navy-650 text-slate-300'
                      }`}
                    >
                      {/* Option Key Radio Circle */}
                      <div
                        className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-cyan-400 text-navy-950 shadow-md'
                            : 'bg-navy-800 border border-navy-700 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {opt.key}
                      </div>

                      {/* Option Text */}
                      <div className="text-sm sm:text-base font-normal pt-0.5 leading-normal">
                        {opt.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="pt-4 border-t border-navy-800 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={prevQuestion}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 disabled:opacity-30 border border-navy-750 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {/* Clear Selection */}
                {selectedOption && (
                  <button
                    onClick={() => clearOption(currentQuestion.id)}
                    className="px-3 py-2 rounded-xl bg-navy-900 hover:bg-navy-850 border border-navy-750 text-slate-400 hover:text-rose-300 text-xs font-medium transition flex items-center space-x-1"
                    title="Clear current selection"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear Choice</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Save & Next Button */}
                <button
                  onClick={nextQuestion}
                  disabled={currentIndex === questions.length - 1}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-electric-600 to-cyan-500 hover:from-electric-500 hover:to-cyan-400 disabled:opacity-40 text-white text-xs font-bold tracking-wide transition shadow-md shadow-electric-600/20 flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* CONFIRMATION DIALOG BEFORE SUBMISSION */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-electric-500/50 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl shadow-electric-500/20 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-electric-500/10 border border-electric-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-cyan-400">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Submit Examination?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                TECH HABBA 2.0 • IT QUIZ ROUND 1
              </p>
            </div>

            {/* Summary statistics */}
            <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-4 mb-5 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Total Questions:</span>
                <span className="font-mono font-bold text-white">25</span>
              </div>
              <div className="flex justify-between items-center text-emerald-400">
                <span>Answered:</span>
                <span className="font-mono font-bold">{summaryCounts.answered}</span>
              </div>
              <div className="flex justify-between items-center text-purple-300">
                <span>Marked for Review:</span>
                <span className="font-mono font-bold">{summaryCounts.marked}</span>
              </div>
              <div className="flex justify-between items-center text-amber-400">
                <span>Unanswered / Skipped:</span>
                <span className="font-mono font-bold">{25 - summaryCounts.answered}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-navy-800">
                <span>Remaining Time:</span>
                <span className="font-mono font-bold text-cyan-300">{formatTime(remainingSeconds)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center mb-6 leading-relaxed">
              Once submitted, you will not be able to change or review your responses. Are you sure you wish to conclude your attempt?
            </p>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-750 text-slate-300 text-xs font-semibold transition"
              >
                Back to Exam
              </button>
              <button
                type="button"
                onClick={() => submitExam(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold tracking-wide transition shadow-lg shadow-emerald-600/30"
              >
                Confirm & Submit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

