'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Timer, Play, Pause, RotateCcw, Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useGateStore } from '@/store/useGateStore';
import { triggerConfetti } from '@/components/ui/Confetti';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete?: (data: { subjectId: string; topicId: string; durationMinutes: number }) => void;
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  onSessionComplete,
}) => {
  const { subjects, addStudySession, getSubject } = useGateStore();

  const [modeMinutes, setModeMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState(subjects[0]?.topics[0]?.id || '');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const subject = getSubject(selectedSubjectId) || subjects[0] || { id: '', branch: 'DA', name: 'Subject', topics: [] };

  useEffect(() => {
    if (subjects.length > 0 && !subjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (subject.topics.length > 0 && !subject.topics.some((t) => t.id === selectedTopicId)) {
      setSelectedTopicId(subject.topics[0].id);
    }
  }, [selectedSubjectId, subject, selectedTopicId]);

  const setTimerDuration = (mins: number) => {
    setIsRunning(false);
    setModeMinutes(mins);
    setTimeLeft(mins * 60);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsFinished(true);
      triggerConfetti();
      if (soundEnabled && typeof window !== 'undefined') {
        try {
          const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5 note
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } catch (e) {
          console.warn('Audio not allowed without gesture', e);
        }
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(modeMinutes * 60);
    setIsFinished(false);
  };

  const handleLogCompletedSession = () => {
    addStudySession({
      subjectId: selectedSubjectId,
      topicId: selectedTopicId,
      branch: subject.branch,
      date: new Date().toISOString(),
      durationMinutes: modeMinutes,
      questionsSolved: Math.round(modeMinutes / 6),
      pyqsSolved: Math.round(modeMinutes / 12),
      confidenceBefore: 3,
      confidenceAfter: 4,
      notes: `Completed ${modeMinutes}-minute deep study block.`,
    });

    if (onSessionComplete) {
      onSessionComplete({
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
        durationMinutes: modeMinutes,
      });
    }

    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSeconds = modeMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Timer className="w-4 h-4" />
          </div>
          <span>Study Timer & Focus Engine</span>
        </div>
      }
      subtitle="Structured deep work intervals designed for intense GATE problem solving"
      maxWidth="xl"
    >
      <div className="flex flex-col items-center">
        {/* Preset Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {[
            { label: '25m Focus', mins: 25 },
            { label: '50m Deep Study', mins: 50 },
            { label: '90m GATE Block', mins: 90 },
            { label: '15m Sprint', mins: 15 },
          ].map((preset) => (
            <button
              key={preset.mins}
              onClick={() => setTimerDuration(preset.mins)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                modeMinutes === preset.mins
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-md shadow-sky-500/10'
                  : 'bg-slate-900/80 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-sky-400 border-white/10'
                : 'bg-slate-900 text-slate-600 border-white/5'
            }`}
            title="Toggle notification chime"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-64 h-64 flex items-center justify-center my-2">
          <svg width={240} height={240} className="rotate-[-90deg]">
            <circle
              cx={120}
              cy={120}
              r={radius}
              stroke="rgba(255, 255, 255, 0.06)"
              strokeWidth={10}
              fill="transparent"
            />
            <circle
              cx={120}
              cy={120}
              r={radius}
              stroke={isFinished ? '#34d399' : '#38bdf8'}
              strokeWidth={10}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-4xl font-extrabold font-mono text-white tracking-wider">
              {formattedTime}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">
              {isFinished ? 'Session Completed!' : isRunning ? 'Focusing...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Focus Target Select */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 mb-6">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Active Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.branch}] {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Active Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              {subject.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Start Focus
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {isFinished && (
            <button
              onClick={handleLogCompletedSession}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 animate-bounce"
            >
              <Check className="w-4 h-4" /> Log Session
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
