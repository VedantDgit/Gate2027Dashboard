'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGateStore } from '@/store/useGateStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  Database,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';
import { Modal } from '@/components/ui/Modal';

export default function SettingsPage() {
  const {
    hydrate,
    isHydrated,
    settings,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    loadSampleData,
    clearSampleData,
    resetAllData,
  } = useGateStore();

  const [examDate, setExamDate] = useState(settings.targetExamDate || '2027-02-06');
  const [examMonth, setExamMonth] = useState(settings.examMonthDisplay || 'FEBRUARY 2027');
  const [dailyHours, setDailyHours] = useState(settings.dailyStudyTargetHours || 4.5);
  const [weeklyHours, setWeeklyHours] = useState(settings.weeklyStudyTargetHours || 30);
  const [branchPriority, setBranchPriority] = useState(settings.branchPriority || 'BALANCED');

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearSampleConfirmOpen, setIsClearSampleConfirmOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!isHydrated) return null;

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      targetExamDate: examDate,
      examMonthDisplay: examMonth.trim(),
      dailyStudyTargetHours: Number(dailyHours),
      weeklyStudyTargetHours: Number(weeklyHours),
      branchPriority,
    });
    setSaveSuccess(true);
    triggerConfetti();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gate-2027-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    triggerConfetti();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJSON(content);
        if (success) {
          setImportStatus('Data successfully restored!');
          triggerConfetti();
        } else {
          setImportStatus('Failed to parse backup JSON. Invalid format.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex min-h-screen bg-[#090c10] text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-12">
        <Header />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-5xl mx-auto w-full">
          {/* Top Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0e1420] to-[#121927] border border-white/10 shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-sky-400" />
              <span>Settings & Data Management</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure targets, customize examination dates, and backup or restore all your preparation intelligence data.
            </p>
          </div>

          {/* Configuration Form */}
          <form
            onSubmit={handleSavePreferences}
            className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-6 shadow-md"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Examination Targets & Study Goals</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Target Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Exam Month Label
                </label>
                <input
                  type="text"
                  value={examMonth}
                  onChange={(e) => setExamMonth(e.target.value)}
                  placeholder="FEBRUARY 2027"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Daily Study Goal (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Weekly Study Goal (Hours)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Branch Prioritization
              </label>
              <select
                value={branchPriority}
                onChange={(e) => setBranchPriority(e.target.value as typeof branchPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="BALANCED">Balanced Allocation (50% CS / 50% DA)</option>
                <option value="DA_FIRST">Prioritize GATE DA (Data Science & AI focus)</option>
                <option value="CS_FIRST">Prioritize GATE CS (Computer Science focus)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Preferences saved!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition-all active:scale-95"
              >
                Save Preferences
              </button>
            </div>
          </form>

          {/* Backup, Export & Import Section */}
          <div className="p-6 rounded-3xl bg-[#0f141c]/90 border border-white/5 space-y-5 shadow-md">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/5">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Full Data Backup & Portability</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              All your study sessions, syllabus mastery checkmarks, custom notes, mistake records, and mock tests are stored client-side in LocalStorage. You can export a snapshot JSON at any time and restore it on any device.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportJSON}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:border-emerald-500/40"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Progress JSON Backup</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:border-sky-500/40"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Import / Restore Backup</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 font-mono">
                {importStatus}
              </div>
            )}
          </div>

          {/* Danger Zone: Clear Sample Data / Reset Data */}
          <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-500/20 space-y-4">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-rose-500/20">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Data Reset Controls</span>
            </h3>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  loadSampleData();
                  triggerConfetti();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo / Sample Telemetry</span>
              </button>

              <button
                onClick={() => setIsClearSampleConfirmOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Clean 0 (Clear All Data)</span>
              </button>

              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Factory Reset (Erase All)</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      <MobileNav />

      {/* Confirm Clear Sample Data Modal */}
      <Modal
        isOpen={isClearSampleConfirmOpen}
        onClose={() => setIsClearSampleConfirmOpen(false)}
        title="Clear Demo / Sample Data?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            This will remove all demo sessions, mock tests, and sample notes, leaving your syllabus completely fresh for your real preparation journey.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsClearSampleConfirmOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearSampleData();
                setIsClearSampleConfirmOpen(false);
                triggerConfetti();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Confirm & Clear Sample Data
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirm Reset Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Factory Reset All Stored Data?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Warning: This action will permanently erase all your tracked progress, study hours, notes, and records. We recommend downloading a JSON backup first.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                resetAllData();
                setIsResetConfirmOpen(false);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
            >
              Erase Everything
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
