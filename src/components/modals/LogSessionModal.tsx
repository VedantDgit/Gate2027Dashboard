'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGateStore } from '@/store/useGateStore';
import { BookOpen, Check } from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';

interface LogSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  defaultTopicId?: string;
  defaultDurationMinutes?: number;
}

export const LogSessionModal: React.FC<LogSessionModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultTopicId,
  defaultDurationMinutes = 60,
}) => {
  const { subjects, getSubject, addStudySession } = useGateStore();

  const firstSub = subjects[0];
  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId || (firstSub ? firstSub.id : ''));
  const [selectedTopicId, setSelectedTopicId] = useState(defaultTopicId || '');
  const [durationMinutes, setDurationMinutes] = useState(defaultDurationMinutes);
  const [questionsSolved, setQuestionsSolved] = useState(8);
  const [pyqsSolved, setPyqsSolved] = useState(4);
  const [confidenceBefore, setConfidenceBefore] = useState(2);
  const [confidenceAfter, setConfidenceAfter] = useState(4);
  const [notes, setNotes] = useState('');

  const currentSubject = getSubject(selectedSubjectId) || firstSub;

  useEffect(() => {
    if (defaultSubjectId) setSelectedSubjectId(defaultSubjectId);
    if (defaultTopicId) setSelectedTopicId(defaultTopicId);
    if (defaultDurationMinutes) setDurationMinutes(defaultDurationMinutes);
  }, [defaultSubjectId, defaultTopicId, defaultDurationMinutes, isOpen]);

  useEffect(() => {
    if (currentSubject && currentSubject.topics.length > 0) {
      if (!currentSubject.topics.some((t) => t.id === selectedTopicId)) {
        setSelectedTopicId(currentSubject.topics[0].id);
      }
    }
  }, [selectedSubjectId, currentSubject, selectedTopicId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId || !currentSubject) return;

    addStudySession({
      subjectId: selectedSubjectId,
      topicId: selectedTopicId,
      branch: currentSubject.branch,
      date: new Date().toISOString(),
      durationMinutes: Number(durationMinutes) || 30,
      questionsSolved: Number(questionsSolved) || 0,
      pyqsSolved: Number(pyqsSolved) || 0,
      confidenceBefore,
      confidenceAfter,
      notes: notes.trim(),
    });

    triggerConfetti();
    onClose();
  };

  if (!currentSubject) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <span>Log Study Session</span>
        </div>
      }
      subtitle="Record focused study time, problem metrics, and confidence progression"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subject & Topic Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.branch}] {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
            >
              {currentSubject.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.subCategory ? `${t.subCategory} → ` : ''}
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duration presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Duration: {durationMinutes} Minutes ({(durationMinutes / 60).toFixed(1)} hrs)
          </label>
          <div className="flex flex-wrap gap-2">
            {[25, 45, 60, 90, 120, 150].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setDurationMinutes(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  durationMinutes === mins
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/20'
                }`}
              >
                {mins} mins
              </button>
            ))}
            <input
              type="number"
              min="5"
              max="600"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-24 px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              placeholder="Custom"
            />
          </div>
        </div>

        {/* Questions and PYQs Solved */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Total Practice Problems Solved
            </label>
            <input
              type="number"
              min="0"
              value={questionsSolved}
              onChange={(e) => setQuestionsSolved(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official GATE PYQs Solved
            </label>
            <input
              type="number"
              min="0"
              value={pyqsSolved}
              onChange={(e) => setPyqsSolved(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900/90 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Confidence scale Before and After */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-white/5">
          <div>
            <span className="block text-xs font-semibold text-slate-400 mb-1.5">
              Confidence Before Study
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setConfidenceBefore(lvl)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    confidenceBefore === lvl
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 mb-1.5">
              Confidence After Session
            </span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setConfidenceAfter(lvl)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    confidenceAfter === lvl
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Session Takeaways / Key Formulas / Pitfalls (Optional)
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., Mastered characteristic polynomial calculations, need caution on algebraic vs geometric multiplicity..."
            className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-white/10 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            Save & Update Intelligence
          </button>
        </div>
      </form>
    </Modal>
  );
};
