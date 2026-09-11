'use client';

import React, { useState, useEffect } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { NoteItem } from '@/types';
import { FileText, Plus, Search, Trash2, Edit3, Tag, Sparkles } from 'lucide-react';
import { BranchBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

export default function NotesPage() {
  const { hydrate, isHydrated, subjects, notes, addNote, updateNote, deleteNote, getSubject, getTopic } = useGateStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [topicId, setTopicId] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const subject = getSubject(subjectId) || subjects[0] || { id: '', branch: 'DA', name: 'Subject', topics: [] };

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (subjects.length > 0 && !subjects.some(s => s.id === subjectId)) {
      setSubjectId(subjects[0].id);
    }
  }, [subjects, subjectId]);

  useEffect(() => {
    if (subject.topics.length > 0 && !subject.topics.some((t) => t.id === topicId)) {
      setTopicId(subject.topics[0].id);
    }
  }, [subjectId, subject, topicId]);

  if (!isHydrated) return null;

  const filteredNotes = notes.filter((n) => {
    if (selectedSubjectId !== 'ALL' && n.subjectId !== selectedSubjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchContent = n.content.toLowerCase().includes(q);
      const matchTags = n.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchContent || matchTags;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addNote({
      title: title.trim(),
      subjectId,
      topicId: topicId || undefined,
      branch: subject.branch,
      content: content.trim(),
      tags,
    });

    setTitle('');
    setContent('');
    setTagsInput('');
    setIsCreateOpen(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    updateNote(editingNote.id, {
      title: title.trim(),
      content: content.trim(),
      tags,
    });

    setEditingNote(null);
  };

  const startEdit = (note: NoteItem) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTagsInput(note.tags.join(', '));
  };

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
                <FileText className="w-7 h-7 text-sky-400" />
                <span>Notes, Proofs & Formula Sheets</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Store structured markdown memos, algorithm walkthroughs, and key mathematical derivations.
              </p>
            </div>

            <button
              onClick={() => {
                setTitle('');
                setContent('');
                setTagsInput('');
                setIsCreateOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 flex items-center gap-2 self-start sm:self-auto transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Note</span>
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes by concept, formulas, tags..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0f141c] border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Subjects ({notes.length} notes)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    [{s.branch}] {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Notes Found"
              description="Record essential definitions, tricky edge cases, and algorithmic step-by-step proofs for quick reference."
              actionLabel="Create First Note"
              onAction={() => setIsCreateOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => {
                const sub = getSubject(note.subjectId);
                const top = note.topicId ? getTopic(note.topicId) : null;
                const updatedStr = new Date(note.updatedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={note.id}
                    className="p-5 rounded-3xl bg-[#0f141c]/90 border border-white/5 hover:border-white/15 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BranchBadge branch={note.branch} />
                          <span className="text-[11px] text-slate-400 font-mono">
                            {sub?.shortName} {top ? `• ${top.name}` : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(note)}
                            className="p-1.5 text-slate-400 hover:text-sky-400 transition-colors"
                            title="Edit note"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight">{note.title}</h3>

                      <div className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950/50 p-3.5 rounded-2xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar">
                        {note.content}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((t, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <span>Updated {updatedStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <MobileNav />

      {/* Create / Edit Note Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingNote}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingNote(null);
        }}
        title={
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>{editingNote ? 'Edit Memo / Formula Sheet' : 'Create Topic Note'}</span>
          </div>
        }
        maxWidth="2xl"
      >
        <form onSubmit={editingNote ? handleUpdate : handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Note Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., B+ Tree Insertion & Splitting Algorithms"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
            />
          </div>

          {!editingNote && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.branch}] {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Topic</label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
                >
                  {subject.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Content (Formulas, Markdown, Key Pitfalls)
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Record your formula summaries, proofs, and tricky standard exam questions..."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="E.g., Formulas, HighWeightage, Tricky"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingNote(null);
              }}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
            >
              {editingNote ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
