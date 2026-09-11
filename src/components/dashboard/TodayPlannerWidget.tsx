'use client';

import React, { useState } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { CheckSquare, Plus, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import Link from 'next/link';

export const TodayPlannerWidget: React.FC = () => {
  const { subjects, plannerTasks, togglePlannerTask, addPlannerTask, getSubject } = useGateStore();
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDuration, setTaskDuration] = useState(60);
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = plannerTasks.filter((t) => t.date === todayStr);

  const completedCount = todayTasks.filter((t) => t.completed).length;
  const progressPercent = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const sub = getSubject(taskSubjectId);
    addPlannerTask({
      title: taskTitle.trim(),
      subjectId: taskSubjectId,
      branch: sub?.branch || 'DA',
      durationMinutes: Number(taskDuration) || 60,
      completed: false,
      date: todayStr,
      priority: 'high',
    });

    setTaskTitle('');
    setIsAdding(false);
  };

  return (
    <div className="p-6 rounded-3xl bg-[#0f141c]/80 border border-white/5 backdrop-blur-sm space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Today&apos;s Mission Plan</h3>
          </div>
          <Link
            href="/planner"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
          >
            <span>Full Planner</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {completedCount} of {todayTasks.length} tasks completed
            </span>
            <span className="font-mono font-bold text-white">{Math.round(progressPercent)}%</span>
          </div>
          <ProgressBar value={progressPercent} height={5} color="bg-sky-400" />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 flex-1 my-2">
        {todayTasks.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic">
            No study blocks scheduled for today yet. Add your primary focus tasks below.
          </div>
        ) : (
          todayTasks.map((task) => {
            const sub = task.subjectId ? getSubject(task.subjectId) : null;

            return (
              <div
                key={task.id}
                onClick={() => togglePlannerTask(task.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-slate-950/40 border-white/5 text-slate-500 line-through'
                    : 'bg-slate-900/80 border-white/10 text-slate-200 hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      task.completed
                        ? 'bg-sky-500 border-sky-500 text-slate-950'
                        : 'border-white/20 bg-slate-950'
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3 h-3 fill-current" />}
                  </div>
                  <span className="text-xs font-medium truncate">{task.title}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {sub && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {sub.shortName}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {task.durationMinutes}m
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Quick Form */}
      {isAdding ? (
        <form onSubmit={handleAddTask} className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-2">
          <input
            type="text"
            required
            autoFocus
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="E.g., OS — Deadlock Avoidance PYQs (45m)"
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={taskSubjectId}
              onChange={(e) => setTaskSubjectId(e.target.value)}
              className="px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-300"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.branch}] {s.shortName}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="15"
                step="15"
                value={taskDuration}
                onChange={(e) => setTaskDuration(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-300 font-mono"
              />
              <span className="text-[10px] text-slate-500">min</span>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full py-2.5 rounded-xl border border-dashed border-white/15 bg-slate-900/40 hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Today&apos;s Task</span>
        </button>
      )}
    </div>
  );
};
