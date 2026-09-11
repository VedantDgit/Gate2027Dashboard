'use client';

import React, { useState, useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Clock, Plus, Search, Trash2, Calendar, Target, Star, Filter } from 'lucide-react';
import { BranchBadge } from '@/components/ui/Badge';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { EmptyState } from '@/components/ui/EmptyState';

export default function SessionsPage() {
  const { hydrate, isHydrated, subjects, studySessions, deleteStudySession, getSubject, getTopic } = useGateStore();
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<'ALL' | 'DA' | 'CS'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) return null;

  const filteredSessions = studySessions.filter((s) => {
    if (branchFilter !== 'ALL' && s.branch !== branchFilter) return false;
    if (subjectFilter !== 'ALL' && s.subjectId !== subjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const topic = getTopic(s.topicId);
      const sub = getSubject(s.subjectId);
      const matchTopic = topic?.name.toLowerCase().includes(q);
      const matchSubject = sub?.name.toLowerCase().includes(q);
      const matchNotes = s.notes.toLowerCase().includes(q);
      return matchTopic || matchSubject || matchNotes;
    }
    return true;
  });

  const totalMinutes = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalQuestions = studySessions.reduce((acc, s) => acc + (s.questionsSolved || 0), 0);
  const totalPYQs = studySessions.reduce((acc, s) => acc + (s.pyqsSolved || 0), 0);
  const avgDuration = studySessions.length > 0 ? Math.round(totalMinutes / studySessions.length) : 0;

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-[#0e1420] to-[#121927] border border-white/10 shadow-xl">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Clock className="w-7 h-7 text-sky-400" />
                <span>Study Session Log & Analytics</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Chronological record of every focused study block, problems completed, and mastery ratings.
              </p>
            </div>

            <button
              onClick={() => setIsLogOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 flex items-center gap-2 self-start sm:self-auto transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log Study Session</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Sessions</span>
              <div className="text-2xl font-black font-mono text-white">{studySessions.length}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Study Time</span>
              <div className="text-2xl font-black font-mono text-sky-400">
                {(totalMinutes / 60).toFixed(1)}h
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Questions Solved</span>
              <div className="text-2xl font-black font-mono text-emerald-400">{totalQuestions}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Avg Duration</span>
              <div className="text-2xl font-black font-mono text-purple-400">{avgDuration} min</div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects or topics..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value as typeof branchFilter)}
                className="w-full px-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Tracks (CS & DA)</option>
                <option value="DA">Data Science & AI (DA)</option>
                <option value="CS">Computer Science (CS)</option>
              </select>
            </div>

            <div>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.branch}] {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sessions List / Table */}
          {filteredSessions.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No Study Sessions Found"
              description="Record your daily preparation blocks to monitor your study pace, questions completed, and syllabus progress."
              actionLabel="Log First Study Session"
              onAction={() => setIsLogOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((sess) => {
                const sub = getSubject(sess.subjectId);
                const top = getTopic(sess.topicId);
                const dateObj = new Date(sess.date);
                const dateStr = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={sess.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0f141c]/90 border border-white/5 hover:border-white/15 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2.5">
                        <BranchBadge branch={sess.branch} />
                        <h4 className="text-sm font-bold text-white">
                          {top?.name || 'Study Block'}
                        </h4>
                        <span className="text-xs text-slate-400">({sub?.name})</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>{dateStr}</span>
                        <button
                          onClick={() => deleteStudySession(sess.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300 font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                        <span className="text-[10px] text-slate-500 block uppercase">Duration</span>
                        <span className="font-bold text-sky-400">{sess.durationMinutes} mins</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                        <span className="text-[10px] text-slate-500 block uppercase">Practice Qs</span>
                        <span className="font-bold text-slate-200">{sess.questionsSolved}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                        <span className="text-[10px] text-slate-500 block uppercase">PYQs Solved</span>
                        <span className="font-bold text-emerald-400">{sess.pyqsSolved}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                        <span className="text-[10px] text-slate-500 block uppercase">Confidence Boost</span>
                        <span className="font-bold text-amber-400">
                          {sess.confidenceBefore} → {sess.confidenceAfter}/5
                        </span>
                      </div>
                    </div>

                    {sess.notes && (
                      <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-white/5 leading-relaxed italic">
                        &ldquo;{sess.notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <MobileNav />

      <LogSessionModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
    </div>
  );
}
