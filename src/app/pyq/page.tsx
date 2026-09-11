'use client';

import React, { useState, useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PYQRecord, TopicDifficulty } from '@/types';
import {
  HelpCircle,
  Plus,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Trash2,
  BookOpen,
  Check,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { BranchBadge, DifficultyBadge } from '@/components/ui/Badge';
import { AddPYQModal } from '@/components/modals/AddPYQModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';

export default function PYQPage() {
  const { hydrate, isHydrated, subjects, pyqRecords, deletePYQRecord, getSubject, getTopic } = useGateStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'MISTAKES'>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<'ALL' | 'DA' | 'CS'>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) return null;

  const mistakesList = pyqRecords.filter((p) => !p.isCorrect);

  const filteredPYQs = (activeTab === 'MISTAKES' ? mistakesList : pyqRecords).filter((p) => {
    if (branchFilter !== 'ALL' && p.branch !== branchFilter) return false;
    if (difficultyFilter !== 'ALL' && p.difficulty !== difficultyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const top = getTopic(p.topicId);
      const sub = getSubject(p.subjectId);
      const matchTop = top?.name.toLowerCase().includes(q);
      const matchSub = sub?.name.toLowerCase().includes(q);
      const matchReason = p.mistakeReason?.toLowerCase().includes(q);
      const matchNotes = p.notes?.toLowerCase().includes(q);
      return matchTop || matchSub || matchReason || matchNotes;
    }
    return true;
  });

  const totalAttempted = pyqRecords.length;
  const totalCorrect = pyqRecords.filter((p) => p.isCorrect).length;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const avgTime =
    totalAttempted > 0
      ? Math.round(pyqRecords.reduce((acc, p) => acc + p.timeTakenSeconds, 0) / totalAttempted)
      : 0;

  // Chart Data: Subject Wise PYQ Count & Correct
  const subjectChartData = subjects.map((s) => {
    const list = pyqRecords.filter((p) => p.subjectId === s.id);
    const correct = list.filter((p) => p.isCorrect).length;
    return {
      name: s.shortName,
      attempted: list.length,
      correct,
      branch: s.branch,
    };
  }).filter((d) => d.attempted > 0);

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
                <Target className="w-7 h-7 text-emerald-400" />
                <span>GATE Previous Year Questions & Mistake Bank</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Maintain question-level telemetry, calculate speed and accuracy, and review all wrong attempts.
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 self-start sm:self-auto transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log PYQ Attempt</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Total PYQs</span>
              <div className="text-2xl font-black font-mono text-white">{totalAttempted}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Accuracy Rate</span>
              <div className="text-2xl font-black font-mono text-emerald-400">{overallAccuracy}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Mistake Bank</span>
              <div className="text-2xl font-black font-mono text-rose-400">{mistakesList.length}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Avg Solve Time</span>
              <div className="text-2xl font-black font-mono text-sky-400">{avgTime}s</div>
            </div>
          </div>

          {/* Subject PYQ Distribution Chart */}
          {subjectChartData.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Subject-Wise PYQ Solved vs Correct</span>
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#8b949e" fontSize={11} />
                    <YAxis stroke="#8b949e" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090c10', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="attempted" name="Attempted" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="correct" name="Correct" fill="#34d399" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tab Switcher: All PYQs vs Mistake Bank */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-900 border border-white/5 w-fit">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ALL'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All PYQ Records ({pyqRecords.length})
            </button>

            <button
              onClick={() => setActiveTab('MISTAKES')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'MISTAKES'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Mistake Bank ({mistakesList.length})</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mistake reasons, topics, tags..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value as typeof branchFilter)}
                className="w-full px-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Exam Branches (CS & DA)</option>
                <option value="DA">GATE DA</option>
                <option value="CS">GATE CS</option>
              </select>
            </div>

            <div>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* PYQ List */}
          {filteredPYQs.length === 0 ? (
            <EmptyState
              icon={Target}
              title={activeTab === 'MISTAKES' ? 'No Recorded Mistakes Found' : 'No PYQ Records Found'}
              description="Log your solved GATE past questions to build mastery statistics and target tricky question patterns."
              actionLabel="Log PYQ Attempt"
              onAction={() => setIsAddOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {filteredPYQs.map((pyq) => {
                const sub = getSubject(pyq.subjectId);
                const top = getTopic(pyq.topicId);

                return (
                  <div
                    key={pyq.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                      !pyq.isCorrect
                        ? 'bg-[#140f12]/90 border-rose-500/20 hover:border-rose-500/40'
                        : 'bg-[#0f141c]/90 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <BranchBadge branch={pyq.branch} />
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                          GATE {pyq.year}
                        </span>
                        <DifficultyBadge difficulty={pyq.difficulty} />
                        <span className="text-sm font-bold text-white">{top?.name}</span>
                        <span className="text-xs text-slate-400">({sub?.name})</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {pyq.timeTakenSeconds}s
                        </span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            pyq.isCorrect
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {pyq.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                        </span>
                        <button
                          onClick={() => deletePYQRecord(pyq.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Mistake Reason Box */}
                    {pyq.mistakeReason && (
                      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-200 leading-relaxed">
                        <div className="font-semibold text-rose-300 mb-0.5 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Root Cause of Mistake:</span>
                        </div>
                        <p>{pyq.mistakeReason}</p>
                      </div>
                    )}

                    {/* Solution notes & tags */}
                    {pyq.notes && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                        &ldquo;{pyq.notes}&rdquo;
                      </p>
                    )}

                    {pyq.tags && pyq.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pyq.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] text-slate-400 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
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

      <AddPYQModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
