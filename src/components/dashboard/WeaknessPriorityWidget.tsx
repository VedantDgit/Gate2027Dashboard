'use client';

import React, { useState } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { AlertTriangle, ChevronRight, Target, Clock, ArrowUpRight } from 'lucide-react';
import { TopicDetailModal } from '@/components/modals/TopicDetailModal';
import { LogSessionModal } from '@/components/modals/LogSessionModal';
import { AddPYQModal } from '@/components/modals/AddPYQModal';
import Link from 'next/link';

export const WeaknessPriorityWidget: React.FC = () => {
  const { getWeaknesses } = useGateStore();
  const weaknesses = getWeaknesses().slice(0, 5);

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [logSessionSubjectTopic, setLogSessionSubjectTopic] = useState<{
    subjectId: string;
    topicId: string;
  } | null>(null);
  const [addPYQSubjectTopic, setAddPYQSubjectTopic] = useState<{
    subjectId: string;
    topicId: string;
  } | null>(null);

  return (
    <div className="p-6 rounded-3xl bg-[#0f141c]/80 border border-white/5 backdrop-blur-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Top Weak Areas & High Priorities
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Algorithmic priority ranking based on low confidence, PYQ error rate, and study staleness
          </p>
        </div>

        <Link
          href="/analytics"
          className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
        >
          <span>Full Analyzer</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Weakness list */}
      <div className="space-y-3">
        {weaknesses.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic">
            No severe weak areas detected yet. Log more PYQ attempts and study sessions to build accuracy models.
          </div>
        ) : (
          weaknesses.map((item, idx) => (
            <div
              key={item.topicId}
              onClick={() => setSelectedTopicId(item.topicId)}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 truncate">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>

                <div className="truncate">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {item.topicName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.branch}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1 truncate">
                    <span className="text-slate-300 font-medium">{item.subjectName}</span>
                    <span>•</span>
                    <span className="text-rose-400">{item.reasons[0] || 'Needs focus'}</span>
                  </div>
                </div>
              </div>

              {/* Metrics & Action Button */}
              <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                <div className="text-right text-[11px] font-mono mr-2">
                  <div className="text-slate-300">
                    Accuracy: <strong className="text-amber-400">{item.pyqAccuracy}%</strong>
                  </div>
                  <div className="text-slate-400">
                    Confidence: <strong className="text-white">{item.confidence}/5</strong>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogSessionSubjectTopic({ subjectId: item.subjectId, topicId: item.topicId });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 text-xs font-semibold border border-white/10 transition-all flex items-center gap-1"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Study</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <TopicDetailModal
        topicId={selectedTopicId}
        onClose={() => setSelectedTopicId(null)}
        onOpenLogSession={(sId, tId) => setLogSessionSubjectTopic({ subjectId: sId, topicId: tId })}
        onOpenAddPYQ={(sId, tId) => setAddPYQSubjectTopic({ subjectId: sId, topicId: tId })}
      />

      {logSessionSubjectTopic && (
        <LogSessionModal
          isOpen={true}
          onClose={() => setLogSessionSubjectTopic(null)}
          defaultSubjectId={logSessionSubjectTopic.subjectId}
          defaultTopicId={logSessionSubjectTopic.topicId}
        />
      )}

      {addPYQSubjectTopic && (
        <AddPYQModal
          isOpen={true}
          onClose={() => setAddPYQSubjectTopic(null)}
          defaultSubjectId={addPYQSubjectTopic.subjectId}
          defaultTopicId={addPYQSubjectTopic.topicId}
        />
      )}
    </div>
  );
};
