'use client';

import React, { useState, useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { RevisionItem, ExamBranch } from '@/types';
import {
  RotateCw,
  Check,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { BranchBadge } from '@/components/ui/Badge';
import { triggerConfetti } from '@/components/ui/Confetti';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

export default function RevisionPage() {
  const { hydrate, isHydrated, subjects, revisionItems, completeRevision, deleteRevisionItem, addRevisionItem, getSubject, getTopic } =
    useGateStore();

  const [activeTab, setActiveTab] = useState<'OVERDUE' | 'TODAY' | 'UPCOMING' | 'COMPLETED'>('TODAY');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New revision form state
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState(subjects[0]?.topics[0]?.id || '');
  const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

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

  if (!isHydrated) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const overdue = revisionItems.filter((r) => !r.isCompleted && r.scheduledDate < todayStr);
  const dueToday = revisionItems.filter((r) => !r.isCompleted && r.scheduledDate === todayStr);
  const upcoming = revisionItems.filter((r) => !r.isCompleted && r.scheduledDate > todayStr);
  const completed = revisionItems.filter((r) => r.isCompleted);

  const getActiveList = () => {
    switch (activeTab) {
      case 'OVERDUE':
        return overdue;
      case 'TODAY':
        return dueToday;
      case 'UPCOMING':
        return upcoming;
      case 'COMPLETED':
        return completed;
    }
  };

  const listToRender = getActiveList();

  const handleComplete = (id: string) => {
    completeRevision(id);
    triggerConfetti();
  };

  const handleCreateManualRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId) return;

    addRevisionItem({
      topicId: selectedTopicId,
      subjectId: selectedSubjectId,
      branch: subject.branch,
      stage,
      scheduledDate,
      isCompleted: false,
      notes: notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0e1420] to-[#121927] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <RotateCw className="w-7 h-7 text-purple-400" />
                <span>Spaced Revision Retention System</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Ebbinghaus forgetting curve intervals: R1 (+1d), R2 (+3d), R3 (+7d), R4 (+14d), R5 (+30d).
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2 self-start sm:self-auto transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Topic Revision</span>
            </button>
          </div>

          {/* Overdue Warning Alert */}
          {overdue.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong className="font-bold">{overdue.length} Revision {overdue.length === 1 ? 'Topic is' : 'Topics are'} Overdue!</strong> Long delays lead to cognitive decay. Clear these high-priority items first.
                </span>
              </div>
              <button
                onClick={() => setActiveTab('OVERDUE')}
                className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-[11px] shrink-0"
              >
                View Overdue
              </button>
            </div>
          )}

          {/* Tab Filter Navigation */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-white/5 w-fit">
            {[
              { id: 'OVERDUE', label: '🔴 Overdue', count: overdue.length, color: 'text-rose-400' },
              { id: 'TODAY', label: '🟡 Due Today', count: dueToday.length, color: 'text-amber-400' },
              { id: 'UPCOMING', label: '🟢 Upcoming', count: upcoming.length, color: 'text-emerald-400' },
              { id: 'COMPLETED', label: '✓ Completed History', count: completed.length, color: 'text-slate-400' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Revision Items Cards */}
          {listToRender.length === 0 ? (
            <EmptyState
              icon={RotateCw}
              title="No Revision Items in This Queue"
              description="Marking topics as 'Completed' in the Syllabus automatically schedules scientific spaced revision stages."
              actionLabel="Schedule Revision Item"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {listToRender.map((item) => {
                const topic = getTopic(item.topicId);
                const sub = getSubject(item.subjectId);

                const isOverdue = item.scheduledDate < todayStr && !item.isCompleted;
                const isDue = item.scheduledDate === todayStr && !item.isCompleted;

                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                      isOverdue
                        ? 'bg-[#180f12]/90 border-rose-500/30 hover:border-rose-500/50'
                        : isDue
                        ? 'bg-[#18150f]/90 border-amber-500/30 hover:border-amber-500/50'
                        : 'bg-[#0f141c]/90 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <BranchBadge branch={item.branch} />
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-xs font-bold border border-purple-500/30">
                          Stage {item.stage} Review
                        </span>
                        <h4 className="text-sm font-bold text-white">{topic?.name}</h4>
                        <span className="text-xs text-slate-400">({sub?.name})</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>Scheduled: {item.scheduledDate}</span>
                        {item.completedDate && (
                          <span className="text-emerald-400">Completed: {item.completedDate}</span>
                        )}
                        <button
                          onClick={() => deleteRevisionItem(item.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete revision item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}

                    {!item.isCompleted && (
                      <div className="flex items-center justify-end pt-1">
                        <button
                          onClick={() => handleComplete(item.id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          <span>Mark Revision Done (Advance to Stage {Math.min(5, item.stage + 1)})</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <MobileNav />

      {/* Manual Revision Scheduler Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-purple-400" />
            <span>Schedule Spaced Revision</span>
          </div>
        }
        subtitle="Manually schedule a retention review for any topic"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateManualRevision} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.branch}] {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            >
              {subject.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Revision Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
              >
                <option value={1}>Stage 1 (+1 day)</option>
                <option value={2}>Stage 2 (+3 days)</option>
                <option value={3}>Stage 3 (+7 days)</option>
                <option value={4}>Stage 4 (+14 days)</option>
                <option value={5}>Stage 5 (+30 days)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Date
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Revision Checklist Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Re-derive formulas, solve 5 PYQs from 2022-2024..."
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
            >
              Schedule Revision
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
