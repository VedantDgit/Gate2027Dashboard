'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGateStore } from '@/store/useGateStore';
import { FlaskConical, Check, Plus, Trash2 } from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';

interface AddMockTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddMockTestModal: React.FC<AddMockTestModalProps> = ({ isOpen, onClose }) => {
  const { subjects, addMockTest } = useGateStore();

  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [branch, setBranch] = useState<'CS' | 'DA' | 'COMBINED'>('DA');
  const [totalMarks, setTotalMarks] = useState(100);
  const [marksObtained, setMarksObtained] = useState(65);
  const [questionsAttempted, setQuestionsAttempted] = useState(50);
  const [correct, setCorrect] = useState(40);
  const [incorrect, setIncorrect] = useState(10);
  const [unattempted, setUnattempted] = useState(15);
  const [timeTakenMinutes, setTimeTakenMinutes] = useState(175);
  const [notes, setNotes] = useState('');

  const [subjectScores, setSubjectScores] = useState<{ subjectId: string; marks: number; total: number }[]>([
    { subjectId: subjects[0]?.id || '', marks: 12, total: 16 },
  ]);

  const addSubjectRow = () => {
    setSubjectScores([...subjectScores, { subjectId: subjects[0]?.id || '', marks: 10, total: 15 }]);
  };

  const removeSubjectRow = (index: number) => {
    setSubjectScores(subjectScores.filter((_, i) => i !== index));
  };

  const handleSubjectScoreChange = (index: number, field: string, val: string | number) => {
    const copy = [...subjectScores];
    copy[index] = { ...copy[index], [field]: val };
    setSubjectScores(copy);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subMap: Record<string, { marks: number; total: number }> = {};
    subjectScores.forEach((s) => {
      if (s.subjectId) {
        subMap[s.subjectId] = { marks: Number(s.marks) || 0, total: Number(s.total) || 0 };
      }
    });

    addMockTest({
      name: name.trim(),
      date,
      branch,
      totalMarks: Number(totalMarks) || 100,
      marksObtained: Number(marksObtained) || 0,
      questionsAttempted: Number(questionsAttempted) || 0,
      correct: Number(correct) || 0,
      incorrect: Number(incorrect) || 0,
      unattempted: Number(unattempted) || 0,
      timeTakenMinutes: Number(timeTakenMinutes) || 180,
      notes: notes.trim(),
      subjectScores: Object.keys(subMap).length > 0 ? subMap : undefined,
    });

    triggerConfetti();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <FlaskConical className="w-4 h-4" />
          </div>
          <span>Add Mock Examination Result</span>
        </div>
      }
      subtitle="Log full-length 3-hour tests, accuracy breakdown, and subject-wise score analytics"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name, Date, Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Mock Test Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., GATE DA Full Length 02"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Date Taken
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Exam Track
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value as 'CS' | 'DA' | 'COMBINED')}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="DA">Data Science & AI (DA)</option>
              <option value="CS">Computer Science (CS)</option>
              <option value="COMBINED">Combined Full Mock</option>
            </select>
          </div>
        </div>

        {/* Score & Marks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Total Marks</label>
            <input
              type="number"
              value={totalMarks}
              onChange={(e) => setTotalMarks(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-indigo-400 mb-1">
              Marks Obtained
            </label>
            <input
              type="number"
              step="0.01"
              value={marksObtained}
              onChange={(e) => setMarksObtained(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-950 border border-indigo-500/40 rounded-lg text-xs text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-emerald-400 mb-1">Correct Qs</label>
            <input
              type="number"
              value={correct}
              onChange={(e) => setCorrect(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-rose-400 mb-1">Incorrect Qs</label>
            <input
              type="number"
              value={incorrect}
              onChange={(e) => setIncorrect(Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Time and Unattempted */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Unattempted Questions
            </label>
            <input
              type="number"
              value={unattempted}
              onChange={(e) => setUnattempted(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Time Taken (Minutes)
            </label>
            <input
              type="number"
              value={timeTakenMinutes}
              onChange={(e) => setTimeTakenMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Subject-Wise Performance Breakdown (Optional) */}
        <div className="bg-slate-900/40 p-3.5 rounded-xl border border-white/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Subject Score Breakdown (Optional)
            </span>
            <button
              type="button"
              onClick={addSubjectRow}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Subject
            </button>
          </div>

          {subjectScores.map((row, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={row.subjectId}
                onChange={(e) => handleSubjectScoreChange(idx, 'subjectId', e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-slate-200"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.branch}] {s.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Scored"
                  value={row.marks}
                  onChange={(e) => handleSubjectScoreChange(idx, 'marks', Number(e.target.value))}
                  className="w-20 px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white font-mono"
                />
                <span className="text-slate-500 text-xs">/</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Total"
                  value={row.total}
                  onChange={(e) => handleSubjectScoreChange(idx, 'total', Number(e.target.value))}
                  className="w-20 px-2 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-xs text-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => removeSubjectRow(idx)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Reflection & Analysis Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Exam Reflections & Time Management Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g., High accuracy in Linear Algebra, spent too long on TOC question 34, need to leave 20 mins for revision..."
            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Action buttons */}
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
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Mock Exam
          </button>
        </div>
      </form>
    </Modal>
  );
};
