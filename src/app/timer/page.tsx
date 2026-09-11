'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Timer, Play, Pause, RotateCcw, Check, Sparkles, Volume2, VolumeX, Flame } from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';
import { LogSessionModal } from '@/components/modals/LogSessionModal';

export default function TimerPage() {
  const { hydrate, isHydrated, subjects, addStudySession, getOverallStats, getSubject } = useGateStore();
  const stats = getOverallStats();

  const [modeMinutes, setModeMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState(subjects[0]?.topics[0]?.id || '');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const subject = getSubject(selectedSubjectId) || subjects[0] || { id: '', branch: 'DA', name: 'Subject', topics: [] };

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  if (!isHydrated) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalSeconds = modeMinutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-5xl mx-auto w-full flex flex-col items-center justify-center">
          {/* Top Headline */}
          <div className="text-center space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GATE DEEP WORK FOCUS ENGINE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Study Timer & Focus Terminal
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminate distractions and execute timed problem-solving blocks calibrated for GATE standard 3-minute questions.
            </p>
          </div>

          {/* Timer Card Container */}
          <div className="w-full max-w-xl p-8 rounded-3xl bg-[#0f141c]/90 border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col items-center space-y-6">
            {/* Mode Presets */}
            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { label: '25m Focus Block', mins: 25 },
                { label: '50m Deep Study', mins: 50 },
                { label: '90m GATE Marathon', mins: 90 },
                { label: '15m Quick Drill', mins: 15 },
              ].map((p) => (
                <button
                  key={p.mins}
                  onClick={() => setTimerDuration(p.mins)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    modeMinutes === p.mins
                      ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-lg shadow-sky-500/20'
                      : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Circular SVG Timer */}
            <div className="relative w-80 h-80 flex items-center justify-center my-2">
              <svg width={300} height={300} className="rotate-[-90deg]">
                <circle
                  cx={150}
                  cy={150}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={12}
                  fill="transparent"
                />
                <circle
                  cx={150}
                  cy={150}
                  r={radius}
                  stroke={isFinished ? '#34d399' : '#38bdf8'}
                  strokeWidth={12}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                <span className="text-5xl sm:text-6xl font-black font-mono text-white tracking-wider">
                  {formattedTime}
                </span>
                <span className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">
                  {isFinished ? 'Interval Complete!' : isRunning ? 'In Focus Mode' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Subject and Topic selection */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Active Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
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
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-xl transition-all active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 shadow-sky-500/25'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-current" /> Pause Session
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" /> Start Deep Work
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft(modeMinutes * 60);
                  setIsFinished(false);
                }}
                className="p-3 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {isFinished && (
                <button
                  onClick={() => setIsLogModalOpen(true)}
                  className="px-6 py-3 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center gap-2 animate-bounce"
                >
                  <Check className="w-5 h-5" /> Log Session
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />

      {/* Log Session Modal */}
      <LogSessionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        defaultSubjectId={selectedSubjectId}
        defaultTopicId={selectedTopicId}
        defaultDurationMinutes={modeMinutes}
      />
    </div>
  );
}
