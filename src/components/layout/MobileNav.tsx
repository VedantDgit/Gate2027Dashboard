'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Timer,
  CheckSquare,
  Menu,
  X,
  HelpCircle,
  FlaskConical,
  RotateCw,
  BarChart3,
  FileText,
  Trophy,
  Settings,
  Clock,
} from 'lucide-react';
import { useGateStore } from '@/store/useGateStore';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { revisionItems, plannerTasks, pyqRecords } = useGateStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueRevisions = revisionItems.filter((r) => !r.isCompleted && r.scheduledDate <= todayStr).length;
  const pendingTasks = plannerTasks.filter((t) => !t.completed && t.date === todayStr).length;

  const primaryItems = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Syllabus', href: '/syllabus', icon: BookOpen },
    { name: 'Timer', href: '/timer', icon: Timer },
    { name: 'Planner', href: '/planner', icon: CheckSquare, badge: pendingTasks || undefined },
  ];

  const secondaryItems = [
    { name: 'Study Sessions', href: '/sessions', icon: Clock },
    { name: 'PYQs & Mistake Bank', href: '/pyq', icon: HelpCircle },
    { name: 'Mock Tests', href: '/mock-tests', icon: FlaskConical },
    { name: 'Spaced Revision', href: '/revision', icon: RotateCw, badge: overdueRevisions || undefined },
    { name: 'Analytics & Weakness', href: '/analytics', icon: BarChart3 },
    { name: 'Notes & Formulas', href: '/notes', icon: FileText },
    { name: 'Achievements', href: '/achievements', icon: Trophy },
    { name: 'Settings & Backup', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Sticky Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090c10]/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 flex items-center justify-around select-none">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-semibold transition-all relative ${
                isActive ? 'text-sky-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
              {item.badge !== undefined && (
                <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-slate-900" />
              )}
            </Link>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-semibold ${
            isDrawerOpen ? 'text-sky-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-over Drawer for More Links */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative bg-[#0d1117] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center">
                  G27
                </div>
                <span className="text-sm font-bold text-white">All Modules</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-900/80 text-slate-300 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">{item.name}</span>
                    {item.badge !== undefined && (
                      <span className="ml-auto px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
