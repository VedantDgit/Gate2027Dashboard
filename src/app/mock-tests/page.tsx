'use client';

import React, { useState, useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { FlaskConical, Plus, Trophy, Target, TrendingUp, Clock, Trash2, CheckCircle2 } from 'lucide-react';
import { AddMockTestModal } from '@/components/modals/AddMockTestModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

export default function MockTestsPage() {
  const { hydrate, isHydrated, mockTests, deleteMockTest, getSubject } = useGateStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) return null;

  const totalMocks = mockTests.length;
  const avgScore =
    totalMocks > 0
      ? Number((mockTests.reduce((acc, m) => acc + (m.marksObtained / m.totalMarks) * 100, 0) / totalMocks).toFixed(1))
      : 0;

  const topScore =
    totalMocks > 0
      ? Math.max(...mockTests.map((m) => m.marksObtained))
      : 0;

  const avgAccuracy =
    totalMocks > 0
      ? Math.round(
          mockTests.reduce((acc, m) => acc + (m.correct / (m.questionsAttempted || 1)) * 100, 0) / totalMocks
        )
      : 0;

  // Chart data sorted by date
  const chartData = [...mockTests]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({
      name: m.name.length > 18 ? `${m.name.slice(0, 18)}...` : m.name,
      score: m.marksObtained,
      accuracy: Math.round((m.correct / (m.questionsAttempted || 1)) * 100),
      date: m.date,
    }));

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
                <FlaskConical className="w-7 h-7 text-indigo-400" />
                <span>Full-Length Mock Test Intelligence</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Benchmark exam stamina, analyze score trajectory, and diagnose subject-level mark distributions.
              </p>
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 self-start sm:self-auto transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Mock Exam Result</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Mocks Attempted</span>
              <div className="text-2xl font-black font-mono text-white">{totalMocks}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Average Score %</span>
              <div className="text-2xl font-black font-mono text-indigo-400">{avgScore}%</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Highest Mark</span>
              <div className="text-2xl font-black font-mono text-emerald-400">{topScore.toFixed(1)} / 100</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-white/5 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Avg Accuracy</span>
              <div className="text-2xl font-black font-mono text-sky-400">{avgAccuracy}%</div>
            </div>
          </div>

          {/* Score Trajectory Line Chart */}
          {chartData.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Mock Examination Score Trajectory & Accuracy</span>
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#8b949e" fontSize={11} />
                    <YAxis stroke="#8b949e" domain={[0, 100]} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090c10',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="score" name="Marks" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" />
                    <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Mock Test Table / Cards */}
          {mockTests.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="No Mock Tests Recorded Yet"
              description="Taking 3-hour full length mock examinations is crucial for time management, negative mark control, and stamina."
              actionLabel="Add Your First Mock Test"
              onAction={() => setIsAddOpen(true)}
            />
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Examination History ({mockTests.length})
              </h3>

              <div className="space-y-3">
                {mockTests.map((mock) => {
                  const scorePercent = ((mock.marksObtained / mock.totalMarks) * 100).toFixed(1);
                  const accuracy =
                    mock.questionsAttempted > 0
                      ? Math.round((mock.correct / mock.questionsAttempted) * 100)
                      : 0;

                  return (
                    <div
                      key={mock.id}
                      className="p-5 rounded-2xl bg-[#0f141c]/90 border border-white/5 hover:border-white/15 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                            {mock.branch}
                          </span>
                          <h4 className="text-base font-bold text-white">{mock.name}</h4>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                          <span>{mock.date}</span>
                          <button
                            onClick={() => deleteMockTest(mock.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete mock test"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                        <div className="p-3 rounded-xl bg-slate-950/60 border border-indigo-500/30">
                          <span className="text-[10px] text-indigo-400 block uppercase">Marks Scored</span>
                          <span className="text-lg font-black text-white">
                            {mock.marksObtained.toFixed(2)} / {mock.totalMarks}
                          </span>
                          <span className="text-[10px] text-slate-400 block">({scorePercent}%)</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                          <span className="text-[10px] text-emerald-400 block uppercase">Correct Qs</span>
                          <span className="text-lg font-bold text-emerald-400">{mock.correct}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                          <span className="text-[10px] text-rose-400 block uppercase">Incorrect Qs</span>
                          <span className="text-lg font-bold text-rose-400">{mock.incorrect}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                          <span className="text-[10px] text-slate-500 block uppercase">Unattempted</span>
                          <span className="text-lg font-bold text-slate-300">{mock.unattempted}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                          <span className="text-[10px] text-sky-400 block uppercase">Accuracy</span>
                          <span className="text-lg font-bold text-sky-400">{accuracy}%</span>
                        </div>
                      </div>

                      {/* Subject Scores breakdown if exists */}
                      {mock.subjectScores && Object.keys(mock.subjectScores).length > 0 && (
                        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                            Subject Mark Distribution:
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {Object.entries(mock.subjectScores).map(([sId, score]) => {
                              const s = getSubject(sId);
                              return (
                                <div
                                  key={sId}
                                  className="p-2 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-between font-mono"
                                >
                                  <span className="text-slate-300 truncate mr-2">{s?.shortName || sId}</span>
                                  <span className="text-indigo-300 font-bold">
                                    {score.marks} / {score.total}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {mock.notes && (
                        <p className="text-xs text-slate-300 italic bg-slate-950/40 p-3 rounded-xl border border-white/5">
                          &ldquo;{mock.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />

      <AddMockTestModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
