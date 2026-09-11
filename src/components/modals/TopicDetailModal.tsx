'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGateStore } from '@/store/useGateStore';
import { TopicStatus } from '@/types';
import { BranchBadge } from '@/components/ui/Badge';
import {
  Clock,
  Edit3,
  FileText,
  Trash2,
  CheckCircle2,
  Star,
  Target,
} from 'lucide-react';
import { TopicManageModal } from '@/components/modals/TopicManageModal';

interface TopicDetailModalProps {
  topicId: string | null;
  onClose: () => void;
  onOpenLogSession?: (subjectId: string, topicId: string) => void;
  onOpenAddPYQ?: (subjectId: string, topicId: string) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topicId,
  onClose,
  onOpenLogSession,
  onOpenAddPYQ,
}) => {
  const {
    topicProgress,
    setTopicStatus,
    updateTopicProgress,
    revisionItems,
    getTopic,
    getSubject,
  } = useGateStore();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [topicNotes, setTopicNotes] = useState('');
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);

  if (!topicId) return null;

  const topic = getTopic(topicId);
  if (!topic) return null;

  const subject = getSubject(topic.subjectId);
  const progress = topicProgress[topicId] || {
    topicId,
    status: 'not_started' as TopicStatus,
    studyHours: 0,
    confidence: 3,
    pyqsAttempted: 0,
    pyqsCorrect: 0,
    revisionCount: 0,
  };

  const topicRevisions = revisionItems.filter((r) => r.topicId === topicId);

  const accuracy =
    progress.pyqsAttempted > 0
      ? Math.round((progress.pyqsCorrect / progress.pyqsAttempted) * 100)
      : 0;

  const handleSaveNotes = () => {
    updateTopicProgress(topicId, { notes: topicNotes });
    setIsEditingNotes(false);
  };

  return (
    <>
      <Modal
        isOpen={!!topicId}
        onClose={onClose}
        title={
          <div className="flex flex-wrap items-center gap-2">
            <BranchBadge branch={topic.branch} />
            <span className="font-semibold text-white">{topic.name}</span>
          </div>
        }
        subtitle={
          subject ? `${subject.name} • ${topic.subCategory || 'Core Curriculum'}` : undefined
        }
        maxWidth="3xl"
      >
        <div className="space-y-6">
          {/* Top Control Bar: Status & Confidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Preparation Status
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'not_started', label: 'Not Started' },
                    { id: 'learning', label: 'Learning' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'needs_revision', label: 'Needs Revision' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTopicStatus(topicId, s.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all text-left flex items-center justify-between ${
                      progress.status === s.id
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <span>{s.label}</span>
                    {progress.status === s.id && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Mastery / Confidence Score
              </label>
              <div className="flex items-center gap-1.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => updateTopicProgress(topicId, { confidence: star })}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      star <= progress.confidence
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-950/60 text-slate-600 border border-white/5 hover:text-slate-400'
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${star <= progress.confidence ? 'fill-current' : ''}`}
                    />
                  </button>
                ))}
                <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                  {progress.confidence}/5
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Last studied: {progress.lastStudiedDate || 'Never'}</span>
              </div>
            </div>
          </div>

          {/* Intelligence Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block mb-1">Study Hours</span>
              <div className="text-xl font-bold font-mono text-white">
                {progress.studyHours.toFixed(1)}h
              </div>
            </div>

            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block mb-1">PYQs Attempted</span>
              <div className="text-xl font-bold font-mono text-white">{progress.pyqsAttempted}</div>
            </div>

            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block mb-1">PYQ Accuracy</span>
              <div className="text-xl font-bold font-mono text-emerald-400">{accuracy}%</div>
            </div>

            <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
              <span className="text-[11px] text-slate-400 block mb-1">Revisions Done</span>
              <div className="text-xl font-bold font-mono text-purple-400">
                {progress.revisionCount}
              </div>
            </div>
          </div>

          {/* Topic Specific Notes & Key Formulas */}
          <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Topic Formula & Concept Memo</span>
              </div>
              {!isEditingNotes && (
                <button
                  onClick={() => {
                    setTopicNotes(progress.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit Memo
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={topicNotes}
                  onChange={(e) => setTopicNotes(e.target.value)}
                  placeholder="Key formulas, theorems, standard traps..."
                  className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {progress.notes || (
                  <span className="text-slate-500 italic">No specific memo added yet. Click edit to record key formulas or common traps.</span>
                )}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
            <button
              onClick={() => setIsEditTopicModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-white/10"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Topic Structure</span>
            </button>

            <div className="flex items-center gap-2">
              {onOpenAddPYQ && subject && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddPYQ(subject.id, topic.id);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5" /> Log PYQ Attempt
                </button>
              )}

              {onOpenLogSession && subject && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogSession(subject.id, topic.id);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-sky-600/20"
                >
                  <Clock className="w-3.5 h-3.5" /> Log Study Session
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Topic Structure Modal */}
      <TopicManageModal
        isOpen={isEditTopicModalOpen}
        onClose={() => {
          setIsEditTopicModalOpen(false);
          onClose();
        }}
        subjectId={topic.subjectId}
        editingTopic={topic}
      />
    </>
  );
};
