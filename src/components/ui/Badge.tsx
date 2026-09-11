'use client';

import React from 'react';
import { TopicStatus, TopicDifficulty, ExamBranch } from '@/types';

export const StatusBadge: React.FC<{ status: TopicStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const configs = {
    not_started: {
      label: 'Not Started',
      bg: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
      dot: 'bg-slate-500',
    },
    learning: {
      label: 'Learning',
      bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400 animate-pulse',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    needs_revision: {
      label: 'Needs Revision',
      bg: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400',
    },
  };

  const config = configs[status] || configs.not_started;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export const BranchBadge: React.FC<{ branch: ExamBranch | 'BOTH' | 'GENERAL' }> = ({ branch }) => {
  const styles = {
    CS: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    DA: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    BOTH: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    GENERAL: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${styles[branch] || styles.GENERAL}`}
    >
      {branch}
    </span>
  );
};

export const DifficultyBadge: React.FC<{ difficulty?: TopicDifficulty }> = ({ difficulty = 'medium' }) => {
  const styles = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    hard: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${styles[difficulty]}`}
    >
      {difficulty}
    </span>
  );
};
