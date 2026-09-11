'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGateStore } from '@/store/useGateStore';
import { ExamBranch, TopicDifficulty } from '@/types';
import { Target, Check, AlertCircle } from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';

interface AddPYQModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  defaultTopicId?: string;
}

export const AddPYQModal: React.FC<AddPYQModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  defaultTopicId,
}) => {
  const { subjects, addPYQRecord, getSubject } = useGateStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState(defaultTopicId || '');
  const [year, setYear] = useState(2024);
  const [difficulty, setDifficulty] = useState<TopicDifficulty>('medium');
  const [isCorrect, setIsCorrect] = useState(true);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(120);
  const [mistakeReason, setMistakeReason] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const currentSubject = getSubject(selectedSubjectId) || subjects[0] || { id: '', branch: 'DA', name: 'Subject', topics: [] };

  useEffect(() => {
    if (defaultSubjectId) setSelectedSubjectId(defaultSubjectId);
    if (defaultTopicId) setSelectedTopicId(defaultTopicId);
  }, [defaultSubjectId, defaultTopicId, isOpen]);

  useEffect(() => {
    if (subjects.length > 0 && !subjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(subjects[0].id);
    }
  }, [subjects, selectedSubjectId]);

  useEffect(() => {
    if (currentSubject.topics.length > 0) {
      if (!currentSubject.topics.some((t) => t.id === selectedTopicId)) {
        setSelectedTopicId(currentSubject.topics[0].id);
      }
    }
  }, [selectedSubjectId, currentSubject, selectedTopicId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addPYQRecord({
      year: Number(year) || 2024,
      branch: currentSubject.branch,
      subjectId: selectedSubjectId,
      topicId: selectedTopicId,
      difficulty,
      isCorrect,
      timeTakenSeconds: Number(timeTakenSeconds) || 60,
      date: new Date().toISOString().split('T')[0],
      mistakeReason: !isCorrect ? mistakeReason.trim() : undefined,
      notes: notes.trim(),
      tags: tags.length > 0 ? tags : undefined,
    });

    if (isCorrect) triggerConfetti();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Target className="w-4 h-4" />
          </div>
          <span>Log Official GATE PYQ Attempt</span>
        </div>
      }
      subtitle="Track accuracy, solve times, and build your searchable Mistake Bank"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject & Topic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.branch}] {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {currentSubject.topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Year, Difficulty, Time */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              GATE Year
            </label>
            <input
              type="number"
              min="1990"
              max="2026"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as TopicDifficulty)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Time (Sec)
            </label>
            <input
              type="number"
              min="10"
              max="1800"
              value={timeTakenSeconds}
              onChange={(e) => setTimeTakenSeconds(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Result: Correct / Incorrect */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Attempt Outcome
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsCorrect(true)}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                isCorrect
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              <Check className="w-4 h-4" /> Correct
            </button>
            <button
              type="button"
              onClick={() => setIsCorrect(false)}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                !isCorrect
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10'
                  : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
              }`}
            >
              <AlertCircle className="w-4 h-4" /> Incorrect (Add to Mistake Bank)
            </button>
          </div>
        </div>

        {/* Mistake Bank Specific Reason (shown if incorrect) */}
        {!isCorrect && (
          <div className="bg-rose-950/20 border border-rose-500/20 p-3.5 rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-rose-300">
              Why was it incorrect? (Root Cause for Mistake Bank)
            </label>
            <textarea
              rows={2}
              value={mistakeReason}
              onChange={(e) => setMistakeReason(e.target.value)}
              placeholder="E.g., Misread the condition 'at least one', calculation mistake on eigenvalue sign, forgot edge case..."
              className="w-full px-3 py-2 bg-slate-900/90 border border-rose-500/30 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-400"
            />
          </div>
        )}

        {/* Notes & Tags */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Solution Note & Tags (Comma-separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="E.g., Tricky, Boundary Condition, Quick Trick"
            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 mb-2"
          />
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Key concept applied or tricky intermediate step..."
            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            Record PYQ
          </button>
        </div>
      </form>
    </Modal>
  );
};
