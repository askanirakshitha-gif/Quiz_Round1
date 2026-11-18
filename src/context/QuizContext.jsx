import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { officialQuestions, getExamQuestions } from '../data/questionsData';
import {
  initializeQuizSession,
  saveExamAnswers,
  recordSecurityViolation,
  submitFinalQuiz
} from '../lib/supabaseClient';

const QuizContext = createContext(null);

const STORAGE_KEY = 'tech_habba_exam_state';
const EXAM_DURATION_SECONDS = 30 * 60; // 30 minutes

export function QuizProvider({ children }) {
  // Participant & Session
  const [participant, setParticipant] = useState(() => {
    try {
      const stored = localStorage.getItem('tech_habba_current_participant');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem('tech_habba_current_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Questions: Guaranteed sequential order (1 to 25)
  const [questions, setQuestions] = useState(officialQuestions);

  // Current active question index (0 to 24)
  const [currentIndex, setCurrentIndex] = useState(0);

  // Answers map: { [questionId]: { option: 'A', markedForReview: false, answeredAt: ... } }
  const [answers, setAnswers] = useState(() => {
    try {
      const stored = localStorage.getItem('tech_habba_exam_answers');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Visited question ids set
  const [visited, setVisited] = useState(() => {
    try {
      const stored = localStorage.getItem('tech_habba_exam_visited');
      return stored ? new Set(JSON.parse(stored)) : new Set([officialQuestions[0]?.id || 1]);
    } catch {
      return new Set([1]);
    }
  });

  // Timer: end timestamp stored in localStorage
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_DURATION_SECONDS);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(() => {
    try {
      const stored = localStorage.getItem('tech_habba_exam_result');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Anti-Cheat Violations
  const [violationsCount, setViolationsCount] = useState(() => {
    try {
      const stored = localStorage.getItem('tech_habba_violations_count');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [violationsLog, setViolationsLog] = useState(() => {
    try {
      const stored = localStorage.getItem('tech_habba_violations_log');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeViolationModal, setActiveViolationModal] = useState(null);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Save state on change
  useEffect(() => {
    if (participant) {
      localStorage.setItem('tech_habba_current_participant', JSON.stringify(participant));
    }
  }, [participant]);

  useEffect(() => {
    if (session) {
      localStorage.setItem('tech_habba_current_session', JSON.stringify(session));
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('tech_habba_exam_answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    localStorage.setItem('tech_habba_exam_visited', JSON.stringify(Array.from(visited)));
  }, [visited]);

  useEffect(() => {
    localStorage.setItem('tech_habba_violations_count', violationsCount.toString());
  }, [violationsCount]);

  useEffect(() => {
    localStorage.setItem('tech_habba_violations_log', JSON.stringify(violationsLog));
  }, [violationsLog]);

  // Mark current question as visited
  useEffect(() => {
    if (questions[currentIndex]) {
      setVisited(prev => new Set(prev).add(questions[currentIndex].id));
    }
  }, [currentIndex, questions]);

  // Periodic answer sync to backend (every 15 seconds)
  useEffect(() => {
    if (!isExamActive || !session || !participant) return;
    const interval = setInterval(() => {
      saveExamAnswers(session?.id, participant?.registration_id || participant?.id, answers);
    }, 15000);
    return () => clearInterval(interval);
  }, [isExamActive, session, participant, answers]);

  // Timer Tick & Session Check
  useEffect(() => {
    if (!isExamActive || isSubmitted) return;

    let endTimestamp = localStorage.getItem('tech_habba_exam_endtime');
    if (!endTimestamp) {
      endTimestamp = (Date.now() + EXAM_DURATION_SECONDS * 1000).toString();
      localStorage.setItem('tech_habba_exam_endtime', endTimestamp);
    }

    const timerInterval = setInterval(() => {
      const targetTime = parseInt(endTimestamp, 10);
      const diff = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(timerInterval);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isExamActive, isSubmitted]);

  /**
   * Start or Resume the Exam
   */
  const startExam = async (loggedParticipant) => {
    setParticipant(loggedParticipant);
    const sessionRes = await initializeQuizSession(loggedParticipant);
    const activeSession = sessionRes.session;
    setSession(activeSession);

    // Keep questions in the exact same order (Q1 to Q25)
    const examQs = [...officialQuestions];
    localStorage.setItem('tech_habba_exam_questions', JSON.stringify(examQs));
    setQuestions(examQs);

    // Determine timer
    let endTimestamp = localStorage.getItem('tech_habba_exam_endtime');
    if (!endTimestamp) {
      endTimestamp = (Date.now() + EXAM_DURATION_SECONDS * 1000).toString();
      localStorage.setItem('tech_habba_exam_endtime', endTimestamp);
    }
    const diff = Math.max(0, Math.floor((parseInt(endTimestamp, 10) - Date.now()) / 1000));
    setRemainingSeconds(diff);

    setIsExamActive(true);
    setIsSubmitted(false);
  };

  /**
   * Answer actions
   */
  const selectOption = (questionId, optionKey) => {
    setAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: {
          ...(prev[questionId] || {}),
          option: optionKey,
          answeredAt: new Date().toISOString()
        }
      };
      // Immediately sync with database in background
      if (session && (session.id || participant?.registration_id)) {
        saveExamAnswers(
          session.id,
          participant?.registration_id || participant?.id,
          updated
        );
      }
      return updated;
    });
  };

  const clearOption = (questionId) => {
    setAnswers(prev => {
      const updated = { ...prev };
      if (updated[questionId]) {
        delete updated[questionId].option;
      }
      // Immediately sync with database in background
      if (session && (session.id || participant?.registration_id)) {
        saveExamAnswers(
          session.id,
          participant?.registration_id || participant?.id,
          updated
        );
      }
      return updated;
    });
  };

  const toggleMarkForReview = (questionId) => {
    setAnswers(prev => {
      const current = prev[questionId] || {};
      return {
        ...prev,
        [questionId]: {
          ...current,
          markedForReview: !current.markedForReview
        }
      };
    });
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  };

  /**
   * Anti-Cheat Violation Logger
   */
  const triggerViolation = useCallback(async (violationType, details) => {
    if (!isExamActive || isSubmitted) return;

    setViolationsCount(prev => {
      const newCount = prev + 1;
      const timestamp = new Date().toLocaleTimeString();

      const newLogEntry = {
        type: violationType,
        details,
        count: newCount,
        timestamp
      };

      setViolationsLog(prevLog => [newLogEntry, ...prevLog]);

      // Trigger modal alert for participant
      setActiveViolationModal({
        type: violationType,
        details,
        count: newCount,
        timestamp,
        isFlagged: newCount >= 3
      });

      // Sync to backend asynchronously
      if (session && participant) {
        recordSecurityViolation({
          sessionId: session.id,
          participant,
          violationType,
          details,
          violationNumber: newCount
        });
      }

      return newCount;
    });
  }, [isExamActive, isSubmitted, session, participant]);

  /**
   * Submit Exam
   */
  const submitExam = async (isAuto = false) => {
    if (isSubmitted) return;

    setIsExamActive(false);
    setIsSubmitted(true);
    setShowSubmitConfirmModal(false);

    try {
      let currentPart = participant;
      if (!currentPart) {
        try {
          const stored = localStorage.getItem('tech_habba_current_participant');
          if (stored) currentPart = JSON.parse(stored);
        } catch {}
      }
      let currentSess = session;
      if (!currentSess) {
        try {
          const stored = localStorage.getItem('tech_habba_current_session');
          if (stored) currentSess = JSON.parse(stored);
        } catch {}
      }

      const timeTaken = Math.max(1, Math.min(EXAM_DURATION_SECONDS, EXAM_DURATION_SECONDS - remainingSeconds));
      const result = await submitFinalQuiz({
        sessionId: currentSess?.id || 'sess_' + Date.now(),
        participant: currentPart,
        answers,
        violationCount: violationsCount,
        timeTakenSeconds: timeTaken
      });

      const finalResult = {
        ...result,
        timeTakenSeconds: timeTaken,
        timeTakenFormatted: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`,
        isAutoSubmitted: isAuto,
        submittedAt: new Date().toLocaleString()
      };

      setSubmissionResult(finalResult);
      localStorage.setItem('tech_habba_exam_result', JSON.stringify(finalResult));
      localStorage.removeItem('tech_habba_exam_endtime');

      // Exit fullscreen if active
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {}
      }

      return finalResult;
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const handleAutoSubmit = () => {
    submitExam(true);
  };

  /**
   * Fullscreen Request Handler
   */
  const requestFullscreen = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
      setShowFullscreenWarning(false);
      return true;
    } catch (e) {
      console.warn("Fullscreen request error:", e);
      return false;
    }
  };

  /**
   * Question Status Helper
   */
  const getQuestionStatus = (qId, index) => {
    if (index === currentIndex) return 'current';
    const ans = answers[qId];
    if (ans?.markedForReview) return 'marked';
    if (ans?.option) return 'answered';
    if (visited.has(qId)) return 'not_answered';
    return 'not_visited';
  };

  // Summary counts
  const summaryCounts = {
    answered: Object.values(answers).filter(a => a?.option).length,
    marked: Object.values(answers).filter(a => a?.markedForReview).length,
    notAnswered: questions.filter(q => visited.has(q.id) && !answers[q.id]?.option).length,
    notVisited: questions.filter(q => !visited.has(q.id)).length,
    total: questions.length
  };

  const value = {
    participant,
    session,
    questions,
    currentQuestion: questions[currentIndex],
    currentIndex,
    answers,
    visited,
    remainingSeconds,
    isExamActive,
    isSubmitted,
    submissionResult,
    violationsCount,
    violationsLog,
    activeViolationModal,
    setActiveViolationModal,
    showSubmitConfirmModal,
    setShowSubmitConfirmModal,
    showFullscreenWarning,
    setShowFullscreenWarning,
    isFullscreen,
    setIsFullscreen,
    summaryCounts,
    startExam,
    selectOption,
    clearOption,
    toggleMarkForReview,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    submitExam,
    triggerViolation,
    requestFullscreen,
    getQuestionStatus
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

