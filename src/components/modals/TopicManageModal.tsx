'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGateStore } from '@/store/useGateStore';
import { Topic, TopicDifficulty } from '@/types';
import { BookOpen, Check, Trash2 } from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';

interface TopicManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  editingTopic?: Topic | null;
}

export const TopicManageModal: React.FC<TopicManageModalProps> = ({
  isOpen,
  onClose,
  subjectId,
  editingTopic,
}) => {
  const { addTopic, updateTopic, deleteTopic, getSubject } = useGateStore();
  const subject = getSubject(subjectId);

  const [name, setName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [difficulty, setDifficulty] = useState<TopicDifficulty>('medium');

  useEffect(() => {
    if (editingTopic) {
      setName(editingTopic.name);
      setSubCategory(editingTopic.subCategory || '');
      setDifficulty(editingTopic.defaultDifficulty || 'medium');
    } else {
      setName('');
      setSubCategory('');
      setDifficulty('medium');
    }
  }, [editingTopic, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTopic) {
      updateTopic(editingTopic.id, {
        name: name.trim(),
        subCategory: subCategory.trim() || undefined,
        defaultDifficulty: difficulty,
      });
    } else {
      addTopic(subjectId, {
        name: name.trim(),
        subCategory: subCategory.trim() || undefined,
        defaultDifficulty: difficulty,
      });
      triggerConfetti();
    }

    onClose();
  };

  const handleDelete = () => {
    if (!editingTopic) return;
    deleteTopic(editingTopic.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-400" />
          <span>{editingTopic ? `Edit Topic: ${editingTopic.name}` : `Add Topic to ${subject?.name || 'Subject'}`}</span>
        </div>
      }
      subtitle="Add or refine curriculum topics dynamically"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Topic Title
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g., Singular Value Decomposition Proofs"
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Sub-Category / Domain
            </label>
            <input
              type="text"
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="E.g., Matrix Decompositions"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Difficulty Baseline
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as TopicDifficulty)}
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          {editingTopic ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Topic</span>
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
              <span>{editingTopic ? 'Save Topic' : 'Add Topic'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
