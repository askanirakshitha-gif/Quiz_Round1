import React, { useEffect, useState, useRef } from 'react';
import { useQuiz } from '../context/QuizContext';
import {
  AlertTriangle,
  ShieldAlert,
  Maximize2,
  Lock,
  Eye,
  AlertOctagon,
  XCircle,
  CheckCircle2,
  Info
} from 'lucide-react';

export default function AntiCheatMonitor() {
  const {
    isExamActive,
    isSubmitted,
    violationsCount,
    activeViolationModal,
    setActiveViolationModal,
    showFullscreenWarning,
    setShowFullscreenWarning,
    triggerViolation,
    requestFullscreen,
    participant,
    session
  } = useQuiz();

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showSecurityToast = (msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    if (!isExamActive || isSubmitted) return;

    // A. Tab Switching & Visibility Detection
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerViolation(
          'TAB_SWITCH',
          'Participant switched browser tabs or minimized the examination window.'
        );
      }
    };

    const handleWindowBlur = () => {
      // Blur can happen if devtools or another app takes focus
      triggerViolation(
        'WINDOW_BLUR',
        'Window lost focus (another application or floating window was activated).'
      );
    };

    // B. Fullscreen Change Detection
    const handleFullscreenChange = () => {
      const isNowFullscreen = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isNowFullscreen && isExamActive && !isSubmitted) {
        setShowFullscreenWarning(true);
        triggerViolation(
          'FULLSCREEN_EXIT',
          'Participant exited mandatory fullscreen examination mode.'
        );
      }
    };

    // C & D. Keyboard Shortcut Restrictions
    const handleKeyDown = (e) => {
      const key = e.key ? e.key.toUpperCase() : '';
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // F12 or Developer Tools
      if (e.keyCode === 123 || key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        showSecurityToast('Developer tools (F12) are restricted during the examination.');
        triggerViolation('DEVTOOLS_ATTEMPT', 'F12 pressed to access developer inspection tools.');
        return false;
      }

      // PrintScreen Key
      if (key === 'PRINTSCREEN' || e.keyCode === 44) {
        e.preventDefault();
        showSecurityToast('Screen capture shortcut detected and restricted.');
        triggerViolation('SCREENSHOT_ATTEMPT', 'PrintScreen key pressed.');
        return false;
      }

      // Ctrl + Key combinations
      if (ctrlOrMeta) {
        // Block Ctrl+C, Ctrl+V, Ctrl+X
        if (['C', 'V', 'X'].includes(key)) {
          e.preventDefault();
          showSecurityToast(`Clipboard shortcut (Ctrl+${key}) is disabled.`);
          triggerViolation('CLIPBOARD_SHORTCUT', `Ctrl+${key} clipboard operation attempted.`);
          return false;
        }

        // Block Ctrl+U (View Source)
        if (key === 'U') {
          e.preventDefault();
          showSecurityToast('Viewing page source is disabled.');
          triggerViolation('VIEW_SOURCE_ATTEMPT', 'Ctrl+U view source shortcut blocked.');
          return false;
        }

        // Block Ctrl+S (Save Page)
        if (key === 'S') {
          e.preventDefault();
          showSecurityToast('Saving page is disabled.');
          triggerViolation('SAVE_PAGE_ATTEMPT', 'Ctrl+S save shortcut blocked.');
          return false;
        }

        // Block Ctrl+P (Print)
        if (key === 'P') {
          e.preventDefault();
          showSecurityToast('Printing is disabled.');
          triggerViolation('PRINT_ATTEMPT', 'Ctrl+P print dialog blocked.');
          return false;
        }

        // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect Element)
        if (e.shiftKey && ['I', 'J', 'C'].includes(key)) {
          e.preventDefault();
          showSecurityToast(`Developer inspect shortcut (Ctrl+Shift+${key}) is disabled.`);
          triggerViolation('INSPECT_SHORTCUT', `Ctrl+Shift+${key} devtools shortcut blocked.`);
          return false;
        }
      }
    };

    // E. Mouse Restrictions & Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      showSecurityToast('Right-click context menu is restricted during the examination.');
      triggerViolation('CONTEXT_MENU', 'Right-click context menu was triggered.');
      return false;
    };

    // Prevent Copy / Cut / Paste / Drag
    const handleCopy = (e) => {
      e.preventDefault();
      showSecurityToast('Copying question content is not permitted.');
      triggerViolation('COPY_ACTION', 'Direct clipboard copy event triggered.');
    };

    const handleCut = (e) => {
      e.preventDefault();
      showSecurityToast('Cutting content is restricted.');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      showSecurityToast('Pasting text into the exam interface is disabled.');
    };

    const handleDragStart = (e) => {
      e.preventDefault();
    };

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [isExamActive, isSubmitted, triggerViolation, setShowFullscreenWarning]);

  if (!isExamActive || isSubmitted) return null;

  return (
    <>
      {/* 1. Security Alert Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-3 bg-rose-950/90 border border-rose-500/50 backdrop-blur-md text-rose-200 px-4 py-3 rounded-xl shadow-2xl shadow-rose-950/50 animate-bounce transition-all">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 2. Fullscreen Exit Enforcement Overlay Modal */}
      {showFullscreenWarning && (
        <div className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-navy-900 border-2 border-amber-500/80 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-amber-500/20 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-400">
              <AlertTriangle className="w-9 h-9 animate-pulse" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Fullscreen Mode Required
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              You have exited the mandatory full-screen examination environment. This action has been logged in your security audit trail.
            </p>

            <div className="bg-navy-850 border border-amber-500/30 rounded-xl p-3.5 mb-6 text-xs text-amber-300/90 text-left flex items-start space-x-2.5">
              <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Repeated full-screen departures will flag your session for manual evaluation by the TECH HABBA 2.0 Organizing Committee.
              </span>
            </div>

            <button
              onClick={async () => {
                const ok = await requestFullscreen();
                if (ok) setShowFullscreenWarning(false);
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Re-enter Fullscreen to Continue Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Centralized Violation Alert Modal */}
      {activeViolationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-rose-500/60 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl shadow-rose-950/60 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-11 h-11 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  Security Violation Detected
                </h4>
                <p className="text-xs text-rose-300">
                  Violation #{activeViolationModal.count} recorded at {activeViolationModal.timestamp}
                </p>
              </div>
            </div>

            <div className="bg-navy-950/80 border border-navy-750 rounded-xl p-3.5 mb-4 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Event Type:</span>
                <span className="text-rose-400 font-semibold">{activeViolationModal.type}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Team:</span>
                <span className="text-slate-200">{participant?.team_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reg ID:</span>
                <span className="text-slate-200">{participant?.registration_id || 'N/A'}</span>
              </div>
              <p className="text-slate-400 pt-1 text-[11px] leading-relaxed border-t border-navy-800">
                {activeViolationModal.details}
              </p>
            </div>

            {activeViolationModal.isFlagged ? (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 mb-5 text-xs text-rose-200 flex items-start space-x-2">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-rose-300 font-semibold mb-0.5">
                    Session Flagged for Review
                  </strong>
                  You have accumulated {activeViolationModal.count} violations. Your quiz attempt will be reviewed by the Big O Technical Club review panel.
                </div>
              </div>
            ) : (
              <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 mb-5 text-xs text-amber-300/90 flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  Notice: A maximum of 2 warnings are tolerated. Any subsequent violations will result in your session being flagged.
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveViolationModal(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-200 hover:text-white text-xs font-semibold tracking-wider transition-all"
            >
              I Understand & Acknowledge Warning
            </button>
          </div>
        </div>
      )}
    </>
  );
}

