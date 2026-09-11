'use client';

import React, { useState, useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PriorityLevel, PlannerTask } from '@/types';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { triggerConfetti } from '@/components/ui/Confetti';
import { EmptyState } from '@/components/ui/EmptyState';

export default function PlannerPage() {
  const { hydrate, isHydrated, subjects, plannerTasks, addPlannerTask, togglePlannerTask, deletePlannerTask, getSubject } =
    useGateStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskTopicId, setTaskTopicId] = useState('');
  const [taskDuration, setTaskDuration] = useState(60);
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('high');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const subject = getSubject(taskSubjectId) || subjects[0] || { id: '', branch: 'DA', name: 'Subject', topics: [] };

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (subjects.length > 0 && !subjects.some(s => s.id === taskSubjectId)) {
      setTaskSubjectId(subjects[0].id);
    }
  }, [subjects, taskSubjectId]);

  useEffect(() => {
    if (subject.topics.length > 0 && !subject.topics.some((t) => t.id === taskTopicId)) {
      setTaskTopicId(subject.topics[0].id);
    }
  }, [taskSubjectId, subject, taskTopicId]);

  if (!isHydrated) return null;

  const dateTasks = plannerTasks.filter((t) => t.date === selectedDate);
  const completedTasks = dateTasks.filter((t) => t.completed).length;
  const progressPercent = dateTasks.length > 0 ? (completedTasks / dateTasks.length) * 100 : 0;
  const totalPlannedMinutes = dateTasks.reduce((acc, t) => acc + t.durationMinutes, 0);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addPlannerTask({
      title: taskTitle.trim(),
      subjectId: taskSubjectId,
      topicId: taskTopicId,
      branch: subject.branch,
      durationMinutes: Number(taskDuration) || 60,
      completed: false,
      date: selectedDate,
      priority: taskPriority,
    });

    setTaskTitle('');
    setIsAddingTask(false);
  };

  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    togglePlannerTask(id);
    if (!currentlyCompleted) triggerConfetti();
  };

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-5xl mx-auto w-full">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0e1420] to-[#121927] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <CheckSquare className="w-7 h-7 text-sky-400" />
                <span>Daily Mission Planner</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Structure dedicated study blocks, set daily targets, and execute consistent daily progress.
              </p>
            </div>

            {/* Date Selector Quick Buttons */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Today
              </button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-white">Daily Target Completion</span>
                <p className="text-[11px] text-slate-400">
                  {completedTasks} of {dateTasks.length} tasks finished • {(totalPlannedMinutes / 60).toFixed(1)} planned study hours
                </p>
              </div>
              <span className="text-xl font-black font-mono text-sky-400">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <ProgressBar value={progressPercent} height={7} color="bg-gradient-to-r from-sky-400 to-indigo-400" />
          </div>

          {/* Task List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Scheduled Focus Tasks ({dateTasks.length})
              </h3>
              {!isAddingTask && (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Task
                </button>
              )}
            </div>

            {/* Inline Add Task Form */}
            {isAddingTask && (
              <form
                onSubmit={handleCreateTask}
                className="p-5 rounded-2xl bg-slate-900/90 border border-sky-500/30 space-y-4 shadow-xl"
              >
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Task Objective</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="E.g., OS — Deadlock Avoidance PYQs & Bankers Proof"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Subject</label>
                    <select
                      value={taskSubjectId}
                      onChange={(e) => setTaskSubjectId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          [{s.branch}] {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={taskDuration}
                      onChange={(e) => setTaskDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as PriorityLevel)}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Schedule Task
                  </button>
                </div>
              </form>
            )}

            {dateTasks.length === 0 && !isAddingTask ? (
              <EmptyState
                icon={CheckSquare}
                title="No Tasks Scheduled For This Date"
                description="Organize your day into 45-90 minute deep work intervals to achieve high syllabus retention."
                actionLabel="Schedule Your First Task"
                onAction={() => setIsAddingTask(true)}
              />
            ) : (
              <div className="space-y-2.5">
                {dateTasks.map((task) => {
                  const sub = task.subjectId ? getSubject(task.subjectId) : null;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        task.completed
                          ? 'bg-slate-950/40 border-white/5 text-slate-500 line-through'
                          : 'bg-[#0f141c]/90 border-white/10 text-slate-200 hover:border-sky-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <button
                          onClick={() => handleToggle(task.id, task.completed)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                            task.completed
                              ? 'bg-sky-500 border-sky-500 text-slate-950'
                              : 'border-white/20 bg-slate-950 hover:border-sky-400'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                        </button>

                        <div className="truncate">
                          <div className="text-xs font-semibold truncate">{task.title}</div>
                          {sub && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              [{sub.branch}] {sub.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          {task.durationMinutes}m
                        </span>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            task.priority === 'high'
                              ? 'bg-rose-500/20 text-rose-300'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>

                        <button
                          onClick={() => deletePlannerTask(task.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
