'use client';

import React from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Clock, Target, FlaskConical, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const RecentActivityFeed: React.FC = () => {
  const { studySessions, getSubject, getTopic } = useGateStore();
  const recentSessions = studySessions.slice(0, 5);

  return (
    <div className="p-6 rounded-3xl bg-[#0f141c]/80 border border-white/5 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Recent Activity Timeline</h3>
        </div>
        <Link
          href="/sessions"
          className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
        >
          <span>All Sessions ({studySessions.length})</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentSessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic">
            No study sessions recorded yet. Use &ldquo;Log Session&rdquo; or the Study Timer to track your work.
          </div>
        ) : (
          recentSessions.map((session) => {
            const subject = getSubject(session.subjectId);
            const topic = getTopic(session.topicId);
            const dateStr = new Date(session.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 truncate">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                    {session.branch}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-bold text-white truncate">
                        {topic?.name || 'Study Block'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({subject?.shortName || 'Subject'})
                      </span>
                    </div>
                    {session.notes && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 italic">
                        &ldquo;{session.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0 self-end sm:self-auto font-mono">
                  <span className="text-sky-300 font-bold">{session.durationMinutes} mins</span>
                  <span>•</span>
                  <span>{session.pyqsSolved} PYQs</span>
                  <span>•</span>
                  <span>{dateStr}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
