'use client';

import React from 'react';
import { useGateStore } from '@/store/useGateStore';
import { RotateCw, Check, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';
import Link from 'next/link';

export const RevisionQueueWidget: React.FC = () => {
  const { revisionItems, completeRevision, getTopic, getSubject } = useGateStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const pendingRevisions = revisionItems.filter((r) => !r.isCompleted);

  const overdue = pendingRevisions.filter((r) => r.scheduledDate < todayStr);
  const dueToday = pendingRevisions.filter((r) => r.scheduledDate === todayStr);
  const upcoming = pendingRevisions.filter((r) => r.scheduledDate > todayStr);

  const displayList = [...overdue, ...dueToday, ...upcoming].slice(0, 5);

  const handleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    completeRevision(id);
    triggerConfetti();
  };

  return (
    <div className="p-6 rounded-3xl bg-[#0f141c]/80 border border-white/5 backdrop-blur-sm space-y-4 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <RotateCw className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Spaced Revision Queue
            </h3>
          </div>
          <Link
            href="/revision"
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            <span>Full Queue ({pendingRevisions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <p className="text-xs text-slate-400">
          Algorithmic review schedules to prevent memory decay before Feb 2027
        </p>
      </div>

      {/* Queue items */}
      <div className="space-y-2.5 flex-1 my-1">
        {displayList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic">
            🎉 Revision queue is completely clear! Mark topics as completed in Syllabus to trigger automatic spaced review cycles.
          </div>
        ) : (
          displayList.map((item) => {
            const topic = getTopic(item.topicId);
            const subject = getSubject(item.subjectId);

            const isOverdue = item.scheduledDate < todayStr;
            const isDueToday = item.scheduledDate === todayStr;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isOverdue
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : isDueToday
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-slate-900/60 border-white/5'
                }`}
              >
                <div className="flex items-start gap-2.5 truncate">
                  <div className="mt-1">
                    {isOverdue ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block animate-pulse" />
                    ) : isDueToday ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-xs font-bold text-white truncate">
                        {topic?.name || 'Topic Review'}
                      </span>
                      <span className="text-[10px] px-1.5 rounded bg-slate-800 text-slate-400 font-mono">
                        R{item.stage}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{subject?.shortName || item.branch}</span>
                      <span>•</span>
                      <span
                        className={
                          isOverdue
                            ? 'text-rose-400 font-semibold'
                            : isDueToday
                            ? 'text-amber-400 font-semibold'
                            : 'text-slate-400'
                        }
                      >
                        {isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : `Due: ${item.scheduledDate}`}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleComplete(item.id, e)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-semibold border border-white/10 transition-all flex items-center gap-1 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-rose-400 font-bold">{overdue.length} Overdue</span>
          <span className="text-amber-400 font-bold">{dueToday.length} Due Today</span>
          <span className="text-emerald-400">{upcoming.length} Upcoming</span>
        </div>
      </div>
    </div>
  );
};
