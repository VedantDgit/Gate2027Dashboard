'use client';

import React, { useState, useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import {
  Trophy,
  Flame,
  Clock,
  Target,
  FlaskConical,
  Award,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { GoalItem } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { triggerConfetti } from '@/components/ui/Confetti';

export default function AchievementsPage() {
  const { hydrate, isHydrated, achievements, goals, addGoal, toggleGoal, deleteGoal, getOverallStats } =
    useGateStore();

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetMetric, setTargetMetric] = useState<GoalItem['targetMetric']>('study_hours');
  const [targetValue, setTargetValue] = useState(50);
  const [unit, setUnit] = useState('hours');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [goalBranch, setGoalBranch] = useState<'CS' | 'DA' | 'GENERAL'>('GENERAL');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) return null;

  const stats = getOverallStats();

  // Dynamic achievement status computation
  const liveAchievements = achievements.map((ach) => {
    let current = ach.progress;
    let unlocked = !!ach.unlockedAt;

    if (ach.id === 'ach-1') {
      current = stats.currentStreak;
      if (current >= 7 && !unlocked) unlocked = true;
    } else if (ach.id === 'ach-2') {
      current = stats.totalStudyHours;
      if (current >= 50 && !unlocked) unlocked = true;
    } else if (ach.id === 'ach-3') {
      current = stats.totalPYQsSolved;
      if (current >= 100 && !unlocked) unlocked = true;
    } else if (ach.id === 'ach-4') {
      current = stats.totalPYQsSolved;
      if (current >= 500 && !unlocked) unlocked = true;
    } else if (ach.id === 'ach-5') {
      current = stats.mockTestsCount;
      if (current >= 1 && !unlocked) unlocked = true;
    } else if (ach.id === 'ach-6') {
      current = stats.pyqAccuracyPercent;
      if (current >= 75 && stats.totalPYQsSolved >= 50 && !unlocked) unlocked = true;
    } else if (ach.id === 'ach-7') {
      current = stats.totalStudyHours;
      if (current >= 100 && !unlocked) unlocked = true;
    } else if (ach.id === 'ach-8') {
      current = stats.overallProgressPercent;
      if (current >= 100 && !unlocked) unlocked = true;
    }

    return { ...ach, progress: current, isUnlocked: unlocked };
  });

  const unlockedCount = liveAchievements.filter((a) => a.isUnlocked).length;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    addGoal({
      title: goalTitle.trim(),
      targetMetric,
      targetValue: Number(targetValue) || 10,
      currentValue: 0,
      unit: unit.trim() || 'units',
      deadline,
      branch: goalBranch,
    });

    setGoalTitle('');
    setIsAddGoalOpen(false);
  };

  const handleToggleGoal = (id: string, currentlyCompleted: boolean) => {
    toggleGoal(id);
    if (!currentlyCompleted) triggerConfetti();
  };

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0e1420] via-[#121927] to-[#0a0d14] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Trophy className="w-7 h-7 text-amber-400" />
                <span>Achievements & Milestone Goals</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Unlocked {unlockedCount} of {liveAchievements.length} preparation badges. Stay accountable to hard targets.
              </p>
            </div>

            <button
              onClick={() => setIsAddGoalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-500 hover:from-amber-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 self-start sm:self-auto transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Target Goal</span>
            </button>
          </div>

          {/* Badges Gallery */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Milestone Badges ({unlockedCount}/{liveAchievements.length} Unlocked)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {liveAchievements.map((badge) => {
                const percent = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`p-5 rounded-3xl border transition-all space-y-3 flex flex-col justify-between ${
                      badge.isUnlocked
                        ? 'bg-gradient-to-b from-[#181a24] to-[#10121a] border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : 'bg-[#0f141c]/60 border-white/5 opacity-70'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                            badge.isUnlocked
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-900 text-slate-500 border border-white/5'
                          }`}
                        >
                          <Trophy className="w-5 h-5" />
                        </div>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            badge.isUnlocked
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {badge.isUnlocked ? 'Unlocked ✓' : 'Locked'}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{badge.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>Progress</span>
                        <span className="text-slate-200">
                          {badge.progress.toFixed(0)} / {badge.maxProgress}
                        </span>
                      </div>
                      <ProgressBar
                        value={percent}
                        height={5}
                        color={badge.isUnlocked ? 'bg-amber-400' : 'bg-slate-600'}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Custom Goals */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-400" />
                <span>Target Goals & Accountability Benchmarks ({goals.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));

                return (
                  <div
                    key={goal.id}
                    className={`p-5 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                      goal.completed
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-[#0f141c]/90 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold">
                            {goal.branch}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Target: {goal.deadline}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                      </div>

                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                        <span className="font-bold text-sky-400">{percent}%</span>
                      </div>
                      <ProgressBar
                        value={percent}
                        height={6}
                        color={goal.completed ? 'bg-emerald-400' : 'bg-sky-400'}
                      />
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                      <button
                        onClick={() => handleToggleGoal(goal.id, goal.completed)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          goal.completed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{goal.completed ? 'Goal Achieved ✓' : 'Mark Achieved'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />

      {/* Add Custom Goal Modal */}
      <Modal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <span>Create Target Preparation Milestone</span>
          </div>
        }
        maxWidth="lg"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Goal Description
            </label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="E.g., Complete 300 GATE CS+DA PYQs"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Metric
              </label>
              <select
                value={targetMetric}
                onChange={(e) => setTargetMetric(e.target.value as typeof targetMetric)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
              >
                <option value="study_hours">Study Hours</option>
                <option value="pyqs">PYQs Solved</option>
                <option value="mock_tests">Mock Tests / Marks</option>
                <option value="topics_completed">Topics Mastered</option>
                <option value="custom">Custom Metric</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Value
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Unit Name
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="hours / pyqs / marks"
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Branch Tag
            </label>
            <select
              value={goalBranch}
              onChange={(e) => setGoalBranch(e.target.value as typeof goalBranch)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            >
              <option value="GENERAL">General Milestone</option>
              <option value="DA">Data Science & AI (DA)</option>
              <option value="CS">Computer Science (CS)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddGoalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
