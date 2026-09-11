'use client';

import React, { useState } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { ProgressRing } from '@/components/ui/ProgressRing';
import {
  Calendar,
  Flame,
  Clock,
  Target,
  FlaskConical,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { MonthStreakModal } from '@/components/modals/MonthStreakModal';

export const HeroCountdown: React.FC = () => {
  const { settings, getOverallStats, getDynamicInsight } = useGateStore();
  const stats = getOverallStats();
  const insight = getDynamicInsight();

  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);

  const targetDateObj = new Date(settings.targetExamDate || '2027-02-06');
  const now = new Date();
  const diffTime = targetDateObj.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.floor(daysLeft / 7);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0e1420] via-[#121927] to-[#0a0d14] p-6 lg:p-8 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Heading & Countdown */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>GATE 2027 • DUAL BRANCH PREPARATION COMMAND CENTER</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
              GATE 2027 <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">CS + DA</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Target examination: <span className="text-white font-bold">{settings.examMonthDisplay || 'FEBRUARY 2027'}</span>. 
              Engineering-driven preparation operating system tracking comprehensive syllabi, spaced revisions, and weakness intelligence.
            </p>
          </div>

          {/* Countdown Blocks */}
          <div className="grid grid-cols-3 gap-3 max-w-md pt-1">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center shadow-inner">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white block">
                {daysLeft}
              </span>
              <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider">
                Days Remaining
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center shadow-inner">
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-200 block">
                {weeksLeft}
              </span>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                Weeks Left
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsStreakModalOpen(true)}
              className="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/10 hover:border-amber-500/40 text-center shadow-inner transition-all cursor-pointer group hover:scale-105 active:scale-95"
              title="Click to view Month-Wise Streak & Consistency Matrix"
            >
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-400 group-hover:animate-bounce" />
                <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                  {stats.currentStreak}d
                </span>
              </div>
              <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                Active Streak <ArrowUpRight className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
              </span>
            </button>
          </div>

          {/* Dynamic Action Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="truncate font-medium">{insight}</span>
            </div>
            <Link
              href="/syllabus"
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 shrink-0 ml-3"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Triple Progress Rings */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/50 border border-white/5 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Syllabus Completion Telemetry
          </span>

          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {/* Overall Ring */}
            <div className="flex flex-col items-center">
              <ProgressRing
                progress={stats.overallProgressPercent}
                size={110}
                strokeWidth={8}
                color="#38bdf8"
                label="Overall"
              />
              <span className="text-[11px] text-slate-400 mt-2 font-mono">
                {stats.completedTopics}/{stats.totalTopics} Topics
              </span>
            </div>

            {/* CS Ring */}
            <div className="flex flex-col items-center">
              <ProgressRing
                progress={stats.csProgressPercent}
                size={96}
                strokeWidth={7}
                color="#818cf8"
                label="CS Core"
              />
              <span className="text-[11px] text-slate-400 mt-2 font-mono">
                {stats.csCompletedTopics}/{stats.csTotalTopics} Topics
              </span>
            </div>

            {/* DA Ring */}
            <div className="flex flex-col items-center">
              <ProgressRing
                progress={stats.daProgressPercent}
                size={96}
                strokeWidth={7}
                color="#34d399"
                label="DA Core"
              />
              <span className="text-[11px] text-slate-400 mt-2 font-mono">
                {stats.daCompletedTopics}/{stats.daTotalTopics} Topics
              </span>
            </div>
          </div>
        </div>
      </div>

      <MonthStreakModal isOpen={isStreakModalOpen} onClose={() => setIsStreakModalOpen(false)} />
    </section>
  );
};
