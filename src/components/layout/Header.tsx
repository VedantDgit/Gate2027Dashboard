'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGateStore } from '@/store/useGateStore';
import {
  Flame,
  Clock,
  Plus,
  Moon,
  Sun,
  Settings,
  Sparkles,
  Calendar,
  Search,
  Timer,
} from 'lucide-react';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { StudyTimerModal } from '@/components/modals/StudyTimerModal';
import { MonthStreakModal } from '@/components/modals/MonthStreakModal';

interface HeaderProps {
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const { settings, updateSettings, getOverallStats, getDynamicInsight } = useGateStore();
  const stats = getOverallStats();
  const dynamicInsight = getDynamicInsight();

  const [isLogSessionOpen, setIsLogSessionOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  // Calculate days remaining to target exam
  const targetDateObj = new Date(settings.targetExamDate || '2027-02-06');
  const now = new Date();
  const diffTime = targetDateObj.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
    if (typeof document !== 'undefined') {
      if (nextTheme === 'light') {
        document.documentElement.classList.add('light');
      } else {
        document.documentElement.classList.remove('light');
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#090c10]/80 backdrop-blur-xl px-4 lg:px-8 py-3 transition-colors">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Countdown & Dynamic Intelligence Ticker */}
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Countdown Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/30 text-sky-300 shadow-inner shrink-0">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-xs font-mono font-bold tracking-tight">
                {daysLeft} DAYS TO GATE 2027
              </span>
            </div>

            {/* Preparation Intelligence Insight */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-white/5 text-slate-300 text-xs truncate max-w-xl">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{dynamicInsight}</span>
            </div>
          </div>

          {/* Right: Actions, Streaks, Timer, Log Session & Theme */}
          <div className="flex items-center gap-2.5 ml-auto">
            {/* Streak Indicator (Click to open Month-Wise Streak Matrix) */}
            <button
              onClick={() => setIsStreakModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                stats.currentStreak > 0
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/10'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/10 hover:border-amber-500/30'
              }`}
              title="Click to view Month-Wise Streak & Consistency Matrix"
            >
              <Flame
                className={`w-4 h-4 ${stats.currentStreak > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-amber-500/70'}`}
              />
              <span>{stats.currentStreak}d streak</span>
            </button>

            {/* Quick Timer Launcher */}
            <button
              onClick={() => setIsTimerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold transition-all hover:border-sky-500/40"
              title="Launch Pomodoro Focus Timer"
            >
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Timer</span>
            </button>

            {/* Log Study Session CTA */}
            <button
              onClick={() => setIsLogSessionOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Session</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-colors"
              aria-label="Toggle theme"
            >
              {settings.theme === 'light' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Settings Link */}
            <Link
              href="/settings"
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Global Modals */}
      <LogSessionModal isOpen={isLogSessionOpen} onClose={() => setIsLogSessionOpen(false)} />
      <StudyTimerModal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />
      <MonthStreakModal isOpen={isStreakModalOpen} onClose={() => setIsStreakModalOpen(false)} />
    </>
  );
};
