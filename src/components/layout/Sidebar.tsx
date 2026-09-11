'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGateStore } from '@/store/useGateStore';
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  Clock,
  CheckSquare,
  HelpCircle,
  FlaskConical,
  RotateCw,
  BarChart3,
  FileText,
  Trophy,
  Settings,
  Flame,
  ChevronRight,
  Database,
  Sparkles,
} from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { revisionItems, plannerTasks, pyqRecords, getOverallStats } = useGateStore();
  const stats = getOverallStats();

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueRevisions = revisionItems.filter((r) => !r.isCompleted && r.scheduledDate <= todayStr).length;
  const pendingTasks = plannerTasks.filter((t) => !t.completed && t.date === todayStr).length;
  const mistakeBankCount = pyqRecords.filter((p) => !p.isCorrect).length;

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Syllabus Explorer', href: '/syllabus', icon: BookOpen },
    { name: 'Study Timer', href: '/timer', icon: Timer },
    { name: 'Study Sessions', href: '/sessions', icon: Clock },
    {
      name: 'Daily Planner',
      href: '/planner',
      icon: CheckSquare,
      badge: pendingTasks > 0 ? pendingTasks : undefined,
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      name: 'PYQs & Mistake Bank',
      href: '/pyq',
      icon: HelpCircle,
      badge: mistakeBankCount > 0 ? mistakeBankCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    { name: 'Mock Tests', href: '/mock-tests', icon: FlaskConical },
    {
      name: 'Spaced Revision',
      href: '/revision',
      icon: RotateCw,
      badge: overdueRevisions > 0 ? overdueRevisions : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    { name: 'Analytics & Weakness', href: '/analytics', icon: BarChart3 },
    { name: 'Notes & Formulas', href: '/notes', icon: FileText },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'Settings & Data', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-white/5 bg-[#090c10] text-slate-300 z-40 select-none">
      {/* Brand & Logo Header */}
      <div className="p-5 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all">
            <div className="w-full h-full bg-[#0d1117] rounded-[11px] flex items-center justify-center font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-sky-400 to-indigo-300 text-sm">
              G27
            </div>
          </div>
          <div>
            <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>GATE 2027</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              CS + DA Command Center
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Mission Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.name}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Preparation Summary Widget */}
      <div className="p-4 border-t border-white/5 bg-[#0c1017]">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Syllabus Mastered</span>
            <span className="text-white font-mono font-bold">
              {stats.overallProgressPercent}%
            </span>
          </div>
          <ProgressBar value={stats.overallProgressPercent} height={5} color="bg-gradient-to-r from-sky-500 to-indigo-500" />
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>CS: {stats.csProgressPercent}%</span>
            <span>DA: {stats.daProgressPercent}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
