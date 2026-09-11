'use client';

import React, { useState, useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import {
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Clock,
  Target,
  Star,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BranchBadge } from '@/components/ui/Badge';
import { TopicDetailModal } from '@/components/modals/TopicDetailModal';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { AddPYQModal } from '@/components/modals/AddPYQModal';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f43f5e', '#c084fc', '#a855f7', '#06b6d4'];

export default function AnalyticsPage() {
  const { hydrate, isHydrated, getWeaknesses, getWeeklySummary, getOverallStats, studySessions, topicProgress, getSubject } =
    useGateStore();

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [logSessionTopic, setLogSessionTopic] = useState<{ subjectId: string; topicId: string } | null>(null);
  const [addPYQTopic, setAddPYQTopic] = useState<{ subjectId: string; topicId: string } | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) return null;

  const weaknesses = getWeaknesses();
  const weekly = getWeeklySummary();
  const stats = getOverallStats();

  // Subject study hours pie data
  const subjectHoursMap = new Map<string, number>();
  for (const s of studySessions) {
    const curr = subjectHoursMap.get(s.subjectId) || 0;
    subjectHoursMap.set(s.subjectId, curr + s.durationMinutes / 60);
  }

  const pieData = Array.from(subjectHoursMap.entries())
    .map(([sId, hours]) => {
      const sub = getSubject(sId);
      return {
        name: sub?.shortName || sId,
        value: Number(hours.toFixed(1)),
      };
    })
    .filter((d) => d.value > 0);

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0e1420] to-[#121927] border border-white/10 shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-sky-400" />
              <span>Preparation Intelligence & Weakness Analyzer</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-variable deterministic ranking algorithm isolating critical syllabus vulnerabilities and velocity trends.
            </p>
          </div>

          {/* Weekly Velocity Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Weekly Study Hours Velocity
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black font-mono text-white">
                  {weekly.thisWeekStudyHours}h
                </span>
                <span className="text-xs font-mono text-slate-400">
                  vs {weekly.lastWeekStudyHours}h last week
                </span>
              </div>
              <p className="text-[11px] text-sky-400">
                {weekly.thisWeekStudyHours >= weekly.lastWeekStudyHours
                  ? `▲ ${(weekly.thisWeekStudyHours - weekly.lastWeekStudyHours).toFixed(1)}h increase in weekly output`
                  : `▼ ${(weekly.lastWeekStudyHours - weekly.thisWeekStudyHours).toFixed(1)}h deficit from previous pace`}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Weekly PYQs Solved
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black font-mono text-emerald-400">
                  {weekly.thisWeekPYQs}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  vs {weekly.lastWeekPYQs} last week
                </span>
              </div>
              <p className="text-[11px] text-emerald-400">
                {weekly.thisWeekAccuracy}% accuracy across current week problems
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Topics Mastered This Week
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black font-mono text-purple-400">
                  {weekly.thisWeekTopicsCompleted}
                </span>
                <span className="text-xs font-mono text-slate-400">completed syllabus units</span>
              </div>
              <p className="text-[11px] text-purple-400">
                {weekly.thisWeekMocks} full mock examinations taken
              </p>
            </div>
          </div>

          {/* Charts Row: Study Time by Subject & CS vs DA Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Distribution */}
            <div className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Study Time Distribution by Subject (Hours)</span>
              </h3>
              {pieData.length > 0 ? (
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}h`}
                        fontSize={11}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090c10',
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-slate-500 italic">
                  Log study sessions to visualize subject distribution graphs.
                </div>
              )}
            </div>

            {/* CS vs DA Completion Ratio */}
            <div className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>CS vs DA Branch Parity</span>
              </h3>

              <div className="space-y-6 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-sky-300">GATE Data Science & AI (DA)</span>
                    <span className="font-mono text-white">{stats.daProgressPercent}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-sky-400 rounded-full transition-all duration-700"
                      style={{ width: `${stats.daProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                    {stats.daCompletedTopics} of {stats.daTotalTopics} topics completed
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-indigo-300">GATE Computer Science (CS)</span>
                    <span className="font-mono text-white">{stats.csProgressPercent}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                      style={{ width: `${stats.csProgressPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                    {stats.csCompletedTopics} of {stats.csTotalTopics} topics completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 10 High Priority Weak Areas */}
          <div className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Ranked High-Priority Weak Areas</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Algorithm Score combines Confidence Deficit (35%), PYQ Inaccuracy (30%), Needs Revision (25%), and Stale Recency (10%).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {weaknesses.map((item, idx) => (
                <div
                  key={item.topicId}
                  onClick={() => setSelectedTopicId(item.topicId)}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                      #{idx + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <BranchBadge branch={item.branch} />
                        <span className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                          {item.topicName}
                        </span>
                        <span className="text-xs text-slate-400">({item.subjectName})</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {item.reasons.map((r, rIdx) => (
                          <span
                            key={rIdx}
                            className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-500/20 text-[10px] font-medium"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-slate-300 self-end md:self-auto">
                    <div className="text-right">
                      <div className="text-amber-400 font-bold">Severity: {item.score}/100</div>
                      <div className="text-slate-400 text-[11px]">
                        Accuracy: {item.pyqAccuracy}% • Conf: {item.confidence}/5
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogSessionTopic({ subjectId: item.subjectId, topicId: item.topicId });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-600/20"
                    >
                      Study
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <MobileNav />

      <TopicDetailModal
        topicId={selectedTopicId}
        onClose={() => setSelectedTopicId(null)}
        onOpenLogSession={(sId, tId) => setLogSessionTopic({ subjectId: sId, topicId: tId })}
        onOpenAddPYQ={(sId, tId) => setAddPYQTopic({ subjectId: sId, topicId: tId })}
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
