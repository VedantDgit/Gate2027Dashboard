'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGateStore } from '@/store/useGateStore';
import { Subject, ExamBranch } from '@/types';
import { BookOpen, Check, Trash2, Edit3, Plus } from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';

interface SubjectManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSubject?: Subject | null;
  defaultBranch?: ExamBranch;
}

export const SubjectManageModal: React.FC<SubjectManageModalProps> = ({
  isOpen,
  onClose,
  editingSubject,
  defaultBranch = 'DA',
}) => {
  const { addSubject, updateSubject, deleteSubject } = useGateStore();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [branch, setBranch] = useState<ExamBranch>(defaultBranch);
  const [category, setCategory] = useState('');
  const [weightageEstimate, setWeightageEstimate] = useState(10);
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#38bdf8');

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setShortName(editingSubject.shortName);
      setBranch(editingSubject.branch);
      setCategory(editingSubject.category);
      setWeightageEstimate(editingSubject.weightageEstimate);
      setDescription(editingSubject.description);
      setColor(editingSubject.color);
    } else {
      setName('');
      setShortName('');
      setBranch(defaultBranch);
      setCategory('Core Curriculum');
      setWeightageEstimate(10);
      setDescription('');
      setColor('#38bdf8');
    }
  }, [editingSubject, defaultBranch, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        branch,
        category: category.trim(),
        weightageEstimate: Number(weightageEstimate) || 10,
        description: description.trim(),
        color,
      });
    } else {
      addSubject({
        name: name.trim(),
        shortName: shortName.trim() || name.trim(),
        branch,
        category: category.trim(),
        weightageEstimate: Number(weightageEstimate) || 10,
        description: description.trim(),
        color,
        iconName: 'BookOpen',
      });
      triggerConfetti();
    }

    onClose();
  };

  const handleDelete = () => {
    if (!editingSubject) return;
    deleteSubject(editingSubject.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <span>{editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Add Custom Subject'}</span>
        </div>
      }
      subtitle="Customize and structure your GATE curriculum dynamically"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Subject Title
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., General Aptitude & Reasoning"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Short Code / Nickname
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="E.g., Aptitude"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Track / Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value as ExamBranch)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            >
              <option value="DA">GATE DA (Data Science & AI)</option>
              <option value="CS">GATE CS (Computer Science)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Category / Group
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="E.g., General Foundation"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Estimated Weightage (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={weightageEstimate}
              onChange={(e) => setWeightageEstimate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Subject Description & Focus Areas
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Overview of core syllabus topics..."
            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {editingSubject ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Subject</span>
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/20"
            >
              <Check className="w-4 h-4" />
              <span>{editingSubject ? 'Save Changes' : 'Create Subject'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
