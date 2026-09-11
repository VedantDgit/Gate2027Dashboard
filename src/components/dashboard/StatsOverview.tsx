'use client';

import React from 'react';
import { useGateStore } from '@/store/useGateStore';
import {
  Clock,
  Target,
  FlaskConical,
  RotateCw,
  Flame,
  TrendingUp,
  Award,
  AlertTriangle,
} from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { getOverallStats, getWeeklySummary, getWeaknesses, revisionItems } = useGateStore();
  const stats = getOverallStats();
  const weekly = getWeeklySummary();
  const weaknesses = getWeaknesses();

  const completedRevisions = revisionItems.filter((r) => r.isCompleted).length;
  const pendingRevisions = revisionItems.filter((r) => !r.isCompleted).length;

  const statCards = [
    {
      title: 'Total Study Hours',
      value: `${stats.totalStudyHours}h`,
      subValue: `+${weekly.thisWeekStudyHours}h this week`,
      icon: Clock,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'PYQs Solved & Accuracy',
      value: `${stats.totalPYQsSolved}`,
      subValue: `${stats.pyqAccuracyPercent}% overall accuracy`,
      icon: Target,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Full Length Mocks',
      value: `${stats.mockTestsCount}`,
      subValue: stats.mockTestsCount > 0 ? 'Diagnostic mocks taken' : 'No mocks logged yet',
      icon: FlaskConical,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Spaced Revisions',
      value: `${completedRevisions}`,
      subValue: `${pendingRevisions} in queue`,
      icon: RotateCw,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Weak Areas Identified',
      value: `${weaknesses.length}`,
      subValue: 'Prioritized for review',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#0f141c]/80 border border-white/5 backdrop-blur-sm hover:border-white/15 transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-7 h-7 rounded-lg ${card.bg} border flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{card.subValue}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
