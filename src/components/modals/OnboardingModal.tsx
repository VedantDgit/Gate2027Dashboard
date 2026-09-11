'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useGateStore } from '@/store/useGateStore';
import { ShieldCheck, Sparkles, Target, Zap, Clock, Compass } from 'lucide-react';
import { triggerConfetti } from '@/components/ui/Confetti';

export const OnboardingModal: React.FC = () => {
  const { settings, updateSettings } = useGateStore();
  const [isOpen, setIsOpen] = useState(!settings.hasCompletedOnboarding);

  const [dailyHours, setDailyHours] = useState(settings.dailyStudyTargetHours || 4.5);
  const [weeklyHours, setWeeklyHours] = useState(settings.weeklyStudyTargetHours || 30);
  const [priority, setPriority] = useState(settings.branchPriority || 'BALANCED');
  const [targetDate, setTargetDate] = useState(settings.targetExamDate || '2027-02-06');

  if (!isOpen) return null;

  const handleFinish = (skip = false) => {
    if (!skip) {
      updateSettings({
        dailyStudyTargetHours: Number(dailyHours),
        weeklyStudyTargetHours: Number(weeklyHours),
        branchPriority: priority,
        targetExamDate: targetDate,
        hasCompletedOnboarding: true,
      });
      triggerConfetti();
    } else {
      updateSettings({ hasCompletedOnboarding: true });
    }
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleFinish(true)}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center font-black tracking-tighter text-sm shadow-md">
            G27
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight">
              GATE 2027 COMMAND CENTER
            </span>
          </div>
        </div>
      }
      subtitle="Welcome to your personal mission-control preparation operating system"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 via-indigo-950/20 to-slate-900 border border-sky-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">
                Engineering-Grade GATE CS + DA Intelligence
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track full syllabi, calculate spaced revisions, monitor PYQ accuracy, analyse weak
                areas deterministically, and maintain unbreakable daily streaks for February 2027.
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Steps */}
        <div className="space-y-4">
          {/* Daily & Weekly Hours Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Daily Target Hours
              </label>
              <div className="flex items-center gap-2">
                {[3, 4.5, 6, 8].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDailyHours(hrs)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      dailyHours === hrs
                        ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                Weekly Study Goal
              </label>
              <div className="flex items-center gap-2">
                {[20, 30, 40, 50].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setWeeklyHours(hrs)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      weeklyHours === hrs
                        ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exam Priority Focus */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Preparation Branch Focus
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'BALANCED', label: 'Balanced CS & DA', desc: 'Equal focus' },
                { id: 'DA_FIRST', label: 'DA Priority', desc: 'Data Science focus' },
                { id: 'CS_FIRST', label: 'CS Priority', desc: 'Computer Science focus' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id as typeof priority)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    priority === p.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/60 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{p.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Exam Date */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Examination Date (Configurable anytime)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => handleFinish(true)}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Skip & Explore Sample Data
          </button>
          <button
            type="button"
            onClick={() => handleFinish(false)}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold tracking-wide shadow-lg shadow-sky-600/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Initialize Command Center
          </button>
        </div>
      </div>
    </Modal>
  );
};
