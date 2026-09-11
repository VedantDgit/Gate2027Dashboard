'use client';

import React, { useState } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Subject, ExamBranch } from '@/types';
import { BranchBadge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BookOpen, Clock, Target, Star, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { TopicDetailModal } from '@/components/modals/TopicDetailModal';
import { SubjectManageModal } from '@/components/modals/SubjectManageModal';
import Link from 'next/link';

export const SubjectGrid: React.FC = () => {
  const { subjects, getSubjectProgress } = useGateStore();
  const [filterBranch, setFilterBranch] = useState<'ALL' | 'DA' | 'CS'>('ALL');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const filteredSubjects = subjects.filter((s) =>
    filterBranch === 'ALL' ? true : s.branch === filterBranch
  );

  return (
    <section className="space-y-4">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span>Curriculum & Subject Progress</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time syllabus coverage, hours, and mastery ratings across {subjects.length} subjects
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5">
            {[
              { id: 'ALL', label: `All (${subjects.length})` },
              { id: 'DA', label: `DA (${subjects.filter((s) => s.branch === 'DA').length})` },
              { id: 'CS', label: `CS (${subjects.filter((s) => s.branch === 'CS').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterBranch(tab.id as typeof filterBranch)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterBranch === tab.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddSubjectOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-sky-500/40 text-sky-400 transition-colors"
            title="Add Custom Subject"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((subject) => {
          const p = getSubjectProgress(subject.id);

          return (
            <div
              key={subject.id}
              className="p-5 rounded-2xl bg-[#0f141c]/80 border border-white/5 backdrop-blur-sm hover:border-white/15 transition-all space-y-4 group flex flex-col justify-between"
            >
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <BranchBadge branch={subject.branch} />
                  <span className="text-[11px] font-mono text-slate-500">
                    ~{subject.weightageEstimate}% GATE weightage
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                    {subject.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {subject.description || 'Custom curriculum subject.'}
                </p>
              </div>

              {/* Progress Bar & Topic stats */}
              <div className="space-y-3 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Completion</span>
                  <span className="text-white font-mono font-bold">{p.progressPercent}%</span>
                </div>
                <ProgressBar
                  value={p.progressPercent}
                  height={6}
                  color={subject.branch === 'DA' ? 'bg-sky-400' : 'bg-indigo-400'}
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    <strong className="text-slate-200 font-mono">{p.completedTopics}</strong> / {p.totalTopics} topics
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{p.averageConfidence}/5</span>
                  </div>
                </div>

                {/* Submetrics: Hours, PYQs */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">Study: <strong className="text-white font-mono">{p.studyHours}h</strong></span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">PYQs: <strong className="text-white font-mono">{p.pyqsAttempted}</strong></span>
                  </div>
                </div>
              </div>

              {/* Quick Topic link */}
              <Link
                href={`/syllabus?subject=${subject.id}`}
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>View All {subject.topics.length} Topics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      <TopicDetailModal
        topicId={selectedTopicId}
        onClose={() => setSelectedTopicId(null)}
      />

      <SubjectManageModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        defaultBranch={filterBranch === 'CS' ? 'CS' : 'DA'}
      />
    </section>
  );
};
