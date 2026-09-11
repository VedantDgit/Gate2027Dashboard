'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ExamBranch, TopicStatus, TopicDifficulty, Subject, Topic } from '@/types';
import { StatusBadge, BranchBadge, DifficultyBadge } from '@/components/ui/Badge';
import { TopicDetailModal } from '@/components/modals/TopicDetailModal';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { AddPYQModal } from '@/components/modals/AddPYQModal';
import { SubjectManageModal } from '@/components/modals/SubjectManageModal';
import { TopicManageModal } from '@/components/modals/TopicManageModal';
import {
  BookOpen,
  Search,
  Plus,
  Edit3,
  Trash2,
  Clock,
  Target,
  Star,
  ChevronRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function SyllabusPage() {
  const {
    hydrate,
    isHydrated,
    subjects,
    topicProgress,
    setTopicStatus,
    getOverallStats,
    resetSyllabusToDefault,
  } = useGateStore();

  const stats = getOverallStats();

  const [activeBranch, setActiveBranch] = useState<ExamBranch>('DA');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'confidence_asc' | 'confidence_desc' | 'pyqs_desc' | 'hours_desc'>('default');

  // Modals state
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [logSessionTopic, setLogSessionTopic] = useState<{ subjectId: string; topicId: string } | null>(null);
  const [addPYQTopic, setAddPYQTopic] = useState<{ subjectId: string; topicId: string } | null>(null);

  // Dynamic Subject & Topic management modals
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [topicModalSubjectId, setTopicModalSubjectId] = useState<string>('');
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const activeSubjects = useMemo(() => {
    return subjects.filter((s) => s.branch === activeBranch);
  }, [subjects, activeBranch]);

  const filteredTopics = useMemo(() => {
    let list = activeSubjects.flatMap((s) => s.topics);

    if (selectedSubjectId !== 'ALL') {
      list = list.filter((t) => t.subjectId === selectedSubjectId);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((t) => {
        const p = topicProgress[t.id];
        const status = p ? p.status : 'not_started';
        return status === statusFilter;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.subCategory && t.subCategory.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'confidence_asc') {
      list.sort((a, b) => (topicProgress[a.id]?.confidence || 3) - (topicProgress[b.id]?.confidence || 3));
    } else if (sortBy === 'confidence_desc') {
      list.sort((a, b) => (topicProgress[b.id]?.confidence || 3) - (topicProgress[a.id]?.confidence || 3));
    } else if (sortBy === 'pyqs_desc') {
      list.sort((a, b) => (topicProgress[b.id]?.pyqsAttempted || 0) - (topicProgress[a.id]?.pyqsAttempted || 0));
    } else if (sortBy === 'hours_desc') {
      list.sort((a, b) => (topicProgress[b.id]?.studyHours || 0) - (topicProgress[a.id]?.studyHours || 0));
    }

    return list;
  }, [activeSubjects, selectedSubjectId, statusFilter, searchQuery, sortBy, topicProgress]);

  const groupedBySubject = useMemo(() => {
    const map = new Map<string, typeof filteredTopics>();
    for (const topic of filteredTopics) {
      const arr = map.get(topic.subjectId) || [];
      arr.push(topic);
      map.set(topic.subjectId, arr);
    }
    return map;
  }, [filteredTopics]);

  if (!isHydrated) return null;

  const currentBranchProgress = activeBranch === 'DA' ? stats.daProgressPercent : stats.csProgressPercent;
  const currentBranchCompleted = activeBranch === 'DA' ? stats.daCompletedTopics : stats.csCompletedTopics;
  const currentBranchTotal = activeBranch === 'DA' ? stats.daTotalTopics : stats.csTotalTopics;

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner & Dual Branch Switcher */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0e1420] via-[#121927] to-[#0a0d14] border border-white/10 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <BookOpen className="w-7 h-7 text-sky-400" />
                  <span>Syllabus Explorer & Mastery Matrix</span>
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  100% Dynamic curriculum. Add custom subjects, create new topics, and track granular progress.
                </p>
              </div>

              {/* Branch Toggle & Add Subject Button */}
              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-white/10">
                  <button
                    onClick={() => {
                      setActiveBranch('DA');
                      setSelectedSubjectId('ALL');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeBranch === 'DA'
                        ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>GATE DA</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
                      {stats.daProgressPercent}%
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveBranch('CS');
                      setSelectedSubjectId('ALL');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeBranch === 'CS'
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>GATE CS</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-950/40 text-[10px] font-mono">
                      {stats.csProgressPercent}%
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setIsSubjectModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>
            </div>

            {/* Branch Summary Progress Bar */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>
                  {activeBranch} Syllabus Coverage: <strong className="text-white font-mono">{currentBranchCompleted}</strong> / {currentBranchTotal} Topics Completed
                </span>
                <span className="font-mono font-bold text-white">{currentBranchProgress}%</span>
              </div>
              <ProgressBar
                value={currentBranchProgress}
                height={6}
                color={activeBranch === 'DA' ? 'bg-sky-400' : 'bg-indigo-400'}
              />
            </div>
          </div>

          {/* Search, Subject Filter & Sorting Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any topic, formula, or concept..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Subjects ({activeSubjects.length})</option>
                {activeSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.topics.length} topics)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="not_started">○ Not Started</option>
                <option value="learning">◐ Learning</option>
                <option value="completed">✓ Completed</option>
                <option value="needs_revision">↻ Needs Revision</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full px-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="default">Default Syllabus Order</option>
                <option value="confidence_asc">Lowest Confidence (Weak Areas)</option>
                <option value="confidence_desc">Highest Confidence</option>
                <option value="pyqs_desc">Most PYQs Solved</option>
                <option value="hours_desc">Most Study Hours</option>
              </select>
            </div>
          </div>

          {/* Topics Rendered by Subject Accordions */}
          <div className="space-y-6">
            {activeSubjects.map((subject) => {
              const topics = filteredTopics.filter((t) => t.subjectId === subject.id);
              if (selectedSubjectId !== 'ALL' && selectedSubjectId !== subject.id) return null;
              if (searchQuery.trim() && topics.length === 0) return null;

              return (
                <div
                  key={subject.id}
                  className="rounded-3xl bg-[#0f141c]/90 border border-white/5 overflow-hidden shadow-md"
                >
                  {/* Subject Header */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900/90 to-[#141c28]/70 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                        {subject.topics.length}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>{subject.name}</span>
                          <span className="text-xs font-normal text-slate-400">
                            ({subject.category})
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{subject.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => {
                          setTopicModalSubjectId(subject.id);
                          setEditingTopic(null);
                          setIsTopicModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold flex items-center gap-1 border border-white/10"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Topic
                      </button>

                      <button
                        onClick={() => {
                          setEditingSubject(subject);
                          setIsSubjectModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        title="Edit subject"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Topics List */}
                  <div className="divide-y divide-white/5">
                    {topics.map((topic) => {
                      const p = topicProgress[topic.id] || {
                        topicId: topic.id,
                        status: 'not_started' as TopicStatus,
                        studyHours: 0,
                        confidence: 3,
                        pyqsAttempted: 0,
                        pyqsCorrect: 0,
                        revisionCount: 0,
                      };

                      return (
                        <div
                          key={topic.id}
                          onClick={() => setSelectedTopicId(topic.id)}
                          className="p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextStatus: Record<TopicStatus, TopicStatus> = {
                                  not_started: 'learning',
                                  learning: 'completed',
                                  completed: 'needs_revision',
                                  needs_revision: 'not_started',
                                };
                                setTopicStatus(topic.id, nextStatus[p.status]);
                              }}
                              className="mt-0.5 hover:scale-110 transition-transform shrink-0"
                              title="Click to advance status"
                            >
                              <StatusBadge status={p.status} size="sm" />
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                                  {topic.name}
                                </span>
                                {topic.subCategory && (
                                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                                    • {topic.subCategory}
                                  </span>
                                )}
                              </div>
                              {p.notes && (
                                <p className="text-[11px] text-slate-400 italic truncate mt-0.5 max-w-md">
                                  Memo: &ldquo;{p.notes}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-400 shrink-0 self-end md:self-auto font-mono">
                            <div className="flex items-center gap-1">
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  p.confidence >= 4
                                    ? 'text-amber-400 fill-amber-400'
                                    : p.confidence <= 2
                                    ? 'text-rose-400'
                                    : 'text-amber-400/60'
                                }`}
                              />
                              <span className="font-bold text-slate-200">{p.confidence}/5</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-sky-400" />
                              <span>{p.studyHours.toFixed(1)}h</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-emerald-400" />
                              <span>
                                {p.pyqsCorrect}/{p.pyqsAttempted} PYQs
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTopicModalSubjectId(subject.id);
                                setEditingTopic(topic);
                                setIsTopicModalOpen(true);
                              }}
                              className="p-1 text-slate-500 hover:text-sky-400 transition-colors"
                              title="Edit topic"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                          </div>
                        </div>
                      );
                    })}

                    {topics.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-500 italic">
                        No topics match your current filter. Click &ldquo;Add Topic&rdquo; to create a new topic under this subject.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <MobileNav />

      {/* Topic Detail Modal */}
      <TopicDetailModal
        topicId={selectedTopicId}
        onClose={() => setSelectedTopicId(null)}
        onOpenLogSession={(sId, tId) => setLogSessionTopic({ subjectId: sId, topicId: tId })}
        onOpenAddPYQ={(sId, tId) => setAddPYQTopic({ subjectId: sId, topicId: tId })}
      />

      {/* Subject Management Modal */}
      <SubjectManageModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        editingSubject={editingSubject}
        defaultBranch={activeBranch}
      />

      {/* Topic Management Modal */}
      <TopicManageModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        subjectId={topicModalSubjectId}
        editingTopic={editingTopic}
      />

      {logSessionTopic && (
        <LogSessionModal
          isOpen={true}
          onClose={() => setLogSessionTopic(null)}
          defaultSubjectId={logSessionTopic.subjectId}
          defaultTopicId={logSessionTopic.topicId}
        />
      )}

      {addPYQTopic && (
        <AddPYQModal
          isOpen={true}
          onClose={() => setAddPYQTopic(null)}
          defaultSubjectId={addPYQTopic.subjectId}
          defaultTopicId={addPYQTopic.topicId}
        />
      )}
    </div>
  );
}
