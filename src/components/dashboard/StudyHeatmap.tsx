'use client';

import React, { useState } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Calendar, Flame, Clock, Sparkles, Trophy, CheckCircle2, TrendingUp } from 'lucide-react';

export const StudyHeatmap: React.FC = () => {
  const { studySessions, pyqRecords } = useGateStore();
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    formattedDate: string;
    minutes: number;
    pyqs: number;
    sessionsCount: number;
  } | null>(null);

  // Map study minutes & PYQ counts by date (YYYY-MM-DD)
  const activityMap = new Map<string, { minutes: number; pyqs: number; sessionsCount: number }>();
  const activeDateSet = new Set<string>();

  for (const session of studySessions) {
    const dateStr = session.date.split('T')[0];
    const curr = activityMap.get(dateStr) || { minutes: 0, pyqs: 0, sessionsCount: 0 };
    curr.minutes += session.durationMinutes;
    curr.pyqs += session.pyqsSolved || 0;
    curr.sessionsCount += 1;
    activityMap.set(dateStr, curr);
    activeDateSet.add(dateStr);
  }

  for (const pyq of pyqRecords) {
    const dateStr = pyq.date;
    const curr = activityMap.get(dateStr) || { minutes: 0, pyqs: 0, sessionsCount: 0 };
    curr.pyqs += 1;
    activityMap.set(dateStr, curr);
    activeDateSet.add(dateStr);
  }

  // Generate 52 weeks aligned to Sunday (like GitHub)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Total 53 columns (weeks)
  const totalWeeks = 53;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (52 * 7 + todayDayOfWeek));

  const weeks: { dateStr: string; dateObj: Date; formattedDate: string; isFuture: boolean }[][] = [];
  const monthLabels: { label: string; colIndex: number }[] = [];

  let cursor = new Date(startDate);
  let lastMonth = -1;

  for (let w = 0; w < totalWeeks; w++) {
    const weekDays = [];
    let newMonthInWeek: string | null = null;

    for (let d = 0; d < 7; d++) {
      const dObj = new Date(cursor);
      const dateStr = dObj.toISOString().split('T')[0];
      const isFuture = dObj > today;
      const formattedDate = dObj.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (!isFuture && dObj.getDate() <= 7 && dObj.getMonth() !== lastMonth) {
        newMonthInWeek = dObj.toLocaleDateString('en-US', { month: 'short' });
        lastMonth = dObj.getMonth();
      }

      weekDays.push({ dateStr, dateObj: dObj, formattedDate, isFuture });
      cursor.setDate(cursor.getDate() + 1);
    }

    if (newMonthInWeek) {
      const prevCol = monthLabels.length > 0 ? monthLabels[monthLabels.length - 1].colIndex : -10;
      if (w - prevCol >= 3) {
        monthLabels.push({ label: newMonthInWeek, colIndex: w });
      }
    }

    weeks.push(weekDays);
  }

  // Calculate Streak Analytics
  const sortedDates = Array.from(activeDateSet).sort();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let currentStreakStart = '';
  let currentStreakEnd = '';

  const checkDate = activeDateSet.has(todayStr)
    ? new Date(today)
    : activeDateSet.has(yesterdayStr)
    ? new Date(yesterday)
    : null;

  if (checkDate) {
    currentStreakEnd = checkDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const cur = new Date(checkDate);
    while (activeDateSet.has(cur.toISOString().split('T')[0])) {
      currentStreak++;
      currentStreakStart = cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      cur.setDate(cur.getDate() - 1);
    }
  }

  // Longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let prevTime: number | null = null;

  for (const dStr of sortedDates) {
    const dTime = new Date(dStr).getTime();
    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((dTime - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevTime = dTime;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Active days this month
  const currentMonthIdx = today.getMonth();
  const currentYearNum = today.getFullYear();
  const activeThisMonth = Array.from(activeDateSet).filter((dStr) => {
    const [y, m] = dStr.split('-').map(Number);
    return y === currentYearNum && m === currentMonthIdx + 1;
  }).length;

  const currentMonthName = today.toLocaleDateString('en-US', { month: 'long' });
  const totalActiveDays = activeDateSet.size;
  const totalMinutes = Array.from(activityMap.values()).reduce((acc, c) => acc + c.minutes, 0);

  const getIntensityClass = (minutes: number, isFuture: boolean) => {
    if (isFuture) return 'opacity-0 pointer-events-none';
    if (minutes === 0) return 'bg-[#161b22] border-white/5 hover:border-white/20';
    if (minutes < 45) return 'bg-sky-950/80 border-sky-800/60 text-sky-300';
    if (minutes < 90) return 'bg-sky-700 border-sky-500/70 text-white';
    if (minutes < 150) return 'bg-sky-500 border-sky-400 text-white';
    return 'bg-emerald-400 border-emerald-300 text-slate-950 shadow-sm shadow-emerald-400/30';
  };

  return (
    <div className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 backdrop-blur-sm space-y-6">
      {/* Header & Streak Quick Cards */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Study Consistency & Activity Graph
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            GitHub-style contribution ledger tracking 365-day problem solving telemetry
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 self-start lg:self-auto bg-slate-900/60 px-3 py-1.5 rounded-xl border border-white/5">
          <span>Less</span>
          <span className="w-3 h-3 rounded-[3px] bg-[#161b22] border border-white/5" />
          <span className="w-3 h-3 rounded-[3px] bg-sky-950/80 border border-sky-800/60" />
          <span className="w-3 h-3 rounded-[3px] bg-sky-700" />
          <span className="w-3 h-3 rounded-[3px] bg-sky-500" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-400" />
          <span>More</span>
        </div>
      </div>

      {/* GitHub Streak Stats Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Current Streak */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-black font-mono text-white">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </div>
            <span className="text-[11px] font-semibold text-amber-400 block truncate">
              {currentStreak > 0 ? `${currentStreakStart} – ${currentStreakEnd}` : 'Current Streak'}
            </span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-black font-mono text-white">
              {longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}
            </div>
            <span className="text-[11px] font-semibold text-purple-400 block truncate">
              Longest Streak
            </span>
          </div>
        </div>

        {/* Total Active Days */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-black font-mono text-white">
              {totalActiveDays} {totalActiveDays === 1 ? 'Day' : 'Days'}
            </div>
            <span className="text-[11px] font-semibold text-sky-400 block truncate">
              Past 365 Days
            </span>
          </div>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-lg sm:text-xl font-black font-mono text-white">
              {activeThisMonth} {activeThisMonth === 1 ? 'Day' : 'Days'}
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 block truncate">
              In {currentMonthName}
            </span>
          </div>
        </div>
      </div>

      {/* GitHub 52-Week Grid with Month Headers and Weekday Labels */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 overflow-x-auto custom-scrollbar">
        <div className="min-w-[780px] select-none">
          {/* Month Header Labels */}
          <div className="flex text-[11px] font-semibold font-mono text-slate-400 mb-2 pl-7 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                style={{ left: `${m.colIndex * 14.5 + 28}px` }}
                className="absolute text-[10px] uppercase tracking-wider text-slate-400"
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid Rows with Weekday Labels (Mon, Wed, Fri) */}
          <div className="flex gap-1.5 items-start">
            {/* Weekday indicators column */}
            <div className="flex flex-col gap-1 text-[9px] font-mono text-slate-500 pr-1 select-none pt-0.5">
              <span className="h-3 sm:h-3.5 leading-none"></span>
              <span className="h-3 sm:h-3.5 leading-none flex items-center">Mon</span>
              <span className="h-3 sm:h-3.5 leading-none"></span>
              <span className="h-3 sm:h-3.5 leading-none flex items-center">Wed</span>
              <span className="h-3 sm:h-3.5 leading-none"></span>
              <span className="h-3 sm:h-3.5 leading-none flex items-center">Fri</span>
              <span className="h-3 sm:h-3.5 leading-none"></span>
            </div>

            {/* 53 Columns of 7 Days */}
            <div className="flex gap-1 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => {
                    const data = activityMap.get(day.dateStr) || {
                      minutes: 0,
                      pyqs: 0,
                      sessionsCount: 0,
                    };
                    const isHovered = hoveredDay?.date === day.dateStr;

                    return (
                      <div
                        key={day.dateStr}
                        onMouseEnter={() =>
                          !day.isFuture &&
                          setHoveredDay({
                            date: day.dateStr,
                            formattedDate: day.formattedDate,
                            minutes: data.minutes,
                            pyqs: data.pyqs,
                            sessionsCount: data.sessionsCount,
                          })
                        }
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-[3px] border transition-all ${
                          !day.isFuture ? 'cursor-pointer' : ''
                        } ${getIntensityClass(data.minutes, day.isFuture)} ${
                          isHovered ? 'ring-2 ring-white scale-125 z-10' : ''
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Tooltip Status Footer */}
      <div className="min-h-[28px] text-xs font-mono px-3 py-2 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-slate-300">
        {hoveredDay ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              {hoveredDay.formattedDate}
            </span>
            <span className="text-slate-500">•</span>
            <span className={hoveredDay.minutes > 0 ? 'text-sky-400 font-semibold' : 'text-slate-400'}>
              {hoveredDay.minutes > 0
                ? `${Math.floor(hoveredDay.minutes / 60)}h ${hoveredDay.minutes % 60}m studied`
                : '0 min studied'}
            </span>
            <span className="text-slate-500">•</span>
            <span className={hoveredDay.pyqs > 0 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {hoveredDay.pyqs} {hoveredDay.pyqs === 1 ? 'PYQ' : 'PYQs'} solved
            </span>
            {hoveredDay.sessionsCount > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-purple-300">
                  {hoveredDay.sessionsCount} {hoveredDay.sessionsCount === 1 ? 'session' : 'sessions'}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Hover over any day square in the 52-week calendar to inspect that date&apos;s exact study session metrics.</span>
          </div>
        )}

        <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline-block">
          Total Recorded: {(totalMinutes / 60).toFixed(1)}h
        </span>
      </div>
    </div>
  );
};
