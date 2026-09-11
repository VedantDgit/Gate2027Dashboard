'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGateStore } from '@/store/useGateStore';
import {
  Flame,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Trophy,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface MonthStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export const MonthStreakModal: React.FC<MonthStreakModalProps> = ({
  isOpen,
  onClose,
  initialDate = new Date(),
}) => {
  const { studySessions, pyqRecords, getSubject, getTopic } = useGateStore();

  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth()); // 0-11
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  // Map activities by date YYYY-MM-DD
  const activityMap = new Map<
    string,
    {
      minutes: number;
      pyqs: number;
      sessions: typeof studySessions;
      pyqList: typeof pyqRecords;
    }
  >();
  const activeDateSet = new Set<string>();

  for (const session of studySessions) {
    const dateStr = session.date.split('T')[0];
    const curr = activityMap.get(dateStr) || { minutes: 0, pyqs: 0, sessions: [], pyqList: [] };
    curr.minutes += session.durationMinutes;
    curr.pyqs += session.pyqsSolved || 0;
    curr.sessions.push(session);
    activityMap.set(dateStr, curr);
    activeDateSet.add(dateStr);
  }

  for (const pyq of pyqRecords) {
    const dateStr = pyq.date;
    const curr = activityMap.get(dateStr) || { minutes: 0, pyqs: 0, sessions: [], pyqList: [] };
    curr.pyqs += 1;
    curr.pyqList.push(pyq);
    activityMap.set(dateStr, curr);
    activeDateSet.add(dateStr);
  }

  // Calculate Overall Streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  const checkDate = activeDateSet.has(todayStr)
    ? new Date(today)
    : activeDateSet.has(yesterdayStr)
    ? new Date(yesterday)
    : null;

  if (checkDate) {
    const cur = new Date(checkDate);
    while (activeDateSet.has(cur.toISOString().split('T')[0])) {
      currentStreak++;
      cur.setDate(cur.getDate() - 1);
    }
  }

  // All-time longest streak
  const sortedDates = Array.from(activeDateSet).sort();
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

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
    setSelectedDayDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
    setSelectedDayDate(null);
  };

  // Generate days for the selected month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun

  const monthName = firstDayOfMonth.toLocaleDateString('en-US', { month: 'long' });

  // Calculate monthly stats
  let monthActiveDays = 0;
  let monthStudyMinutes = 0;
  let monthPYQs = 0;
  let monthMaxStreak = 0;
  let curMonthStreak = 0;

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const act = activityMap.get(dateStr);
    if (act && (act.minutes > 0 || act.pyqs > 0)) {
      monthActiveDays++;
      monthStudyMinutes += act.minutes;
      monthPYQs += act.pyqs;
      curMonthStreak++;
      if (curMonthStreak > monthMaxStreak) monthMaxStreak = curMonthStreak;
    } else {
      curMonthStreak = 0;
    }
  }

  const monthStudyHours = Number((monthStudyMinutes / 60).toFixed(1));
  const monthConsistencyPercent = Math.round((monthActiveDays / daysInMonth) * 100);

  // Selected day details
  const selectedDayActivity = selectedDayDate ? activityMap.get(selectedDayDate) : null;
  const selectedDayFormatted = selectedDayDate
    ? new Date(selectedDayDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  // Streak Milestones
  const milestones = [
    { days: 3, label: '3-Day Spark', icon: '🔥', desc: 'Ignite study momentum' },
    { days: 7, label: '7-Day Velocity', icon: '⚡', desc: '1 Full Week of Consistency' },
    { days: 14, label: '14-Day Vanguard', icon: '🌟', desc: '2 Weeks of Deep Problem Solving' },
    { days: 30, label: '30-Day Master', icon: '🏆', desc: '1 Full Month Daily Discipline' },
    { days: 60, label: '60-Day Titan', icon: '👑', desc: 'GATE 2027 Top 1% Habit' },
  ];

  const nextMilestone = milestones.find((m) => m.days > currentStreak) || milestones[milestones.length - 1];
  const milestoneProgress = Math.min(100, Math.round((currentStreak / nextMilestone.days) * 100));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-md shadow-amber-500/10">
            <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-white">Month-Wise Streak & Consistency Matrix</span>
            <span className="text-xs font-normal text-slate-400">Track day-by-day active problem solving and study habits</span>
          </div>
        </div>
      }
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Streak Showcase Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-900/10 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Current Streak</span>
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {currentStreak} <span className="text-sm font-semibold text-amber-300">Days</span>
            </div>
            <span className="text-[10px] text-amber-300/80 block">
              {currentStreak > 0 ? 'Active & Burning 🔥' : 'Start today!'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-purple-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Longest Run</span>
              <Trophy className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {longestStreak} <span className="text-sm font-semibold text-purple-300">Days</span>
            </div>
            <span className="text-[10px] text-slate-400 block">Personal Best</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-sky-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Month Study</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {monthStudyHours} <span className="text-sm font-semibold text-sky-300">Hours</span>
            </div>
            <span className="text-[10px] text-slate-400 block">in {monthName}</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Month Active</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              {monthActiveDays} <span className="text-sm font-semibold text-emerald-300">/ {daysInMonth}</span>
            </div>
            <span className="text-[10px] text-slate-400 block">{monthConsistencyPercent}% Consistency</span>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next Milestone: {nextMilestone.icon} {nextMilestone.label} ({nextMilestone.days} Days)</span>
            </span>
            <span className="font-mono text-amber-400 font-bold">{currentStreak} / {nextMilestone.days} days ({milestoneProgress}%)</span>
          </div>
          <ProgressBar value={milestoneProgress} height={6} color="bg-gradient-to-r from-amber-500 to-amber-300" />
        </div>

        {/* Month Navigator Header */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Month</span>
          </button>

          <div className="text-center">
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center justify-center gap-2">
              <CalendarIcon className="w-4 h-4 text-sky-400" />
              <span>{monthName} {currentYear}</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {monthActiveDays} active study days • {monthPYQs} PYQs solved
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-colors flex items-center gap-1 text-xs font-semibold"
          >
            <span className="hidden sm:inline">Next Month</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Full Month Calendar Matrix */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-white/5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots for starting day of week */}
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-transparent opacity-0 pointer-events-none" />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayActivity = activityMap.get(dateStr);
              const isActive = !!dayActivity && (dayActivity.minutes > 0 || dayActivity.pyqs > 0);
              const isToday = dateStr === todayStr;
              const isSelected = selectedDayDate === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayDate(dateStr)}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                    isSelected
                      ? 'ring-2 ring-sky-400 border-sky-400 bg-sky-950/40 shadow-lg shadow-sky-500/10'
                      : isToday
                      ? 'border-sky-500/60 bg-slate-900/90 shadow-md shadow-sky-500/10'
                      : isActive
                      ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-slate-900/30 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold ${
                        isToday
                          ? 'px-1.5 py-0.5 rounded-md bg-sky-500 text-slate-950'
                          : isActive
                          ? 'text-emerald-400 font-black'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    )}
                  </div>

                  {isActive ? (
                    <div className="space-y-0.5">
                      {dayActivity.minutes > 0 && (
                        <div className="text-[10px] font-mono font-semibold text-sky-300 leading-tight truncate">
                          {Math.floor(dayActivity.minutes / 60)}h {dayActivity.minutes % 60}m
                        </div>
                      )}
                      {dayActivity.pyqs > 0 && (
                        <div className="text-[9px] font-mono font-semibold text-emerald-400 leading-tight">
                          +{dayActivity.pyqs} PYQs
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] text-slate-600 font-mono italic">Rest</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Activity Drilldown Details */}
        {selectedDayDate && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-bold text-white">{selectedDayFormatted}</span>
              </div>
              <button
                onClick={() => setSelectedDayDate(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close Day Drilldown
              </button>
            </div>

            {selectedDayActivity && (selectedDayActivity.minutes > 0 || selectedDayActivity.pyqs > 0) ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Time</span>
                    <span className="text-lg font-black text-sky-400">
                      {Math.floor(selectedDayActivity.minutes / 60)}h {selectedDayActivity.minutes % 60}m
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">PYQs Solved</span>
                    <span className="text-lg font-black text-emerald-400">
                      {selectedDayActivity.pyqs} Questions
                    </span>
                  </div>
                </div>

                {/* Session Breakdown List */}
                {selectedDayActivity.sessions.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
                      Study Sessions on this Date:
                    </span>
                    {selectedDayActivity.sessions.map((sess) => {
                      const sub = getSubject(sess.subjectId);
                      const top = getTopic(sess.topicId);
                      return (
                        <div
                          key={sess.id}
                          className="p-3 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">[{sess.branch}] {top?.name || 'Study Block'}</span>
                            <span className="text-slate-400 text-[11px] block">({sub?.name})</span>
                          </div>
                          <span className="font-mono text-sky-400 font-bold">{sess.durationMinutes} mins</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400 italic">
                No study sessions or PYQs were recorded on this date.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
